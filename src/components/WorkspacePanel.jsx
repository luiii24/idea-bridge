import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import pb from '../pocketbase';

export default function WorkspacePanel({ activeProject, currentUser, setActiveTab }) {
  // --- STATE & REF UNTUK LOGIKA CHAT ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- EFEK FETCH & SUBSCRIPTION REAL-TIME ---
  useEffect(() => {
    if (!activeProject) return;
    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const records = await pb.collection('messages').getFullList({
          filter: `workspace="${activeProject.id}"`,
          sort: 'created',
          expand: 'user' 
        });
        if (isSubscribed) setMessages(records);
      } catch (err) {
        console.error("Gagal mengambil pesan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Dengarkan pesan masuk secara real-time
    pb.collection('messages').subscribe('*', async (e) => {
      if (e.action === 'create' && e.record.workspace === activeProject.id) {
        try {
          const newRecord = await pb.collection('messages').getOne(e.record.id, {
            expand: 'user'
          });
          setMessages((prev) => [...prev, newRecord]);
        } catch (err) {
          console.error("Gagal expand user realtime", err);
        }
      }
    });

    return () => {
      isSubscribed = false;
      pb.collection('messages').unsubscribe('*');
    };
  }, [activeProject]);

  // --- FUNGSI MENGIRIM PESAN ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage(''); // Reset input seketika

    try {
      await pb.collection('messages').create({
        text: textToSend,
        workspace: activeProject.id,
        user: currentUser.id
      });
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      alert("Gagal mengirim pesan.");
    }
  };

  if (!activeProject) return null;

  // --- UI RENDER ---
  return (
    <>
      <style>{`
        /* Animasi baru yang lebih mulus (muncul dari bawah sambil memudar) */
        @keyframes slide-up-fade {
          from { 
            transform: translateY(30px); 
            opacity: 0;
          }
          to { 
            transform: translateY(0); 
            opacity: 1;
          }
        }
      `}</style>

      {/* Gunakan fixed inset-0 dan z-[100] agar overlay sempurna di atas segalanya */}
      <div 
        className="fixed inset-0 z-[100] flex flex-col bg-gray-50 dark:bg-[#0f131f]"
        style={{ animation: 'slide-up-fade 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
      >
        
        {/* Workspace Header */}
        <div className="bg-white dark:bg-[#1a1f2e] border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 shadow-sm z-10 shrink-0">
          <button onClick={() => setActiveTab('home')} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{activeProject.title}</h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              Oleh {activeProject.author} • {activeProject.bridged} Gabung
            </p>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-[11px] font-medium px-4 py-2 rounded-lg mb-2 text-center max-w-[85%] border border-indigo-200 dark:border-indigo-800/50">
              Kamu telah menyatakan ketertarikan untuk menjembatani ide ini! Mulailah berdiskusi.
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-10">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <MessageSquare size={32} className="mb-2 opacity-50" />
              <p className="text-xs">Belum ada diskusi. Jadilah yang pertama menyapa!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user === currentUser.id;
              const sender = msg.expand?.user;
              
              const senderName = sender?.name || sender?.username || 'Anonim';
              const senderAvatar = sender?.avatar ? pb.files.getUrl(sender, sender.avatar, { thumb: '100x100' }) : null;

              return (
                <div key={msg.id} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar Pengirim */}
                  <div 
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-5 overflow-hidden ${isMe ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}
                    style={{ borderRadius: '50%' }}
                  >
                    {senderAvatar ? (
                      <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover rounded-full" style={{ borderRadius: '50%' }} />
                    ) : (
                      senderName.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Bubble Chat */}
                  <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : ''}`}>
                    <span className={`text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-semibold select-none ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {isMe ? 'Kamu' : senderName}
                    </span>
                    <div className={`py-2.5 px-4 rounded-2xl shadow-sm ${
                      isMe 
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input (SUDAH DIBESARKAN) */}
        <div className="p-4 bg-white dark:bg-[#1a1f2e] border-t border-gray-100 dark:border-gray-800 shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-100 dark:bg-[#0f131f] rounded-3xl pl-5 pr-2 py-2 border border-transparent dark:border-gray-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-500 transition-colors">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 dark:text-white py-2"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="text-white bg-indigo-600 dark:bg-indigo-500 p-2.5 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-full transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </form>
        </div>
        
      </div>
    </>
  );
}
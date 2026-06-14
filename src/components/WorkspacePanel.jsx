import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function WorkspacePanel({ activeProject, currentUser, setActiveTab }) {
  if (!activeProject) return null;

  return (
    <div className="animate-fade-in flex flex-col min-h-full bg-gray-50 dark:bg-[#0f131f]">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-[#1a1f2e] border-b border-gray-100 dark:border-gray-800 px-3 py-3 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={() => setActiveTab('home')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">Proyek: {activeProject.author}</h2>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Tim: 2 Orang Bergabung</p>
        </div>
      </div>
      
      {/* Chat Area (Mock) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-[11px] font-medium px-4 py-2 rounded-lg mb-2 text-center max-w-[85%] border border-indigo-200 dark:border-indigo-800/50">
            Kamu telah menyatakan ketertarikan untuk menjembatani ide ini! Mulailah berdiskusi.
          </div>
        </div>
        
        {/* Chat bubble - other person */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {activeProject.author.charAt(0)}
          </div>
          <div className="bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-800 dark:text-gray-200">Halo! Senang banget kamu tertarik sama ide ini. Kira-kira kamu bisa bantu di bagian mana?</p>
          </div>
        </div>

        {/* Chat bubble - me */}
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]">
            <p className="text-sm">Hai! Aku bisa bantu coding front-end nya nih kebetulan pakai React. Kalau untuk UI/UX design udah ada bayangan belum?</p>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white dark:bg-[#1a1f2e] border-t border-gray-100 dark:border-gray-800 sticky bottom-0">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0f131f] rounded-full pl-4 pr-1 py-1 border border-transparent dark:border-gray-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-500 transition-colors">
          <input 
            type="text"
            placeholder="Ketik pesan..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white py-1.5"
          />
          <button className="text-white bg-indigo-600 dark:bg-indigo-500 p-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-full transition shadow-sm">
            <Send size={16} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
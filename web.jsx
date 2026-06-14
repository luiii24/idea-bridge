import React, { useState } from 'react';
import { Home, Search, User, ThumbsUp, Handshake, Plus, Zap, Sun, Moon, ArrowLeft, Send, Github, ExternalLink, CheckCircle } from 'lucide-react';

// --- MOCK DATA ---
const currentUser = {
  id: 99,
  name: "Kamu (User)",
  handle: "@pengguna_baru",
  role: "Creator", // Bisa Ideator atau Creator
  bio: "Frontend Developer yang lagi cari ide-ide gila buat dibikin nyata.",
  skills: ["React", "Tailwind", "JavaScript"],
  portfolio: {
    github: "github.com/kamu-user",
    website: "kamu-dev.com"
  },
  completedProjects: [
    { id: 101, title: "Sistem Kasir UMKM Lokal", role: "Frontend" }
  ]
};

const initialPosts = [
  {
    id: 1,
    author: "Budi Santoso",
    handle: "@budisans",
    role: "Ideator",
    text: "Gimana kalau ada aplikasi pengingat minum obat, tapi pakai sistem 'Virtual Pet'? Kalau kita lupa minum obat, hewannya bakal sakit. Butuh mobile developer nih!",
    votes: 124,
    tags: ["Mobile", "Kesehatan", "Gamifikasi"],
    status: "Mencari Tim",
    bridged: 5
  },
  {
    id: 2,
    author: "Siti Aminah",
    handle: "@siticode",
    role: "Creator",
    text: "Lagi kosong weekend ini. Gue Fullstack Web Developer. Ada yang punya ide web app unik untuk problem UMKM lokal? Yuk discuss, gue yang coding.",
    votes: 89,
    tags: ["Web", "Open Collab", "UMKM"],
    status: "Sedang Dibangun",
    bridged: 12
  },
  {
    id: 3,
    author: "Rangga Pratama",
    handle: "@ranggap",
    role: "Ideator",
    text: "Ide: Platform text-to-speech khusus untuk logat daerah Indonesia (Jawa, Sunda, Batak, dll) buat bantu konten kreator lokal. Ada AI Engineer yang tertarik?",
    votes: 210,
    tags: ["AI", "Audio", "Lokal"],
    status: "Selesai",
    bridged: 8
  }
];

const mockUsers = [
  { id: 1, name: "Budi Santoso", handle: "@budisans", role: "Ideator", bio: "Product Manager by day, Idea Machine by night." },
  { id: 2, name: "Siti Aminah", handle: "@siticode", role: "Creator", bio: "Membangun web satu per satu. React & Node.js enthusiast." },
  { id: 3, name: "Rangga Pratama", handle: "@ranggap", role: "Ideator", bio: "Senang mencari solusi untuk masalah sehari-hari." },
  { id: 4, name: "Dewi Lestari", handle: "@dewidesign", role: "Creator", bio: "UI/UX Designer. Mengubah ide abstrak jadi tampilan cantik." }
];

// --- MAIN COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState(initialPosts);
  
  // States for Search Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('ideas'); // 'ideas' or 'users'

  // States for New Post
  const [isPosting, setIsPosting] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  // NEW: States for Features (Dark Mode & Workspace)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Handle Voting
  const handleVote = (postId, type) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          votes: type === 'up' ? post.votes + 1 : post.votes - 1
        };
      }
      return post;
    }));
  };

  // Handle New Post
  const submitPost = () => {
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: currentUser.name,
      handle: currentUser.handle,
      role: currentUser.role,
      text: newPostText,
      votes: 0,
      tags: ["Baru"],
      status: "Mencari Tim", // Default status baru
      bridged: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setIsPosting(false);
  };

  // NEW: Open Workspace Chat
  const openWorkspace = (post) => {
    setActiveProject(post);
    setActiveTab('workspace');
  };

  // Component: Post Card
  const PostCard = ({ post }) => {
    // Helper status colors
    const getStatusColor = (status) => {
      switch(status) {
        case 'Mencari Tim': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        case 'Sedang Dibangun': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 border-purple-200 dark:border-purple-800';
        case 'Selesai': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
      }
    };

    return (
      <div className="bg-white dark:bg-[#1a1f2e] p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#23293b] transition">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{post.author}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{post.handle}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {/* NEW: Status Badge */}
                {post.status && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(post.status)}`}>
                    {post.status.toUpperCase()}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border
                  ${post.role === 'Ideator' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'}`}>
                  {post.role === 'Ideator' ? '💡 Ideator' : '🛠️ Creator'}
                </span>
              </div>
            </div>
            
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3">
              {post.text}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md font-medium border border-indigo-100 dark:border-transparent">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => handleVote(post.id, 'up')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium group transition">
                  <ThumbsUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                  <span>{post.votes}</span>
                </button>
                <button onClick={() => openWorkspace(post)} className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium group transition">
                  <Handshake size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Jembatani ({post.bridged})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component: User Card (for Search)
  const UserCard = ({ user }) => (
    <div className="bg-white dark:bg-[#1a1f2e] p-4 border-b border-gray-100 dark:border-gray-800 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
        {user.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{user.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.handle}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium border
              ${user.role === 'Ideator' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'}`}>
              {user.role}
            </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{user.bio}</p>
        <button className="mt-2 w-full py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
          Lihat Profil
        </button>
      </div>
    </div>
  );

  return (
    // ROOT WRAPPER - Dark Mode Trigger applied here via `dark` class
    <div className={`min-h-screen flex justify-center font-sans ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#0f131f] min-h-screen shadow-2xl relative flex flex-col overflow-hidden pb-16 transition-colors duration-300">
        
        {/* Main Header (Hidden when in Workspace) */}
        {activeTab !== 'workspace' && (
          <header className="bg-white dark:bg-[#0f131f] border-b border-gray-100 dark:border-gray-800 px-4 py-3 sticky top-0 z-10 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg shadow-sm">
                <Zap size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Idea<span className="text-indigo-600 dark:text-indigo-400">Bridge</span></h1>
            </div>
            <div className="flex gap-1">
              {/* NEW: Dark Mode Toggle */}
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1f2e] rounded-full transition">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {activeTab === 'home' && (
                <button onClick={() => setIsPosting(!isPosting)} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition ml-1">
                  <Plus size={20} />
                </button>
              )}
            </div>
          </header>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: BERANDA */}
          {activeTab === 'home' && (
            <div className="animate-fade-in">
              {/* New Post Input Section */}
              {isPosting && (
                <div className="p-4 bg-indigo-50/50 dark:bg-[#151a26] border-b dark:border-gray-800">
                  <textarea 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Apa ide cemerlangmu hari ini? Atau sedang mencari ide untuk dikerjakan?"
                    className="w-full p-3 bg-white dark:bg-[#0f131f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
                    rows="3"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsPosting(false)} className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md">Batal</button>
                    <button onClick={submitPost} className="px-4 py-1.5 text-sm bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600">Posting Ide</button>
                  </div>
                </div>
              )}

              {/* Feed */}
              <div>
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            </div>
          )}

          {/* TAB 2: CARI */}
          {activeTab === 'search' && (
            <div className="animate-fade-in min-h-full">
              <div className="p-4 bg-white dark:bg-[#0f131f] border-b dark:border-gray-800 sticky top-0 z-10">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                  <input 
                    type="text" 
                    placeholder={`Cari ${searchFilter === 'ideas' ? 'ide atau kata kunci...' : 'nama atau role...'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border-transparent rounded-xl focus:bg-white dark:focus:bg-[#1a1f2e] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition text-sm"
                  />
                </div>
                
                {/* Search Toggle */}
                <div className="flex mt-4 bg-gray-100 dark:bg-[#1a1f2e] p-1 rounded-lg">
                  <button 
                    onClick={() => setSearchFilter('ideas')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${searchFilter === 'ideas' ? 'bg-white dark:bg-[#2a3041] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Ide/Proyek
                  </button>
                  <button 
                    onClick={() => setSearchFilter('users')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${searchFilter === 'users' ? 'bg-white dark:bg-[#2a3041] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Kreator/Ideator
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div>
                {searchFilter === 'ideas' ? (
                  posts.filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
                       .map(post => <PostCard key={post.id} post={post} />)
                ) : (
                  mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()))
                           .map(user => <UserCard key={user.id} user={user} />)
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROFIL */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in bg-gray-50 dark:bg-[#0f131f] min-h-full">
              <div className="bg-white dark:bg-[#1a1f2e] p-6 border-b dark:border-gray-800 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-3xl text-white font-bold shadow-lg mb-3 border-4 border-white dark:border-gray-800">
                  {currentUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.handle}</p>
                <div className="mt-3 inline-block">
                   <span className={`text-sm px-3 py-1 rounded-full font-bold shadow-sm border
                      ${currentUser.role === 'Ideator' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'}`}>
                      {currentUser.role === 'Ideator' ? '💡 Punya Ide (Ideator)' : '🛠️ Eksekutor (Creator)'}
                    </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-4 px-4">{currentUser.bio}</p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {currentUser.skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-[#0f131f] text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border dark:border-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* NEW: Portfolio Links */}
                <div className="mt-5 flex justify-center gap-5">
                  {currentUser.portfolio.github && (
                    <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                      <Github size={18} /> GitHub
                    </a>
                  )}
                  {currentUser.portfolio.website && (
                    <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                      <ExternalLink size={18} /> Website
                    </a>
                  )}
                </div>
                
                <button className="mt-6 w-full bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-2 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-md">
                  Edit Profil
                </button>
              </div>

              {/* NEW: Portofolio / Proyek Selesai */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" /> Proyek Berhasil Dijembatani
                </h3>
                <div className="space-y-3">
                  {currentUser.completedProjects.map(proj => (
                    <div key={proj.id} className="bg-white dark:bg-[#1a1f2e] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{proj.title}</span>
                      <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-md">
                        {proj.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEW TAB: WORKSPACE / CHATROOM */}
          {activeTab === 'workspace' && activeProject && (
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
          )}
        </main>

        {/* --- BOTTOM NAVIGATION (Hidden when in Workspace) --- */}
        {activeTab !== 'workspace' && (
          <nav className="absolute bottom-0 w-full bg-white dark:bg-[#0f131f] border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Beranda</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${activeTab === 'search' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Cari</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Profil</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  );
}
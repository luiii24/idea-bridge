import React, { useState, useEffect } from 'react';
import { Home, Search, User, Plus, Zap, Sun, Moon, Camera, ExternalLink, CheckCircle, Globe, Link2, Edit } from 'lucide-react';

// Import Data
import { currentUser, initialPosts, mockUsers } from './data/mockData';

// Import Components
import PostCard from './components/PostCard';
import UserCard from './components/UserCard';
import WorkspacePanel from './components/WorkspacePanel';
import EditProfileModal from './components/EditProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState(initialPosts);
  const [userProfile, setUserProfile] = useState(currentUser);
  // States for Search Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('ideas');

  // States for New Post
  const [isPosting, setIsPosting] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  // States for Features (Dark Mode & Workspace & Profile)
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const [activeProject, setActiveProject] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
      status: "Mencari Tim",
      bridged: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setIsPosting(false);
  };

  // Open Workspace Chat
  const openWorkspace = (post) => {
    setActiveProject(post);
    setActiveTab('workspace');
  };

  // Save Profile Changes
  const handleSaveProfile = (updatedProfile) => {
    setUserProfile({
      ...userProfile,
      name: updatedProfile.name,
      handle: updatedProfile.handle,
      bio: updatedProfile.bio,
      role: updatedProfile.role,
      skills: updatedProfile.skills,
      portfolio: updatedProfile.portfolio
    });
    setIsEditingProfile(false);
  };

  return (
    <div className={`min-h-screen flex justify-center font-sans ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full bg-white dark:bg-[#0f131f] min-h-screen shadow-2xl relative flex flex-col transition-colors duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        
        {/* Main Header - FIXED TOP */}
        {activeTab !== 'workspace' && (
          <header className="fixed top-0 left-0 right-0 bg-white dark:bg-[#0f131f] border-b border-gray-100 dark:border-gray-800 px-4 py-3 z-50 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg shadow-sm">
                <Zap size={20} className="text-white" />
              </div>
              <h1 className="font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ fontSize: '18px' }}>Idea<span className="text-indigo-600 dark:text-indigo-400">Bridge</span></h1>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('home')}
                className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'home' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                style={{ fontSize: '14px' }}
              >
                Beranda
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'search' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                style={{ fontSize: '14px' }}
              >
                Cari
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'profile' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                style={{ fontSize: '14px' }}
              >
                Profil
              </button>
            </div>

            <div className="flex gap-1">
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

        {/* Main Content Area - SCROLLABLE ONLY */}
        <main className="flex-1 overflow-y-auto custom-scrollbar lg:p-6" style={{ paddingTop: '80px', paddingBottom: '96px' }}>
          <div className="lg:max-w-6xl lg:mx-auto">
          
          {/* TAB 1: BERANDA */}
          {activeTab === 'home' && (
            <div className="animate-fade-in">
              {isPosting && (
                <div className="p-4 bg-indigo-50/50 dark:bg-[#151a26] border-b dark:border-gray-800">
                  <textarea 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Apa ide cemerlangmu hari ini?"
                    className="w-full p-3 bg-white dark:bg-[#0f131f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
                    rows="3"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsPosting(false)} className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md">Batal</button>
                    <button onClick={submitPost} className="px-4 py-1.5 text-sm bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600">Posting Ide</button>
                  </div>
                </div>
              )}

              <div>
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    handleVote={handleVote} 
                    openWorkspace={openWorkspace} 
                  />
                ))}
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
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border-transparent rounded-xl focus:bg-white dark:focus:bg-[#1a1f2e] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
                  />
                </div>
                
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

              <div>
                {searchFilter === 'ideas' ? (
                  posts.filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
                       .map(post => <PostCard key={post.id} post={post} handleVote={handleVote} openWorkspace={openWorkspace} />)
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
              <div className="bg-white dark:bg-[#1a1f2e] p-6 border-b dark:border-gray-800">
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg border-4 border-white dark:border-gray-800">
                      {userProfile.name.charAt(0)}
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="absolute bottom-0 right-0 flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-medium shadow-md"
                      style={{ fontSize: '14px' }}
                    >
                      <Edit size={16} strokeWidth={3.5} />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontSize: '18px' }}>{userProfile.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>@{userProfile.handle}</p>
                  <div className="mt-3 inline-block">
                     <span className={`text-sm px-3 py-1 rounded-full font-bold shadow-sm border
                        ${userProfile.role === 'Ideator' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 text-amber-700 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-700 dark:text-blue-400'}`}
                        style={{ fontSize: '14px' }}
                      >
                        {userProfile.role === 'Ideator' ? '💡 Punya Ide' : '🛠️ Eksekutor'}
                      </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-4 px-4" style={{ fontSize: '14px' }}>{userProfile.bio}</p>
                
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {userProfile.skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-[#0f131f] text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border dark:border-gray-700" style={{ fontSize: '12px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-center gap-4 flex-wrap">
                    {userProfile.portfolio?.github && (
                      <a href={userProfile.portfolio.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                        <Link2 size={18} /> GitHub
                      </a>
                    )}
                    {userProfile.portfolio?.linkedin && (
                      <a href={userProfile.portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                        <Link2 size={18} /> LinkedIn
                      </a>
                    )}
                    {userProfile.portfolio?.website && (
                      <a href={userProfile.portfolio.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                        <Globe size={18} /> Website
                      </a>
                    )}
                    {userProfile.portfolio?.twitter && (
                      <a href={userProfile.portfolio.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                        <Link2 size={18} /> Twitter
                      </a>
                    )}
                    {userProfile.portfolio?.instagram && (
                      <a href={userProfile.portfolio.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                        <Link2 size={18} /> Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2" style={{ fontSize: '14px' }}>
                  <CheckCircle size={16} className="text-emerald-500" /> Proyek Berhasil
                </h3>
                <div className="space-y-3">
                  {userProfile.completedProjects.map(proj => (
                    <div key={proj.id} className="bg-white dark:bg-[#1a1f2e] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200" style={{ fontSize: '14px' }}>{proj.title}</span>
                      <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-md" style={{ fontSize: '12px' }}>
                        {proj.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB WORKSPACE */}
          {activeTab === 'workspace' && activeProject && (
            <WorkspacePanel 
              activeProject={activeProject} 
              currentUser={userProfile} 
              setActiveTab={setActiveTab} 
            />
          )}
          </div>
        </main>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <EditProfileModal
            currentUser={userProfile}
            onSave={handleSaveProfile}
            onClose={() => setIsEditingProfile(false)}
          />
        )}

        {/* Mobile Tab Navigation - FIXED BOTTOM */}
        {activeTab !== 'workspace' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f131f] border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors z-50 lg:hidden">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Beranda</span>
            </button>
            <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'search' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Cari</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Profil</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

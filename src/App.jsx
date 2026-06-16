import React, { useState, useEffect } from 'react';
import pb from './pocketbase';
import { Home, Search, User, Trash2, Power, ThumbsUp, Plus, Zap, Sun, Moon, Camera, MessageSquare, ExternalLink, CheckCircle, Globe, Link2, Edit, AlertTriangle, X } from 'lucide-react';
import myCustomLogo from './assets/logo.png';

// Import Data
import { currentUser, initialPosts, mockUsers } from './data/mockData';

// Import Components
import PostCard from './components/PostCard';
import UserCard from './components/UserCard';
import WorkspacePanel from './components/WorkspacePanel';
import EditProfileModal from './components/EditProfileModal';

export default function App() {
  // =========================================================
  // 1. SEMUA USESTATE
  // =========================================================
  const [allUsers, setAllUsers] = useState([]); // Menyimpan data semua orang
  const [viewingPublicProfile, setViewingPublicProfile] = useState(null); // Menyimpan data orang yang di-klik
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  const [user, setUser] = useState(null); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false); 
  const [authAlert, setAuthAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' }); 
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [authType, setAuthType] = useState('login'); 
  const [formErrors, setFormErrors] = useState({ name: '', email: '', password: '' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(currentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('ideas');
  const [isPosting, setIsPosting] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // State untuk Edit Ide
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); 
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostText, setEditPostText] = useState('');

  // State untuk Hapus Ide (Modal Konfirmasi Baru)
  const [postToDelete, setPostToDelete] = useState(null);

  // Helper untuk fetch user profile dari PocketBase
  const fetchUserProfile = async (userId) => {
    try {
      const profileData = await pb.collection('users').getOne(userId);
      if (profileData) {
        const avatarUrl = profileData.avatar 
          ? pb.files.getUrl(profileData, profileData.avatar) 
          : null;

        setUserProfile({
          ...profileData,
          avatar_url: avatarUrl,
          avatarPreview: avatarUrl
        });
      }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
    }
  };

  // FUNGSI MENGAMBIL DATA POSTINGAN DARI POCKETBASE
  const fetchPosts = async () => {
    try {
      const records = await pb.collection('posts').getFullList({
        sort: '-created',
        expand: 'author', 
      });

      const realPosts = records.map(record => ({
        id: record.id,
        title: record.title,
        text: record.text,
        author: record.expand?.author?.name || 'Kreator Anonim',
        handle: record.expand?.author?.username || 'anonim',
        timestamp: record.created,
        votes: record.upvoters?.length || 0,
        upvoters: record.upvoters || [],
        tags: record.tags || [],
        bridged: record.joinedUsers?.length || 0,
        joinedUsers: record.joinedUsers || []
      }));

      setPosts(realPosts);
    } catch (error) {
      console.error("Gagal mengambil feed beranda:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // Ambil semua user dari database
      const records = await pb.collection('users').getFullList({
        sort: '-created',
      });
      setAllUsers(records);
    } catch (error) {
      console.error("Gagal mengambil daftar user:", error);
    }
  };
  // =========================================================
  // 2. SEMUA USEEFFECT
  // =========================================================
  useEffect(() => {
    fetchPosts();
    fetchAllUsers();
  }, []);
  
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => setShowWarning(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setIsLoggedIn(true);
      setUser(pb.authStore.model);
      fetchUserProfile(pb.authStore.model.id);
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setUserProfile(currentUser); 
    }
    setIsLoadingAuth(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (pb.authStore.isValid) {
        setIsLoggedIn(true);
        setUser(model);
        fetchUserProfile(model.id);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(currentUser);
      }
    }, true);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authType !== 'signup' || !inputUsername) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (inputUsername.length < 3) {
      setUsernameStatus('error');
      setUsernameMessage('Minimal 3 karakter.');
      return;
    }
    if (inputUsername.length > 12) {
      setUsernameStatus('error');
      setUsernameMessage('Maksimal 12 karakter.');
      return;
    }

    setUsernameStatus('loading');
    setUsernameMessage('Memeriksa ketersediaan...');

    const timer = setTimeout(async () => {
      try {
        await pb.collection('users').getFirstListItem(`username="${inputUsername.toLowerCase()}"`);
        setUsernameStatus('error');
        setUsernameMessage('Username sudah digunakan.');
      } catch (err) {
        if (err.status === 404) {
          setUsernameStatus('success');
          setUsernameMessage('Username tersedia!');
        } else {
          console.error(err);
          setUsernameStatus('error');
          setUsernameMessage('Gagal memverifikasi database.');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputUsername, authType]);

  useEffect(() => {
    setInputName('');
    setInputEmail('');
    setInputPassword('');
    setInputUsername('');
    setUsernameStatus('idle');
    setUsernameMessage('');
  }, [isAuthModalOpen, authType]);

  useEffect(() => {
    if (authType !== 'signup') {
      setFormErrors({ name: '', email: '', password: '' });
      return;
    }
    const errors = { name: '', email: '', password: '' };
    if (inputName && inputName.trim().length < 2) errors.name = 'Nama lengkap minimal 2 karakter.';
    const emailRegex = /\S+@\S+\.\S+/;
    if (inputEmail && !emailRegex.test(inputEmail)) errors.email = 'Format email tidak valid.';
    if (inputPassword && inputPassword.length < 8) errors.password = 'Password minimal wajib 8 karakter.';
    setFormErrors(errors);
  }, [inputName, inputEmail, inputPassword, authType]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f131f]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================
  // 4. LOGIKA FUNGSI AKSI & HANDLER
  // =========================================================
  
  const handleVote = async (postId, type) => {
    if (!isLoggedIn) {
      setAuthType('login');
      setIsAuthModalOpen(true);
      return;
    }

    if (!userProfile?.id) return;

    const postToVote = posts.find(p => p.id === postId);
    if (!postToVote) return;

    let currentUpvoters = postToVote.upvoters || [];
    if (!Array.isArray(currentUpvoters)) {
      currentUpvoters = [currentUpvoters]; 
    }

    const hasVoted = currentUpvoters.includes(userProfile.id);
    let newUpvoters = [];

    if (type === 'up') {
      if (hasVoted) {
        newUpvoters = currentUpvoters.filter(id => id !== userProfile.id); 
      } else {
        newUpvoters = [...currentUpvoters, userProfile.id]; 
      }
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, upvoters: newUpvoters, votes: newUpvoters.length };
      }
      return p;
    }));

    try {
      await pb.collection('posts').update(postId, {
        upvoters: newUpvoters
      });
    } catch (err) {
      console.error("Gagal update vote:", err);
      if (typeof fetchPosts === 'function') {
        fetchPosts(); 
      }
    }
  };

  const submitPost = async () => {
    if (!newPostText.trim()) return;
    setIsSubmittingPost(true);

    try {
      const hashtagRegex = /#[\w]+/g; 
      const extractedTags = newPostText.match(hashtagRegex) || []; 
      const cleanTags = extractedTags.map(tag => tag.substring(1));
      const finalTags = [...new Set([...cleanTags])]; 

      const data = {
        title: newPostTitle || "Ide Baru",
        text: newPostText,
        author: userProfile.id, 
        tags: finalTags,
        joinedUsers: userProfile.id ? [userProfile.id] : [] 
      };

      await pb.collection('posts').create(data);

      if (typeof fetchPosts === 'function') fetchPosts();

      setNewPostTitle('');
      setNewPostText('');
      setIsPosting(false);

    } catch (error) {
      console.error("Gagal membuat postingan:", error);
      const errorMsg = error.response?.message || error.message || "Gagal terhubung ke server.";
      alert(`Waduh, eror: ${errorMsg}`);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const openEditPostModal = (post) => {
    setEditingPost(post);
    setEditPostTitle(post.title);
    setEditPostText(post.text);
    setIsEditPostModalOpen(true);
  };

  const handleUpdatePost = async () => {
    if (!editPostText.trim()) return;

    try {
      const hashtagRegex = /#[\w]+/g; 
      const extractedTags = editPostText.match(hashtagRegex) || []; 
      const cleanTags = extractedTags.map(tag => tag.substring(1));
      const finalTags = [...new Set(["Baru", ...cleanTags])];

      await pb.collection('posts').update(editingPost.id, {
        title: editPostTitle,
        text: editPostText,
        tags: finalTags
      });

      setPosts(posts.map(p => {
        if (p.id === editingPost.id) {
          return { ...p, title: editPostTitle, text: editPostText, tags: finalTags };
        }
        return p;
      }));

      setIsEditPostModalOpen(false);
      setEditingPost(null);
      
    } catch (err) {
      console.error("Gagal update ide:", err);
      alert("Gagal memperbarui ide. Pastikan Anda memiliki koneksi.");
    }
  };

  // FUNGSI KONFIRMASI HAPUS IDE (SUDAH DIPERBARUI)
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await pb.collection('posts').delete(postToDelete);
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null); // Tutup modal setelah berhasil
    } catch (err) {
      console.error("Gagal menghapus post:", err);
      alert("Gagal menghapus ide. Pastikan Anda memiliki akses.");
      setPostToDelete(null); // Tutup modal meskipun gagal
    }
  };

  const handleLeaveWorkspace = async (post, e) => {
    e.stopPropagation(); 
    
    if (!window.confirm(`Yakin ingin keluar dari workspace "${post.title}"?`)) return;

    try {
      const updatedJoinedUsers = post.joinedUsers.filter(id => id !== userProfile.id);
      
      await pb.collection('posts').update(post.id, {
        joinedUsers: updatedJoinedUsers
      });

      setPosts(posts.map(p => {
        if (p.id === post.id) {
          return { ...p, joinedUsers: updatedJoinedUsers, bridged: p.bridged - 1 };
        }
        return p;
      }));

    } catch (err) {
      console.error("Gagal keluar dari workspace:", err);
    }
  };

  const openWorkspace = (post) => {
    if (!isLoggedIn) {
      setAuthType('login');
      setIsAuthModalOpen(true);
      return;
    }

    setActiveProject(post);
    const isJoined = post.joinedUsers?.includes(userProfile.id);
    
    if (!isJoined) {
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            joinedUsers: [...(p.joinedUsers || []), userProfile.id],
            bridged: p.bridged + 1 
          };
        }
        return p;
      }));
    }
    setActiveTab('workspace');
  };

  const handleSaveProfile = (updatedProfile) => {
    setUserProfile({
      ...userProfile,
      name: updatedProfile.name,
      username: updatedProfile.username,
      bio: updatedProfile.bio,
      avatar_url: updatedProfile.avatar_url,
      skills: updatedProfile.skills,
      portfolio: updatedProfile.portfolio
    });
    setIsEditingProfile(false);
  };

  const handleLogOut = () => {
    pb.authStore.clear(); 
    setIsLogoutModalOpen(false);
    setActiveTab('home');
  };

  const handleSignUp = async (email, password, name, username) => {
    if (!email || !password || !name || !username) return;
    setIsSubmittingAuth(true);
    try {
      const data = {
        username: username.toLowerCase().replace(/\s+/g, '_'),
        email: email,
        emailVisibility: true,
        password: password,
        passwordConfirm: password, 
        name: name
      };
      await pb.collection('users').create(data);
      await pb.collection('users').authWithPassword(email, password);
      setIsAuthModalOpen(false);
      setAuthAlert({ isOpen: true, type: 'welcome', title: 'Selamat Datang!', message: `Akun @${data.username} berhasil dibuat.` });
    } catch (err) {
      console.error("Error signup:", err);
      const errorMsg = err.response?.message || err.message || 'Gagal terhubung ke server.';
      setAuthAlert({ isOpen: true, type: 'error', title: 'Gagal Mendaftar', message: errorMsg });
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogin = async (email, password) => {
    if (!email || !password) return;
    setIsSubmittingAuth(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      setIsAuthModalOpen(false);
      setAuthAlert({ isOpen: true, type: 'welcome', title: 'Selamat Datang Kembali!', message: 'Akses masuk berhasil.' });
    } catch (err) {
      console.error("Error login:", err);
      setAuthAlert({ isOpen: true, type: 'error', title: 'Gagal Masuk', message: 'Email atau password salah.' });
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // =========================================================
  // 5. RENDERING JSX UTAMA
  // =========================================================
  return (
    <div className={`min-h-screen flex justify-center font-sans ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full bg-white dark:bg-[#0f131f] min-h-screen shadow-2xl relative flex flex-col transition-colors duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        
        {/* Main Header */}
        {activeTab !== 'workspace' && (
          <header className="fixed top-0 left-0 right-0 bg-white dark:bg-[#0f131f] border-b border-gray-100 dark:border-gray-800 px-4 py-3 z-50 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-2">
              <img src={myCustomLogo} alt="Logo IdeaBridge" className="w-8 h-8 object-cover rounded-lg shadow-sm" />
              <h1 className="font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ fontSize: '18px' }}>Idea<span className="text-indigo-600 dark:text-indigo-400">Bridge</span></h1>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => setActiveTab('home')} className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'home' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`} style={{ fontSize: '14px' }}>Beranda</button>
              <button onClick={() => setActiveTab('search')} className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'search' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`} style={{ fontSize: '14px' }}>Cari</button>
              <button onClick={() => setActiveTab('profile')} className={`font-medium pb-2 transition-colors border-b-2 ${activeTab === 'profile' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`} style={{ fontSize: '14px' }}>Profil</button>
            </div>

            <div className="flex gap-1">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1f2e] rounded-full transition">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {isLoggedIn && (
                <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-full border border-transparent hover:border-red-100 dark:hover:border-red-800/50" title="Log Out">
                  <Power size={20} strokeWidth={2.5} />
                </button>
              )}
              {activeTab === 'home' && (
                <button 
                  onClick={() => {
                    if (!isLoggedIn) {
                      setAuthType('login');
                      setIsAuthModalOpen(true);
                    } else {
                      setIsPosting(!isPosting);
                    }
                  }} 
                  className="flex flex-col items-center p-2 text-indigo-600 dark:text-indigo-400"
                >
                  <Plus size={24} className={`transition-transform duration-500 ${isPosting ? 'rotate-45' : 'rotate-0'}`} />
                </button>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar lg:p-6" style={{ paddingTop: '80px', paddingBottom: '96px' }}>
          <div className="lg:max-w-6xl lg:mx-auto">
            <style>{`
              @keyframes tab-transition { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
              .animate-tab-swap { animation: tab-transition 0.3s ease-in-out forwards; }
            `}</style>

            {/* TAB 1: BERANDA */}
            {activeTab === 'home' && (
              <div className="animate-tab-swap">
                <style>{`
                  @keyframes composer-slide-down { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
                  @keyframes composer-slide-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-15px); } }
                  .animate-slide-down { animation: composer-slide-down 0.3s ease-out forwards; }
                  .animate-slide-up { animation: composer-slide-up 0.3s ease-in forwards; }
                `}</style>

                <div className={isPosting ? "animate-slide-down" : "animate-slide-up overflow-hidden h-0 p-0 border-none"}>
                  {isPosting && (
                    <div className="p-4 bg-indigo-50/50 dark:bg-[#151a26] border-b dark:border-gray-800">
                      <input 
                        type="text"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Judul Ide atau Proyekmu..."
                        className="w-full p-3 bg-white dark:bg-[#0f131f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold mb-3 text-sm outline-none transition"
                      />
                      <textarea 
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Apa ide cemerlangmu hari ini?"
                        className="w-full p-3 bg-white dark:bg-[#0f131f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-2 outline-none transition"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setIsPosting(false); setNewPostTitle(''); setNewPostText(''); }} className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition">Batal</button>
                        <button 
                        onClick={submitPost} 
                        disabled={isSubmittingPost}
                        className="flex items-center justify-center gap-2 px-4 py-1.5 text-sm bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingPost ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Memposting...
                            </>
                          ) : (
                            'Posting Ide'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} handleVote={handleVote} openWorkspace={openWorkspace} currentUser={userProfile}/>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CARI */}
            {activeTab === 'search' && (
              <div className="animate-tab-swap min-h-full">
                <div className="p-4 bg-white dark:bg-[#0f131f] border-b dark:border-gray-800 sticky top-0 z-10">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border-transparent rounded-xl focus:bg-white dark:focus:bg-[#1a1f2e] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm" />
                  </div>
                  <div className="flex mt-4 bg-gray-100 dark:bg-[#1a1f2e] p-1 rounded-lg">
                    <button onClick={() => setSearchFilter('ideas')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${searchFilter === 'ideas' ? 'bg-white dark:bg-[#2a3041] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Ide/Proyek</button>
                    <button onClick={() => setSearchFilter('users')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${searchFilter === 'users' ? 'bg-white dark:bg-[#2a3041] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Kreator/Ideator</button>
                  </div>
                </div>

                <div>
                  {searchFilter === 'ideas' ? (
                    posts.filter(p => (p.text || '').toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
                         .map(post => <PostCard key={post.id} post={post} handleVote={handleVote} openWorkspace={openWorkspace} currentUser={userProfile} />)
                  ) : (
                    allUsers.filter(u => 
                              (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(user => (
                              <UserCard 
                                key={user.id} 
                                user={user} 
                                onClick={(userData) => setViewingPublicProfile(userData)} 
                              />
                            ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROFIL */}
            {activeTab === 'profile' && (
              <div className="animate-tab-swap pb-24 max-w-2xl mx-auto px-4 mt-4">
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white dark:bg-[#1a1f2e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
                      <User size={32} strokeWidth={2} />
                    </div>
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Profil Anda Kosong</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">Masuk atau buat akun terlebih dahulu untuk melihat profil, mengatur riwayat ruang kerja, dan berkolaborasi.</p>
                    <div className="flex gap-3 w-full max-w-xs justify-center">
                      <button onClick={() => { setAuthType('login'); setIsAuthModalOpen(true); }} className="flex-1 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition shadow-sm">Log In</button>
                      <button onClick={() => { setAuthType('signup'); setIsAuthModalOpen(true); }} className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-[#23293b] transition">Create Account</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white dark:bg-[#1a1f2e] p-6 border-b dark:border-gray-800 rounded-2xl shadow-sm">
                      <div className="text-center mb-4">
                        <div className="relative inline-block mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden" style={{ borderRadius: '50%' }}>
                            {userProfile.avatarPreview || userProfile.avatar_url || userProfile.avatar ? (
                              <img src={userProfile.avatarPreview || userProfile.avatar_url || userProfile.avatar} alt="Profil" className="w-full h-full object-cover rounded-full" style={{ borderRadius: '50%' }} />
                            ) : (
                              userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"
                            )}
                          </div>
                          <button onClick={() => setIsEditingProfile(true)} className="absolute bottom-0 right-0 flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition font-medium shadow-md" style={{ fontSize: '14px' }}>
                            <Edit size={16} strokeWidth={3.5} />
                          </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontSize: '18px' }}>{userProfile.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>@{userProfile.username || userProfile.handle}</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-4 px-4" style={{ fontSize: '14px' }}>{userProfile.bio}</p>
                      
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {userProfile.skills && userProfile.skills.map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-[#0f131f] text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border dark:border-gray-700" style={{ fontSize: '12px' }}>{skill}</span>
                          ))}
                        </div>

                        <div className="mt-5 flex justify-center gap-4 flex-wrap">
                          {Array.isArray(userProfile.portfolio) && userProfile.portfolio.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition" style={{ fontSize: '14px' }}>
                              {link.title.toLowerCase().includes('web') ? <Globe size={18} /> : <Link2 size={18} />} {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      
                      {/* KOLOM 1: IDE BUATANKU */}
                      <div className="p-4 bg-white dark:bg-[#1a1f2e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2" style={{ fontSize: '14px' }}>
                          <span className="w-4 h-4 rounded-full bg-indigo-500 flex-shrink-0" /> Ide Saya
                        </h3>
                        <div className="space-y-3">
                          {(() => {
                            const myPosts = posts.filter(post => post.author_id === userProfile.id || post.author === userProfile.name);
                            
                            if (myPosts.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Belum ada ide yang diposting.</p>;

                            return myPosts.map(topic => (
                              <div 
                                key={topic.id} 
                                onClick={() => openWorkspace(topic)} // <-- Buka workspace saat diklik
                                className="bg-gray-50 dark:bg-[#0f131f] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                              >
                                <div className="flex flex-col min-w-0 pr-2">
                                  {/* Tambahkan efek berubah warna saat di-hover */}
                                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {topic.title}
                                  </span>
                                  <span className="text-[11px] text-gray-400 mt-0.5">{topic.votes} Dukungan • {topic.bridged} Gabung</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {/* TOMBOL POP-UP EDIT */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); openEditPostModal(topic); }} 
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                                    title="Edit Ide"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  
                                  {/* TOMBOL POP-UP HAPUS */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setPostToDelete(topic.id); }} 
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    title="Hapus Ide"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* KOLOM 2: RIWAYAT WORKSPACE */}
                      <div className="p-4 bg-white dark:bg-[#1a1f2e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2" style={{ fontSize: '14px' }}>
                          <span className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0" /> Riwayat Workspace
                        </h3>
                        <div className="space-y-3">
                          {(() => {
                            const joinedWorkspaces = posts.filter(post => 
                              post.joinedUsers?.includes(userProfile.id) && 
                              post.author_id !== userProfile.id && 
                              post.author !== userProfile.name
                            );
                            
                            if (joinedWorkspaces.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Belum bergabung ke workspace lain.</p>;

                            return joinedWorkspaces.map(topic => (
                              <div key={topic.id} onClick={() => openWorkspace(topic)} className="bg-gray-50 dark:bg-[#0f131f] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer hover:border-emerald-200 transition-all group">
                                <div className="flex flex-col min-w-0 pr-2">
                                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-emerald-600 transition-colors">{topic.title}</span>
                                  <span className="text-[11px] text-gray-400 mt-0.5">Oleh {topic.author}</span>
                                </div>
                                
                                <button 
                                  onClick={(e) => handleLeaveWorkspace(topic, e)}
                                  className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-transparent hover:border-red-600"
                                  title="Keluar dari Workspace"
                                >
                                  <Power size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB WORKSPACE */}
            {activeTab === 'workspace' && activeProject && (
              <WorkspacePanel activeProject={activeProject} currentUser={userProfile} setActiveTab={setActiveTab} />
            )}
          </div>
        </main>

        {/* =========================================================================
            SEMUA MODAL BERADA DI BAWAH SINI
        ========================================================================= */}

        {/* MODAL POP-UP EDIT IDE */}
        {isEditPostModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl relative animate-scale-up">
              
              <button 
                onClick={() => setIsEditPostModalOpen(false)} 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Ide/Proyek</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Judul Ide</label>
                  <input 
                    type="text" 
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Judul Ide (opsional)"
                    className="w-full p-3 bg-gray-50 dark:bg-[#0f131f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Ide</label>
                  <textarea 
                    value={editPostText}
                    onChange={(e) => setEditPostText(e.target.value)}
                    rows="4"
                    placeholder="Jelaskan idemu..."
                    className="w-full p-3 bg-gray-50 dark:bg-[#0f131f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsEditPostModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdatePost} 
                  disabled={!editPostText.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS IDE */}
        {postToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a1f2e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xl animate-scale-up">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-1">Hapus Ide Ini?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">Tindakan ini tidak bisa dibatalkan. Ide akan terhapus secara permanen dari sistem.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPostToDelete(null)} 
                  className="flex-1 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeletePost} 
                  className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL POP-UP AUTH (LOGIN / SIGN UP) */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl animate-scale-up relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">{authType === 'login' ? 'Log In ke IdeaBridge' : 'Buat Akun Baru'}</h3>
              
              <div className="space-y-4">
                {authType === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                      <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Ahmad Lu'ay" className={`w-full p-3 bg-gray-50 dark:bg-[#0f131f] border rounded-xl text-sm focus:outline-none focus:ring-2 text-gray-900 dark:text-white outline-none transition ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} />
                      {formErrors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                      <div className="relative flex items-center">
                        <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} placeholder="username_kamu" className={`w-full p-3 pr-10 bg-gray-50 dark:bg-[#0f131f] border rounded-xl text-sm focus:outline-none focus:ring-2 text-gray-900 dark:text-white outline-none transition ${usernameStatus === 'success' ? 'border-green-500 focus:ring-green-500' : usernameStatus === 'error' ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} />
                        <div className="absolute right-3 flex items-center justify-center">
                          {usernameStatus === 'loading' && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                          {usernameStatus === 'success' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5"/></svg>}
                          {usernameStatus === 'error' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>}
                        </div>
                      </div>
                      {usernameMessage && <p className={`text-[10px] mt-1 font-medium ${usernameStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} placeholder="contoh@email.com" className={`w-full p-3 bg-gray-50 dark:bg-[#0f131f] border rounded-xl text-sm focus:outline-none focus:ring-2 text-gray-900 dark:text-white outline-none transition ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} />
                  {formErrors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder="••••••••" className={`w-full p-3 bg-gray-50 dark:bg-[#0f131f] border rounded-xl text-sm focus:outline-none focus:ring-2 text-gray-900 dark:text-white outline-none transition ${formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} />
                  {formErrors.password && <p className="text-[10px] text-red-500 mt-1 font-medium">{formErrors.password}</p>}
                </div>
              </div>

              <button 
                onClick={() => { authType === 'login' ? handleLogin(inputEmail, inputPassword) : handleSignUp(inputEmail, inputPassword, inputName, inputUsername); }} 
                disabled={isSubmittingAuth || (authType === 'signup' && (usernameStatus !== 'success' || formErrors.name || formErrors.email || formErrors.password || !inputName || !inputEmail || !inputPassword))}
                className={`w-full py-3.5 mt-6 font-bold rounded-xl text-xs transition shadow-sm text-white flex items-center justify-center gap-2 ${isSubmittingAuth || (authType === 'signup' && (usernameStatus !== 'success' || formErrors.name || formErrors.email || formErrors.password || !inputName || !inputEmail || !inputPassword)) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isSubmittingAuth ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Memproses...</span></> : (authType === 'login' ? 'Log In Sekarang' : 'Daftar Akun')}
              </button>
              
              <p className="text-[11px] text-gray-400 text-center mt-4">
                {authType === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} 
                <span onClick={() => setAuthType(authType === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-semibold cursor-pointer ml-1 hover:underline">{authType === 'login' ? 'Buat Akun' : 'Log In'}</span>
              </p>
            </div>
          </div>
        )}

        {/* Peringatan Dummy Data Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <style>{` @keyframes shrink-bar { from { width: 100%; } to { width: 0%; } } `}</style>
            <div className="relative overflow-hidden bg-white dark:bg-[#0f131f] rounded-2xl w-full max-w-md shadow-2xl p-10 flex flex-col items-center text-center transform transition-all duration-300 border border-gray-100 dark:border-gray-800">
              <div className="absolute top-0 left-0 h-1.5 bg-amber-500" style={{ animation: 'shrink-bar 4s linear forwards' }}></div>
              <button onClick={() => setShowWarning(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={22} strokeWidth={2.5} /></button>
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 mt-2"><AlertTriangle size={48} className="text-amber-500" strokeWidth={2.5} /></div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4" style={{ fontSize: '20px' }}>Peringatan</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium px-4" style={{ fontSize: '15px' }}>Harap tidak membuat postingan yang mengandung unsur sara dan membuat keributan.</p>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI LOG OUT */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a1f2e] rounded-2xl p-5 border border-gray-100 shadow-xl">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-1">Keluar dari Akun?</h3>
              <p className="text-xs text-gray-500 text-center mb-6">Apakah Anda yakin ingin keluar dari IdeaBridge?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">Batal</button>
                <button onClick={handleLogOut} className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL PROFIL PUBLIK (MENGINTIP ORANG LAIN) */}
        {viewingPublicProfile && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#1a1f2e] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl relative animate-scale-up flex flex-col max-h-[90vh]">
              
              {/* Tombol Close Diperjelas */}
              <button 
                onClick={() => setViewingPublicProfile(null)} 
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full transition backdrop-blur-sm"
              >
                <X size={20} />
              </button>

              {/* FIX AVATAR: Pindahkan Header Background ke DALAM scrollable area */}
              <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                
                {/* Header Profil (Warna Ungu) */}
                <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0 relative"></div>
                
                {/* Area Konten Profil */}
                <div className="px-6 pb-6 relative">
                  
                  {/* Avatar Mengambang (Sekarang aman dari potongan overflow) */}
                  <div className="w-24 h-24 bg-white dark:bg-[#1a1f2e] rounded-full p-1.5 -mt-12 mb-3 mx-auto relative z-10 shadow-md">
                    <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden" style={{ borderRadius: '50%' }}>
                      {viewingPublicProfile.avatar ? (
                        <img src={pb.files.getUrl(viewingPublicProfile, viewingPublicProfile.avatar, { thumb: '100x100' })} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        viewingPublicProfile.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingPublicProfile.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">@{viewingPublicProfile.username}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {viewingPublicProfile.bio || 'Pengguna ini belum menuliskan bio apapun.'}
                    </p>
                    
                    {/* FIX SKILLS */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {viewingPublicProfile.skills && viewingPublicProfile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-gray-50 dark:bg-[#0f131f] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* FIX PORTOFOLIO: Sekarang Tampil! */}
                    {Array.isArray(viewingPublicProfile.portfolio) && viewingPublicProfile.portfolio.length > 0 && (
                      <div className="flex justify-center gap-4 flex-wrap mt-2">
                        {viewingPublicProfile.portfolio.map((link, idx) => (
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            {link.title.toLowerCase().includes('web') ? <Globe size={16} /> : <Link2 size={16} />} {link.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Ide Buatan {viewingPublicProfile.name.split(' ')[0]}
                    </h4>
                    
                    <div className="space-y-3">
                      {(() => {
                        const userPosts = posts.filter(p => p.author === viewingPublicProfile.name || p.author_id === viewingPublicProfile.id);
                        
                        if (userPosts.length === 0) return <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">Belum membagikan ide apapun.</p>;

                        return userPosts.map(topic => (
                          <div 
                            key={topic.id} 
                            // FIX: Modal tertutup dan langsung buka Workspace
                            onClick={() => {
                              setViewingPublicProfile(null); 
                              openWorkspace(topic); 
                            }}
                            className="bg-gray-50 dark:bg-[#0f131f] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {topic.title}
                              </span>
                              <span className="text-[11px] text-gray-500 mt-1">{topic.votes} Dukungan • {topic.bridged} Gabung</span>
                            </div>
                            
                            {/* FIX: Tombol Dukungan (ThumbsUp) + Angka! */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Biar pas klik Like nggak sengaja ngebuka Workspace
                                handleVote(topic.id, 'up');
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                                topic.upvoters?.includes(userProfile?.id) 
                                ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 border border-transparent' 
                                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-sm'
                              }`}
                              title="Beri Dukungan"
                            >
                              <ThumbsUp size={16} className={topic.upvoters?.includes(userProfile?.id) ? "fill-current" : ""} />
                              <span className="text-xs">{topic.votes || 0}</span>
                            </button>

                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <EditProfileModal currentUser={userProfile} onSave={handleSaveProfile} onClose={() => setIsEditingProfile(false)} />
        )}

        {/* Mobile Tab Navigation */}
        {activeTab !== 'workspace' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f131f] border-t border-gray-200 flex justify-around items-center px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 lg:hidden">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} /><span className="text-[10px] mt-1 font-semibold">Beranda</span></button>
            <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'search' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} /><span className="text-[10px] mt-1 font-semibold">Cari</span></button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 min-w-[64px] ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}><User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} /><span className="text-[10px] mt-1 font-semibold">Profil</span></button>
          </nav>
        )}
      </div>
    </div>
  );
}
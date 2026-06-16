import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link2 } from 'lucide-react';
import pb from '../pocketbase'; // Pastikan path ini benar

export default function EditProfileModal({ currentUser, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    handle: currentUser.username || currentUser.handle || '',
    bio: currentUser.bio || '',
    skills: currentUser.skills ? [...currentUser.skills] : [],
    avatar: null,
    avatarPreview: currentUser.avatarPreview || currentUser.avatar_url || currentUser.avatar || null
  });

  // --- 1. STATE BARU UNTUK VALIDASI USERNAME REAL-TIME ---
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  // Pastikan data awal portfolio adalah array
  const initialSocials = Array.isArray(currentUser.portfolio)
    ? currentUser.portfolio.filter(item => typeof item === 'object' && item !== null)
    : [];
  const [socialLinks, setSocialLinks] = useState(initialSocials);

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. CCTV VALIDASI USERNAME (Mengecek ke PocketBase) ---
  useEffect(() => {
    const currentHandle = (currentUser.username || currentUser.handle || '').toLowerCase();
    const inputHandle = formData.handle.toLowerCase();

    // Jika username tidak diubah (masih milik sendiri), status aman
    if (inputHandle === currentHandle) {
      setUsernameStatus('success');
      setUsernameMessage('Username milikmu saat ini.');
      return;
    }

    // Validasi aturan dasar
    if (!inputHandle || inputHandle.length < 3) {
      setUsernameStatus('error');
      setUsernameMessage('Minimal 3 karakter.');
      return;
    }
    if (inputHandle.includes(' ')) {
      setUsernameStatus('error');
      setUsernameMessage('Tidak boleh pakai spasi.');
      return;
    }

    setUsernameStatus('loading');
    setUsernameMessage('Mengecek...');

    // Debounce 500ms agar tidak spam API
    const timer = setTimeout(async () => {
      try {
        await pb.collection('users').getFirstListItem(`username="${inputHandle}"`);
        setUsernameStatus('error');
        setUsernameMessage('Username sudah dipakai orang lain.');
      } catch (err) {
        if (err.status === 404) {
          setUsernameStatus('success');
          setUsernameMessage('Username tersedia!');
        } else {
          setUsernameStatus('error');
          setUsernameMessage('Gagal terhubung ke server.');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.handle, currentUser]);
  // ---------------------------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  // --- 3. PERBAIKAN MANAJEMEN STATE SOCIAL LINKS (IMMUTABLE) ---
  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { title: '', url: '' }]);
  };

  const handleSocialLinkChange = (index, field, value) => {
    // Menggunakan map agar React benar-benar merender ulang ketikanmu
    const updatedLinks = socialLinks.map((link, i) => {
      if (i === index) return { ...link, [field]: value };
      return link;
    });
    setSocialLinks(updatedLinks);
  };

  const handleRemoveSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };
  // -------------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama tidak boleh kosong';
    if (!formData.handle.trim()) newErrors.handle = 'Username tidak boleh kosong';
    
    // Cegah save jika username error/sedang loading
    if (usernameStatus === 'error' || usernameStatus === 'loading') {
      newErrors.handle = 'Selesaikan perbaikan username terlebih dahulu.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('username', formData.handle.toLowerCase().replace(/\s+/g, '_'));
      submitData.append('bio', formData.bio);
      submitData.append('skills', JSON.stringify(formData.skills));

      // Filter link dengan sangat aman (mencegah crash undefined .trim())
      const validLinks = socialLinks.filter(link => {
        const t = link?.title || '';
        const u = link?.url || '';
        return t.trim() !== '' && u.trim() !== '';
      });
      submitData.append('portfolio', JSON.stringify(validLinks));

      if (formData.avatar instanceof File) {
        submitData.append('avatar', formData.avatar);
      }

      const updatedRecord = await pb.collection('users').update(currentUser.id, submitData);

      const newAvatarUrl = updatedRecord.avatar 
        ? pb.files.getUrl(updatedRecord, updatedRecord.avatar) 
        : null;

      onSave({
        ...updatedRecord,
        handle: updatedRecord.username,
        avatar_url: newAvatarUrl,
        avatarPreview: newAvatarUrl,
        portfolio: validLinks, // Masukkan validLinks agar UI langsung berubah
        skills: formData.skills
      });

    } catch (error) {
      console.error("Gagal update profil:", error);
      const errorMsg = error.response?.data?.username?.message || error.response?.message || "Terjadi kesalahan sistem.";
      alert(`Gagal: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f131f] rounded-2xl max-h-[90vh] overflow-y-auto w-full max-w-md shadow-2xl relative">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0f131f] border-b dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '18px' }}>Edit Profil</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div 
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden"
                style={{ borderRadius: '50%' }}
              >
                {formData.avatarPreview ? (
                  <img src={formData.avatarPreview} alt="Profil" className="w-full h-full object-cover rounded-full" style={{ borderRadius: '50%' }} />
                ) : (
                  formData.name.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 dark:bg-indigo-500 p-2 rounded-full cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-lg">
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isSubmitting} className="hidden" />
                <Plus size={16} className="text-white" />
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2" style={{ fontSize: '12px' }}>Klik ikon untuk ganti foto</p>
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Nama</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={isSubmitting} className={`w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border ${errors.name ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50`} style={{ fontSize: '14px' }} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* --- TAMPILAN BARU USERNAME DENGAN IKON CHECKER --- */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Username (@)</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                name="handle" 
                value={formData.handle} 
                onChange={handleInputChange} 
                disabled={isSubmitting} 
                className={`w-full px-3 py-2 pr-10 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border outline-none transition disabled:opacity-50 ${
                  usernameStatus === 'success' ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 
                  usernameStatus === 'error' || errors.handle ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 
                  'border-transparent focus:ring-2 focus:ring-indigo-500'
                }`} 
                style={{ fontSize: '14px' }} 
              />
              <div className="absolute right-3 flex items-center justify-center">
                {usernameStatus === 'loading' && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                {usernameStatus === 'success' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5"/></svg>}
                {usernameStatus === 'error' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>}
              </div>
            </div>
            {usernameMessage && (
              <p className={`text-xs mt-1 font-medium ${usernameStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {usernameMessage}
              </p>
            )}
            {errors.handle && !usernameMessage && <p className="text-red-500 text-xs mt-1">{errors.handle}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={isSubmitting} rows="3" className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none disabled:opacity-50" style={{ fontSize: '14px' }} />
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Skills</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()} disabled={isSubmitting} placeholder="Ketik skill..." className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50" style={{ fontSize: '14px' }} />
              <button onClick={handleAddSkill} disabled={isSubmitting} className="flex items-center justify-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"><Plus size={18} strokeWidth={2.5} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="bg-gray-100 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border dark:border-gray-700 flex items-center gap-2">
                  {skill}
                  <button onClick={() => !isSubmitting && handleRemoveSkill(idx)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-3" style={{ fontSize: '14px' }}>Social Links</label>
            <div className="space-y-3">
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Judul (ex: GitHub)"
                    value={link.title}
                    onChange={(e) => handleSocialLinkChange(idx, 'title', e.target.value)}
                    disabled={isSubmitting}
                    className="w-1/3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white outline-none disabled:opacity-50 border border-transparent focus:ring-2 focus:ring-indigo-500 transition"
                    style={{ fontSize: '14px' }}
                  />
                  <input
                    type="url"
                    placeholder="URL (ex: https://...)"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white outline-none disabled:opacity-50 border border-transparent focus:ring-2 focus:ring-indigo-500 transition"
                    style={{ fontSize: '14px' }}
                  />
                  <button 
                    onClick={() => handleRemoveSocialLink(idx)} 
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 p-2 transition disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddSocialLink}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline disabled:opacity-50 mt-2"
              >
                <Plus size={16} /> Tambah Link
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50" style={{ fontSize: '14px' }}>Batal</button>
            <button onClick={handleSave} disabled={isSubmitting || usernameStatus === 'error' || usernameStatus === 'loading'} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50" style={{ fontSize: '14px' }}>
              {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Menyimpan...</> : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Plus, Trash2, Link2 } from 'lucide-react';

const socialIconMap = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: 'Website',
  twitter: 'Twitter',
  instagram: 'Instagram'
};

export default function EditProfileModal({ currentUser, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    handle: currentUser.handle,
    bio: currentUser.bio,
    role: currentUser.role,
    skills: [...currentUser.skills],
    avatar: null,
    avatarPreview: null
  });

  const [socialLinks, setSocialLinks] = useState(currentUser.portfolio || {});
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});

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
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama tidak boleh kosong';
    if (!formData.handle.trim()) newErrors.handle = 'Handle tidak boleh kosong';
    if (formData.handle.includes(' ')) newErrors.handle = 'Handle tidak boleh mengandung spasi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ ...formData, portfolio: socialLinks });
    }
  };

  const socialKeys = ['github', 'linkedin', 'website', 'twitter', 'instagram'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f131f] rounded-2xl max-h-[90vh] overflow-y-auto w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0f131f] border-b dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '18px' }}>Edit Profil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {formData.avatarPreview ? (
                  <img src={formData.avatarPreview} alt="preview" className="w-full h-full rounded-full object-cover" />
                ) : (
                  formData.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 dark:bg-indigo-500 p-2 rounded-full cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-lg">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Plus size={16} className="text-white" />
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2" style={{ fontSize: '12px' }}>Klik ikon untuk ganti foto</p>
          </div>

          {/* Nama */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border ${errors.name ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 outline-none transition`}
              style={{ fontSize: '14px' }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1" style={{ fontSize: '12px' }}>{errors.name}</p>}
          </div>

          {/* Handle */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Handle (@)</label>
            <input
              type="text"
              name="handle"
              value={formData.handle}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border ${errors.handle ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 outline-none transition`}
              style={{ fontSize: '14px' }}
            />
            {errors.handle && <p className="text-red-500 text-xs mt-1" style={{ fontSize: '12px' }}>{errors.handle}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition"
              style={{ fontSize: '14px' }}
            >
              <option value="Ideator">💡 Punya Ide</option>
              <option value="Creator">🛠️ Eksekutor</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '14px' }}>Skills</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Ketik skill..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition"
                style={{ fontSize: '14px' }}
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium"
                style={{ fontSize: '14px' }}
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="bg-gray-100 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border dark:border-gray-700 flex items-center gap-2" style={{ fontSize: '12px' }}>
                  {skill}
                  <button onClick={() => handleRemoveSkill(idx)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-3" style={{ fontSize: '14px' }}>Social Links (opsional)</label>
            <div className="space-y-3">
              {socialKeys.map(key => (
                <div key={key} className="flex items-center gap-2">
                  <Link2 size={18} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    name={key}
                    value={socialLinks[key] || ''}
                    onChange={handleSocialLinkChange}
                    placeholder={`${socialIconMap[key]} URL...`}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white border border-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#1a1f2e] text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#252d3d] transition font-medium"
              style={{ fontSize: '14px' }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium"
              style={{ fontSize: '14px' }}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

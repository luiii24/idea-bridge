import React from 'react';
import { User } from 'lucide-react';
import pb from '../pocketbase';

export default function UserCard({ user, onClick }) {
  // Ambil URL gambar avatar dari PocketBase jika ada
  const avatarUrl = user.avatar ? pb.files.getUrl(user, user.avatar, { thumb: '100x100' }) : null;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
      
      {/* Avatar */}
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold overflow-hidden" style={{ borderRadius: '50%' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" style={{ borderRadius: '50%' }} />
        ) : (
          user.name?.charAt(0).toUpperCase() || <User size={24} />
        )}
      </div>

      {/* Info User */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{user.name}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">@{user.username}</p>
        
        {/* Render Skills (Maksimal 3 agar rapi) */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {user.skills && user.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-gray-100 dark:bg-[#0f131f] text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
              {skill}
            </span>
          ))}
          {user.skills && user.skills.length > 3 && (
            <span className="text-[10px] font-medium text-gray-400 px-1 py-1">+{user.skills.length - 3} lagi</span>
          )}
        </div>
      </div>

      {/* Tombol Lihat Profil */}
      <button 
        onClick={() => onClick(user)}
        className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-xl transition"
      >
        Lihat Profil
      </button>

    </div>
  );
}
import React from 'react';
import { ThumbsUp, Handshake } from 'lucide-react';

export default function PostCard({ post, handleVote, openWorkspace }) {
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
              <span className="font-bold text-gray-900 dark:text-white">{post.title}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{post.handle}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
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
}
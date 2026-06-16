import React from 'react';
import { ThumbsUp, Handshake, Clock } from 'lucide-react';

// Hapus import { currentUser } dari mockData. 
// Kita tangkap currentUser langsung dari props.
export default function PostCard({ post, handleVote, openWorkspace, currentUser }) {

  const formatTime = (rawTimestamp) => {
    const dateObj = new Date(rawTimestamp);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  };

  // Cek apakah user yang login sudah nge-vote post ini
  const hasVoted = post.upvoters?.includes(currentUser?.id);

  return (
    <div className="bg-white dark:bg-[#1a1f2e] p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#23293b] transition">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">{post.title}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">@{post.handle}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 mt-0.5">
                <Clock size={12} />
                <span className="text-[11px] font-medium">{formatTime(post.timestamp)}</span>
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
              {/* TOMBOL DUKUNGAN (THUMBS UP) */}
              <button 
                onClick={() => handleVote(post.id, 'up')} 
                className={`flex items-center gap-1.5 text-sm font-medium group transition ${
                  hasVoted 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <ThumbsUp 
                  size={16} 
                  fill={hasVoted ? "currentColor" : "none"} // Pindah ke sini!
                  className="group-hover:-translate-y-0.5 transition-transform" 
                />
                <span>{post.votes}</span>
              </button>

              {/* TOMBOL JEMBATANI (HANDSHAKE) */}
              <button 
                onClick={() => openWorkspace(post)} 
                className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium group transition"
              >
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
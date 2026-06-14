import React from 'react';

export default function UserCard({ user }) {
  return (
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
}
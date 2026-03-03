import React, { useState } from 'react';

const UserProfileCard = ({ user, onStartCall, onStartChat }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="relative bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-primary-500 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-accent-600/20"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-dark-700 overflow-hidden shadow-lg">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-dark-800"></div>
          </div>
          
          {/* Name */}
          <h3 className="text-xl font-bold text-dark-100 mt-3">
            {user.displayName || user.username}
          </h3>
          <p className="text-dark-500 text-sm">@{user.username}</p>
        </div>

        {/* Status */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Quick Actions */}
        <div className={`flex justify-center gap-3 transition-all duration-300 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <button
            onClick={() => onStartChat(user)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 hover:bg-primary-600 text-dark-100 text-sm font-medium transition-colors"
          >
            💬 Chat
          </button>
          <button
            onClick={() => onStartCall(user)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white text-sm font-medium transition-all"
          >
            📹 Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;

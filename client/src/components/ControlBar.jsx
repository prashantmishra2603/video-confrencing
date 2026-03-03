import React from 'react';

const ControlBar = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  isScreenSharing,
  onToggleScreenShare,
  onToggleChat,
  chatOpen,
  unreadMessages = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-dark-950 via-dark-900/95 to-transparent p-6 flex justify-center items-end">
      <div className="flex items-center gap-3 bg-dark-800/90 backdrop-blur-xl px-6 py-4 rounded-2xl border border-dark-700 shadow-2xl">
        {/* Mute Audio */}
        <button
          onClick={onToggleAudio}
          className={`group w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
            isAudioEnabled
              ? 'bg-dark-700 hover:bg-dark-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          <span className="group-hover:scale-110 transition-transform">
            {isAudioEnabled ? '🎤' : '🔇'}
          </span>
        </button>

        {/* Toggle Video */}
        <button
          onClick={onToggleVideo}
          className={`group w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
            isVideoEnabled
              ? 'bg-dark-700 hover:bg-dark-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          <span className="group-hover:scale-110 transition-transform">
            {isVideoEnabled ? '📹' : '📵'}
          </span>
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`group w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
            isScreenSharing
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-dark-700 hover:bg-dark-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <span className="group-hover:scale-110 transition-transform">
            🖥️
          </span>
        </button>

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`group relative w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
            chatOpen
              ? 'bg-accent-500 hover:bg-accent-600 text-white'
              : 'bg-dark-700 hover:bg-dark-600 text-white'
          }`}
          title={chatOpen ? 'Close Chat' : 'Open Chat'}
        >
          <span className="group-hover:scale-110 transition-transform">
            💬
          </span>
          {unreadMessages > 0 && !chatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>

        {/* Leave Call */}
        <button
          onClick={onLeave}
          className="group w-16 h-14 rounded-xl flex items-center justify-center text-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all ml-2"
          title="Leave Call"
        >
          <span className="group-hover:scale-110 transition-transform">
            📞
          </span>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;

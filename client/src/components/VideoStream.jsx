import React, { useRef, useEffect, useState } from 'react';

const VideoStream = ({ stream, isMuted = false, userName = 'User', isScreenShare = false, isVideoEnabled = true }) => {
  const videoRef = useRef(null);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const hasTrack = videoTracks.length > 0;
      // Show placeholder if no track OR if track is disabled
      setShowPlaceholder(!hasTrack || !isVideoEnabled);
    } else {
      setShowPlaceholder(true);
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
        style={{ display: showPlaceholder && !isScreenShare ? 'none' : 'block' }}
      />
      
      {/* User info overlay */}
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-3 py-1 rounded-md">
        <p className="text-white text-sm font-medium">{userName}</p>
      </div>

      {/* Video off indicator */}
      {showPlaceholder && !isScreenShare && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{userName}</p>
            <p className="text-gray-500 text-xs mt-1">Camera Off</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStream;

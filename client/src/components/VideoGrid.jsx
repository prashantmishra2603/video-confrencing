import React from 'react';
import VideoStream from './VideoStream';

const VideoGrid = ({ localStream, screenStream, remoteStreams, participants, localUser, isVideoEnabled = true, isAudioEnabled = true }) => {
  const totalParticipants = 1 + Object.keys(remoteStreams).length;

  // When screen sharing, show screen in full width
  const isScreenSharing = !!screenStream;

  // Responsive grid layout
  const getGridClass = () => {
    if (isScreenSharing) return 'grid-cols-1';
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-2 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  // When screen sharing, local video is smaller
  const getLocalVideoClass = () => {
    if (isScreenSharing) {
      return 'absolute bottom-4 right-4 w-48 h-32 rounded-lg overflow-hidden border-2 border-primary-500 z-10';
    }
    return 'w-full h-full min-h-[300px] rounded-lg overflow-hidden border-2 border-primary-500';
  };

  return (
    <div
      className={`grid ${getGridClass()} gap-3 w-full h-full p-3 bg-gray-900`}
    >
      {/* Screen share stream */}
      {isScreenSharing && (
        <div className="col-span-full h-full min-h-[500px] rounded-lg overflow-hidden border-2 border-blue-500">
          <VideoStream
            stream={screenStream}
            isMuted={true}
            userName={`${localUser?.displayName || 'You'}'s Screen`}
            isScreenShare={true}
            isVideoEnabled={true}
          />
        </div>
      )}

      {/* Local video - hide when screen sharing (shown as pip) */}
      {!isScreenSharing && (
        <div className={getLocalVideoClass()}>
          <VideoStream
            stream={localStream}
            isMuted={true}
            userName={localUser?.displayName || 'You'}
            isVideoEnabled={isVideoEnabled}
          />
        </div>
      )}

      {/* Remote videos */}
      {participants
        .filter((p) => remoteStreams[p.socketId])
        .map((participant) => (
          <div
            key={participant.socketId}
            className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border-2 border-gray-600 hover:border-primary-500 transition-colors"
          >
            <VideoStream
              stream={remoteStreams[participant.socketId]}
              isMuted={false}
              userName={participant.displayName || participant.username}
              isVideoEnabled={true}
            />
          </div>
        ))}
    </div>
  );
};

export default VideoGrid;

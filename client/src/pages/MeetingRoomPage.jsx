import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';
import { getSocket } from '../services/socket';
import { meetingService } from '../services/api';
import Navbar from '../components/Navbar';
import VideoGrid from '../components/VideoGrid';
import ControlBar from '../components/ControlBar';
import CopyButton from '../components/CopyButton';
import Button from '../components/Button';
import Chat from '../components/Chat';

const MeetingRoomPage = () => {
  const { roomId: paramRoomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const meeting = useMeeting();
  const socket = getSocket();

  const [meeting_data, setMeetingData] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [screenStream, setScreenStream] = useState(null);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const roomId = paramRoomId || meeting.roomId;

  useEffect(() => {
    if (!roomId || !user) {
      navigate('/dashboard');
      return;
    }

    // Fetch meeting data
    const fetchMeeting = async () => {
      try {
        const response = await meetingService.getMeetingByRoomId(roomId);
        setMeetingData(response.data.meeting);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch meeting');
      }
    };

    fetchMeeting();
  }, [roomId, user, navigate]);

  useEffect(() => {
    if (!socket || !user || !roomId) return;
    
    console.log('🔌 Connecting to room:', roomId);

    // Join room
    socket.emit('user-joined', {
      userId: user._id,
      username: user.username,
      displayName: user.displayName,
      roomId: roomId,
    });

    // Handle existing participants
    socket.on('existing-participants', (participants) => {
      console.log('👥 Existing participants:', participants.length);
      participants.forEach((participant) => {
        meeting.addParticipant(participant);
        initiateWebRTC(participant.socketId);
      });
    });

    // Handle new user joined
    socket.on('user-joined', (data) => {
      console.log('👋 User joined:', data.displayName);
      meeting.addParticipant(data);
      initiateWebRTC(data.socketId);
    });

    // Handle user left
    socket.on('user-left', (data) => {
      console.log('👋 User left:', data.displayName);
      meeting.removeParticipant(data.socketId);
    });

    // Handle chat messages
    socket.on('room-message', (data) => {
      setChatMessages((prev) => {
        // Only add if not from current user (prevents duplicates)
        const exists = prev.find((m) => m.id === data.id);
        if (exists) return prev;
        return [...prev, { ...data, isOwnMessage: data.senderId === user._id }];
      });
    });

    // WebRTC handlers
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('existing-participants');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-message');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, user, roomId, meeting]);

  // Initialize local stream
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        console.log('📷 Requesting media access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log('✅ Media access granted');
        
        meeting.setLocalStream(stream);
        meeting.setIsAudioEnabled(true);
        
        // Check if video track is enabled
        const videoTracks = stream.getVideoTracks();
        const videoEnabled = videoTracks.length > 0 && videoTracks[0].enabled;
        meeting.setIsVideoEnabled(videoEnabled);
        
        console.log('✅ Local stream initialized', { videoEnabled });
      } catch (err) {
        console.error('❌ Media error:', err);
        setError(
          'Unable to access camera/microphone. Please check permissions.\n' +
          'Error: ' + err.message
        );
      }
    };

    initLocalStream();

    return () => {
      if (meeting.localStream) {
        meeting.localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // WebRTC setup
  const peerConnections = useRef(new Map());
  const iceCandidatesQueue = useRef(new Map());
  const isInitiatorRef = useRef(new Map());

  const createPeerConnection = (socketId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        // STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add TURN servers for better connectivity (free public servers)
        {
          urls: 'turn:turn.bistu.com:3478',
          username: 'user',
          credential: 'pass'
        },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
    });

    // Add local stream
    if (meeting.localStream) {
      meeting.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, meeting.localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      meeting.addRemoteStream(socketId, event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: socketId,
          from: socket.id,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'disconnected'
      ) {
        peerConnection.close();
        peerConnections.current.delete(socketId);
        meeting.removeRemoteStream(socketId);
      }
    };

    peerConnections.current.set(socketId, peerConnection);

    // Process queued ICE candidates
    if (iceCandidatesQueue.current.has(socketId)) {
      iceCandidatesQueue.current.get(socketId).forEach((candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
      iceCandidatesQueue.current.delete(socketId);
    }

    return peerConnection;
  };

  const initiateWebRTC = async (socketId) => {
    // Prevent duplicate connections
    if (peerConnections.current.has(socketId)) {
      console.log('Peer connection already exists for', socketId);
      return;
    }
    
    // Only the user who joined later should initiate the offer
    // The user who was already in the room waits for the offer
    const peerConnection = createPeerConnection(socketId);
    isInitiatorRef.current.set(socketId, true);

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('offer', {
        offer: offer,
        to: socketId,
        from: socket.id,
        displayName: user.displayName,
      });
      console.log('📤 Offer sent to', socketId);
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const handleOffer = async (data) => {
    const { offer, from } = data;

    if (!peerConnections.current.has(from)) {
      createPeerConnection(from);
    }

    const peerConnection = peerConnections.current.get(from);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('answer', {
        answer: answer,
        to: from,
        from: socket.id,
      });
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  const handleAnswer = async (data) => {
    const { answer, from } = data;
    const peerConnection = peerConnections.current.get(from);

    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  };

  const handleIceCandidate = (data) => {
    const { candidate, from } = data;

    if (peerConnections.current.has(from)) {
      const peerConnection = peerConnections.current.get(from);
      try {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    } else {
      // Queue the candidate if peer connection doesn't exist yet
      if (!iceCandidatesQueue.current.has(from)) {
        iceCandidatesQueue.current.set(from, []);
      }
      iceCandidatesQueue.current.get(from).push(candidate);
    }
  };

  const handleToggleAudio = () => {
    const newState = !meeting.isAudioEnabled;
    meeting.toggleAudio();
    socket.emit('toggle-audio', {
      roomId,
      enabled: newState,
    });
  };

  const handleToggleVideo = () => {
    const newState = !meeting.isVideoEnabled;
    meeting.toggleVideo();
    socket.emit('toggle-video', {
      roomId,
      enabled: newState,
    });
  };

  const handleScreenShare = async () => {
    if (meeting.isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      meeting.setIsScreenSharing(false);
      
      // Restore camera stream
      if (meeting.localStream) {
        peerConnections.current.forEach((pc) => {
          const videoTrack = meeting.localStream.getVideoTracks()[0];
          if (videoTrack) {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          }
        });
      }
      
      socket.emit('screen-share-stopped', { roomId });
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        meeting.setIsScreenSharing(true);
        
        // Replace video track in all peer connections
        const videoTrack = stream.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        
        // Handle user stopping screen share from browser UI
        videoTrack.onended = () => {
          handleScreenShare();
        };
        
        socket.emit('screen-share-started', { roomId });
      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    }
  };

  const handleLeaveCall = () => {
    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop local stream
    if (meeting.localStream) {
      meeting.localStream.getTracks().forEach((track) => track.stop());
    }

    socket.emit('user-left', { roomId });
    navigate('/dashboard');
  };

  const handleSendMessage = (text) => {
    const message = {
      id: Date.now(),
      text,
      senderId: user._id,
      senderName: user.displayName,
      timestamp: new Date().toISOString(),
      isOwnMessage: true,
    };
    // Don't add locally - wait for server echo to avoid duplicates
    // setChatMessages((prev) => [...prev, message]);
    
    // Send to room
    socket.emit('room-message', {
      roomId,
      message,
    });
  };

  const handleToggleChat = () => {
    setChatOpen(!chatOpen);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="bg-dark-900 p-8 rounded-2xl border border-dark-700 text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-dark-200 text-lg mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const meetingLink = `${window.location.origin}/meeting/${roomId}`;

  return (
    <div className="h-screen w-screen bg-dark-950 flex flex-col overflow-hidden">
      {/* Top Info Bar */}
      {showInfo && (
        <div className="bg-gradient-to-r from-dark-900 to-dark-950 border-b border-dark-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">
                {meeting_data?.title || 'Video Meeting'}
              </h2>
              <p className="text-dark-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Room: {roomId} • Participants: {meeting.participants.length + 1}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleToggleChat}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  chatOpen 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                💬 Chat
                {chatMessages.length > 0 && (
                  <span className="bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">
                    {chatMessages.length}
                  </span>
                )}
              </button>
              <CopyButton text={meetingLink} label="📋 Copy" />
              <Button
                onClick={() => setShowInfo(false)}
                variant="ghost"
                size="sm"
                className="text-dark-400"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 overflow-hidden relative">
        <VideoGrid
          localStream={meeting.localStream}
          screenStream={screenStream}
          remoteStreams={meeting.remoteStreams}
          participants={meeting.participants}
          localUser={user}
          isVideoEnabled={meeting.isVideoEnabled}
          isAudioEnabled={meeting.isAudioEnabled}
        />
        
        {/* Floating Chat */}
        {chatOpen && (
          <div className="absolute top-4 right-4 h-[calc(100%-2rem)] z-10">
            <Chat
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              chatWith={{ displayName: 'Meeting Chat' }}
              isGroupChat={true}
            />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        isAudioEnabled={meeting.isAudioEnabled}
        isVideoEnabled={meeting.isVideoEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onLeave={handleLeaveCall}
        isScreenSharing={meeting.isScreenSharing}
        onToggleScreenShare={handleScreenShare}
        onToggleChat={handleToggleChat}
        chatOpen={chatOpen}
        unreadMessages={chatMessages.length}
      />
    </div>
  );
};

export default MeetingRoomPage;

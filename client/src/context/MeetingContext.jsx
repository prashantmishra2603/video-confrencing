import React, { createContext, useContext, useState, useCallback } from 'react';

const MeetingContext = createContext();

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within MeetingProvider');
  }
  return context;
};

export const MeetingProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  
  // Direct call state
  const [directCall, setDirectCall] = useState({
    isOpen: false,
    callData: null,
    status: null, // 'calling', 'ringing', 'connected', 'ended'
    localStream: null,
    remoteStream: null,
  });

  const addParticipant = useCallback((participant) => {
    setParticipants((prev) => {
      const exists = prev.find((p) => p.socketId === participant.socketId);
      if (exists) return prev;
      return [...prev, participant];
    });
  }, []);

  const removeParticipant = useCallback((socketId) => {
    setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[socketId];
      return newStreams;
    });
  }, []);

  const addRemoteStream = useCallback((socketId, stream) => {
    setRemoteStreams((prev) => ({
      ...prev,
      [socketId]: stream,
    }));
  }, []);

  const removeRemoteStream = useCallback((socketId) => {
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[socketId];
      return newStreams;
    });
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      // Update state based on track enabled status
      const videoEnabled = localStream.getVideoTracks()[0]?.enabled;
      setIsVideoEnabled(videoEnabled);
    }
  }, [localStream]);

  // Chat functions
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    }]);
  }, []);

  const openChat = useCallback((contact = null) => {
    setChatWith(contact);
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Direct call functions
  const startDirectCall = useCallback((callData) => {
    setDirectCall({
      isOpen: true,
      callData,
      status: 'calling',
      localStream: null,
      remoteStream: null,
    });
  }, []);

  const receiveIncomingCall = useCallback((callData) => {
    setDirectCall({
      isOpen: true,
      callData,
      status: 'ringing',
      localStream: null,
      remoteStream: null,
    });
  }, []);

  const acceptCall = useCallback(() => {
    setDirectCall((prev) => ({
      ...prev,
      status: 'connected',
    }));
  }, []);

  const declineCall = useCallback(() => {
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  }, []);

  const endCall = useCallback(() => {
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  }, []);

  const updateDirectCallStreams = useCallback((localStream, remoteStream) => {
    setDirectCall((prev) => ({
      ...prev,
      localStream,
      remoteStream,
    }));
  }, []);

  const value = {
    roomId,
    setRoomId,
    participants,
    addParticipant,
    removeParticipant,
    localStream,
    setLocalStream,
    remoteStreams,
    addRemoteStream,
    removeRemoteStream,
    isAudioEnabled,
    setIsAudioEnabled,
    toggleAudio,
    isVideoEnabled,
    setIsVideoEnabled,
    toggleVideo,
    isScreenSharing,
    setIsScreenSharing,
    // Chat
    messages,
    addMessage,
    isChatOpen,
    openChat,
    closeChat,
    chatWith,
    // Direct call
    directCall,
    startDirectCall,
    receiveIncomingCall,
    acceptCall,
    declineCall,
    endCall,
    updateDirectCallStreams,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

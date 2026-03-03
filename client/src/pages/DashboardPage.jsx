import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';
import { meetingService, userService } from '../services/api';
import { getSocket } from '../services/socket';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import ContactList from '../components/ContactList';
import UserProfileCard from '../components/UserProfileCard';
import Chat from '../components/Chat';
import DirectCall from '../components/DirectCall';

const DashboardPage = () => {
  const { user } = useAuth();
  const meeting = useMeeting();
  const navigate = useNavigate();
  const socket = getSocket();

  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [directCall, setDirectCall] = useState({
    isOpen: false,
    callData: null,
    status: null,
    localStream: null,
    remoteStream: null,
  });

  useEffect(() => {
    fetchMeetings();
    fetchOnlineUsers();

    // Listen for incoming calls
    if (socket) {
      socket.on('incoming-call', handleIncomingCall);
      socket.on('call-accepted', handleCallAccepted);
      socket.on('call-declined', handleCallDeclined);
      socket.on('call-ended', handleCallEnded);
      socket.on('offer-call', handleOfferCall);
      socket.on('answer-call', handleAnswerCall);
      socket.on('ice-candidate-call', handleIceCandidateCall);
    }

    // Refresh online users periodically
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('incoming-call');
        socket.off('call-accepted');
        socket.off('call-declined');
        socket.off('call-ended');
        socket.off('offer-call');
        socket.off('answer-call');
        socket.off('ice-candidate-call');
      }
    };
  }, []);

  // WebRTC for direct calls
  const peerConnectionRef = React.useRef(null);

  const fetchMeetings = async () => {
    try {
      const response = await meetingService.getUserMeetings();
      setMeetings(response.data.meetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await userService.getOnlineUsers();
      // Filter out current user
      const otherUsers = response.data.users.filter((u) => u._id !== user._id);
      setOnlineUsers(otherUsers);
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await meetingService.createMeeting(
        formData.title || 'Video Meeting',
        formData.description
      );

      meeting.setRoomId(response.data.meeting.roomId);
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);

      navigate(`/meeting/${response.data.meeting.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    meeting.setRoomId(roomCode.toUpperCase());
    navigate(`/meeting/${roomCode.toUpperCase()}`);
  };

  // Chat functions
  const handleStartChat = (contact) => {
    setChatContact(contact);
    setChatMessages([]);
    setChatOpen(true);
  };

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      senderId: user._id,
      senderName: user.displayName,
      timestamp: new Date().toISOString(),
      isOwnMessage: true,
    };
    // Don't add locally - wait for server echo to avoid duplicates
    // setChatMessages((prev) => [...prev, newMessage]);

    // Send via socket
    if (socket && chatContact) {
      socket.emit('private-message', {
        to: chatContact._id,
        message: newMessage,
      });
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('private-message', (data) => {
        // Only add if not from current user (prevents duplicates)
        setChatMessages((prev) => {
          const exists = prev.find((m) => m.id === data.message.id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      });
    }
    return () => {
      if (socket) {
        socket.off('private-message');
      }
    };
  }, [socket]);

  // Direct call functions
  const handleStartCall = async (contact) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setDirectCall({
        isOpen: true,
        callData: contact,
        status: 'calling',
        localStream: stream,
        remoteStream: null,
      });

      // Notify the user via socket
      socket.emit('call-user', {
        to: contact._id,
        from: {
          _id: user._id,
          displayName: user.displayName,
          username: user.username,
        },
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call. Please check camera/microphone permissions.');
    }
  };

  const handleIncomingCall = (data) => {
    setDirectCall({
      isOpen: true,
      callData: data.from,
      status: 'ringing',
      localStream: null,
      remoteStream: null,
    });
  };

  const handleAcceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setDirectCall((prev) => ({
        ...prev,
        status: 'connected',
        localStream: stream,
      }));

      socket.emit('accept-call', {
        to: directCall.callData._id,
        from: user._id,
      });
    } catch (err) {
      console.error('Error accepting call:', err);
    }
  };

  const handleDeclineCall = () => {
    socket.emit('decline-call', {
      to: directCall.callData._id,
      from: user._id,
    });
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  };

  const handleEndCall = () => {
    if (directCall.localStream) {
      directCall.localStream.getTracks().forEach(track => track.stop());
    }
    socket.emit('end-call', {
      to: directCall.callData?._id,
      from: user._id,
    });
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  };

  // WebRTC handlers for direct calls
  const handleOfferCall = async (data) => {
    // Handle offer for direct call
  };

  const handleAnswerCall = async (data) => {
    // Handle answer for direct call
  };

  const handleIceCandidateCall = (data) => {
    // Handle ICE candidate for direct call
  };

  const handleCallAccepted = (data) => {
    setDirectCall((prev) => ({
      ...prev,
      status: 'connected',
    }));
  };

  const handleCallDeclined = (data) => {
    if (directCall.localStream) {
      directCall.localStream.getTracks().forEach(track => track.stop());
    }
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  };

  const handleCallEnded = (data) => {
    if (directCall.localStream) {
      directCall.localStream.getTracks().forEach(track => track.stop());
    }
    setDirectCall({
      isOpen: false,
      callData: null,
      status: null,
      localStream: null,
      remoteStream: null,
    });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-dark-950 to-accent-900/20"></div>
        <div className="absolute inset-0 hero-pattern opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {user?.displayName || user?.username}!
              </span>
            </h1>
            <p className="text-dark-400 text-lg">
              Start a new meeting, join an existing one, or connect with your contacts
            </p>
          </div>

          {/* Main Action Card */}
          <div className="bg-dark-900/80 backdrop-blur-xl rounded-3xl border border-dark-700/50 p-8 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Meeting */}
              <button
                onClick={() => {
                  const newRoomId = Math.random().toString(36).substring(2, 12).toUpperCase();
                  meeting.setRoomId(newRoomId);
                  navigate(`/meeting/${newRoomId}`);
                }}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 text-2xl">
                    📹
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Start Meeting</h3>
                  <p className="text-primary-100 text-sm">
                    Create a new video meeting instantly
                  </p>
                </div>
              </button>

              {/* Join Meeting */}
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center mb-4 text-2xl">
                    🔗
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Join Meeting</h3>
                  <p className="text-dark-400 text-sm mb-4">
                    Enter a room code to join
                  </p>
                  <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Room code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Join
                    </button>
                  </form>
                </div>
              </div>

              {/* Schedule Meeting */}
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 text-2xl">
                    📅
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Schedule</h3>
                  <p className="text-accent-100 text-sm">
                    Plan a meeting for later
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Create Meeting Form */}
          {showCreateForm && (
            <div className="bg-dark-900/80 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-6 mb-8 animate-float">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✨</span> Create New Meeting
              </h3>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Meeting Title"
                    type="text"
                    placeholder="My Meeting"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <Input
                    label="Description (Optional)"
                    type="text"
                    placeholder="Add a description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-primary-600 to-primary-500"
                  >
                    {loading ? 'Creating...' : 'Create Meeting'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ title: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Online Users */}
          <div className="lg:col-span-1">
            <ContactList
              contacts={onlineUsers}
              onStartCall={handleStartCall}
              onStartChat={handleStartChat}
              title={`Online Users (${onlineUsers.length})`}
            />
          </div>

          {/* Recent Meetings */}
          <div className="lg:col-span-2">
            {meetings.length > 0 ? (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <span>📋</span> Your Meetings
                  </h3>
                </div>
                <div className="divide-y divide-dark-700">
                  {meetings.slice(0, 5).map((meet) => (
                    <div
                      key={meet._id}
                      className="p-4 hover:bg-dark-700/50 transition-colors cursor-pointer"
                      onClick={() => {
                        meeting.setRoomId(meet.roomId);
                        navigate(`/meeting/${meet.roomId}`);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-xl">
                          📹
                        </div>
                        <div className="flex-1">
                          <h4 className="text-dark-100 font-medium">
                            {meet.title}
                          </h4>
                          <p className="text-dark-500 text-sm">
                            Room: {meet.roomId} • {meet.participants.length} participants
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-dark-200 text-lg font-medium mb-2">
                  No meetings yet
                </h3>
                <p className="text-dark-500">
                  Create a meeting to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <Chat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        chatWith={chatContact}
      />

      {/* Direct Call Component */}
      <DirectCall
        isOpen={directCall.isOpen}
        onClose={handleEndCall}
        callData={directCall.callData}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        localStream={directCall.localStream}
        remoteStream={directCall.remoteStream}
        callStatus={directCall.status}
      />
    </div>
  );
};

export default DashboardPage;

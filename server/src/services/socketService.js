import User from '../models/User.js';
import Meeting from '../models/Meeting.js';

export const setupSocketEvents = (io) => {
  // Track active connections
  const activeConnections = new Map();
  const rooms = new Map();

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on('user-joined', async (data) => {
      const { userId, username, displayName, roomId } = data;

      try {
        // Store connection info
        activeConnections.set(socket.id, {
          userId,
          username,
          displayName,
          roomId,
          socketId: socket.id,
        });

        // Update user as online
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        // Join socket room
        socket.join(roomId);

        // Update meeting with participant
        const meeting = await Meeting.findOne({ roomId });
        if (meeting) {
          meeting.participants.push({
            userId,
            socketId: socket.id,
            displayName,
          });
          await meeting.save();
        }

        // Notify others in room
        socket.to(roomId).emit('user-joined', {
          userId,
          username,
          displayName,
          socketId: socket.id,
        });

        // Send existing participants to new user
        if (meeting) {
          const otherParticipants = meeting.participants.filter(
            (p) => p.socketId !== socket.id
          );
          socket.emit('existing-participants', otherParticipants);
        }

        console.log(`👤 ${displayName} joined room ${roomId}`);
      } catch (error) {
        console.error('Error handling user-joined:', error);
      }
    });

    // Room chat messages
    socket.on('room-message', (data) => {
      const { roomId, message } = data;
      // Broadcast to all users in the room including sender
      io.to(roomId).emit('room-message', message);
    });

    // Private messages (one-to-one chat)
    socket.on('private-message', (data) => {
      const { to, message } = data;
      // Find the socket ID of the recipient
      const recipientSocket = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to || conn.socketId === to);
      
      if (recipientSocket) {
        io.to(recipientSocket[0]).emit('private-message', { message });
      }
    });

    // Call user (initiate one-to-one video call)
    socket.on('call-user', async (data) => {
      const { to, from } = data;
      
      // Find the recipient's socket
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('incoming-call', {
          from,
          roomId: data.roomId,
        });
      }
    });

    // Accept call
    socket.on('accept-call', (data) => {
      const { to } = data;
      
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('call-accepted', { from: socket.id });
      }
    });

    // Decline call
    socket.on('decline-call', (data) => {
      const { to } = data;
      
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('call-declined', { from: socket.id });
      }
    });

    // End call
    socket.on('end-call', (data) => {
      const { to } = data;
      
      if (to) {
        const recipientEntry = Array.from(activeConnections.entries())
          .find(([socketId, conn]) => conn.userId === to);
        
        if (recipientEntry) {
          io.to(recipientEntry[0]).emit('call-ended', { from: socket.id });
        }
      }
    });

    // WebRTC Offer for direct calls
    socket.on('offer-call', (data) => {
      const { to, offer, from } = data;
      
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('offer-call', {
          offer,
          from,
        });
      }
    });

    // WebRTC Answer for direct calls
    socket.on('answer-call', (data) => {
      const { to, answer, from } = data;
      
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('answer-call', {
          answer,
          from,
        });
      }
    });

    // ICE candidates for direct calls
    socket.on('ice-candidate-call', (data) => {
      const { to, candidate, from } = data;
      
      const recipientEntry = Array.from(activeConnections.entries())
        .find(([socketId, conn]) => conn.userId === to);
      
      if (recipientEntry) {
        io.to(recipientEntry[0]).emit('ice-candidate-call', {
          candidate,
          from,
        });
      }
    });

    // WebRTC Offer (for meeting room)
    socket.on('offer', (data) => {
      const { offer, to, from, displayName } = data;

      socket.to(to).emit('offer', {
        offer,
        from,
        displayName,
      });

      console.log(`📤 Offer sent from ${from} to ${to}`);
    });

    // WebRTC Answer (for meeting room)
    socket.on('answer', (data) => {
      const { answer, to, from } = data;

      socket.to(to).emit('answer', {
        answer,
        from,
      });

      console.log(`📥 Answer sent from ${from} to ${to}`);
    });

    // ICE Candidate (for meeting room)
    socket.on('ice-candidate', (data) => {
      const { candidate, to, from } = data;

      socket.to(to).emit('ice-candidate', {
        candidate,
        from,
      });
    });

    // Toggle audio
    socket.on('toggle-audio', (data) => {
      const { roomId, enabled } = data;
      socket.to(roomId).emit('user-audio-toggle', {
        userId: socket.id,
        enabled,
      });
    });

    // Toggle video
    socket.on('toggle-video', (data) => {
      const { roomId, enabled } = data;
      socket.to(roomId).emit('user-video-toggle', {
        userId: socket.id,
        enabled,
      });
    });

    // Screen share started
    socket.on('screen-share-started', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-screen-share-started', {
        userId: socket.id,
      });
      console.log(`🖥️ Screen share started by ${socket.id}`);
    });

    // Screen share stopped
    socket.on('screen-share-stopped', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-screen-share-stopped', {
        userId: socket.id,
      });
      console.log(`🖥️ Screen share stopped by ${socket.id}`);
    });

    // User disconnection
    socket.on('disconnect', async () => {
      try {
        const connectionData = activeConnections.get(socket.id);

        if (connectionData) {
          const { userId, displayName, roomId } = connectionData;

          // Update user as offline
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
          });

          // Update meeting
          const meeting = await Meeting.findOne({ roomId });
          if (meeting) {
            meeting.participants = meeting.participants.filter(
              (p) => p.socketId !== socket.id
            );
            await meeting.save();
          }

          // Notify others in room
          if (roomId) {
            socket.to(roomId).emit('user-left', {
              userId,
              displayName,
              socketId: socket.id,
            });
          }

          activeConnections.delete(socket.id);
          console.log(`👋 ${displayName} left`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

export default setupSocketEvents;

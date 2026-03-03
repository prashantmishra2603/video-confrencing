# 🏗️ System Architecture & Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages: Login, Signup, Dashboard, MeetingRoom            │  │
│  │  Components: VideoGrid, ControlBar, Navbar              │  │
│  │  State: AuthContext, MeetingContext                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ HTTP/WebSocket                    │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                              
┌─────────────────────────────────────────────────────────────────┐
│                    Network Layer (Internet)                      │
│                                                                  │
│     ┌──────────────┐          ┌──────────────┐               │
│     │  STUN Server │          │  TURN Server │ (if needed)   │
│     │ (Google)     │          │  (optional)  │               │
│     └──────────────┘          └──────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REST API Routes:                                         │  │
│  │  • /api/auth (signup, login, profile)                    │  │
│  │  • /api/users (online users, profiles)                   │  │
│  │  • /api/meetings (create, join, history)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WebSocket Service (Socket.io):                           │  │
│  │  • Signaling (offer, answer, ICE)                        │  │
│  │  • User presence (join, leave)                           │  │
│  │  • Media controls (audio, video toggles)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication:                                          │  │
│  │  • JWT token generation & validation                      │  │
│  │  • Password hashing (bcryptjs)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ MongoDB Driver                    │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database (MongoDB):                                      │  │
│  │  • Users Collection                                      │  │
│  │  • Meetings Collection                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    P2P Video Stream (WebRTC)                     │
│                                                                  │
│  Participant A ←→ (Encrypted Media Streams) ←→ Participant B   │
│                                                                  │
│  All video/audio transmitted directly (no server intermediary) │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Authentication Flow
```
1. User visits frontend
   ↓
2. Auth context checks for JWT in localStorage
   ↓
3. If no token → redirect to login
   ↓
4. User enters credentials → POST /api/auth/login
   ↓
5. Backend validates password with bcryptjs
   ↓
6. If valid → generate JWT token → return to frontend
   ↓
7. Frontend stores token in localStorage
   ↓
8. Redirect to dashboard
```

### WebRTC Video Call Flow
```
User A                          Signaling Server                  User B
  │                                   │                              │
  │─── user-joined event ────────────→│                              │
  │                                   │← user-joined event ──────────│
  │                                   │                              │
  │─── create offer ───────────────────────────────────────────────→│
  │(via createOffer() RTCPeerConnection)                            │
  │                                   │                              │
  │                              (via Socket.io)                     │
  │                                   │                              │
  │                        receive offer, create answer             │
  │←─── answer + ICE candidates ─────────────────────────────────────│
  │                                   │                              │
  │─── ICE candidates exchange ───────────────────────────────────→│
  │(for NAT traversal)                                              │
  │                                   │                              │
  │ ━━━━━━━━ P2P Connection Established ━━━━━━━━                  │
  │                    (Direct Media Stream)                        │
  │                                                                  │
```

### Meeting Room DataFlow
```
Create Room:
  User → Frontend → /api/meetings/create → Backend → MongoDB
                                            ↓
                                    Generate unique roomId
                                    Create Meeting doc
                                            ↓
                                  Return to frontend

Join Room:
  User → Frontend → enter roomId → /api/meetings/room/:roomId
                                            ↓
                                   Backend validates room exists
                                            ↓
                                  Connect via Socket.io
                                            ↓
  Backend → emit "user-joined" → notify existing participants
                                            ↓
  Existing participants → initiate WebRTC offer → new user
```

## Component Architecture

### Context API Structure

**AuthContext:**
- Manages user authentication state
- Handles login/signup/logout
- Validates JWT tokens
- Stores user profile data

**MeetingContext:**
- Manages current meeting state
- Tracks participants list
- Manages local/remote media streams
- Handles audio/video toggle state

### Component Hierarchy

```
App
├── Router
│   ├── LoginPage
│   ├── SignupPage
│   └── PrivateRoute
│       ├── DashboardPage
│       │   ├── Navbar
│       │   └── [Meeting Cards, Online Users]
│       └── MeetingRoomPage
│           ├── Navbar
│           ├── VideoGrid
│           │   ├── VideoStream (Local)
│           │   └── VideoStream[] (Remote)
│           └── ControlBar
```

## WebSocket Events Architecture

### Server-Side Event Handling

```javascript
// Connection established
socket.on('connect')

// User events
socket.on('user-joined')
socket.on('user-left')

// WebRTC signaling
socket.on('offer')
socket.on('answer')
socket.on('ice-candidate')

// Media control
socket.on('toggle-audio')
socket.on('toggle-video')

// Disconnection
socket.on('disconnect')
```

### Client-Side Event Handling

```javascript
// Emit events to server
socket.emit('user-joined', userData)
socket.emit('offer', {...})
socket.emit('answer', {...})
socket.emit('ice-candidate', {...})

// Listen for events
socket.on('user-joined', handleUserJoined)
socket.on('existing-participants', handleExisting)
socket.on('offer', handleOffer)
socket.on('answer', handleAnswer)
socket.on('ice-candidate', handleICE)
socket.on('user-left', handleUserLeft)
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  displayName: String,
  avatar: String (URL),
  isOnline: Boolean,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Meeting Collection
```javascript
{
  _id: ObjectId,
  roomId: String (unique, required),
  createdBy: ObjectId (ref: User),
  title: String,
  description: String,
  participants: [
    {
      userId: ObjectId (ref: User),
      socketId: String,
      displayName: String,
      joinedAt: Date,
      leftAt: Date
    }
  ],
  status: String (enum: ['ongoing', 'completed']),
  startedAt: Date,
  endedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Specification

### Authentication Endpoints

**POST /api/auth/signup**
```
Request: {
  username: string,
  email: string,
  password: string,
  displayName?: string
}
Response: {
  success: boolean,
  token: string,
  user: { ... }
}
Status: 201 Created | 400 Bad Request | 409 Conflict
```

**POST /api/auth/login**
```
Request: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  token: string,
  user: { ... }
}
Status: 200 OK | 401 Unauthorized
```

**GET /api/auth/me**
```
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  user: { ... }
}
Status: 200 OK | 401 Unauthorized | 404 Not Found
```

### User Endpoints

**GET /api/users/online**
```
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  users: [User]
}
Status: 200 OK | 401 Unauthorized
```

**GET /api/users/:userId**
```
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  user: User
}
Status: 200 OK | 401 Unauthorized | 404 Not Found
```

**PUT /api/users/:userId**
```
Headers: Authorization: Bearer {token}
Request: {
  displayName?: string,
  avatar?: string
}
Response: {
  success: boolean,
  user: User
}
Status: 200 OK | 401 Unauthorized | 403 Forbidden
```

### Meeting Endpoints

**POST /api/meetings/create**
```
Headers: Authorization: Bearer {token}
Request: {
  title?: string,
  description?: string
}
Response: {
  success: boolean,
  meeting: Meeting
}
Status: 201 Created | 401 Unauthorized
```

**GET /api/meetings/room/:roomId**
```
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  meeting: Meeting
}
Status: 200 OK | 401 Unauthorized | 404 Not Found
```

**GET /api/meetings/user/history**
```
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  meetings: [Meeting]
}
Status: 200 OK | 401 Unauthorized
```

## Security Architecture

### Authentication & Authorization

```
┌─ Frontend ────────────────┐
│                           │
│ 1. User Credentials       │
│    ↓                      │
│ 2. POST /login            │
│    ↓                      │
│ Backend Validates:        │
│ • Email format            │
│ • Password hash match     │
│    ↓                      │
│ 3. Generate JWT           │
│ • userId + expiry         │
│ • Sign with secret key    │
│    ↓                      │
│ 4. Return token           │
│    ↓                      │
│ 5. Store in localStorage  │
│    ↓                      │
│ All subsequent requests   │
│ include Bearer token      │
│   
└─ Protected API ───────────┘

Every protected endpoint:
1. Extracts token from header
2. Verifies signature
3. Checks expiry
4. Returns 401 if invalid
```

### Password Security

```
User enters password
        ↓
bcrypt.hash(password, saltRounds=10)
        ↓
Stored in database as hash
        ↓
On login: bcrypt.compare(input, stored_hash)
        ↓
Returns boolean match
```

## Performance Optimization

### Frontend Optimization
- React.lazy for code splitting
- useCallback to prevent re-renders
- useMemo for expensive calculations
- Image optimization via CDN
- Tailwind CSS purging unused styles

### Backend Optimization
- MongoDB indexes on frequently queried fields
- Connection pooling
- Compression middleware
- Caching for online users
- Efficient socket event handling

### WebRTC Optimization
- Adaptive bitrate streaming
- Video quality scaling based on bandwidth
- ICE candidate batching
- Connection state monitoring

## Error Handling Strategy

### Frontend Error Handling
```javascript
try {
  // API call
  const response = await api.post('/login', data);
} catch (error) {
  // Network error
  if (!error.response) {
    console.error('Network error');
  }
  // Server error
  else {
    const message = error.response.data.message;
    console.error('API Error:', message);
  }
}
```

### Backend Error Handling
```javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
});
```

## Scalability Considerations

### Current Capacity
- Supports hundreds of concurrent meetings
- Each meeting peers connect directly (P2P)
- Server only handles signaling (lightweight)
- MongoDB can handle thousands of users

### Future Scaling
- Add Redis for session management
- Implement message queuing (RabbitMQ)
- Create microservices for meetings
- Implement database sharding
- Add CDN for static assets
- Deploy multiple instances with load balancer

---

This architecture ensures scalability, security, and performance for a production-ready video conferencing platform.

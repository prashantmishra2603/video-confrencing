# UniMeet - Real-Time Video Conferencing Application

A complete, production-ready video conferencing web application built with MERN stack (MongoDB, Express, React, Node.js), WebRTC for peer-to-peer video connections, and Socket.io for real-time signaling.

## 🚀 Features

### Authentication
- ✅ User Signup/Login with JWT authentication
- ✅ Secure password hashing with bcryptjs
- ✅ Protected routes for authenticated users
- ✅ User profiles with avatars and display names

### Video Conferencing
- ✅ One-to-one and multi-user video calls
- ✅ WebRTC peer-to-peer connections
- ✅ HD video quality (up to 1280x720)
- ✅ Crystal clear audio with echo cancellation
- ✅ Mute/Unmute audio controls
- ✅ Enable/Disable camera controls
- ✅ Automatic ICE candidate handling

### Meeting Management
- ✅ Create unique meeting rooms with custom room IDs
- ✅ Join meetings using room codes
- ✅ Responsive video grid layout
- ✅ Display participant names and info
- ✅ Real-time participant join/leave notifications
- ✅ Meeting history tracking

### User Experience
- ✅ Beautiful, modern UI with Tailwind CSS
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Copy meeting link feature
- ✅ Online users list
- ✅ Optimized bandwidth management

## 📁 Project Structure

```
project3/
├── client/                          # Frontend (React + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoStream.jsx
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── CopyButton.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/                 # State management
│   │   │   ├── AuthContext.jsx
│   │   │   └── MeetingContext.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── MeetingRoomPage.jsx
│   │   ├── services/                # API and Socket services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
└── server/                          # Backend (Node.js + Express)
    ├── src/
    │   ├── config/
    │   │   └── database.js          # MongoDB connection
    │   ├── models/
    │   │   ├── User.js              # User schema
    │   │   └── Meeting.js           # Meeting schema
    │   ├── middleware/
    │   │   └── auth.js              # JWT authentication
    │   ├── routes/
    │   │   ├── auth.js              # Auth endpoints
    │   │   ├── users.js             # User endpoints
    │   │   └── meetings.js          # Meeting endpoints
    │   ├── services/
    │   │   └── socketService.js     # WebRTC signaling
    │   └── index.js                 # Main server file
    ├── package.json
    ├── .env.example
    └── .gitignore
```

## 🛠️ Tech Stack

**Frontend:**
- React 18.2.0
- React Router DOM 6
- Tailwind CSS 3
- Axios for API calls
- Socket.io-client for real-time communication
- Vite for bundling

**Backend:**
- Node.js
- Express.js 4
- MongoDB with Mongoose
- Socket.io 4.5
- JWT for authentication
- bcryptjs for password hashing

**Real-Time Communication:**
- WebRTC for P2P video
- Socket.io for signaling

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud - MongoDB Atlas)
- Git

### Backend Setup

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables in .env:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/video-conferencing?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Getting MongoDB URI:**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account and cluster
- Get your connection string
- Replace `<username>` and `<password>` with your credentials

5. **Start backend server**
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Update .env (optional - defaults work for local development)**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Start frontend development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🚀 Running the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Test the Application

1. **Sign up** with a new account
2. **Login** with your credentials
3. **Create a meeting** or enter a room code
4. **Share the meeting link** with others to join
5. **Start video conferencing!**

To test with multiple users:
- Open another browser window/incognito tab
- Sign up with a different account
- Join the same meeting room

## 📱 Key Features Walkthrough

### Authentication Flow
1. User signs up with username, email, and password
2. Password is hashed and stored securely
3. JWT token is generated and stored in localStorage
4. Protected routes check for valid token

### Video Conferencing Flow
1. User creates or joins a meeting room
2. Local media stream is captured (camera + microphone)
3. Socket.io establishes WebRTC signaling connection
4. Peer connections are created for each participant
5. SDP offers and answers are exchanged
6. ICE candidates are gathered and shared
7. Video/audio tracks are transmitted in real-time

### Real-Time Control
- **Audio Toggle**: Mutes/unmutes microphone in real-time
- **Video Toggle**: Disables/enables camera in real-time
- **Leave Call**: Closes all connections and returns to dashboard
- **Copy Link**: Shares meeting room link with invite code

## 🔒 Security Features

- JWT Token validation on all protected endpoints
- Password hashing with bcrypt (salt rounds: 10)
- CORS configuration for secure cross-origin requests
- HTTP-only token storage (via localStorage)
- Input validation on signup/login
- Protected API routes

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/online` - Get all online users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile

### Meetings
- `POST /api/meetings/create` - Create new meeting
- `GET /api/meetings/room/:roomId` - Get meeting details
- `GET /api/meetings/user/history` - Get user's meetings

## 🌐 WebSocket Events

### Client to Server
- `user-joined` - User joins meeting room
- `offer` - WebRTC offer for peer connection
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate for NAT traversal
- `toggle-audio` - Audio toggled
- `toggle-video` - Video toggled
- `user-left` - User disconnects from room

### Server to Client
- `user-joined` - New user joined notification
- `existing-participants` - List of current participants
- `offer` - Receive peer offer
- `answer` - Receive peer answer
- `ice-candidate` - Receive ICE candidate
- `user-left` - User left notification
- `user-audio-toggle` - Peer audio status
- `user-video-toggle` - Peer video status

## 🚀 Deployment

### Deploy Backend (Render)
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables
6. Deploy

[See detailed deployment guide](#deployment-guide)

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import project from GitHub
4. Add environment variables
5. Deploy

[See detailed deployment guide](#deployment-guide)

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions for camera and microphone
- Ensure HTTPS is used (WebRTC requires secure context)
- Check if another app is using the camera

### Video Not Displaying
- Verify both users have accepted camera permissions
- Check browser console for errors
- Ensure STUN servers are accessible

### Connection Issues
- Check if backend server is running
- Verify firewall isn't blocking WebSocket connections
- Check if CORS is properly configured

### MongoDB Connection Error
- Verify MongoDB URI in .env file
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure database credentials are correct

## 📝 Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🎨 UI Customization

### Colors
Edit `client/tailwind.config.js` to customize color scheme:
```javascript
colors: {
  primary: { /* your custom colors */ }
}
```

### Fonts
Modify CSS in `client/src/index.css`

## 📦 Build for Production

### Frontend Build
```bash
cd client
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## ✅ Testing Checklist

- [ ] User signup works
- [ ] User login works
- [ ] JWT token saved in localStorage
- [ ] Protected routes redirect to login
- [ ] Can create meeting room
- [ ] Can join meeting with room code
- [ ] Camera permission prompt appears
- [ ] Video displays in grid
- [ ] Audio mute/unmute works
- [ ] Video toggle works
- [ ] Can see other participants' video
- [ ] Leave call works
- [ ] Can copy meeting link
- [ ] Logout works

## 📞 Support & Documentation

For more information:
- Check `/server` and `/client` directories
- Review environment variable examples
- Check browser console for errors
- Verify all dependencies are installed

## 🎯 Future Enhancements

- Screen sharing with audio
- Chat messaging in meetings
- Meeting recordings
- Virtual backgrounds
- Hand raise feature
- Meeting scheduling
- Integration with calendar apps
- Mobile app version
- End-to-end encryption

## 📄 License

MIT License - feel free to use for personal and commercial projects

## 🙏 Credits

Built with modern web technologies for seamless real-time communication.

---

**Happy Conferencing! 📹**

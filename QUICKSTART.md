# ⚡ Quick Start Guide

**Get your video conferencing app running in 5 minutes!**

## Prerequisites
- Node.js v16+ installed
- MongoDB (free tier on MongoDB Atlas or local)
- Browser with WebRTC support

## 🚀 5-Minute Setup

### 1. Clone & Navigate (1 min)
```bash
git clone <your-repo-url>
cd project3
```

### 2. Backend Setup (2 min)

```bash
cd server
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-conferencing?retryWrites=true&w=majority
JWT_SECRET=any_random_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Start server:
```bash
npm run dev
# ✅ Server running on port 5000
```

### 3. Frontend Setup (2 min)

In a new terminal:
```bash
cd client
npm install
npm run dev
# ✅ App loaded at http://localhost:3000
```

### 4. Test It! (None)
1. Open http://localhost:3000
2. Sign up with any credentials
3. Create a meeting
4. Open another browser tab (incognito)
5. Sign up as different user
6. Join same meeting
7. **Done!** You have video conferencing! 🎉

---

## Common Commands

```bash
# Backend
cd server
npm run dev          # Development mode
npm start            # Production mode
npm test             # Run tests

# Frontend  
cd client
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview build
```

## Troubleshooting

**Backend won't start?**
```bash
# Check if port 5000 is in use
# Update PORT in .env
# Restart server
```

**No video showing?**
```bash
# Check browser permissions for camera
# Refresh page
# Check that both users are in same room
```

**Can't connect to MongoDB?**
```bash
# Check MONGODB_URI in .env
# Whitelist your IP in MongoDB Atlas
# Verify username/password
```

## Environment Variables Needed

### Backend (.env)
```
MONGODB_URI=        # Your MongoDB connection string
JWT_SECRET=         # Any random secret key
JWT_EXPIRE=7d       # Token expiry
PORT=5000           # Backend port
NODE_ENV=development # Environment
CLIENT_URL=         # Frontend URL
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Key Features Ready to Use

✅ User Authentication  
✅ Create Video Meetings  
✅ Join with Room Code  
✅ Multi-participant Video  
✅ Mute/Unmute Audio  
✅ Toggle Camera  
✅ Copy Meeting Link  
✅ Responsive Design  

## Next Steps

1. **Customize:** Edit colors in `client/tailwind.config.js`
2. **Deploy:** Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Enhance:** Add features from [README.md](./README.md)
4. **Scale:** Check [ARCHITECTURE.md](./ARCHITECTURE.md)

## File Structure Overview

```
project3/
├── server/              # Backend API & Signaling
│   ├── src/
│   │   ├── index.js     # Main server
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Socket.io logic
│   └── package.json
│
├── client/              # Frontend UI
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # UI components
│   │   ├── context/     # State management
│   │   └── services/    # API & Socket clients
│   └── package.json
│
├── README.md            # Full documentation
├── DEPLOYMENT.md        # Deployment guide
└── ARCHITECTURE.md      # Technical details
```

## First Test Checklist

- [ ] Backend server running
- [ ] Frontend loading at localhost:3000
- [ ] Can sign up successfully
- [ ] Can create a meeting room
- [ ] Room code is displayed
- [ ] Can join room from another browser
- [ ] Video appears after camera permission
- [ ] Audio/video controls work
- [ ] Leave call works

---

**You're all set! Start conferencing now!** 🎥✨

For detailed info, see [README.md](./README.md)

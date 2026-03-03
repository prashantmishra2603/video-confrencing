# 🎬 HOW TO START - READ THIS FIRST!

## Your Video Conferencing App is Ready! 🚀

This document will guide you through running your application in the next 5 minutes.

---

## Step 1: Open Your Project
```
Navigate to: c:\Users\bit23\OneDrive\Desktop\project\project3
```

You'll see:
```
project3/
├── server/          ← Backend
├── client/          ← Frontend
├── README.md        ← Full documentation
├── QUICKSTART.md    ← 5-minute guide
├── DEPLOYMENT.md    ← How to go live
└── PROJECT_SUMMARY.md ← What was built
```

---

## Step 2: Setup Backend

```powershell
# Open PowerShell and navigate to server folder
cd c:\Users\bit23\OneDrive\Desktop\project\project3\server

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env file - Set these values:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/video-conferencing?retryWrites=true&w=majority
# JWT_SECRET=any_random_secret_key
# PORT=5000
# CLIENT_URL=http://localhost:3000

# Start the backend server
npm run dev

# You should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on port 5000
# 📡 WebSocket server initialized
```

---

## Step 3: Setup Frontend (NEW TERMINAL)

```powershell
# Open a NEW PowerShell window and navigate to client folder
cd c:\Users\bit23\OneDrive\Desktop\project\project3\client

# Install dependencies
npm install

# Create .env file (optional - defaults work locally)
copy .env.example .env

# Start the frontend
npm run dev

# You should see:
# ➜  Local: http://localhost:3000/
# Click the link to open in browser
```

---

## Step 4: Test the App! 🎉

1. **Browser should automatically open to http://localhost:3000**

2. **Sign Up:**
   - Create a new account with any username/email
   - Set a password (minimum 6 characters)

3. **Create a Meeting:**
   - Click "Create Meeting" button
   - A room with unique code will be generated

4. **Test with Another User:**
   - Open a new browser tab (or incognito window)
   - Sign up with a different username
   - Join the same meeting room

5. **Video Conference!**
   - Allow camera/microphone permissions
   - You should see video from both users
   - Test mute/unmute buttons
   - Test camera on/off button
   - Click "Leave Call" to exit

---

## 📋 MongoDB Setup (One-Time)

**Skip this if you have MongoDB already set up**

### Get Free MongoDB (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" (use Google/GitHub email)
3. Create a new project
4. Click "Create a Deployment" → Choose "Free" tier
5. Set up credentials (username/password)
6. Go to "Network Access" and add "0.0.0.0/0" IP
7. Go to "Database Access" and create a user
8. Click "Connect" → Choose "Drivers"
9. Copy the connection string
10. Replace in your `.env` file:
    ```
    MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/video-conferencing?retryWrites=true&w=majority
    ```

---

## ⚠️ Troubleshooting

### "Cannot find module" error
```bash
# In server or client folder
rm -r node_modules package-lock.json
npm install
```

### "Port 5000 already in use"
```bash
# Use a different port - update server/.env
PORT=5001
```

### "Camera not working"
- Check browser permissions for camera/microphone
- Use HTTPS (production) or localhost (development)
- Refresh the page

### "Can't connect to MongoDB"
- Copy the connection string correctly
- Whitelist your IP in MongoDB Atlas (0.0.0.0/0 for dev)
- Check username and password

---

## 📚 Documentation Files

Read these for more info:

| File | Purpose | Reading Time |
|------|---------|--------------|
| **README.md** | Complete guide with all features | 10 min |
| **QUICKSTART.md** | Fast setup (this file) | 5 min |
| **DEPLOYMENT.md** | Deploy to production (Render + Vercel) | 15 min |
| **ARCHITECTURE.md** | How it works technically | 20 min |
| **PROJECT_SUMMARY.md** | What was built | 5 min |

---

## 🎨 Customization

### Change App Name
Edit `client/src/components/Navbar.jsx`:
```javascript
<span className="text-white font-bold text-xl">Your App Name</span>
```

### Change Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color-here',
    // Change other shades too
  }
}
```

### Add Your Logo
Replace the 📹 emoji in components with an `<img>` tag

---

## 🚀 Deploy to Production

When ready to share with others:

### Deploy Backend (Render)
1. Push code to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect your GitHub repository
5. Set environment variables
6. Deploy!

→ See DEPLOYMENT.md for detailed steps

### Deploy Frontend (Vercel)
1. Go to vercel.com
2. Import from GitHub
3. Set environment variables
4. Deploy!

→ See DEPLOYMENT.md for detailed steps

---

## 📞 Need Help?

### Check These
1. Browser console for errors (F12 → Console)
2. Terminal for server errors
3. README.md for features
4. DEPLOYMENT.md for production issues

### Common Issues
- **Video not showing?** Check camera permissions
- **Can't sign up?** Check MongoDB is connected
- **WebSocket error?** Ensure backend is running on port 5000
- **Port in use?** Change PORT in .env

---

## ✅ Success Indicators

Your app is working if you see:

✅ Frontend loads at http://localhost:3000  
✅ Can sign up with email  
✅ Can create a meeting room  
✅ Can see room ID/code  
✅ Can join room from another browser  
✅ Camera permission prompt appears  
✅ Video shows in grid layout  
✅ Mute button works  
✅ Can leave call  

---

## 🎯 Next Steps

After testing locally:

1. **Commit to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial video conferencing app"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Deploy** (See DEPLOYMENT.md)
   - Backend to Render
   - Frontend to Vercel
   - Share your live URL!

3. **Share**
   - Get your deployed URL
   - Share with friends
   - They can sign up and video conference!

---

## 📁 Project Structure

```
Backend (server/)
├── API Routes (/api/auth, /users, /meetings)
├── Socket.io Signaling (WebRTC signaling)
├── MongoDB (User & Meeting data)
└── WebRTC Logic (Peer connection)

Frontend (client/)
├── Pages (Login, Signup, Dashboard, Meeting)
├── Components (Video, Controls, Navbar)
├── State Management (Auth & Meeting context)
└── Real-time (Socket.io client)

Connection: HTTP for API + WebSocket for video
```

---

## 🎬 Video Conferencing Flow

```
User A                           User B
  │                                 │
  1. Creates Room ────────────────→ Room Created
  │                                 │
  2. Shares Link / Code             │
  │                                 │
  3. User B Joins ←─────────────── Joins Room
  │                                 │
  4. WebRTC Peers Connected ←───→ P2P Video Stream
  │                                 │
  5. Video Conferencing! 📹        
```

---

## 💡 Pro Tips

- Test with multiple browser windows to simulate users
- Use incognito/private mode for different sessions
- Check browser console (F12) for debugging
- Monitor backend logs for server errors
- Use MongoDB Compass to view database data

---

## 🎉 You're Ready!

Everything is set up and ready to run. Just follow the 4 steps above and you'll have a working video conferencing app!

**Start with Step 1 → Step 2 → Step 3 → Step 4**

For detailed information, open:
- **README.md** - Main documentation
- **DEPLOYMENT.md** - Going live guide

---

**Happy Coding! 📹✨**

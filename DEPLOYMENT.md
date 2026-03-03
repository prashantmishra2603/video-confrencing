# 🚀 Complete Setup & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Production Configuration](#production-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Local Development Setup

### Step 1: Prerequisites Installation

**Windows:**
1. Download and install [Node.js](https://nodejs.org/) (LTS version)
2. Download and install [Git](https://git-scm.com/)
3. Verify installation:
```powershell
node --version
npm --version
git --version
```

**Mac:**
```bash
# Using Homebrew
brew install node git

# Or download from official websites
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### Step 2: MongoDB Setup

**Option A: MongoDB Atlas (Recommended)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" and create an account
3. Create a new project
4. Create a Cluster (Free tier available)
5. Configure Security:
   - Go to Network Access
   - Add "0.0.0.0/0" to allow all IPs (for development)
   - Go to Database Access
   - Create a user with password
6. Get Connection String:
   - Click "Connect"
   - Choose "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>`

**Option B: Local MongoDB**
```bash
# Windows
# Download from https://www.mongodb.com/try/download/community
# And follow installation wizard

# Mac
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongod
```

Connection string for local:
```
mongodb://localhost:27017/video-conferencing
```

### Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/yourusername/videoconference.git
cd videoconference

# Setup Backend
cd server
npm install
cp .env.example .env

# Setup Frontend
cd ../client
npm install
cp .env.example .env
```

### Step 4: Configure Environment Variables

**Server (.env)**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/video-conferencing?retryWrites=true&w=majority
JWT_SECRET=dev_secret_key_very_secure_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client (.env)**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Output: 🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Output: Click http://localhost:3000 to open
```

### Step 6: Test Locally

1. Open http://localhost:3000
2. Sign up with test account
3. Create a meeting
4. Open another browser tab (incognito)
5. Sign up with different account
6. Join the same meeting
7. Test video, audio, controls

---

## Backend Deployment (Render)

### Step 1: Prepare for Production

**Update server/src/index.js:**
```javascript
// Add production CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```

**Update .env for production:**
```
MONGODB_URI=mongodb+srv://prod_user:prod_password@prod-cluster.mongodb.net/video-conferencing-prod?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_production_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

### Step 2: Push to GitHub

```bash
# Navigate to project root
cd project3

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Video conferencing application"

# Add remote and push
git remote add origin https://github.com/yourusername/video-conference.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to [Render](https://render.com)**
   - Click "New +"
   - Select "Web Service"

2. **Connect GitHub Repository**
   - Click "Connect a repository" 
   - Select your GitHub account and repository
   - Choose "video-conference" or similar

3. **Configure Service**
   - Name: `video-conference-api`
   - Environment: `Node`
   - Region: `Oregon` (US) or closest to you
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Click "Advanced"
   - Add Environment Variables:
     ```
     MONGODB_URI=mongodb+srv://prod_user:password@cluster.mongodb.net/video-conferencing-prod?retryWrites=true&w=majority
     JWT_SECRET=your_production_secret_key_here
     JWT_EXPIRE=7d
     PORT=5000
     NODE_ENV=production
     CLIENT_URL=https://your-vercel-domain.com
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Get your URL: `https://your-service.onrender.com`

6. **Verify Deployment**
   ```bash
   curl https://your-service.onrender.com/health
   # Response: {"status":"Server is running"}
   ```

---

## Frontend Deployment (Vercel)

### Step 1: Build Frontend for Production

```bash
cd client
npm run build
# Creates /dist folder
```

### Step 2: Deploy on Vercel

1. **Go to [Vercel](https://vercel.com)**
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Select "video-conference"
   - Click "Import"

3. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `./client` (if in monorepo)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   - Scroll to "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-backend-service.onrender.com/api
     VITE_SOCKET_URL=https://your-backend-service.onrender.com
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - Get your URL: `https://your-project.vercel.app`

6. **Update Backend CORS**
   - Go to Render
   - Update `CLIENT_URL` environment variable:
     ```
     CLIENT_URL=https://your-project.vercel.app
     ```
   - Redeploy backend

### Step 3: Verify Deployment

1. Open your Vercel URL
2. Sign up/Login
3. Create meeting
4. Start video conference

---

## Production Configuration

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Set `NODE_ENV=production` on backend
- [ ] Configure CORS with specific domain
- [ ] Use HTTPS for all communications
- [ ] Don't commit `.env` files
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB IP whitelist
- [ ] Set secure cookies if using them
- [ ] Add rate limiting to API endpoints

### Scalability Improvements

**For larger deployments:**

1. **Redis for session management**
```bash
npm install redis
```

2. **Load balancing**
- Configure multiple backend instances
- Use load balancer (Render handles this)

3. **Database optimization**
- Add database indexes
- Archive old meetings
- Implement database partitioning

4. **CDN for static assets**
- Vercel includes CDN
- Setup CloudFare for additional caching

---

## Monitoring & Maintenance

### Monitor Application

**Backend Logs (Render):**
- Go to your service
- Click "Logs" tab
- View real-time logs

**Frontend Errors (Vercel):**
- Go to your project
- Click "Deployments"
- Navigate to deployment details

### Common Issues & Solutions

**Issue: WebSocket connection fails**
```
Solution: Check CORS_ORIGIN in backend .env
Ensure VITE_SOCKET_URL matches backend URL
```

**Issue: Video not loading**
```
Solution: Check media device permissions
Verify HTTPS is enabled
Check ICE servers connectivity
```

**Issue: Database connection timeout**
```
Solution: Check MongoDB IP whitelist
Verify connection string is correct
Check network connectivity
```

### Backup Strategy

1. **Database Backups**
   - MongoDB Atlas automatically backs up
   - Configure backup snapshot schedule

2. **Code Backups**
   - Use GitHub for code version control
   - Set up automated backups

### Performance Optimization

**Frontend:**
```bash
# Check bundle size
npm run build -- --analyze

# Deploy only necessary files
```

**Backend:**
```javascript
// Add caching headers
app.set('view cache', true);

// Enable compression
const compression = require('compression');
app.use(compression());
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update
```

---

## Troubleshooting Deployment

### Backend won't start
```
Check logs on Render
Verify environment variables
Ensure MongoDB connection string is correct
```

### Frontend won't load
```
Check build logs on Vercel
Verify environment variables
Clear browser cache
Check VITE_API_URL setting
```

### WebRTC not working after deployment
```
Check if STUN servers are accessible
Verify backend WebSocket is running
Check browser console for errors
```

### Performance issues
```
Monitor CPU and memory usage
Check database query performance
Optimize video quality settings
Enable compression on responses
```

---

## Success Checklist

- ✅ Backend running on Render
- ✅ Frontend deployed on Vercel
- ✅ MongoDB connected and working
- ✅ User authentication working
- ✅ Video conferencing functional
- ✅ HTTPS enabled
- ✅ Environment variables configured
- ✅ CORS properly set up
- ✅ Logs accessible
- ✅ Backups configured

---

## 📞 Support

For deployment issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Test API endpoints manually
4. Check browser console for errors
5. Review application README.md

Your application is now production-ready! 🎉

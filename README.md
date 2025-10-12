# 🎵 Spotify Account Transfer - Complete Master Guide

A beautiful web application to seamlessly transfer your Spotify liked songs, playlists, and followed artists between accounts. Features a stunning glassmorphism design with smooth animations.

![Spotify Transfer](https://img.shields.io/badge/Spotify-Transfer-1DB954?style=for-the-badge&logo=spotify&logoColor=white)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [What Gets Transferred](#-what-gets-transferred)
3. [Local Development Setup](#-local-development-setup)
4. [Deploy to Vercel (Production)](#-deploy-to-vercel-production)
5. [How to Use](#-how-to-use)
6. [Troubleshooting](#-troubleshooting)
7. [Tech Stack](#-tech-stack)

---

## ✨ Features

- 🎵 **Liked Songs Transfer** - All your favorite tracks
- 📋 **Playlist Transfer** - Complete playlists with tracks and metadata
- 🎤 **Followed Artists** - All artists you follow
- 🎨 **Glassmorphism UI** - Beautiful dark theme with glass effects
- ⚡ **Smooth Animations** - Powered by Framer Motion
- 📱 **Fully Responsive** - Works on all devices
- 🔒 **Secure OAuth** - Industry-standard authentication

---

## ✅ What Gets Transferred

### Included ✅
- All liked songs
- All user-created playlists
- All followed artists
- Playlist names and descriptions
- Track order in playlists

### Not Included ❌
- Username (Spotify API limitation)
- Profile picture (Spotify API limitation)
- Listening history
- Spotify-generated playlists (Discover Weekly, etc.)
- Podcasts

---

## 🖥️ Local Development Setup

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Spotify Account** (Free or Premium)

### Step 1: Create Spotify Developer App

1. Go to **https://developer.spotify.com/dashboard**
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in:
   - **App name**: `Spotify Account Transfer`
   - **App description**: `Transfer music between accounts`
   - **Redirect URI**: `http://localhost:8888/callback`
   - Check "I understand and agree"
5. Click **"Save"**
6. Click **"Settings"**
7. Copy your **Client ID**
8. Click **"View client secret"** and copy your **Client Secret**

### Step 2: Configure Environment

Create a file named `.env` in the root folder:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
PORT=8888
CLIENT_URL=http://localhost:3000
```

Replace `your_client_id_here` and `your_client_secret_here` with your actual credentials.

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 4: Run Locally

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

---

## 🚀 Deploy to Vercel (Production)

Deploy your app to the internet for free using Vercel!

### Prerequisites for Deployment

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your computer

---

### Part 1: Prepare Your Backend (Railway)

Since Vercel is for frontend only, we'll use Railway for the backend (also free).

#### Step 1: Setup Railway Backend

1. **Sign up at Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect your GitHub account** (we'll push code in next step)

#### Step 2: Modify Backend for Production

Create a new file `railway.json` in your project root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Update `server/index.js` to use environment PORT:

```javascript
const PORT = process.env.PORT || 8888;
```

(This is already set correctly in your file!)

---

### Part 2: Push to GitHub

#### Step 1: Initialize Git Repository

Open terminal in your project folder:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Spotify Transfer App"
```

#### Step 2: Create GitHub Repository

1. Go to **https://github.com**
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `spotify-transfer-app`
4. Keep it **Public** or **Private** (your choice)
5. **Don't** initialize with README (we already have files)
6. Click **"Create repository"**

#### Step 3: Push to GitHub

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/spotify-transfer-app.git

# Push code
git branch -M main
git push -u origin main
```

---

### Part 3: Deploy Backend to Railway

1. **Return to Railway Dashboard**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your `spotify-transfer-app` repository**
5. **Railway will auto-detect Node.js**

#### Set Environment Variables in Railway:

Click on your project → **"Variables"** tab → Add these:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://YOUR_RAILWAY_URL/callback
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=8888
```

**Note**: You'll update these URLs after deployment

6. **Deploy** - Railway will automatically deploy your backend
7. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

---

### Part 4: Deploy Frontend to Vercel

#### Step 1: Update Frontend for Production

Create `client/.env.production`:

```env
REACT_APP_API_URL=https://your-railway-url.railway.app
```

Replace with your actual Railway URL.

Update `client/src/App.js` - Replace all instances of `http://localhost:8888` with:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

// Then use API_URL instead of hardcoded localhost
// For example:
window.location.href = `${API_URL}/auth/login`;
await axios.post(`${API_URL}/transfer/profile`, {...});
```

#### Step 2: Commit Changes

```bash
git add .
git commit -m "Add production environment configuration"
git push
```

#### Step 3: Deploy to Vercel

1. **Go to https://vercel.com**
2. **Sign up/Login with GitHub**
3. **Click "Add New Project"**
4. **Import your `spotify-transfer-app` repository**
5. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. **Environment Variables** - Click "Add":
   ```
   REACT_APP_API_URL=https://your-railway-url.railway.app
   ```
7. **Click "Deploy"**
8. Wait 2-3 minutes for deployment
9. **Copy your Vercel URL** (e.g., `https://spotify-transfer-app.vercel.app`)

---

### Part 5: Update Environment Variables

#### Update Railway Variables:

1. Go to Railway Dashboard → Your Project → Variables
2. Update:
   ```
   SPOTIFY_REDIRECT_URI=https://your-railway-url.railway.app/callback
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
3. Save changes

#### Update Spotify Developer Dashboard:

1. Go to **https://developer.spotify.com/dashboard**
2. Select your app → **Settings**
3. **Edit Settings**
4. **Redirect URIs** - Add:
   ```
   https://your-railway-url.railway.app/callback
   ```
5. **Save**
6. **Wait 2-3 minutes** for changes to propagate

---

### Part 6: Test Your Live App

1. **Open your Vercel URL**: `https://your-app.vercel.app`
2. **Test the full flow**:
   - Connect source account
   - Connect target account (use incognito window)
   - Transfer music
3. **Verify transfer in Spotify**

---

### 🎉 You're Live!

Your app is now deployed and accessible worldwide! 

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-app.railway.app`

---

## 🔄 Making Updates

### Update Your Live App

```bash
# Make changes to your code
# Then commit and push:
git add .
git commit -m "Your update description"
git push
```

**Both Vercel and Railway will auto-deploy** your changes!

---

## 🎯 How to Use

### Step 1: Connect Source Account
1. Click **"Connect Spotify"** under "Source Account"
2. Log in with your **source** Spotify account (the one you're copying FROM)
3. Click **"Agree"** to authorize
4. You'll be redirected back

### Step 2: Connect Target Account
1. **Important**: Open **new incognito/private window**
2. Go to your app URL
3. Click **"Connect Spotify"** under "Target Account"
4. Log in with your **target** Spotify account (the one you're copying TO)
5. Click **"Agree"** to authorize
6. You'll be redirected back

### Step 3: Transfer
1. Click **"Start Transfer"**
2. Watch the progress bar
3. Wait for completion (5-15 minutes for large libraries)
4. Success! 🎉

---

## 🔧 Troubleshooting

### Local Development Issues

#### "Invalid client" error
- Check `.env` file has correct Client ID and Secret
- No extra spaces in credentials
- Restart server after changing `.env`

#### "Invalid redirect URI" error
- Verify `http://localhost:8888/callback` is in Spotify Dashboard
- Check PORT matches in `.env`
- Wait 2-3 minutes after adding redirect URI

#### Can't connect second account
- Use incognito/private window
- Or log out of Spotify first
- Or use different browser

#### Port 8888 already in use
```bash
# Windows
netstat -ano | findstr :8888
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8888 | xargs kill -9
```

Or change PORT in `.env` to 8889

---

### Production/Deployment Issues

#### "CORS error" in production
- Verify `CLIENT_URL` in Railway matches your Vercel URL exactly
- No trailing slashes
- Check HTTPS not HTTP

#### "Invalid redirect URI" in production
- Add production callback URL to Spotify Dashboard:
  `https://your-railway-url.railway.app/callback`
- Wait 2-3 minutes for changes to propagate

#### Transfer fails in production
- Check Railway logs for errors
- Verify environment variables are set correctly
- Test each endpoint individually

#### Build fails on Vercel
- Ensure `client` is set as root directory
- Check all dependencies are in `client/package.json`
- Review build logs for specific errors

#### Backend not responding
- Check Railway deployment status
- Verify environment variables are set
- Check Railway logs for errors
- Ensure `railway.json` is in root directory

---

## 📊 Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Axios** - HTTP client
- **Spotify Web API** - Music data

### Frontend
- **React 18** - UI library
- **Framer Motion** - Animations
- **CSS3** - Glassmorphism styling
- **Axios** - API requests

### Hosting
- **Vercel** - Frontend hosting (free)
- **Railway** - Backend hosting (free tier)

---

## 🔒 Security & Privacy

- All authentication uses OAuth 2.0
- No passwords are stored
- Tokens are temporary and session-only
- No data is stored on servers
- All transfers happen directly through Spotify API
- Open source - you can review all code

---

## 📝 Important Notes

### Rate Limits
- Spotify has API rate limits
- Large libraries (1000+ songs) may take 10-15 minutes
- App automatically handles batching

### Free Tier Limits
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Railway**: 500 hours/month (enough for most users)

### Best Practices
1. Test with small playlist first
2. Use stable internet connection
3. Don't close browser during transfer
4. Verify transfer in Spotify app
5. Use incognito for second account

---

## 🎓 Additional Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [React Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🤝 Contributing

This is an open-source project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - Free to use, modify, and distribute!

---

## ⚠️ Disclaimer

This application is not affiliated with Spotify. It uses Spotify's official API and follows their terms of service.

---

## 💡 Pro Tips

1. **Always test locally first** before deploying
2. **Use environment variables** for all sensitive data
3. **Monitor Railway usage** to stay within free tier
4. **Set up custom domain** on Vercel (optional, but professional)
5. **Enable GitHub branch protection** to review changes before deployment

---

## 🎉 Success!

You now have a fully deployed Spotify account transfer application!

**Questions?** Review the troubleshooting section above.

**Working?** Share it with friends who need to transfer their Spotify libraries!

---

**Made with ❤️ for music lovers**

**Project Version**: 1.0.0  
**Last Updated**: October 2025

# 🚀 Quick Deployment Checklist

Use this checklist to deploy your Spotify Transfer app to production.

---

## ✅ Pre-Deployment

- [ ] Node.js installed locally
- [ ] Git installed
- [ ] GitHub account created
- [ ] Vercel account created (vercel.com)
- [ ] Railway account created (railway.app)
- [ ] Spotify Developer app created
- [ ] Have Client ID and Client Secret ready

---

## 📦 Step 1: Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub (github.com/new)
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/spotify-transfer-app.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository URL: ________________

---

## 🚂 Step 2: Deploy Backend (Railway)

1. **Go to https://railway.app**
2. **New Project** → Deploy from GitHub
3. **Select your repository**
4. **Add Environment Variables**:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://your-app.railway.app/callback
CLIENT_URL=https://your-app.vercel.app
PORT=8888
```

5. **Deploy and wait**

- [ ] Railway backend deployed
- [ ] Railway URL: https://________________

---

## ▲ Step 3: Deploy Frontend (Vercel)

1. **Go to https://vercel.com**
2. **New Project** → Import from GitHub
3. **Configure**:
   - Root Directory: `client`
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables**:
```
REACT_APP_API_URL=https://your-railway-app.railway.app
```

5. **Deploy**

- [ ] Vercel frontend deployed
- [ ] Vercel URL: https://________________

---

## 🔧 Step 4: Update Configuration

### Update `client/.env.production`:
```env
REACT_APP_API_URL=https://your-actual-railway-url.railway.app
```

### Update Railway Variables:
- [ ] `SPOTIFY_REDIRECT_URI` = `https://your-railway-url.railway.app/callback`
- [ ] `CLIENT_URL` = `https://your-vercel-url.vercel.app`

### Update Spotify Dashboard:
- [ ] Go to developer.spotify.com/dashboard
- [ ] Settings → Edit Settings
- [ ] Add Redirect URI: `https://your-railway-url.railway.app/callback`
- [ ] Save

### Push updates:
```bash
git add .
git commit -m "Update production URLs"
git push
```

- [ ] Configuration updated
- [ ] Changes pushed to GitHub

---

## ✅ Step 5: Test Your Live App

- [ ] Open Vercel URL in browser
- [ ] Click "Connect Spotify" for source account
- [ ] Login and authorize
- [ ] Open incognito window
- [ ] Click "Connect Spotify" for target account
- [ ] Login with different account and authorize
- [ ] Click "Start Transfer"
- [ ] Wait for completion
- [ ] Verify music in Spotify app

---

## 🎉 Success!

**Your app is now live!**

Frontend: https://________________  
Backend: https://________________

---

## 📝 Future Updates

To update your live app:

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push
```

Both Railway and Vercel will auto-deploy!

---

## 🆘 Troubleshooting

**CORS errors?**
- Check `CLIENT_URL` in Railway matches Vercel URL exactly
- No trailing slashes

**"Invalid redirect URI"?**
- Verify redirect URI in Spotify Dashboard
- Wait 2-3 minutes after adding

**Backend not responding?**
- Check Railway deployment logs
- Verify environment variables

**Build fails?**
- Check Vercel build logs
- Ensure `client` is set as root directory

---

**Date Deployed**: ________________  
**Status**: ⬜ Testing | ⬜ Live | ⬜ Issues


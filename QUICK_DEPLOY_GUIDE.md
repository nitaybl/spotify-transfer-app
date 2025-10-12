# ⚡ Ultra-Quick Deploy Guide

Deploy your Spotify Transfer app in 15 minutes!

---

## 🎯 What You Need

- [ ] GitHub account
- [ ] Vercel account (vercel.com - sign up with GitHub)
- [ ] Railway account (railway.app - sign up with GitHub)
- [ ] Spotify Client ID & Secret (from developer.spotify.com/dashboard)

---

## 🚀 5-Step Deployment

### 1️⃣ Push to GitHub (2 min)

```bash
git init
git add .
git commit -m "Initial commit"

# Go to github.com/new and create repo "spotify-transfer-app"
# Then run (replace YOUR_USERNAME):

git remote add origin https://github.com/nitaybl/spotify-transfer-app.git
git branch -M main
git push -u origin main
```

✅ **GitHub URL**: `https://github.com/YOUR_USERNAME/spotify-transfer-app`

---

### 2️⃣ Deploy Backend - Railway (3 min)

1. Go to **https://railway.app**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select **`spotify-transfer-app`**
4. Click on project → **"Variables"** tab
5. Add these variables:

```
SPOTIFY_CLIENT_ID = your_client_id_here
SPOTIFY_CLIENT_SECRET = your_client_secret_here
SPOTIFY_REDIRECT_URI = https://TEMP.railway.app/callback
CLIENT_URL = https://TEMP.vercel.app
PORT = 8888
```

6. Click **"Deploy"**
7. Copy your Railway URL: `https://spotify-transfer-app-production-XXXX.up.railway.app`

✅ **Railway URL**: ________________

---

### 3️⃣ Deploy Frontend - Vercel (3 min)

1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. **Import** your GitHub repo
4. **Configure**:
   - Root Directory: **`client`**
   - Framework Preset: **Create React App**
   - Build Command: `npm run build`
   - Output Directory: `build`

5. **Environment Variables**:
   - Click "Add" button
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-railway-url.railway.app` (paste your Railway URL)

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Copy your Vercel URL: `https://spotify-transfer-app.vercel.app`

✅ **Vercel URL**: ________________

---

### 4️⃣ Update URLs (5 min)

#### A. Update Railway Variables:

1. Go to Railway → Your Project → **Variables**
2. Edit these two:
   ```
   SPOTIFY_REDIRECT_URI = https://your-railway-url.railway.app/callback
   CLIENT_URL = https://your-vercel-url.vercel.app
   ```
3. Save (Railway auto-redeploys)

#### B. Update Spotify Dashboard:

1. Go to **https://developer.spotify.com/dashboard**
2. Click your app → **"Settings"**
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, click **"Add URI"**
5. Add: `https://your-railway-url.railway.app/callback`
6. Click **"Save"**
7. **Wait 2-3 minutes**

---

### 5️⃣ Test! (2 min)

1. Open your Vercel URL
2. Click "Connect Spotify" for source account
3. Login and authorize
4. Open **incognito window**
5. Go to your Vercel URL again
6. Click "Connect Spotify" for target account
7. Login with different account
8. Click "Start Transfer"

🎉 **Success!** Your app is live!

---

## 📝 Save Your URLs

**Frontend (Vercel)**: ________________________________

**Backend (Railway)**: ________________________________

**GitHub Repo**: ________________________________

---

## 🔄 How to Update

Make changes to your code, then:

```bash
git add .
git commit -m "Your changes"
git push
```

Both Vercel and Railway auto-deploy in ~2 minutes!

---

## ⚠️ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Check `CLIENT_URL` in Railway matches Vercel URL |
| "Invalid redirect URI" | Wait 2-3 min after adding to Spotify Dashboard |
| Backend not responding | Check Railway logs for errors |
| Build fails on Vercel | Ensure root directory is set to `client` |

---

## 💰 Costs

- **Vercel**: FREE (unlimited deployments)
- **Railway**: FREE (500 hours/month - plenty!)
- **Total**: **$0** 🎉

---

## 📞 Help

Full guide: **README.md**  
Checklist: **DEPLOYMENT_CHECKLIST.md**

---

**That's it! You're deployed!** 🚀


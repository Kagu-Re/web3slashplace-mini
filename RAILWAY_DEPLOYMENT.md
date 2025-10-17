# 🚂 Railway Deployment Guide

Railway is the recommended platform for deploying this application because it supports Socket.IO real-time features perfectly.

## 🚀 Quick Deploy (2 minutes)

### Step 1: Push to GitHub
```bash
git add railway.json RAILWAY_DEPLOYMENT.md
git commit -m "Add Railway deployment config"
git push
```

### Step 2: Deploy to Railway

1. **Sign Up**: Go to [railway.app](https://railway.app) and sign in with GitHub
2. **New Project**: Click "New Project"
3. **Deploy from GitHub**: Select "Deploy from GitHub repo"
4. **Select Repo**: Choose `web3slashplace-mini`
5. **Configure**: Railway will auto-detect Next.js

### Step 3: Add Environment Variables

In your Railway project dashboard, go to **Variables** tab and add:

#### Required Variables:
```bash
XUMM_API_KEY=your_xumm_api_key
XUMM_API_SECRET=your_xumm_api_secret
JWT_SECRET=your_jwt_secret_min_32_chars
APP_BASE_URL=https://your-app.up.railway.app
```

#### Optional (for WalletConnect):
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Step 4: Deploy! 🎉

Railway will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Build your app (`npm run build`)
- ✅ Start the server (`npm start`)
- ✅ Assign you a public URL

Your app will be live at: `https://your-app.up.railway.app`

---

## 🔧 Configuration Details

### Build Settings
Railway uses **Nixpacks** to automatically detect and build Next.js apps. The configuration in `railway.json` ensures:
- Proper build command
- Automatic restart on failure
- Optimized for production

### Socket.IO Support
Unlike Vercel, Railway runs **persistent Node.js processes**, so Socket.IO works perfectly:
- ✅ Real-time pixel updates
- ✅ Live leaderboard
- ✅ Event notifications
- ✅ WebSocket connections

### Custom Domain (Optional)
1. Go to your Railway project
2. Click **Settings** → **Domains**
3. Click **Generate Domain** or add your custom domain
4. Update `APP_BASE_URL` environment variable

---

## 📊 Monitoring

Railway provides built-in monitoring:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: Version history and rollback

Access these in your project dashboard.

---

## 💰 Pricing

Railway offers:
- **$5 free credits** per month (plenty for testing)
- **Pay-as-you-go** after that
- Typically costs **$5-10/month** for small apps

Much cheaper than traditional hosting and perfect for Socket.IO apps!

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check Railway logs in dashboard
# Make sure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Socket.IO Not Working
- Verify `APP_BASE_URL` is set to your Railway domain
- Check Railway logs for WebSocket connection errors
- Ensure you're using HTTPS (Railway provides this automatically)

### Environment Variables Not Loading
- Double-check variable names match exactly
- Restart the deployment after adding variables
- Check Railway dashboard → Variables tab

---

## 🔄 Updates

To update your deployment:

```bash
git add .
git commit -m "Your update message"
git push
```

Railway automatically redeploys on every push to `main` branch!

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) (very helpful community)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)

---

## ✅ Why Railway > Vercel for This Project

| Feature | Railway | Vercel |
|---------|---------|--------|
| Socket.IO Support | ✅ Perfect | ❌ Doesn't work |
| Persistent Connections | ✅ Yes | ❌ Serverless |
| WebSocket Support | ✅ Native | ❌ Limited |
| Real-time Updates | ✅ Works | ❌ Fails |
| Price | 💰 $5-10/mo | 💰 Free tier |
| Setup Difficulty | 🟢 Easy | 🟢 Easy |

**Bottom line**: For Socket.IO apps, Railway is the way to go! 🚂


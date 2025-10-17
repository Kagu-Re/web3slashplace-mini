# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Web3SlashPlace Mini"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:

   ```
   XUMM_API_KEY=your_xumm_api_key_here
   XUMM_API_SECRET=your_xumm_api_secret_here
   JWT_SECRET=generate_a_secure_random_string_here
   APP_BASE_URL=https://your-domain.vercel.app
   ```

   **To generate a secure JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect Next.js and configure build settings
   - Your app will be live at `https://your-project.vercel.app`

---

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add XUMM_API_KEY
   vercel env add XUMM_API_SECRET
   vercel env add JWT_SECRET
   vercel env add APP_BASE_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed to Git
- [ ] `.env.local` added to `.gitignore` (already done ✅)
- [ ] Environment variables ready:
  - [ ] XUMM_API_KEY (if using Xaman)
  - [ ] XUMM_API_SECRET (if using Xaman)
  - [ ] JWT_SECRET (generate securely)
  - [ ] APP_BASE_URL (your production URL)
- [ ] Tested locally with `npm run build` and `npm start`
- [ ] No console errors in production build

---

## 🔧 Build Verification (Run Locally First)

Before deploying, verify your production build works:

```bash
# Build the project
npm run build

# Start production server
npm start

# Open http://localhost:3000
```

Check for:
- ✅ No build errors
- ✅ All pages load correctly
- ✅ Wallet connections work
- ✅ Pixel placement works
- ✅ WebSocket connections work
- ✅ Leaderboard loads
- ✅ Mobile responsive

---

## 🌍 Environment Variables

### Required for Full Functionality

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `XUMM_API_KEY` | XUMM API key for Xaman wallet | No* | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `XUMM_API_SECRET` | XUMM API secret for Xaman wallet | No* | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `JWT_SECRET` | Secret for JWT session tokens | Yes** | Use crypto.randomBytes(32) |
| `APP_BASE_URL` | Your production URL | Recommended | `https://your-app.vercel.app` |

\* Only required if you want XRPL/Xaman wallet support. MetaMask and WalletConnect will work without these.

\** Auto-generated if not provided, but recommended to set for production.

### How to Get XUMM Credentials

1. Visit [XUMM Developer Console](https://xumm.readme.io/)
2. Create a new application
3. Copy API Key and API Secret
4. Add them to your environment variables

---

## 🔒 Security Considerations

### Production Security Checklist

- [x] Environment variables stored securely (not in code)
- [x] `.env.local` in `.gitignore`
- [x] SIWE authentication enabled
- [x] IP rate limiting configured
- [x] Session cookies HTTP-only
- [x] Server-side validation for all actions
- [x] No sensitive data in client-side code

### Additional Recommendations

1. **JWT_SECRET**: Use a strong, random 32+ character string
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **CORS**: Configure allowed origins in production
   - Update `pages/api/socketio.ts` if needed
   - Default allows all origins in development

3. **Rate Limiting**: Adjust limits in `lib/rateLimit.ts` based on expected traffic
   ```typescript
   const MAX_REQUESTS = 100;  // Adjust as needed
   const WINDOW_MS = 60000;   // 1 minute
   ```

---

## 🐛 Troubleshooting Deployment

### Build Fails

**Error: Module not found**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Error: TypeScript errors**
```bash
# Check TypeScript
npm run build
# Fix any errors shown
```

### WebSocket Connection Issues

1. **Check CORS Settings**
   - Vercel automatically configures WebSockets
   - Ensure `APP_BASE_URL` is set correctly

2. **Verify Socket.IO Path**
   - Client connects to `/` with path `/api/socketio`
   - This is configured correctly in the code

### Environment Variables Not Working

1. **Verify Variables in Vercel Dashboard**
   - Settings → Environment Variables
   - Make sure they're set for "Production"

2. **Redeploy After Adding Variables**
   ```bash
   vercel --prod
   ```

### XUMM/Xaman Not Working

1. **Check API Credentials**
   - Verify `XUMM_API_KEY` and `XUMM_API_SECRET` are correct
   - Test in development first

2. **Check Callback URLs**
   - XUMM console should have correct callback URLs
   - Format: `https://your-domain.vercel.app/api/xumm/callback`

---

## 📊 Post-Deployment Verification

After deployment, test:

1. **Open your production URL**
   - [ ] Page loads correctly
   - [ ] No console errors

2. **Test Wallet Connections**
   - [ ] MetaMask/Injected wallet works
   - [ ] WalletConnect works
   - [ ] Xaman works (if configured)

3. **Test Core Functionality**
   - [ ] Place a pixel
   - [ ] See real-time updates
   - [ ] Check leaderboard
   - [ ] Test on mobile

4. **Performance Check**
   - [ ] Fast page load (<3s)
   - [ ] WebSocket connects quickly
   - [ ] No memory leaks

---

## 🔄 Updates & Redeployment

### To Deploy Updates

**Via Git (Automatic)**
```bash
git add .
git commit -m "Your update message"
git push
```
Vercel will automatically redeploy.

**Via CLI**
```bash
vercel --prod
```

---

## 🌐 Custom Domain

### Add Custom Domain in Vercel

1. Go to your project in Vercel
2. Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Update `APP_BASE_URL` environment variable

---

## 📈 Monitoring

### Vercel Analytics (Free)

1. Enable in Vercel Dashboard
2. View real-time metrics:
   - Page views
   - Performance scores
   - Geographic distribution

### Custom Logging

Add logging for production issues:

```typescript
// Add to pages/api/ routes
console.error('Production error:', error);
```

View logs in Vercel Dashboard → Deployments → Function Logs

---

## 💡 Optimization Tips

1. **Enable Edge Functions** (Vercel default)
   - Faster response times
   - Reduced latency

2. **Use Vercel KV** (Optional)
   - Replace in-memory state for persistence
   - Survives server restarts

3. **Enable Caching**
   - Already configured for leaderboard
   - Add more caching as needed

---

## 🎉 Success!

Once deployed, your Web3SlashPlace Mini will be live at:
```
https://your-project.vercel.app
```

Share the link and watch users interact with your pixel canvas in real-time! 🎨

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **XUMM API**: [xumm.readme.io](https://xumm.readme.io/)

---

**Need help?** Check the [Troubleshooting](#-troubleshooting-deployment) section above or open a GitHub issue.


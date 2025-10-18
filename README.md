# CanvasW3 🎨

> A Web3-powered collaborative pixel canvas with real-time updates, multi-chain wallet support, and engaging game mechanics.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-green)](https://socket.io/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.12-purple)](https://wagmi.sh/)

---

## 🌟 Features

### 🎨 Core Gameplay
- **50x50 Interactive Canvas** - Click to place colored pixels
- **Multi-Chain Wallet Support**
  - 🦊 MetaMask & Injected Wallets  
  - 🔗 WalletConnect v2  
  - 🔷 Xaman (XRPL)
- **Real-time Updates** - See other players' pixels instantly via WebSocket
- **Color Picker** - 12 preset colors + custom hex color selector
- **Territory Control** - Claim and expand your pixel territory

### 🎮 Game Mechanics
- **Connected Clusters** - Group adjacent pixels for bonuses
- **Line Detection** - Auto-fill pixels to create lines (4-pixel range)
- **Mining Rewards** - Earn mock tokens based on territory size
- **Connectivity Bonuses** - Higher rewards for larger connected regions
- **Visual Effects** - Glowing borders and pulse animations

### 🏆 Social Features
- **Live Leaderboard** - Track top players by pixels, territory, and rewards
- **Real-time Event Log** - See all pixel placements as they happen
- **Player Stats** - Detailed metrics for each participant
- **Game Metrics** - Total pixels, players, and canvas fill percentage

### 🔐 Security
- **SIWE Authentication** - Sign-In with Ethereum for secure verification
- **IP Rate Limiting** - Sliding window algorithm to prevent abuse
- **Session Management** - HTTP-only cookies for secure authentication
- **Server-side Validation** - All actions validated on backend

### 📱 Responsive Design
- **Desktop-First** - Full-featured interface with slide-out panels
- **Mobile-Optimized** - Touch-friendly with bottom sheet modals
- **Gesture Support** - Swipe to close, pinch to zoom, drag to pan
- **Adaptive UI** - Hamburger menu and collapsible sections

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Kagu-Re/CanvasW3.git
cd CanvasW3

# Install dependencies
npm install

# Create environment file
cp env.template .env.local

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Environment Variables

Create `.env.local` in the root directory:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# XUMM/Xaman API Credentials (get from https://apps.xumm.dev/)
XUMM_API_KEY=your_xumm_api_key
XUMM_API_SECRET=your_xumm_api_secret

# JWT Secret (use random string for production)
JWT_SECRET=devsecret

# Application URL
APP_BASE_URL=http://localhost:3000
```

> **Note:** XUMM credentials are optional. MetaMask and WalletConnect work without them.

---

## 🎮 How to Play

1. **Connect Wallet** - Choose MetaMask, WalletConnect, or Xaman
2. **Pick a Color** - Select from presets or create custom colors
3. **Place Pixels** - Click on the canvas to claim pixels
4. **Build Lines** - Place pixels within 4 spaces to auto-connect
5. **Climb Leaderboard** - Expand territory and earn rewards

---

## 🚂 Deployment

### Railway (Recommended)

Railway fully supports Socket.IO and real-time features.

**Quick Deploy:**
1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Add environment variables
4. Deploy! ✨

📖 **[Full Railway deployment guide](./RAILWAY_DEPLOYMENT.md)**

### ⚠️ Vercel Limitations

Vercel's serverless architecture **does not support Socket.IO**:
- ❌ Real-time updates won't work
- ❌ WebSocket connections will fail
- ✅ Canvas works but requires manual refresh

**For full functionality, use Railway or another platform with persistent Node.js processes.**

---

## 🏗️ Project Structure

```
CanvasW3/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main application page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── AddressConnector.tsx # Wallet connection UI
│   ├── Canvas.tsx           # 50x50 pixel grid
│   ├── ColorPicker.tsx      # Color selection
│   ├── Leaderboard.tsx      # Player rankings
│   ├── AboutModal.tsx       # Info & instructions
│   ├── RatingPopup.tsx      # User rating system
│   ├── DonationPopup.tsx    # Donation prompts
│   └── ...                  # More components
├── pages/api/               # API routes
│   ├── auth/                # Authentication (SIWE)
│   ├── xumm/                # Xaman integration
│   ├── canvas.ts            # Canvas state
│   ├── place.ts             # Place pixel
│   ├── leaderboard.ts       # Rankings
│   ├── socketio.ts          # WebSocket server
│   └── ...                  # More endpoints
├── lib/                     # Utilities
│   ├── state.ts             # Game state
│   ├── session.ts           # JWT sessions
│   ├── rateLimit.ts         # IP limiting
│   └── constants.ts         # Configuration
└── README.md                # This file
```

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5.4
- TailwindCSS 3.4

**Web3:**
- wagmi 2.12
- WalletConnect 2.14
- viem 2.21
- xumm-sdk 1.10

**Backend:**
- Socket.IO 4.7
- JWT (jsonwebtoken)
- Node.js API routes

**Deployment:**
- Railway (recommended)
- Vercel (limited functionality)

---

## 📡 API Endpoints

### Canvas
- `GET /api/canvas` - Get current canvas state
- `POST /api/place` - Place a pixel (auth required)

### Authentication (SIWE)
- `POST /api/auth/nonce` - Generate nonce
- `POST /api/auth/verify` - Verify signature
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Check session

### Stats
- `GET /api/leaderboard` - Player rankings
- `GET /api/metrics` - Game statistics
- `GET /api/events` - Recent events

### WebSocket
- Connect to `/` with path `/api/socketio`
- Events: `pixel_placed`, `pixel_event`

---

## 🎯 Game Configuration

Edit `lib/constants.ts`:

```typescript
// Canvas settings
export const CANVAS_SIZE = 50;
export const COOLDOWN_MS = 1000; // 1 second cooldown

// Game mechanics
export const LINE_CONNECTION_RANGE = 4;
export const CONNECTIVITY_BONUS_MULTIPLIER = 0.5;
export const LINE_BONUS_MULTIPLIER = 2.0;

// Performance
export const LEADERBOARD_CACHE_MS = 5000;
export const LEADERBOARD_POLL_INTERVAL = 10000;
```

---

## 🐛 Troubleshooting

### WebSocket Issues
- Ensure port 3000 is available
- Check browser console for errors
- Refresh the page

### Wallet Connection
- **MetaMask:** Install extension and unlock
- **WalletConnect:** Use mobile wallet app with QR code
- **Xaman:** Verify XUMM credentials are set

### Pixel Placement
- Connect wallet first
- Wait for 1-second cooldown
- Check rate limits (100 requests/minute)

---

## 💜 Support Development

Enjoying CanvasW3? Support the project!

**Donate Crypto:**

```
ETH/ERC-20: 0x293e53080Db196BEdDD0Cfa40B70360b2a621564
```

Your donations help keep the server running and support ongoing development. Thank you! 🙏

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use for any purpose.

---

## 📞 Support

For issues or questions:
- Open a [GitHub Issue](https://github.com/Kagu-Re/CanvasW3/issues)
- Check existing [documentation](./RAILWAY_DEPLOYMENT.md)

---

## 🙏 Acknowledgments

Built with ❤️ using:
- Next.js & React
- Socket.IO for real-time features
- wagmi & WalletConnect for Web3 integration
- Railway for reliable hosting

---

**Powered by Web3 • Built for the Community • Open Source**

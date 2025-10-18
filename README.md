# CanvasW3

A Web3-powered collaborative pixel canvas built with Next.js, featuring real-time updates, multi-chain wallet support, and advanced game mechanics.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-green)
![Wagmi](https://img.shields.io/badge/Wagmi-2.12-purple)
![WalletConnect](https://img.shields.io/badge/WalletConnect-2.14-blue)

## ✨ Features

### 🎨 Core Functionality
- **50x50 Interactive Canvas** - Click to place colored pixels
- **Multi-Chain Wallet Support**:
  - 🦊 MetaMask & Injected Wallets
  - 🔗 WalletConnect v2
  - 🔷 Xaman (XRPL)
- **Real-time Updates** - See other users' pixels instantly via WebSockets
- **Color Picker** - 12 preset colors + custom hex color selector
- **Persistent State** - Canvas state survives page refreshes

### 🎮 Game Mechanics
- **Territory Control** - Claim and expand your pixel territory
- **Connected Clusters** - Group adjacent pixels for bonuses
- **Line Detection** - Auto-fill pixels to create lines (4-pixel range)
- **Mining Rewards** - Earn mock tokens based on territory size
- **Connectivity Bonuses** - Higher rewards for larger connected regions
- **Visual Effects** - Glowing borders and pulse animations for connected pixels

### 🏆 Social Features
- **Live Leaderboard** - Track top players by pixels, territory, and rewards
- **Real-time Event Log** - See all pixel placements as they happen
- **Player Stats** - Detailed metrics for each participant
- **Game Metrics** - Total pixels, players, and canvas fill percentage

### 🔐 Security & Performance
- **SIWE Authentication** - Sign-In with Ethereum for secure wallet verification
- **IP Rate Limiting** - Sliding window algorithm to prevent abuse
- **Session Management** - HTTP-only cookies for secure authentication
- **Server-side Validation** - All actions validated on the backend
- **Optimized Caching** - 5-second TTL for leaderboard data

### 📱 Responsive Design
- **Desktop-First** - Full-featured interface with slide-out panels
- **Mobile-Optimized** - Touch-friendly with bottom sheet modals
- **Gesture Support** - Swipe to close, pinch to zoom, drag to pan
- **Adaptive UI** - Hamburger menu and collapsible sections on mobile

### 🎛️ Canvas Controls
- **Zoom In/Out** - Mouse wheel or buttons
- **Pan** - Click and drag to navigate
- **Reset View** - Return to default zoom/position
- **Cluster Toggle** - Show/hide visual cluster borders
- **Demo Mode** - Watch AI agents play the game

---

## 🚀 Deployment

### 🚂 Railway (Recommended for Production)

**Railway is the recommended platform** because it fully supports Socket.IO and real-time features.

👉 **[See RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for full deployment guide**

**Quick Deploy:**
1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Add environment variables
4. Done! Your app is live with full Socket.IO support ✨

### ⚠️ Vercel Limitations

Vercel's serverless architecture **does not support Socket.IO**. If you deploy to Vercel:
- ❌ Real-time updates won't work
- ❌ WebSocket connections will fail
- ✅ The canvas will work but users must refresh to see changes

**For full functionality, use Railway or another platform with persistent Node.js processes.**

---

## 💻 Local Development

### Prerequisites
- **Node.js** 18.x or later
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Kagu-Re/web3slashplace-mini.git
cd web3slashplace-mini
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Required for Xaman/XRPL support (get from https://xumm.readme.io/)
XUMM_API_KEY=your_xumm_api_key
XUMM_API_SECRET=your_xumm_api_secret

# Optional: Base URL for production
APP_BASE_URL=http://localhost:3000

# Optional: JWT Secret (auto-generated if not provided)
JWT_SECRET=your_random_secret_key
```

> **Note:** If you don't need Xaman/XRPL support, you can skip the XUMM credentials. MetaMask and WalletConnect will still work.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

---

## 🏗️ Project Structure

```
web3slashplace-mini/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main application page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── AddressConnector.tsx # Wallet connection UI
│   ├── Canvas.tsx           # 50x50 pixel grid
│   ├── ColorPicker.tsx      # Desktop color selector
│   ├── MobileColorPicker.tsx # Mobile color modal
│   ├── Leaderboard.tsx      # Desktop leaderboard panel
│   ├── MobileLeaderboard.tsx # Mobile leaderboard modal
│   ├── CanvasControls.tsx   # Zoom/pan controls
│   ├── DemoController.tsx   # AI agent demo
│   ├── EventLog.tsx         # Real-time event feed
│   └── Toast.tsx            # Notification system
├── pages/api/               # API routes
│   ├── auth/                # Authentication endpoints
│   │   ├── nonce.ts         # Generate SIWE nonce
│   │   ├── verify.ts        # Verify signature
│   │   ├── logout.ts        # Clear session
│   │   └── session.ts       # Check session
│   ├── xumm/                # Xaman integration
│   │   ├── create.ts        # Create sign-in payload
│   │   └── status.ts        # Check payload status
│   ├── canvas.ts            # Get canvas state
│   ├── place.ts             # Place pixel
│   ├── leaderboard.ts       # Get leaderboard
│   ├── metrics.ts           # Game statistics
│   ├── events.ts            # Event log
│   └── socketio.ts          # WebSocket server
├── lib/                     # Shared utilities
│   ├── state.ts             # In-memory game state
│   ├── session.ts           # JWT session management
│   ├── nonceStore.ts        # SIWE nonce storage
│   ├── rateLimit.ts         # IP rate limiting
│   ├── eventLog.ts          # Event logging
│   └── constants.ts         # Game configuration
├── .env.local               # Environment variables (create this)
├── env.template             # Environment variable template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind CSS config
└── README.md                # This file
```

---

## 🎮 How to Play

### 1. Connect Your Wallet
Click one of the connection buttons:
- **Injected** - MetaMask or browser wallet
- **WalletConnect** - Mobile wallets via QR code
- **Xaman** - XRPL wallets

For EVM wallets, you'll be asked to sign a message (SIWE) to verify ownership.

### 2. Choose Your Color
- **Desktop:** Click the color picker button
- **Mobile:** Tap the color square or hamburger menu → Color Picker

### 3. Place Pixels
Click any white or opponent-owned pixel on the 50x50 grid to claim it.

### 4. Build Territory
- Place pixels adjacent to each other to create **clusters**
- Form **lines** by placing pixels in a straight line (horizontal/vertical)
- Connected pixels earn **bonus rewards**
- Larger territories = higher mining rewards

### 5. Track Your Progress
- **Desktop:** Click the trophy icon on the right
- **Mobile:** Hamburger menu → Leaderboard

### 6. Controls
- **Zoom:** Mouse wheel, pinch (mobile), or control buttons
- **Pan:** Click and drag
- **Reset:** Return to default view

---

## 🔧 Configuration

### Game Settings
Edit `lib/constants.ts` to customize:

```typescript
export const CANVAS_SIZE = 50;                    // Grid dimensions
export const COOLDOWN_MS = 1000;                  // Pixel placement cooldown (1s)
export const LINE_CONNECTION_RANGE = 4;           // Range for line auto-fill
export const CONNECTIVITY_BONUS_MULTIPLIER = 0.5; // Bonus per connected pixel
export const LINE_BONUS_MULTIPLIER = 2.0;         // Bonus for lines
export const LEADERBOARD_CACHE_MS = 5000;         // Cache duration
```

### Rate Limiting
Adjust in `lib/rateLimit.ts`:

```typescript
const MAX_REQUESTS = 100;      // Max requests per window
const WINDOW_MS = 60000;       // Time window (1 minute)
```

---

## 🛠️ Technology Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5.7** - Type safety
- **Tailwind CSS** - Utility-first styling

### Blockchain Integration
- **wagmi** - EVM wallet connector
- **@reown/appkit** - WalletConnect v2
- **viem** - Ethereum library (SIWE verification)
- **xumm-sdk** - XRPL/Xaman integration

### Real-time
- **Socket.IO** - WebSocket server & client

### State & Data
- **@tanstack/react-query** - Data fetching & caching

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```env
XUMM_API_KEY=your_production_key
XUMM_API_SECRET=your_production_secret
APP_BASE_URL=https://your-domain.com
JWT_SECRET=generate_a_strong_random_secret
```

### Build Locally
```bash
npm run build
npm start
```

---

## 📚 API Endpoints

### Canvas
- `GET /api/canvas` - Get current canvas state
- `POST /api/place` - Place a pixel (requires authentication)

### Authentication
- `POST /api/auth/nonce` - Generate SIWE nonce
- `POST /api/auth/verify` - Verify signature & create session
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Check session status

### Leaderboard & Stats
- `GET /api/leaderboard` - Get player rankings
- `GET /api/metrics` - Get game statistics
- `GET /api/events` - Get recent pixel placements

### XRPL/Xaman
- `POST /api/xumm/create` - Create sign-in payload
- `GET /api/xumm/status?uuid={uuid}` - Check payload status

### WebSocket
- Connect to `/` with path `/api/socketio`
- Events:
  - `pixel_placed` - Broadcast when pixel is placed
  - `pixel_event` - Detailed event for event log

---

## 🔒 Security Features

- **SIWE (Sign-In with Ethereum)** - Cryptographic proof of wallet ownership
- **Nonce-based authentication** - Prevents replay attacks
- **HTTP-only cookies** - Secure session storage
- **IP rate limiting** - Prevents spam and DoS
- **Server-side validation** - All actions verified on backend
- **Color format validation** - Prevents injection attacks

---

## 🎯 Requirements Compliance

This project fully meets and exceeds the original requirements:

✅ React + Next.js  
✅ Multi-chain wallet support (WalletConnect + Xaman)  
✅ 50x50 pixel grid  
✅ Cooldown system (1-second backend restriction)  
✅ WebSocket real-time updates  
✅ Canvas state persistence  
✅ No database (in-memory storage)  

**Bonus features:** Leaderboard, canvas controls, mobile optimization, game mechanics, security enhancements, and more!

See [REQUIREMENTS_COMPARISON.md](./REQUIREMENTS_COMPARISON.md) for detailed comparison.

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure port 3000 is not in use by another process
- Check browser console for connection errors
- Try refreshing the page

### Wallet Connection Problems
- **MetaMask:** Ensure extension is installed and unlocked
- **WalletConnect:** Make sure your wallet app supports WalletConnect v2
- **Xaman:** Verify XUMM_API_KEY and XUMM_API_SECRET are set

### Pixel Placement Issues
- Check if you're connected (address shown in header)
- Wait for cooldown to expire (1 second)
- Verify you're not rate limited (100 requests/minute)

---

## 📄 License

MIT License - feel free to use for any purpose.

---

## 🤝 Contributing

This is a demo project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 💜 Support Development

Enjoying CanvasW3? Consider supporting the project!

**Donate Crypto:**
- ETH/ERC-20: `0x293e53080Db196BEdDD0Cfa40B70360b2a621564`

Your donations help keep the server running and support ongoing development. Thank you! 🙏

---

## 📞 Support

For issues or questions, please open a GitHub issue at [github.com/Kagu-Re/web3slashplace-mini](https://github.com/Kagu-Re/web3slashplace-mini/issues).

---

**Built with ❤️ using Next.js, React, and Web3 technologies.**
#   D e p l o y m e n t   r e t r y   -   1 0 / 1 8 / 2 0 2 5   0 5 : 2 9 : 1 0 
 
 
# VERIDICAL

**Immutable. Uncensorable. Forever.**

A cinematic, documentary-style interactive web application that visualizes 5,000 years of human atrocities across an interactive 3D globe. Every verified crime record is inscribed on the Monad blockchain—immutable and accessible to all.

[**Live Demo** ](https://veridical.vercel.app) | [**Documentation**](./GITHUB_AND_VERCEL_SETUP.md) | [**Deployment Guide**](./DEPLOYMENT.md)

---

## 🌍 Features

### Interactive 3D Globe
- **Rotating Earth visualization** powered by Three.js and react-globe.gl
- **115+ documented crimes** mapped to exact locations
- **Real-time filtering** by era, category, severity, and year
- **Cinematic animations** with Framer Motion for smooth interactions
- **GPU optimized** for 60fps performance

### Blockchain Verification
- **Smart contract integration** with Monad Testnet (chainId: 10143)
- **On-chain record submission** - submit crime records as immutable on-chain data
- **Community upvoting** - verify records through consensus
- **Transaction history** - view all verified records
- **Live contract** at `0x7aEbcBE903eE79B798a51d78F90017A985000BC1`

### Professional UI/UX
- **MONAD NOIR dark theme** with purple accents
- **Responsive design** works on desktop, tablet, and mobile
- **Framer Motion animations** for smooth, 60fps transitions
- **Real-time wallet connection** (MetaMask, Phantom)
- **Toast notifications** for transaction feedback

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **3D Visualization** | Three.js, react-globe.gl |
| **Animations** | Framer Motion |
| **State Management** | Zustand |
| **Blockchain** | ethers.js v6, Monad Testnet |
| **Styling** | Tailwind CSS, custom CSS |
| **Build** | Vite, esbuild |
| **Smart Contract** | Solidity 0.8.20, Hardhat 2.22.0 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or Phantom wallet
- Monad Testnet configured in wallet

### Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/veridical.git
   cd veridical
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # .env now contains:
   # VITE_CONTRACT_ADDRESS=0x7aEbcBE903eE79B798a51d78F90017A985000BC1
   # MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5174`

4. **Connect your wallet:**
   - Click "🔗 CONNECT WALLET" in header
   - Approve Monad Testnet connection
   - Start submitting and verifying records!

---

## 🌐 Live Deployment

**Currently deployed at:** `https://veridical.vercel.app`

### Deploy Your Own

#### On Vercel (Recommended)
1. Push code to GitHub (see [GitHub & Vercel Setup](./GITHUB_AND_VERCEL_SETUP.md))
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variable: `VITE_CONTRACT_ADDRESS=0x7aEbcBE903eE79B798a51d78F90017A985000BC1`
5. Deploy (automatic on every push to main)

#### On Other Platforms
- **Netlify**: `npm run build` → Deploy `dist/` folder
- **GitHub Pages**: Configure in repo settings
- **Railway/Render**: Deploy Node.js buildpack with `npm run build`

See [GITHUB_AND_VERCEL_SETUP.md](./GITHUB_AND_VERCEL_SETUP.md) for detailed instructions.

---

## 🔗 Blockchain Integration

### Smart Contract
- **Name**: VeridicalRegistry
- **Address**: `0x7aEbcBE903eE79B798a51d78F90017A985000BC1`
- **Network**: Monad Testnet (chainId: 10143)
- **Functions**:
  - `submitRecord(eventId, contentHash)` - Submit a crime record
  - `upvoteRecord(eventId)` - Upvote an existing record
  - `getRecord(eventId)` - Read record details
  - `getTotalRecords()` - Get submission count

### Environment Variables
```bash
# Required for frontend
VITE_CONTRACT_ADDRESS=0x7aEbcBE903eE79B798a51d78F90017A985000BC1
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Optional - only for contract deployment
PRIVATE_KEY=your_private_key_here
```

---

## 📊 Dataset

**115+ historically documented crimes** including:
- **Ancient Era** (3000 BCE - 500 CE): Carthage, Slavery, Roman Massacres
- **Medieval Era** (500 - 1500 CE): Crusades, Inquisitions
- **Colonial Era** (1500 - 1900): Belgian Congo, Native American Genocide, Transatlantic Slave Trade
- **Modern Era** (1900 - 2000): Holocaust, Gulags, Cambodian Genocide, Armenian Genocide
- **Contemporary** (2000 - Present): Darfur, Rwandan Genocide, Yazidi Genocide, Ukraine War

Each record includes:
- Location (lat/lng for 3D globe mapping)
- Time period (year/year range)
- Perpetrators and victims
- Historical sources and references
- Severity rating (1-5)

See [src/data/crimes.json](./src/data/crimes.json) for full dataset.

---

## 🎮 Using the App

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `D` | Documentary mode (auto-play through crimes) |
| `?` | Show keyboard help |
| `S` | Toggle statistics panel |
| `R` | Random crime discovery |
| `←` `→` | Navigate to previous/next crime |
| `SPACE` | Pause/resume globe rotation |
| `ESC` | Close all panels |

### Controls
- **Mouse drag** - Rotate globe
- **Scroll** - Zoom in/out
- **Click crime** - View details
- **⛓ TRANSACTIONS** - View blockchain history
- **⟳ + -** - Reset view / Zoom controls

---

## 📁 Project Structure

```
veridical/
├── src/
│   ├── components/          # React components
│   │   ├── Blockchain/      # Wallet & transaction UI
│   │   ├── Globe/           # 3D visualization
│   │   ├── Panels/          # Detail, filter, leaderboard panels
│   │   └── UI/              # Header, search, modals
│   ├── hooks/               # Custom React hooks
│   │   ├── useMonad.ts      # Blockchain wallet logic
│   │   ├── useGlobe.ts      # Globe state
│   │   └── useFiltered...   # Data filtering
│   ├── store/               # Zustand state management
│   ├── contracts/           # Smart contract ABI
│   ├── data/                # crimes.json dataset (115+ records)
│   ├── types/               # TypeScript definitions
│   └── styles/              # CSS files
├── scripts/
│   └── deploy.ts            # Contract deployment script
├── artifacts/               # Compiled contract artifacts
├── package.json             # Dependencies
├── vite.config.ts           # Vite build config
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

---

## 🔧 Development

### Available Scripts
```bash
npm run dev                  # Start dev server (http://localhost:5174)
npm run build                # Build for production (creates dist/)
npm run contract:deploy      # Deploy VeridicalRegistry to Monad
npm run contract:check       # Verify contract status
npm run preview              # Preview production build locally
```

### Building for Production
```bash
npm run build
# Creates optimized dist/ folder (~5 MB gzipped)
# Ready to deploy on Vercel, Netlify, GitHub Pages, etc.
```

---

## 🎨 Customization

### Add More Crimes
Edit [src/data/crimes.json](./src/data/crimes.json) and follow the structure:
```json
{
  "id": "unique-id",
  "title": "Crime Title",
  "year": 2024,
  "era": "Contemporary",
  "category": "genocide|war-crimes|state-terror|etc",
  "severity": 5,
  "coordinates": { "lat": 0, "lng": 0 },
  "perpetrators": ["Person/Group"],
  "victims": "Description",
  "summary": "Short summary",
  "detail": "Detailed explanation",
  "sources": ["https://reference"]
}
```

### Change Theme
- Colors: [src/index.css](./src/index.css) `:root` variables
- Animations: Framer Motion variants in component files
- Fonts: Tailwind config + Google Fonts in CSS

### Modify Contract
- Edit [src/contracts/VeridicalRegistry.sol](./src/contracts/VeridicalRegistry.sol)
- Redeploy with `npm run contract:deploy`
- Update `VITE_CONTRACT_ADDRESS` in .env

---

## 🐛 Troubleshooting

### Blank Screen on Load
- Check browser console (F12) for errors
- Ensure `VITE_CONTRACT_ADDRESS` is set in .env
- Try hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)

### Wallet Connection Fails
- Install MetaMask or Phantom
- Ensure Monad Testnet is configured
- Network: Monad Testnet, RPC: https://testnet-rpc.monad.xyz, ChainID: 10143

### Transaction Reverts
- Verify you have MON tokens in wallet (Monad Testnet faucet)
- Check contract address is correct
- Ensure connected to right network

### Build Errors
```bash
npm run build 2>&1 | head -20
# Check for TypeScript or esbuild errors
npm install  # Reinstall dependencies if needed
rm -rf node_modules dist && npm install  # Full clean install
```

---

## 📜 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional historical crimes to dataset
- UI/UX enhancements
- Additional blockchain features
- Mobile optimization
- Accessibility improvements

---

## 📚 Resources

- **Live Demo**: https://veridical.vercel.app
- **GitHub Repo**: https://github.com/YOUR_USERNAME/veridical
- **Monad Testnet**: https://testnet.monadexplorer.com
- **Smart Contract ABI**: [src/contracts/abi.ts](./src/contracts/abi.ts)
- **Deployment Guide**: [GITHUB_AND_VERCEL_SETUP.md](./GITHUB_AND_VERCEL_SETUP.md)

---

## 🌟 Making History Permanent

Every atrocity documented has been erased from official histories. Veridical makes that impossible. Records inscribed on Monad cannot be deleted, modified, or censored. The truth, once verified, lives forever.

**The chain remembers.**

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

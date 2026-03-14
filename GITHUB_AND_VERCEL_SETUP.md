# GitHub & Vercel Deployment Guide

## ✅ Current Status
- **Git Repository**: Initialized ✓
- **Initial Commit**: Done ✓
- **Ready for**: GitHub push + Vercel deployment

---

## Step 1: Push to GitHub 🚀

### Option A: Create New Repository on GitHub (Recommended)

1. **Go to GitHub.com** and sign in
   - If you don't have an account, create one at https://github.com/signup

2. **Create New Repository**
   - Click the `+` icon (top right) → `New repository`
   - **Repository Name**: `veridical` (or your choice)
   - **Description**: "Immutable crime documentation on Monad blockchain"
   - **Public** (so it's deployable on Vercel)
   - **DO NOT initialize** with README, .gitignore, or license (we already have them)
   - Click **Create repository**

3. **Copy the repository URL** (looks like: `https://github.com/YOUR_USERNAME/veridical.git`)

4. **Add Remote and Push** (run these commands):

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/veridical.git

# Rename main branch to match GitHub
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

### Expected Output:
```
Enumerating objects: 72, done.
Counting objects: 100% (72/72), done.
Compressing objects: 100% (65/65), done.
Writing objects: 100% (72/72), ...
remote: Resolving deltas: 100% (18/18), done.
To https://github.com/YOUR_USERNAME/veridical.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Your code is now on GitHub!**

---

## Step 2: Deploy on Vercel 🌐

### Prerequisites:
- GitHub repository created (Step 1)
- Vercel account (free at https://vercel.com)

### Deployment Steps:

1. **Go to Vercel.com** and sign in (or sign up)
   - Recommended: Sign in with GitHub

2. **Create New Project**
   - Click **Add New...** → **Project**
   - Select your GitHub account
   - Search for `veridical` repository
   - Click **Import**

3. **Configure Project Settings**
   - **Framework Preset**: Select `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm ci` (default)

4. **Environment Variables** (IMPORTANT ⚠️)
   
   Add these in the **Environment Variables** section:
   
   ```
   VITE_CONTRACT_ADDRESS = 0x7aEbcBE903eE79B798a51d78F90017A985000BC1
   ```
   
   **DO NOT add PRIVATE_KEY** - it's only for deployment scripts, not the frontend!
   
   - For each variable, set **Environments**: Select `Production`, `Preview`, and `Development`
   - Click **Add** for each

5. **Click Deploy**
   - Vercel will build and deploy automatically
   - Watch the build logs - should complete in ~2-3 minutes
   - You'll see: `Deployment Complete` with a URL

✅ **Your app is now live on Vercel!**

---

## Step 3: Access Your Live App 🎉

After Vercel finishes deploying:

1. **Your live URL** will be: `https://veridical.vercel.app` (or `https://veridical-YOUR_USERNAME.vercel.app`)
   
2. **Share with anyone** - the app is now public!

3. **Custom Domain** (Optional)
   - In Vercel dashboard → **Settings** → **Domains**
   - Add your custom domain (e.g., `veridical.app`)

---

## Step 4: Update and Deploy Changes 📦

To deploy new changes:

1. **Make changes** to your code locally

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

3. **Vercel automatically redeploys** when it detects new pushes to main branch ✓

---

## Environment Variables Configuration

### For Local Development:
Create/update `.env` file in project root:
```
VITE_CONTRACT_ADDRESS=0x7aEbcBE903eE79B798a51d78F90017A985000BC1
PRIVATE_KEY=your_private_key_here (only needed for contract deployment)
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### For Vercel:
Only add `VITE_CONTRACT_ADDRESS` (public constant)
- `PRIVATE_KEY` should NOT be exposed in frontend

---

## Troubleshooting 🔧

### Build Fails on Vercel

**If you see build errors:**

1. Check **Build Logs** in Vercel dashboard
2. Common issues:
   - **Missing environment variables**: Add them in Vercel Settings → Environment Variables
   - **TypeScript errors**: Run `npm run build` locally to debug
   - **Module not found**: Check `npm run build` locally works

### App Shows Blank Screen

- Check browser console (F12) for errors
- Verify environment variables are correct
- Check that Three.js and Three-Globe libraries loaded
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Contract Not Responding

- Verify `VITE_CONTRACT_ADDRESS` is correct: `0x7aEbcBE903eE79B798a51d78F90017A985000BC1`
- Ensure it's on Monad Testnet (chainId: 10143)
- Check browser wallet is set to Monad Testnet

---

## File Structure for Deployment

```
veridical/
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── components/          # Blockchain & UI components
│   ├── contracts/           # Solidity ABI
│   ├── data/                # Crime dataset (115+ crimes)
│   ├── hooks/               # React hooks (Monad wallet, etc)
│   ├── store/               # State management (Zustand)
│   └── types/               # TypeScript definitions
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment template
├── README.md                # Documentation
└── DEPLOYMENT.md            # Deployment notes
```

---

## Quick Command Reference

```bash
# Local development
npm run dev              # Start dev server at http://localhost:5174

# Build for production
npm run build            # Creates dist/ folder

# Deploy smart contract
npm run contract:deploy  # Deploys VeridicalRegistry to Monad Testnet

# Check contract status
npm run contract:check   # Verifies contract is live
```

---

## What's Included in This Deployment ✅

- ✅ **React 18** with TypeScript
- ✅ **Vite** for fast builds
- ✅ **Framer Motion** for smooth animations
- ✅ **Three.js + Three-Globe** for 3D Earth visualization
- ✅ **Zustand** for state management
- ✅ **ethers.js v6** for blockchain integration
- ✅ **115+ documented historical crimes** across all eras
- ✅ **Monad blockchain integration** (chainId: 10143)
- ✅ **VeridicalRegistry smart contract** deployed and live
- ✅ **Dark theme UI** with professional animations
- ✅ **Responsive design** for mobile & desktop
- ✅ **GPU-optimized rendering** for 60fps performance

---

## Next Steps After Deployment 🚀

1. **Test wallet connection** - Connect MetaMask/Phantom to Monad Testnet
2. **Submit a crime record** - Test the blockchain integration
3. **Share the URL** - Invite others to explore and verify records
4. **Monitor Monad Testnet** - Check transactions at https://testnet.monadexplorer.com
5. **Improvements** - Add more crimes, optimize UI, add features

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com
- **Vite Docs**: https://vitejs.dev
- **Monad Testnet**: https://testnet-rpc.monad.xyz
- **Monad Explorer**: https://testnet.monadexplorer.com

---

**Your Veridical app is ready to change the world! 🌍**

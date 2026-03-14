# VERIDICAL

A cinematic, documentary-style interactive web application that visualizes the history of humanity's most notorious crimes and atrocities on a rotating 3D globe, with on-chain record verification powered by the Monad blockchain.

## Features

- **3D Globe Visualization**: Interactive rotating globe with crime hotspots
- **Blockchain Verification**: Submit and verify crime records on Monad Testnet
- **Cinematic Design**: MONAD NOIR theme with grain effects and animations
- **Filtering & Search**: Filter by era, category, severity, and search
- **Responsive UI**: Panels slide in/out with Framer Motion animations

## Tech Stack

- React 18 + TypeScript + Vite
- Three.js via react-globe.gl
- Framer Motion for animations
- ethers.js for Monad blockchain integration
- Zustand for state management
- Tailwind CSS for styling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your deployed contract address to VITE_CONTRACT_ADDRESS
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploying the Smart Contract

1. Set up your Monad Testnet private key in `.env`:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

2. Deploy to Monad Testnet:
   ```bash
   npx hardhat run scripts/deploy.ts --network monadTestnet
   ```

3. Update `VITE_CONTRACT_ADDRESS` in `.env` with the deployed address.

## Build for Production

```bash
npm run build
```

## Environment Variables

- `VITE_CONTRACT_ADDRESS`: Deployed VeridicalRegistry contract address
- `PRIVATE_KEY`: Private key for contract deployment (not for frontend)

## Monad Network Configuration

- **Network Name**: Monad Testnet
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Chain ID**: 10143
- **Currency Symbol**: MON
- **Explorer**: https://testnet.monadexplorer.com
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
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

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

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

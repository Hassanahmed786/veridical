import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const WalletButton = () => {
  const { walletAddress, isConnected } = useAppStore();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-2 bg-bg-surface border border-border-glow rounded-lg hover:bg-bg-elevated transition-colors"
    >
      <div className="w-8 h-8 bg-monad-purple rounded-full flex items-center justify-center">
        <Wallet size={16} className="text-text-primary" />
      </div>
      <div className="text-left">
        <div className="text-text-primary font-body text-sm">
          {isConnected && walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'CONNECT WALLET'}
        </div>
        <div className="text-text-dim text-xs">Monad Testnet</div>
      </div>
    </motion.button>
  );
};

export default WalletButton;

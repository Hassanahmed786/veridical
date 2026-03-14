import { motion } from 'framer-motion';
import { useMonad } from '../../hooks/useMonad';
import WalletButton from '../UI/WalletButton';

const BlockchainPanel = () => {
  const { isConnected, isCorrectChain, walletAddress, balance } = useMonad();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="fixed top-4 right-4 z-20"
    >
      <div className="flex items-center gap-4">
        <WalletButton />
        {isConnected && (
          <div className="bg-bg-surface border border-border-glow rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCorrectChain ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-text-secondary text-sm font-display uppercase tracking-wider">
                {isCorrectChain ? 'MONAD TESTNET' : 'WRONG NETWORK'}
              </span>
            </div>
            {walletAddress && (
              <div className="text-text-dim text-xs mt-1">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} • {balance} MON
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BlockchainPanel;
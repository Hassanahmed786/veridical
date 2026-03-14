import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { BlockchainTransactionReceipt } from '../../types';

interface TransactionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistoryPanel = ({ isOpen, onClose }: TransactionHistoryPanelProps) => {
  const { transactionHistory } = useAppStore();

  // Memoize sorted history to prevent unnecessary re-renders
  const sortedHistory = useMemo(
    () => [...transactionHistory].reverse(),
    [transactionHistory]
  );

  const containerVariants = {
    hidden: { x: -400, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      x: -400,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (index: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: index * 0.05,
        duration: 0.2,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="tx-history-panel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="tx-history-header">
            <span>TRANSACTION HISTORY</span>
            <button onClick={onClose} className="tx-history-close">
              ✕
            </button>
          </div>

          {sortedHistory.length > 0 ? (
            <div className="tx-history-list">
              {sortedHistory.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  className="tx-history-item"
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="tx-item-action">
                    {tx.action === 'submit' ? '📝' : '👍'} {tx.action}
                  </div>

                  <div className="tx-item-details">
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-item-hash"
                    >
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </a>
                    <div className="tx-item-meta">
                      <span className={`tx-item-status ${tx.status}`}>
                        {tx.status === 'success' ? '✓' : '⏳'} {tx.status}
                      </span>
                      <span className="tx-item-time">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="tx-item-gas">
                    {(BigInt(tx.gasUsed) * BigInt(tx.gasPrice)) / BigInt('1e18')} MON
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="tx-history-empty">
              <div>No transactions yet</div>
              <span>Transactions will appear here after submission</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

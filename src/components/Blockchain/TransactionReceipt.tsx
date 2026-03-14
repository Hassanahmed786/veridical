import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { BlockchainTransactionReceipt } from '../../types';
import '../../../src/styles/TransactionReceipt.css';

interface TransactionReceiptProps {
  transaction: BlockchainTransactionReceipt | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TransactionReceipt = ({
  transaction,
  isVisible,
  onClose,
}: TransactionReceiptProps) => {
  const [autoClose, setAutoClose] = useState(false);

  useEffect(() => {
    if (!isVisible || !transaction) return;

    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;

    // Auto-close after 8 seconds for successful transactions
    if (transaction.status === 'success') {
      timer1 = setTimeout(() => {
        setAutoClose(true);
        onClose();
      }, 8000);
    }

    // Failsafe: Force close after 12 seconds no matter what
    timer2 = setTimeout(() => {
      onClose();
    }, 12000);

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [isVisible, transaction, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isVisible) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isVisible, onClose]);

  // Only render if both conditions are met
  if (!isVisible || !transaction) return null;

  const explorerUrl = `https://testnet.monadexplorer.com/tx/${transaction.hash}`;
  const gasUsedNum = BigInt(transaction.gasUsed);
  const gasPriceNum = BigInt(transaction.gasPrice);
  const totalGasCost = (gasUsedNum * gasPriceNum) / BigInt('1e18');

  return (
    <AnimatePresence mode="wait">
      {isVisible && transaction && (
        <motion.div
          className="tx-receipt-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="tx-receipt-modal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="tx-receipt-header">
              <div className="tx-status-badge">
                <div
                  className={`tx-status-indicator ${transaction.status === 'success' ? 'success' : 'pending'}`}
                />
                <span>{transaction.status === 'success' ? 'CONFIRMED' : 'PENDING'}</span>
              </div>
              <button className="tx-close-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="tx-receipt-content">
              {/* Action */}
              <div className="tx-detail-row">
                <span className="tx-label">Action</span>
                <span className="tx-value tx-action">
                  {transaction.action === 'submit' ? '📝 Submit Record' : '👍 Upvote Record'}
                </span>
              </div>

              {/* Transaction Hash */}
              <div className="tx-detail-row">
                <span className="tx-label">Transaction Hash</span>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="tx-value tx-hash">
                  {transaction.hash.slice(0, 12)}...{transaction.hash.slice(-10)}
                </a>
              </div>

              {/* Block Number */}
              <div className="tx-detail-row">
                <span className="tx-label">Block Number</span>
                <span className="tx-value">{transaction.blockNumber.toLocaleString()}</span>
              </div>

              {/* From */}
              <div className="tx-detail-row">
                <span className="tx-label">From</span>
                <span className="tx-value tx-address">
                  {transaction.from.slice(0, 10)}...{transaction.from.slice(-8)}
                </span>
              </div>

              {/* Gas Used */}
              <div className="tx-detail-row">
                <span className="tx-label">Gas Used</span>
                <span className="tx-value">{gasUsedNum.toLocaleString()} units</span>
              </div>

              {/* Gas Price */}
              <div className="tx-detail-row">
                <span className="tx-label">Gas Price</span>
                <span className="tx-value">{(gasPriceNum / BigInt('1e9')).toString()} Gwei</span>
              </div>

              {/* Total Cost */}
              <div className="tx-detail-row tx-detail-total">
                <span className="tx-label">Total Cost</span>
                <span className="tx-value tx-cost">{totalGasCost.toString()} MON</span>
              </div>

              {/* Crime ID (if applicable) */}
              {transaction.crimeId && (
                <div className="tx-detail-row">
                  <span className="tx-label">Record ID</span>
                  <span className="tx-value tx-recordid">{transaction.crimeId}</span>
                </div>
              )}

              {/* Content Hash (if applicable) */}
              {transaction.contentHash && (
                <div className="tx-detail-row">
                  <span className="tx-label">Content Hash</span>
                  <span className="tx-value tx-contenthash">
                    {transaction.contentHash.slice(0, 18)}...{transaction.contentHash.slice(-16)}
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <div className="tx-detail-row">
                <span className="tx-label">Timestamp</span>
                <span className="tx-value">
                  {new Date(transaction.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Confirmations */}
              <div className="tx-detail-row">
                <span className="tx-label">Confirmations</span>
                <span className="tx-value tx-confirmations">{transaction.confirmations}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="tx-receipt-footer">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="tx-explorer-link">
                View on Monad Explorer →
              </a>
              <button className="tx-close-footer" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

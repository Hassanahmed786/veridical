import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCmdK } from '../../hooks/useKbd';
import { useMonad } from '../../hooks/useMonad';

interface HeaderProps {
  isLeaderboardOpen: boolean;
  onToggleLeaderboard: () => void;
  onToggleStats: () => void;
  onDiscover: () => void;
  isStatsOpen: boolean;
  onToggleTransactionHistory: () => void;
  isTransactionHistoryOpen: boolean;
}

const Header = ({ isLeaderboardOpen, onToggleLeaderboard, onToggleStats, onDiscover, isStatsOpen, onToggleTransactionHistory, isTransactionHistoryOpen }: HeaderProps) => {
  const { documentaryMode, setDocumentaryMode, setIsSearchOpen, addToast } = useAppStore();
  const { connectWallet, switchToMonad, isConnected, walletAddress, isCorrectChain } = useMonad();

  useCmdK(
    (event) => {
      event.preventDefault();
      setIsSearchOpen(true);
    },
    [setIsSearchOpen]
  );

  const handleDocumentaryToggle = () => {
    if (!documentaryMode) {
      addToast({
        variant: 'info',
        title: '▶  Documentary Mode — press ESC to stop',
      });
    }
    setDocumentaryMode(!documentaryMode);
  };

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleWallet = async () => {
    if (!isConnected) {
      await connectWallet('auto');
      addToast({
        variant: 'success',
        title: 'Wallet connected to Monad Testnet',
      });
      return;
    }

    if (!isCorrectChain) {
      await switchToMonad();
    }
  };

  const buttonStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    letterSpacing: 'var(--ls-wider)',
    padding: '7px 14px',
    borderRadius: '5px',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--purple-glow)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 28px',
        background: 'linear-gradient(to bottom, rgba(0,0,10,0.96) 0%, transparent 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-hero)',
              fontWeight: 900,
              letterSpacing: 'var(--ls-tight)',
              color: 'var(--text-1)',
              textShadow:
                '0 0 40px rgba(165,148,255,0.65), 0 0 80px rgba(131,110,249,0.25)',
              lineHeight: 1,
              animation: 'logo-pulse 4s ease-in-out infinite',
            }}
          >
            VERIDICAL
          </div>
          <div
            style={{
              marginTop: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 300,
              color: 'var(--text-3)',
              letterSpacing: '0.04em',
            }}
          >
            A Record of Human Darkness, Immutably Stored
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={handleDocumentaryToggle}
              style={{
                ...buttonStyle,
                borderColor: documentaryMode ? 'var(--purple)' : 'var(--border)',
                boxShadow: documentaryMode ? '0 0 12px rgba(131,110,249,0.5)' : 'none',
              }}
            >
              {documentaryMode ? '■ STOP' : '▶ DOCUMENTARY'}
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              style={buttonStyle}
            >
              ⌖ SEARCH ⌘K
            </button>
            <button
              onClick={onToggleTransactionHistory}
              style={{
                ...buttonStyle,
                borderColor: isTransactionHistoryOpen ? 'var(--purple)' : 'var(--border)',
                background: isTransactionHistoryOpen ? 'var(--purple-faint)' : 'transparent',
              }}
            >
              ⛓ TRANSACTIONS
            </button>
            <button
              onClick={onToggleLeaderboard}
              style={{
                ...buttonStyle,
                borderColor: isLeaderboardOpen ? 'var(--purple)' : 'var(--border)',
                background: isLeaderboardOpen ? 'var(--purple-faint)' : 'transparent',
              }}
            >
              ◈ CHAIN RECORDS
            </button>
            <button
              onClick={onToggleStats}
              style={{
                ...buttonStyle,
                borderColor: isStatsOpen ? 'var(--purple)' : 'var(--border)',
                background: isStatsOpen ? 'var(--purple-faint)' : 'transparent',
              }}
            >
              ◎ STATS
            </button>
            <button onClick={onDiscover} style={buttonStyle}>
              ◉ DISCOVER
            </button>
            <button
              onClick={handleWallet}
              style={{
                ...buttonStyle,
                borderColor: isConnected ? 'var(--green-ok)' : 'var(--amber)',
                color: isConnected ? 'var(--green-ok)' : 'var(--amber)',
              }}
            >
              {isConnected && walletAddress ? truncateAddress(walletAddress) : 'CONNECT WALLET'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: 'var(--purple)',
              letterSpacing: 'var(--ls-wide)',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#4ade80',
                animation: 'pulseDot 2s infinite',
              }}
            />
            ⬡ MONAD TESTNET · CHAIN 10143
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

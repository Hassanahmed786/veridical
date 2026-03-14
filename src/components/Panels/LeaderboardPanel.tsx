import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryColor = (category: string) => {
  const map: Record<string, string> = {
    genocide: '#E53535',
    'war-crimes': '#E8873A',
    'state-terror': '#C8762A',
    slavery: '#9B6FD4',
    'colonial-atrocity': '#D4A017',
    'organized-crime': '#836EF9',
    'serial-crimes': '#E84393',
    'human-trafficking': '#3AB8C8',
    'environmental-crime': '#5AAF3C',
  };

  return map[category] || 'var(--purple)';
};

const LeaderboardPanel = ({ isOpen, onClose }: LeaderboardPanelProps) => {
  const { crimes, setSelectedCrime } = useAppStore();
  const [refreshTick, setRefreshTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setElapsed(0);
    const refreshInterval = window.setInterval(() => {
      setRefreshTick((prev) => prev + 1);
      setElapsed(0);
    }, 30000);

    const elapsedInterval = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(refreshInterval);
      window.clearInterval(elapsedInterval);
    };
  }, [isOpen]);

  const top = useMemo(() => {
    return [...crimes]
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 6);
  }, [crimes, refreshTick]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          id="leaderboard"
          className="panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 265, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          style={{
            position: 'fixed',
            top: '80px',
            right: '18px',
            zIndex: 45,
            overflow: 'hidden',
            background: 'rgba(8,11,36,0.94)',
            backdropFilter: 'blur(18px)',
            border: '1px solid var(--border)',
            borderRadius: '13px',
          }}
        >
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--purple)', letterSpacing: 'var(--ls-wider)' }}>
                ON-CHAIN RECORDS
              </div>
              <button
                onClick={onClose}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              {top.map((crime, index) => (
                <button
                  key={crime.id}
                  onClick={() => setSelectedCrime(crime)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: index < top.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    padding: '8px 0',
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr auto',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = 'rgba(131,110,249,0.06)';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--purple-dim)' }}>{index + 1}</div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        color: 'var(--text-1)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {crime.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: categoryColor(crime.category), letterSpacing: 'var(--ls-wide)' }}>
                      {crime.year} · {crime.country}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--purple-glow)' }}>
                    {crime.upvotes || 0}
                  </div>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: '10px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-3)',
                letterSpacing: 'var(--ls-wide)',
              }}
            >
              Last updated {elapsed}s ago · Powered by Monad
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

export default LeaderboardPanel;

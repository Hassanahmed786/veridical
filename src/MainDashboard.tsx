import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import GlobeCanvas from './components/Globe/GlobeCanvas';
import FilterPanel from './components/Panels/FilterPanel';
import TimelinePanel from './components/Panels/TimelinePanel';
import Header from './components/UI/Header';
import StatsBar from './components/UI/StatsBar';
import ToastStack from './components/UI/ToastStack';
import { TransactionHistoryPanel } from './components/Blockchain/TransactionHistoryPanel';
import crimesData from './data/crimes.json';
import { useFilteredCrimes } from './hooks/useFilteredCrimes';
import { useAppStore } from './store/useAppStore';
import type { CrimeEvent } from './types';

const CrimeDetailPanel = lazy(() => import('./components/Panels/CrimeDetailPanel'));
const SearchModal = lazy(() => import('./components/UI/SearchModal'));
const LeaderboardPanel = lazy(() => import('./components/Panels/LeaderboardPanel'));
const StatisticsPanel = lazy(() => import('./components/Panels/StatisticsPanel'));

const STATUS_LINES = [
  'Seeding star field...',
  'Rendering Earth...',
  'Loading crime records...',
  'Connecting to Monad...',
  'Ready.',
];

const LoadingScreen = ({ done }: { done: boolean }) => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (done) return;
    const interval = window.setInterval(() => {
      setStatusIndex((prev) => Math.min(prev + 1, STATUS_LINES.length - 1));
    }, 450);

    return () => window.clearInterval(interval);
  }, [done]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,8,0.86)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 10001,
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-hero)',
              lineHeight: 'var(--lh-tight)',
              fontWeight: 900,
              color: 'var(--text-1)',
              letterSpacing: 'var(--ls-tight)',
              textShadow: '0 0 50px rgba(165,148,255,0.7)',
              animation: 'flicker 4.8s infinite',
            }}
          >
            VERIDICAL
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 10001,
              width: '280px',
              height: '1px',
              marginTop: '18px',
              background: 'rgba(131,110,249,0.12)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ height: '1px', background: 'var(--purple)' }}
            />
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 10001,
              marginTop: '16px',
              color: 'var(--purple-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 300,
              letterSpacing: 'var(--ls-wide)',
              textTransform: 'uppercase',
            }}
          >
            {STATUS_LINES[statusIndex]}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const ShortcutOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const rows = [
    ['ESC', 'Close panels'],
    ['D', 'Documentary mode'],
    ['CMD+K', 'Search'],
    ['← →', 'Previous / Next crime'],
    ['Space', 'Pause/resume globe rotation'],
    ['R', 'Random crime'],
    ['S', 'Toggle stats panel'],
    ['?', 'This help screen'],
  ];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(0,0,8,0.76)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(560px, 92vw)',
              background: 'rgba(10,13,40,0.96)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-1)' }}>
              Keyboard Shortcuts
            </div>
            <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
              {rows.map(([key, label]) => (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      justifySelf: 'start',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      background: 'var(--elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      color: 'var(--text-1)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {key}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-2)' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const MainDashboard = () => {
  const {
    setCrimes,
    documentaryMode,
    setDocumentaryMode,
    selectedCrime,
    setSelectedCrime,
    setYearRange,
    isSearchOpen,
    setIsSearchOpen,
    addToast,
  } = useAppStore();

  const filteredCrimes = useFilteredCrimes();
  const sortedDocumentary = useMemo(() => [...filteredCrimes].sort((a, b) => a.year - b.year), [filteredCrimes]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [documentaryIndex, setDocumentaryIndex] = useState(0);
  const [documentaryProgress, setDocumentaryProgress] = useState(0);
  const [documentaryCrime, setDocumentaryCrime] = useState<CrimeEvent | null>(null);

  useEffect(() => {
    setCrimes(crimesData as CrimeEvent[]);
    
    // Safety timeout: if globe doesn't initialize in 8 seconds, force the loading screen to close
    const safetyTimer = window.setTimeout(() => {
      if (!isGlobeReady) {
        setIsGlobeReady(true);
        console.warn('Globe initialization timeout - forcing UI load');
      }
    }, 8000);
    
    return () => window.clearTimeout(safetyTimer);
  }, [setCrimes]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleDiscover = () => {
    if (!filteredCrimes.length) {
      addToast({ variant: 'info', title: 'No crimes available in current filter set.' });
      return;
    }
    const next = filteredCrimes[Math.floor(Math.random() * filteredCrimes.length)];
    setSelectedCrime(next);
    addToast({ variant: 'info', title: `Discovering: ${next.title}` });
  };

  const navigateCrime = (direction: -1 | 1) => {
    if (!filteredCrimes.length) return;
    const sorted = [...filteredCrimes].sort((a, b) => a.year - b.year);
    const currentIndex = selectedCrime ? sorted.findIndex((crime) => crime.id === selectedCrime.id) : -1;
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + sorted.length) % sorted.length;
    setSelectedCrime(sorted[nextIndex]);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
      );

      if (event.key === 'Escape') {
        setIsHelpOpen(false);
        setIsSearchOpen(false);
        setIsLeaderboardOpen(false);
        setIsStatsOpen(false);
        setSelectedCrime(null);
        if (documentaryMode) {
          setDocumentaryMode(false);
          setDocumentaryProgress(0);
          addToast({ variant: 'info', title: '■ Documentary Mode Stopped' });
        }
        return;
      }

      if (isTyping) return;

      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setDocumentaryMode(!documentaryMode);
        if (!documentaryMode) {
          addToast({ variant: 'info', title: '▶  Documentary Mode — press ESC to stop' });
        }
        return;
      }

      if (event.key === '?' || event.key === '/') {
        event.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        setIsStatsOpen((prev) => !prev);
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleDiscover();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateCrime(-1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateCrime(1);
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('veridical:toggle-rotation'));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [documentaryMode, selectedCrime, setDocumentaryMode, setIsSearchOpen, setSelectedCrime, addToast]);

  const clearFilters = () => {
    useAppStore.setState((state) => ({
      filters: {
        ...state.filters,
        era: 'all',
        categories: [
          'genocide',
          'war-crimes',
          'state-terror',
          'slavery',
          'colonial-atrocity',
          'organized-crime',
          'serial-crimes',
          'human-trafficking',
          'environmental-crime',
        ],
        severity: 1,
        search: '',
        yearFrom: -3000,
        yearTo: 2024,
      },
      yearRange: [-3000, 2024],
    }));
  };

  useEffect(() => {
    if (!documentaryMode || sortedDocumentary.length === 0) {
      setDocumentaryProgress(0);
      setDocumentaryCrime(null);
      return;
    }

    let current = 0;
    setDocumentaryIndex(0);

    const runSequence = () => {
      const crime = sortedDocumentary[current % sortedDocumentary.length];
      setDocumentaryCrime(crime);
      setDocumentaryIndex(current % sortedDocumentary.length);
      setDocumentaryProgress(0);
      setYearRange([crime.year - 6, crime.year + 6]);

      const openTimeout = window.setTimeout(() => {
        setSelectedCrime(crime);
      }, 800);

      const closeTimeout = window.setTimeout(() => {
        setSelectedCrime(null);
      }, 5200);

      const progressInterval = window.setInterval(() => {
        setDocumentaryProgress((prev) => {
          const next = prev + 100 / 60;
          return next > 100 ? 100 : next;
        });
      }, 100);

      const cycleTimeout = window.setTimeout(() => {
        window.clearInterval(progressInterval);
        current += 1;
        runSequence();
      }, 6000);

      return () => {
        window.clearTimeout(openTimeout);
        window.clearTimeout(closeTimeout);
        window.clearTimeout(cycleTimeout);
        window.clearInterval(progressInterval);
      };
    };

    const cleanup = runSequence();

    return () => {
      cleanup();
      setSelectedCrime(null);
      useAppStore.setState((state) => ({
        filters: { ...state.filters, yearFrom: -3000, yearTo: 2024 },
        yearRange: [-3000, 2024] as [number, number],
      }));
    };
  }, [documentaryMode, sortedDocumentary, setYearRange, setSelectedCrime]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
      >
        <GlobeCanvas onGlobeReady={() => setIsGlobeReady(true)} documentaryCrime={documentaryCrime} />
      </motion.div>

      <Header
        isLeaderboardOpen={isLeaderboardOpen}
        onToggleLeaderboard={() => setIsLeaderboardOpen((prev) => !prev)}
        isStatsOpen={isStatsOpen}
        onToggleStats={() => setIsStatsOpen((prev) => !prev)}
        onDiscover={handleDiscover}
        isTransactionHistoryOpen={isTransactionHistoryOpen}
        onToggleTransactionHistory={() => setIsTransactionHistoryOpen((prev) => !prev)}
      />

      <FilterPanel />
      {!isMobile ? <StatsBar /> : null}
      <TimelinePanel documentaryProgress={documentaryProgress} />

      <Suspense fallback={null}>
        <CrimeDetailPanel />
        <LeaderboardPanel isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        <StatisticsPanel isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <TransactionHistoryPanel isOpen={isTransactionHistoryOpen} onClose={() => setIsTransactionHistoryOpen(false)} />
      </Suspense>

      {filteredCrimes.length === 0 ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              pointerEvents: 'auto',
              background: 'rgba(6,7,24,0.98)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(16px)',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--text-2)' }}>
              No records match current filters.
            </div>
            <button
              onClick={clearFilters}
              style={{
                marginTop: '10px',
                border: '1px solid var(--purple)',
                background: 'var(--purple-faint)',
                color: 'var(--purple-glow)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                letterSpacing: 'var(--ls-wide)',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}

      <ToastStack />

      <AnimatePresence>
        {documentaryMode ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'fixed',
              top: '82px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 90,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--purple)',
              letterSpacing: 'var(--ls-wide)',
              background: 'rgba(4,5,18,0.8)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '5px 14px',
            }}
          >
            {String(documentaryIndex + 1).padStart(2, '0')} / {String(sortedDocumentary.length).padStart(2, '0')}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ShortcutOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <LoadingScreen done={isGlobeReady} />
    </div>
  );
};

export default MainDashboard;
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useState } from 'react';
import IntroPage from './IntroPage';
import SpaceBackdrop from './components/UI/SpaceBackdrop';

const loadMainDashboard = () => import('./MainDashboard');
const MainDashboard = lazy(loadMainDashboard);

type AppPhase = 'intro' | 'transitioning' | 'app';

function App() {
  const [phase, setPhase] = useState<AppPhase>(() => {
    if (typeof window === 'undefined') return 'intro';
    return sessionStorage.getItem('veridical-visited') ? 'app' : 'intro';
  });

  const handleEnter = () => {
    if (phase !== 'intro') return;
    sessionStorage.setItem('veridical-visited', '1');
    void loadMainDashboard();
    setPhase('transitioning');
    window.setTimeout(() => {
      setPhase('app');
    }, 600);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackdrop desktopCount={1400} mobileCount={760} />

      <AnimatePresence mode="sync">
        {phase !== 'app' ? (
          <motion.div key="intro" style={{ position: 'absolute', inset: 0 }}>
            <IntroPage isLeaving={phase === 'transitioning'} onEnter={handleEnter} />
          </motion.div>
        ) : null}

        {phase !== 'intro' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          >
            {phase === 'app' ? (
              <Suspense fallback={null}>
                <MainDashboard />
              </Suspense>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default App;

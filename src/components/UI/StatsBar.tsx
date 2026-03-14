import { motion } from 'framer-motion';
import { useFilteredCrimes } from '../../hooks/useFilteredCrimes';
import { useCountUp } from '../../hooks/useCountUp';

const StatsBar = () => {
  const crimes = useFilteredCrimes();

  const stats = {
    crimes: crimes.length,
    eras: new Set(crimes.map((crime) => crime.era)).size,
    countries: new Set(crimes.map((crime) => crime.country)).size,
    verified: crimes.filter((crime) => Boolean(crime.onChainId)).length,
  };

  const animated = {
    crimes: useCountUp(stats.crimes),
    eras: useCountUp(stats.eras),
    countries: useCountUp(stats.countries),
    verified: useCountUp(stats.verified),
  };

  return (
    <motion.div
      id="stats-bar"
      className="panel"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.3 }}
      style={{
        position: 'fixed',
        bottom: '130px',
        left: '18px',
        zIndex: 40,
        display: 'flex',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        background: 'rgba(10,13,40,0.92)',
      }}
    >
      {[
        { label: 'CRIMES DOCUMENTED', value: animated.crimes },
        { label: 'ERAS COVERED', value: animated.eras },
        { label: 'COUNTRIES', value: animated.countries },
        { label: 'ON-CHAIN VERIFIED', value: animated.verified },
      ].map((item, index) => (
        <div
          key={item.label}
          style={{
            padding: '12px 20px',
            borderRight: index < 3 ? '1px solid rgba(131,110,249,0.2)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--purple-glow)',
              lineHeight: 1,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              marginTop: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--ls-wider)',
              color: 'var(--text-3)',
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default StatsBar;

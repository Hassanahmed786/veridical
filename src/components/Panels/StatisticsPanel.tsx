import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useFilteredCrimes } from '../../hooks/useFilteredCrimes';

const CATEGORY_COLORS: Record<string, string> = {
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

const ARC = 2 * Math.PI * 46;

interface StatisticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const countBy = (items: string[]) =>
  items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

const normContinent = (region: string) => {
  const v = region.toLowerCase();
  if (v.includes('africa')) return 'Africa';
  if (v.includes('europe')) return 'Europe';
  if (v.includes('asia')) return 'Asia';
  if (v.includes('north america')) return 'North America';
  if (v.includes('south america')) return 'South America';
  if (v.includes('oceania')) return 'Oceania';
  if (v.includes('atlantic')) return 'Atlantic';
  return 'Other';
};

const StatisticsPanel = ({ isOpen, onClose }: StatisticsPanelProps) => {
  const crimes = useFilteredCrimes();
  const { crimes: allCrimes } = useAppStore();

  const continents = useMemo(() => {
    const counts = countBy(crimes.map((crime) => normContinent(crime.region)));
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: (count / max) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [crimes]);

  const eras = useMemo(() => {
    const counts = countBy(crimes.map((crime) => crime.era));
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: (count / max) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [crimes]);

  const categories = useMemo(() => {
    const counts = countBy(crimes.map((crime) => crime.category));
    const total = Math.max(1, crimes.length);
    let offset = 0;
    return Object.entries(counts)
      .map(([name, count]) => {
        const ratio = count / total;
        const length = ARC * ratio;
        const segment = {
          name,
          count,
          color: CATEGORY_COLORS[name] || 'var(--purple)',
          dasharray: `${length} ${ARC - length}`,
          dashoffset: -offset,
        };
        offset += length;
        return segment;
      })
      .sort((a, b) => b.count - a.count);
  }, [crimes]);

  const onChain = useMemo(() => {
    return {
      totalVerified: allCrimes.filter((crime) => Boolean(crime.onChainId)).length,
      totalUpvotes: allCrimes.reduce((acc, crime) => acc + (crime.upvotes || 0), 0),
    };
  }, [allCrimes]);

  const deadliest = useMemo(() => {
    return [...crimes]
      .sort((a, b) => b.severity - a.severity || a.year - b.year)
      .slice(0, 5);
  }, [crimes]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={{
            position: 'fixed',
            left: 0,
            top: '74px',
            width: '360px',
            maxWidth: '92vw',
            height: 'calc(100vh - 74px)',
            zIndex: 75,
            background: 'rgba(10,13,40,0.95)',
            borderRight: '1px solid var(--border)',
            backdropFilter: 'blur(24px)',
            overflowY: 'auto',
            padding: '18px 16px 24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--ls-wider)', color: 'var(--purple)' }}>
              STATISTICS
            </div>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-3)', fontSize: '24px', cursor: 'pointer' }}>
              ×
            </button>
          </div>

          <section style={{ marginTop: '14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>CRIMES BY CONTINENT</div>
            <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
              {continents.map((row, idx) => (
                <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-1)' }}>{row.name}</div>
                    <div style={{ height: '28px', background: 'rgba(131,110,249,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.06 }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--purple), var(--purple-dim))',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--purple-glow)' }}>{row.count}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '18px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>CRIMES BY CATEGORY</div>
            <div style={{ marginTop: '8px', display: 'grid', placeItems: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(131,110,249,0.12)" strokeWidth="12" />
                {categories.map((segment, idx) => (
                  <motion.circle
                    key={segment.name}
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeLinecap="butt"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={segment.dashoffset}
                    initial={{ strokeDashoffset: ARC }}
                    animate={{ strokeDashoffset: segment.dashoffset }}
                    transition={{ duration: 0.9, delay: 0.1 + idx * 0.06 }}
                    transform="rotate(-90 60 60)"
                  />
                ))}
                <text x="60" y="62" textAnchor="middle" style={{ fill: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700 }}>
                  {crimes.length}
                </text>
              </svg>
            </div>
            <div style={{ marginTop: '8px', display: 'grid', gap: '5px' }}>
              {categories.map((segment) => (
                <div key={segment.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: segment.color }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-2)' }}>{segment.name.replace('-', ' ')}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--purple-glow)' }}>{segment.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '18px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>CRIMES BY ERA</div>
            <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
              {eras.map((row, idx) => (
                <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-1)' }}>{row.name}</div>
                    <div style={{ height: '28px', background: 'rgba(131,110,249,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.06 }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--purple), var(--purple-dim))',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--purple-glow)' }}>{row.count}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '18px', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>ON-CHAIN STATS</div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-display)', fontSize: '48px', lineHeight: '1.05', color: 'var(--purple-glow)' }}>
              {onChain.totalVerified}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>Total verified</div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-display)', fontSize: '48px', lineHeight: '1.05', color: 'var(--purple-glow)' }}>
              {onChain.totalUpvotes}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>Total upvotes</div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
              Connected to Monad Testnet · Chain 10143
            </div>
          </section>

          <section style={{ marginTop: '18px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>DEADLIEST CRIMES</div>
            <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
              {deadliest.map((crime) => (
                <div
                  key={crime.id}
                  style={{
                    borderLeft: `4px solid ${CATEGORY_COLORS[crime.category] || 'var(--purple)'}`,
                    background: 'rgba(20,22,56,0.65)',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>{crime.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-2)' }}>{crime.victims}</div>
                </div>
              ))}
            </div>
          </section>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

export default StatisticsPanel;

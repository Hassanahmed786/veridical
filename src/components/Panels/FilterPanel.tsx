import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Menu, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useFilteredCrimes } from '../../hooks/useFilteredCrimes';
import type { CrimeCategory } from '../../types';

const CATEGORY_COLORS: Record<CrimeCategory, string> = {
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

const CATEGORIES = Object.keys(CATEGORY_COLORS) as CrimeCategory[];
const ERAS = ['All', 'Ancient', 'Medieval', 'Colonial', 'Modern', 'Contemporary'];

const FilterPanel = () => {
  const { filters, setFilters, crimes } = useAppStore();
  const filteredCrimes = useFilteredCrimes();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const stats = useMemo(() => {
    return {
      crimes: filteredCrimes.length,
      eras: new Set(filteredCrimes.map((crime) => crime.era)).size,
      countries: new Set(filteredCrimes.map((crime) => crime.country)).size,
    };
  }, [filteredCrimes]);

  const categoryCounts = useMemo(() => {
    const scoped = crimes.filter((crime) => {
      if (filters.era !== 'all' && crime.era !== filters.era) return false;
      if (crime.severity < filters.severity) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          crime.title.toLowerCase().includes(q) ||
          crime.country.toLowerCase().includes(q) ||
          crime.perpetrators.join(' ').toLowerCase().includes(q)
        );
      }
      return true;
    });

    return scoped.reduce((acc, crime) => {
      acc[crime.category] = (acc[crime.category] || 0) + 1;
      return acc;
    }, {} as Record<CrimeCategory, number>);
  }, [crimes, filters]);

  const updateSearch = (value: string) => {
    setSearchDraft(value);
    window.clearTimeout((updateSearch as any).__timer);
    (updateSearch as any).__timer = window.setTimeout(() => {
      setFilters({ ...filters, search: value });
    }, 120);
  };

  const toggleCategory = (category: CrimeCategory) => {
    const hasCategory = filters.categories.includes(category);
    const next = hasCategory
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    setFilters({ ...filters, categories: next.length ? next : [category] });
  };

  const panelOpen = isMobile ? isMobileOpen : isHovered;

  return (
    <>
      {isMobile ? (
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          style={{
            position: 'fixed',
            bottom: '72px',
            left: '14px',
            zIndex: 40,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'rgba(8,11,36,0.95)',
            color: 'var(--purple-glow)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Menu size={18} />
        </button>
      ) : null}

      <motion.aside
        id="left-panel"
        className="panel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: panelOpen ? 270 : 52 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          left: 0,
          top: isMobile ? 'auto' : '50%',
          bottom: isMobile ? '130px' : 'auto',
          transform: isMobile ? 'none' : 'translateY(-50%)',
          zIndex: 40,
          maxHeight: 'calc(100vh - 180px)',
          background: 'rgba(8,11,36,0.92)',
          borderRight: '1px solid var(--border)',
          borderRadius: '0 14px 14px 0',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}
      >
        {!panelOpen ? (
          <div
            style={{
              width: '52px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              padding: '16px 0',
            }}
          >
            <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '4px' }}>
              ≡
            </span>
            {CATEGORIES.map((category) => (
              <span
                key={category}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[category],
                  opacity: filters.categories.includes(category) ? 0.8 : 0.2,
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ width: 270, padding: '18px', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--ls-wider)', color: 'var(--purple)', fontWeight: 500 }}>
                FILTERS
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-2)', letterSpacing: 'var(--ls-wide)' }}>
                {filteredCrimes.length} records
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--purple)',
                }}
              />
              <input
                value={searchDraft}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Filter records..."
                style={{
                  width: '100%',
                  background: 'rgba(3,4,26,0.8)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  padding: '8px 12px 8px 31px',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--purple)', letterSpacing: 'var(--ls-wider)', fontWeight: 500 }}>ERA</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {ERAS.map((era) => {
                  const active = (era === 'All' && filters.era === 'all') || filters.era === era;
                  return (
                    <button
                      key={era}
                      onClick={() => setFilters({ ...filters, era: era === 'All' ? 'all' : era })}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        padding: '5px 9px',
                        borderRadius: '999px',
                        border: `1px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
                        color: active ? 'var(--text-1)' : 'var(--text-3)',
                        background: active ? 'var(--purple-dim)' : 'transparent',
                      }}
                    >
                      {era}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--purple)', letterSpacing: 'var(--ls-wider)', fontWeight: 500 }}>CATEGORY</div>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {CATEGORIES.map((category) => {
                  const active = filters.categories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        color: 'var(--text-2)',
                        opacity: active ? 1 : 0.3,
                        transition: 'opacity 0.15s',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 400,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          background: CATEGORY_COLORS[category],
                        }}
                      />
                      <span>{category.replace('-', ' ')}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--purple-glow)', marginLeft: 'auto' }}>
                        ({categoryCounts[category] || 0})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--purple)', letterSpacing: 'var(--ls-wider)', fontWeight: 500 }}>
                MIN SEVERITY
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={filters.severity}
                onChange={(event) => setFilters({ ...filters, severity: Number(event.target.value) })}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  '--sev-pct': `${((filters.severity - 1) / 4) * 100}%`,
                  background: `linear-gradient(to right, var(--purple) 0%, var(--purple) var(--sev-pct), rgba(131,110,249,0.15) var(--sev-pct), rgba(131,110,249,0.15) 100%)`,
                } as CSSProperties}
              />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 400,
                  color: filteredCrimes.length === crimes.length ? 'var(--text-4)' : 'var(--purple)',
                  letterSpacing: 'var(--ls-wide)',
                  marginTop: '6px',
                  animation: filteredCrimes.length === crimes.length ? 'none' : 'filter-pulse 0.55s ease 1',
                }}
              >
                SHOWING {filteredCrimes.length} OF {crimes.length} RECORDS
              </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Crimes', value: stats.crimes },
                { label: 'Eras', value: stats.eras },
                { label: 'Countries', value: stats.countries },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--purple-glow)', fontWeight: 700 }}>{item.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--ls-wider)', color: 'var(--text-3)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default FilterPanel;

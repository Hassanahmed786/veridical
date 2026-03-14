import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(regex);
  const queryLower = query.toLowerCase();
  return parts.map((part, index) => (
    part.toLowerCase() === queryLower ? <mark key={`${part}-${index}`}>{part}</mark> : <span key={`${part}-${index}`}>{part}</span>
  ));
};

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const { setSelectedCrime } = useAppStore();
  const crimes = useFilteredCrimes();
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return crimes.slice(0, 8);
    const needle = query.toLowerCase();
    return crimes
      .filter((crime) => {
        return (
          crime.title.toLowerCase().includes(needle) ||
          crime.country.toLowerCase().includes(needle) ||
          crime.perpetrators.join(' ').toLowerCase().includes(needle) ||
          String(crime.year).includes(needle)
        );
      })
      .slice(0, 8);
  }, [crimes, query]);

  const selectCrime = (index: number) => {
    const crime = results[index];
    if (!crime) return;
    setSelectedCrime(crime);
    onClose();
    setQuery('');
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, Math.max(0, results.length - 1)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectCrime(focusedIndex);
    }
  };

  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(0,0,10,0.75)',
            backdropFilter: 'blur(8px)',
            padding: isMobile ? 0 : '0 16px',
          }}
          onClick={onClose}
        >
          <motion.div
            id="search-box"
            className="panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: isMobile ? '100vw' : '580px',
              maxWidth: isMobile ? '100vw' : '90vw',
              margin: isMobile ? 0 : '10vh auto 0',
              height: isMobile ? '100vh' : 'auto',
              background: 'rgba(4,5,18,0.99)',
              border: '1px solid var(--border-hover)',
              borderRadius: isMobile ? 0 : '14px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.75)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                padding: '0 20px',
              }}
            >
              <Search size={16} color="var(--purple)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search crimes, countries, perpetrators, years..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: '16px 10px',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: 'var(--text-md)',
                }}
              />
            </div>

            <div style={{ maxHeight: isMobile ? 'calc(100vh - 90px)' : '380px', overflowY: 'auto' }}>
              {results.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--text-2)' }}>
                    No records match.
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      fontFamily: 'var(--font-body)',
                      fontStyle: 'italic',
                      fontSize: '13px',
                      color: 'var(--text-4)',
                    }}
                  >
                    "The silence is not innocence."
                  </div>
                </div>
              ) : (
                results.map((crime, index) => (
                  <button
                    key={crime.id}
                    onClick={() => selectCrime(index)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      background:
                        focusedIndex === index ? 'rgba(131,110,249,0.12)' : 'rgba(131,110,249,0.02)',
                      textAlign: 'left',
                      display: 'grid',
                      gridTemplateColumns: '10px 1fr auto',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                  >
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: CATEGORY_COLORS[crime.category],
                      }}
                    />
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-1)' }}>{crime.title}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-1)' }}>
                        {highlightMatch(crime.title, query)}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-3)',
                          letterSpacing: 'var(--ls-wide)',
                          marginTop: '3px',
                        }}
                      >
                        {crime.year} · {crime.country}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, dotIndex) => (
                        <span
                          key={`${crime.id}-${dotIndex}`}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: dotIndex < crime.severity ? '#E53535' : 'var(--text-4)',
                          }}
                        />
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-4)',
                letterSpacing: 'var(--ls-wide)',
              }}
            >
              <span>↵ SELECT</span>
              <span>↑↓ NAVIGATE</span>
              <span>ESC CLOSE</span>
              <span>⌘K TOGGLE</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SearchModal;

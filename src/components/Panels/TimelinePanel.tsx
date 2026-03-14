import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const MIN_YEAR = -3000;
const MAX_YEAR = 2024;
const KEY_YEARS = [-3000, -1000, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000, 2024];

const ERA_ZONES = [
  { key: 'all', label: 'All', year: -3000, mode: 'all' as const, left: 0 },
  { key: 'ancient', label: 'Ancient', year: 0, mode: 'era' as const, left: 30 },
  { key: 'medieval', label: 'Medieval', year: 1000, mode: 'era' as const, left: 46 },
  { key: 'colonial', label: 'Colonial', year: 1700, mode: 'era' as const, left: 62 },
  { key: 'modern', label: 'Modern', year: 1950, mode: 'era' as const, left: 78 },
  { key: 'contemporary', label: 'Contemporary', year: 2010, mode: 'era' as const, left: 92 },
];

const ERA_RANGES: Record<string, [number, number]> = {
  all: [MIN_YEAR, MAX_YEAR],
  ancient: [MIN_YEAR, 499],
  medieval: [500, 1499],
  colonial: [1500, 1899],
  modern: [1900, 1999],
  contemporary: [2000, MAX_YEAR],
};

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

interface TimelinePanelProps {
  documentaryProgress: number;
}

const clampYear = (value: number) => Math.max(MIN_YEAR, Math.min(MAX_YEAR, value));

const yearToPct = (year: number) => ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

const fmtYear = (year: number) => (year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`);

const eraNameFromYear = (year: number) => {
  if (year < 500) return 'Ancient';
  if (year < 1500) return 'Medieval';
  if (year < 1900) return 'Colonial';
  if (year < 2000) return 'Modern';
  return 'Contemporary';
};

const TimelinePanel = ({ documentaryProgress }: TimelinePanelProps) => {
  const axisRef = useRef<HTMLDivElement | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const dragYearRef = useRef<{ from: number; to: number }>({ from: MIN_YEAR, to: MAX_YEAR });
  const [dragging, setDragging] = useState<'from' | 'to' | null>(null);
  const [travelLabelYear, setTravelLabelYear] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const {
    crimes,
    documentaryMode,
    selectedYear,
    isTimeTravelling,
    filters,
    setSelectedCrime,
    setSelectedYear,
    setIsTimeTravelling,
    setTimeTravelDirection,
    setTimeTravelTargetMode,
    setTimeTravelTargetYear,
  } = useAppStore();

  useEffect(() => {
    dragYearRef.current = { from: filters.yearFrom, to: filters.yearTo };
  }, [filters.yearFrom, filters.yearTo]);

  const activeEra = useMemo(() => {
    const year = selectedYear ?? Math.round((filters.yearFrom + filters.yearTo) / 2);
    return eraNameFromYear(year);
  }, [selectedYear, filters.yearFrom, filters.yearTo]);

  const triggerTravel = (year: number, mode: 'window' | 'era' | 'all') => {
    const safeYear = clampYear(year);
    const baseYear = selectedYear ?? Math.round((filters.yearFrom + filters.yearTo) / 2);

    setTimeTravelDirection(safeYear < baseYear ? 'past' : 'future');
    setTimeTravelTargetYear(safeYear);
    setTimeTravelTargetMode(mode);
    setIsTimeTravelling(true);
    setTravelLabelYear(safeYear);

    window.setTimeout(() => setTravelLabelYear(null), 700);
  };

  useEffect(() => {
    if (!dragging) return;

    const flushDrag = () => {
      dragRafRef.current = null;
      useAppStore.setState((state) => ({
        filters: {
          ...state.filters,
          yearFrom: dragYearRef.current.from,
          yearTo: dragYearRef.current.to,
        },
      }));
    };

    const updateFromClientX = (clientX: number) => {
      if (!axisRef.current) return;
      const rect = axisRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const year = clampYear(Math.round(MIN_YEAR + ratio * (MAX_YEAR - MIN_YEAR)));

      if (dragging === 'from') {
        dragYearRef.current.from = Math.min(year, dragYearRef.current.to - 1);
      } else {
        dragYearRef.current.to = Math.max(year, dragYearRef.current.from + 1);
      }

      if (dragRafRef.current === null) {
        dragRafRef.current = requestAnimationFrame(flushDrag);
      }
    };

    const onMove = (event: MouseEvent) => {
      updateFromClientX(event.clientX);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      updateFromClientX(event.touches[0].clientX);
    };

    const onUp = () => {
      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }

      useAppStore.setState((state) => ({
        filters: {
          ...state.filters,
          yearFrom: dragYearRef.current.from,
          yearTo: dragYearRef.current.to,
        },
      }));

      const target = dragging === 'from' ? dragYearRef.current.from : dragYearRef.current.to;
      setDragging(null);
      triggerTravel(target, 'window');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
    };
  }, [dragging]);

  const onEraClick = (key: string, year: number, mode: 'window' | 'era' | 'all') => {
    if (key === 'all') {
      useAppStore.setState((state) => ({
        filters: {
          ...state.filters,
          yearFrom: MIN_YEAR,
          yearTo: MAX_YEAR,
        },
      }));
      setSelectedYear(null);
      triggerTravel(MAX_YEAR, 'all');
      return;
    }

    const range = ERA_RANGES[key];
    if (range) {
      useAppStore.setState((state) => ({
        filters: {
          ...state.filters,
          yearFrom: range[0],
          yearTo: range[1],
        },
      }));
    }
    setSelectedYear(year);
    triggerTravel(year, mode);
  };

  const onCrimeTickClick = (crime: (typeof crimes)[number]) => {
    setSelectedCrime(crime);
    setSelectedYear(crime.year);
    triggerTravel(crime.year, 'window');
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.7, duration: 0.3 }}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: isMobile ? '92px' : '118px',
        zIndex: 40,
        background: 'linear-gradient(to top, rgba(0,0,12,1) 0%, transparent 100%)',
        padding: '0 28px',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '16px', height: '20px' }}>
          {ERA_ZONES.map((zone) => (
            <motion.button
              key={zone.key}
              whileHover={{ scale: 1.05 }}
              onClick={() => onEraClick(zone.key, zone.year, zone.mode)}
              style={{
                position: 'absolute',
                left: `${zone.left}%`,
                transform: 'translateX(-50%)',
                border: 'none',
                background: 'transparent',
                color:
                  zone.label === activeEra || (zone.key === 'all' && filters.yearFrom === MIN_YEAR && filters.yearTo === MAX_YEAR)
                    ? 'var(--purple-glow)'
                    : 'var(--text-4)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: 0,
              }}
            >
              {zone.label}
            </motion.button>
          ))}

          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'absolute',
              left: `${ERA_ZONES.find((zone) => zone.label === activeEra)?.left ?? 0}%`,
              bottom: '-26px',
              transform: 'translateX(-50%)',
              background: 'rgba(131,110,249,0.15)',
              border: '1px solid var(--purple)',
              borderRadius: '20px',
              padding: '3px 10px',
              color: 'var(--purple-glow)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}
          >
            {activeEra}
          </motion.div>
        </div>

        <div
          ref={axisRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '58%',
            height: '1px',
            background:
              'linear-gradient(to right, transparent, var(--border) 8%, var(--border) 92%, transparent)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${yearToPct(filters.yearFrom)}%`,
              width: `${Math.max(0, yearToPct(filters.yearTo) - yearToPct(filters.yearFrom))}%`,
              height: '10px',
              top: '-4px',
              borderRadius: '8px',
              background: 'rgba(131,110,249,0.15)',
            }}
          />

          <button
            onMouseDown={() => setDragging('from')}
            onTouchStart={() => setDragging('from')}
            style={{
              position: 'absolute',
              left: `${yearToPct(filters.yearFrom)}%`,
              top: '-11px',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '24px',
              borderRadius: '3px',
              background: 'var(--purple)',
              border: '2px solid var(--purple-glow)',
              cursor: 'ew-resize',
              boxShadow: '0 0 12px rgba(131,110,249,0.5)',
              transition: 'box-shadow 150ms ease, transform 150ms ease',
              touchAction: 'none',
              padding: 0,
            }}
            aria-label="Start year handle"
          />

          <button
            onMouseDown={() => setDragging('to')}
            onTouchStart={() => setDragging('to')}
            style={{
              position: 'absolute',
              left: `${yearToPct(filters.yearTo)}%`,
              top: '-11px',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '24px',
              borderRadius: '3px',
              background: 'var(--purple)',
              border: '2px solid var(--purple-glow)',
              cursor: 'ew-resize',
              boxShadow: '0 0 12px rgba(131,110,249,0.5)',
              transition: 'box-shadow 150ms ease, transform 150ms ease',
              touchAction: 'none',
              padding: 0,
            }}
            aria-label="End year handle"
          />

          {crimes.map((crime) => {
            const left = yearToPct(crime.year);
            const height = crime.severity * 5 + 4;
            return (
              <button
                key={crime.id}
                className="tl-crime-tick"
                data-label={`${crime.title} · ${crime.year}`}
                onClick={() => onCrimeTickClick(crime)}
                style={{
                  left: `${left}%`,
                  top: `calc(0px - ${height}px)`,
                  width: '2px',
                  height: `${height}px`,
                  borderRadius: '1px 1px 0 0',
                  transform: 'translateX(-50%)',
                  background: CATEGORY_COLORS[crime.category] || 'var(--purple)',
                  opacity: 0.72,
                  border: 'none',
                  cursor: 'pointer',
                  willChange: 'transform, opacity',
                  transition: 'opacity 0.15s, transform 0.15s',
                  padding: 0,
                }}
              />
            );
          })}
        </div>

        {KEY_YEARS.map((year) => (
          <div
            key={year}
            style={{
              position: 'absolute',
              left: `${yearToPct(year)}%`,
              top: '69%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-3)',
              fontWeight: 300,
              letterSpacing: '1px',
            }}
          >
            {year < 0 ? `${Math.abs(year)} BCE` : year}
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--text-2)',
            letterSpacing: '1.5px',
          }}
        >
          {fmtYear(filters.yearFrom)} — {fmtYear(filters.yearTo)}
        </div>

        {travelLabelYear !== null ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '8px',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '16px',
              color: 'var(--text-2)',
            }}
          >
            Travelling to {fmtYear(travelLabelYear)}
          </div>
        ) : null}

        {documentaryMode ? (
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: '11px',
              width: isMobile ? '160px' : '220px',
              height: '2px',
              background: 'var(--border)',
            }}
          >
            <div
              style={{
                width: `${documentaryProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--purple), var(--purple-glow))',
                transition: 'width linear 120ms',
                willChange: 'width',
              }}
            />
          </div>
        ) : null}

        {isTimeTravelling ? (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '8px',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '16px',
              color: 'var(--text-2)',
            }}
          >
            Time-traveling...
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default TimelinePanel;

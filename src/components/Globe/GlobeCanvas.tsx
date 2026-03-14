import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useAppStore } from '../../store/useAppStore';
import type { CrimeCategory, CrimeEvent } from '../../types';

const CAT_COLORS: Record<CrimeCategory, string> = {
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

const MIN_YEAR = -3000;
const MAX_YEAR = 2024;

interface TooltipInfo {
  crime: CrimeEvent;
  x: number;
  y: number;
}

interface GlobeCanvasProps {
  onGlobeReady: () => void;
  documentaryCrime?: CrimeEvent | null;
}

const createFallbackEarthTexture = () => {
  const fallback = document.createElement('canvas');
  fallback.width = 1024;
  fallback.height = 512;
  const ctx = fallback.getContext('2d');
  if (!ctx) return '';

  const ocean = ctx.createLinearGradient(0, 0, 0, fallback.height);
  ocean.addColorStop(0, '#6ea7ff');
  ocean.addColorStop(0.55, '#4f82df');
  ocean.addColorStop(1, '#325db3');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, fallback.width, fallback.height);

  // Add faint pseudo-continents so the sphere reads as Earth even offline.
  ctx.fillStyle = 'rgba(182, 215, 138, 0.42)';
  for (let i = 0; i < 14; i += 1) {
    const x = Math.random() * fallback.width;
    const y = Math.random() * fallback.height;
    const w = 70 + Math.random() * 190;
    const h = 26 + Math.random() * 90;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 200; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * fallback.width, Math.random() * fallback.height, Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return fallback.toDataURL('image/png');
};

const getTooltipPosition = (x: number, y: number) => {
  const width = 240;
  const height = 124;
  const offsetX = 16;
  const offsetY = 52;

  const left = Math.min(Math.max(10, x + offsetX), window.innerWidth - width - 10);
  const top = Math.min(Math.max(10, y - offsetY - height), window.innerHeight - height - 10);

  return { left, top };
};

const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace('#', '');
  const normalized = cleaned.length === 3
    ? cleaned
        .split('')
        .map((c) => `${c}${c}`)
        .join('')
    : cleaned;
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const eraRangeFromYear = (year: number): [number, number] => {
  if (year < 500) return [MIN_YEAR, 499];
  if (year < 1500) return [500, 1499];
  if (year < 1900) return [1500, 1899];
  if (year < 2000) return [1900, 1999];
  return [2000, MAX_YEAR];
};

const eraNameFromYear = (year: number) => {
  if (year < 500) return 'Ancient';
  if (year < 1500) return 'Medieval';
  if (year < 1900) return 'Colonial';
  if (year < 2000) return 'Modern';
  return 'Contemporary';
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const angularDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const p1 = toRadians(lat1);
  const p2 = toRadians(lat2);
  const dLng = toRadians(lng2 - lng1);
  const cos = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dLng);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
};

const GlobeCanvas = ({ onGlobeReady, documentaryCrime }: GlobeCanvasProps) => {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    crimes,
    filters,
    selectedCrime,
    selectedYear,
    isTimeTravelling,
    timeTravelDirection,
    timeTravelTargetYear,
    timeTravelTargetMode,
    setSelectedCrime,
    setSelectedYear,
    setIsTimeTravelling,
    setTimeTravelDirection,
    setTimeTravelTargetYear,
    setTimeTravelTargetMode,
    addToast,
  } = useAppStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredCrime, setHoveredCrime] = useState<CrimeEvent | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [globeTextureUrl, setGlobeTextureUrl] = useState<string>(() => createFallbackEarthTexture());
  const [isDragging, setIsDragging] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [zoomAltitude, setZoomAltitude] = useState(2.4);
  const lastAltitudeRef = useRef(2.4);

  const [flashActive, setFlashActive] = useState(false);
  const [labelActive, setLabelActive] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.85;
    controls.enablePan = false;
    controls.minDistance = 140;
    controls.maxDistance = 420;
  }, []);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = 'https://unpkg.com/three-globe/example/img/earth-day.jpg';
    // Set a timeout for texture loading to not block globe initialization
    const textureTimeout = window.setTimeout(() => {
      if (image.complete === false) {
        // Image is still loading, abort and use fallback
        setGlobeTextureUrl(createFallbackEarthTexture());
      }
    }, 3500);
    image.onload = () => {
      window.clearTimeout(textureTimeout);
      setGlobeTextureUrl(image.src);
    };
    image.onerror = () => {
      window.clearTimeout(textureTimeout);
      // Keep the already-initialized fallback texture.
    };
    return () => window.clearTimeout(textureTimeout);
  }, []);

  useEffect(() => {
    if (!documentaryCrime || !globeRef.current) return;
    globeRef.current.pointOfView(
      {
        lat: documentaryCrime.coordinates.lat,
        lng: documentaryCrime.coordinates.lng,
        altitude: 1.6,
      },
      1450
    );
  }, [documentaryCrime]);

  useEffect(() => {
    if (!selectedCrime || !globeRef.current) return;
    globeRef.current.pointOfView(
      {
        lat: selectedCrime.coordinates.lat,
        lng: selectedCrime.coordinates.lng,
        altitude: 1.6,
      },
      1450
    );
  }, [selectedCrime]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const pov = globeRef.current?.pointOfView?.();
      if (!pov?.altitude) return;
      if (Math.abs(pov.altitude - lastAltitudeRef.current) < 0.12) return;
      lastAltitudeRef.current = pov.altitude;
      setZoomAltitude(pov.altitude);
    }, 500); // Increased from 320ms to reduce computation frequency

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onToggle = () => {
      const controls = globeRef.current?.controls?.();
      if (!controls) return;
      controls.autoRotate = !controls.autoRotate;
      addToast({
        variant: 'info',
        title: controls.autoRotate ? '▶ Rotation resumed' : '⏸ Rotation paused',
      });
    };

    window.addEventListener('veridical:toggle-rotation', onToggle as EventListener);
    return () => window.removeEventListener('veridical:toggle-rotation', onToggle as EventListener);
  }, [addToast]);

  useEffect(() => {
    if (!isTimeTravelling || timeTravelTargetYear === null || !globeRef.current) return;

    const controls = globeRef.current.controls();
    if (!controls) return;

    const direction = timeTravelDirection === 'past' ? -1 : 1;
    const fastSpeed = 4 * direction;
    const slowSpeed = 0.5 * direction;
    const startTime = performance.now();

    setFlashActive(true);
    window.setTimeout(() => setFlashActive(false), 400);
    window.setTimeout(() => setLabelActive(true), 400);
    window.setTimeout(() => setLabelActive(false), 900);

    controls.autoRotate = true;

    let frame = 0;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / 1200);
      const easeOut = 1 - Math.pow(1 - t, 3);
      controls.autoRotateSpeed = fastSpeed + (slowSpeed - fastSpeed) * easeOut;
      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);

    const applyTimer = window.setTimeout(() => {
      if (timeTravelTargetMode === 'all') {
        useAppStore.setState((state) => ({
          filters: {
            ...state.filters,
            yearFrom: MIN_YEAR,
            yearTo: MAX_YEAR,
          },
        }));
      } else if (timeTravelTargetMode === 'era') {
        const [from, to] = eraRangeFromYear(timeTravelTargetYear);
        useAppStore.setState((state) => ({
          filters: {
            ...state.filters,
            yearFrom: from,
            yearTo: to,
          },
        }));
      } else {
        useAppStore.setState((state) => ({
          filters: {
            ...state.filters,
            yearFrom: Math.max(MIN_YEAR, timeTravelTargetYear - 100),
            yearTo: Math.min(MAX_YEAR, timeTravelTargetYear + 100),
          },
        }));
      }
    }, 900);

    const endTimer = window.setTimeout(() => {
      controls.autoRotateSpeed = 0.5;
      setIsTimeTravelling(false);
      setTimeTravelDirection(null);
      setTimeTravelTargetMode('all');
      setSelectedYear(timeTravelTargetYear);
      setTimeTravelTargetYear(null);
    }, 1400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(applyTimer);
      window.clearTimeout(endTimer);
    };
  }, [
    isTimeTravelling,
    timeTravelDirection,
    timeTravelTargetYear,
    timeTravelTargetMode,
    setIsTimeTravelling,
    setTimeTravelDirection,
    setTimeTravelTargetMode,
    setSelectedYear,
    setTimeTravelTargetYear,
  ]);

  const filteredByNonYear = useMemo(() => {
    return crimes.filter((crime) => {
      if (filters.era !== 'all' && crime.era !== filters.era) return false;
      if (!filters.categories.includes(crime.category)) return false;
      if (crime.severity < filters.severity) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          crime.title.toLowerCase().includes(searchLower) ||
          crime.country.toLowerCase().includes(searchLower) ||
          crime.perpetrators.some((p) => p.toLowerCase().includes(searchLower)) ||
          crime.detail.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [crimes, filters]);

  const pointsData = useMemo(
    () =>
      filteredByNonYear.map((crime) => {
        const inYear = crime.year >= filters.yearFrom && crime.year <= filters.yearTo;
        const alpha = inYear ? 1 : 0.2;
        return {
          ...crime,
          lat: crime.coordinates.lat,
          lng: crime.coordinates.lng,
          color: hexToRgba(CAT_COLORS[crime.category], alpha),
          labelColor: inYear ? 'rgba(240,236,255,0.95)' : 'rgba(240,236,255,0.45)',
          size: crime.severity * 0.28 + 0.1,
          isActiveYear: inYear,
        };
      }),
    [filteredByNonYear, filters.yearFrom, filters.yearTo]
  );

  const relatedCrimes = useMemo(() => {
    if (!selectedCrime) return [];

    const sourcePerp = selectedCrime.perpetrators.join(' ').toLowerCase();
    return crimes
      .filter((crime) => crime.id !== selectedCrime.id)
      .filter((crime) => {
        const perpMatch = crime.perpetrators.some((p) => sourcePerp.includes(p.toLowerCase())) ||
          selectedCrime.perpetrators.some((p) => crime.perpetrators.join(' ').toLowerCase().includes(p.toLowerCase()));
        const eraMatch = Math.abs(crime.year - selectedCrime.year) <= 50;
        return perpMatch || eraMatch;
      })
      .slice(0, 12); // Reduced from 18 to 12 for better rendering
  }, [selectedCrime, crimes]);

  const arcsData = useMemo(() => {
    if (!selectedCrime) return [];
    const color = CAT_COLORS[selectedCrime.category];
    return relatedCrimes.map((related) => ({
      startLat: selectedCrime.coordinates.lat,
      startLng: selectedCrime.coordinates.lng,
      endLat: related.coordinates.lat,
      endLng: related.coordinates.lng,
      color,
    }));
  }, [selectedCrime, relatedCrimes]);

  const labelData = useMemo(() => {
    if (zoomAltitude <= 1.42) return [];

    const pov = globeRef.current?.pointOfView?.() || { lat: 0, lng: 0 };
    return pointsData
      .filter((point) => angularDistance(point.lat, point.lng, pov.lat ?? 0, pov.lng ?? 0) < 85)
      .slice(0, 8) // Reduced from 14 to 8 labels for better performance
      .map((point) => ({
        lat: point.lat,
        lng: point.lng,
        text: point.title,
      }));
  }, [zoomAltitude, pointsData]);

  const handlePointClick = (point: any) => {
    setSelectedCrime(point as CrimeEvent);
    setHoveredCrime(point as CrimeEvent);

    if (globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat: point.lat,
          lng: point.lng,
          altitude: 1.6,
        },
        1450
      );
    }
  };

  const handleInteractionStart = () => {
    setIsDragging(true);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = false;
    }

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = hoveredCrime ? 'crosshair' : 'grab';
    }
    resumeTimerRef.current = setTimeout(() => {
      const globe = globeRef.current;
      if (!globe) return;
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
      }
    }, 4000);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hoveredCrime) return;
    setTooltip({ crime: hoveredCrime, x: event.clientX, y: event.clientY });
  };

  const resetView = () => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1200);
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
  };

  const zoomIn = () => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.dollyIn(1.12);
    controls.update();
  };

  const zoomOut = () => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.dollyOut(1.12);
    controls.update();
  };

  const toggleRotation = () => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.autoRotate = !controls.autoRotate;
    addToast({
      variant: 'info',
      title: controls.autoRotate ? '▶ Rotation resumed' : '⏸ Rotation paused',
    });
  };

  const globeSize = isMobile
    ? Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9)
    : Math.min(window.innerHeight * 0.75, window.innerWidth * 0.75);

  const labelYear = timeTravelTargetYear ?? selectedYear;
  const directionColor = timeTravelDirection === 'future' ? 'var(--amber)' : 'var(--purple-glow)';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3,
        cursor: 'grab',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          filter: 'drop-shadow(0 0 60px rgba(80,120,255,0.2)) drop-shadow(0 0 120px rgba(60,90,255,0.1))',
          zIndex: 3,
        }}
      >
        <div
          className="globe-stage"
          style={{
            position: 'relative',
            width: `${globeSize}px`,
            height: `${globeSize}px`,
            borderRadius: '50%',
            overflow: 'hidden',
            transform: 'translateZ(0)',
            boxShadow: '0 0 90px rgba(96,144,255,0.18), inset 0 0 0 1px rgba(131,110,249,0.06)',
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 67%, rgba(0,0,0,0.98) 71%, rgba(0,0,0,0.22) 79%, transparent 88%)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 67%, rgba(0,0,0,0.98) 71%, rgba(0,0,0,0.22) 79%, transparent 88%)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundImage: `url(${globeTextureUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 0 80px rgba(96,144,255,0.22), inset -40px -30px 90px rgba(2,6,22,0.65)',
              opacity: globeReady ? 0 : 0.92,
              visibility: globeReady ? 'hidden' : 'visible',
              transition: 'opacity 260ms ease',
              transform: 'translateZ(0) scale(1.002)',
              pointerEvents: 'none',
            }}
          />

          <Globe
            ref={globeRef}
            width={globeSize}
            height={globeSize}
            globeImageUrl={globeTextureUrl}
            showGlobe={true}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            atmosphereColor="#6090ff"
            atmosphereAltitude={0.22}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={showAtmosphere}
            enablePointerInteraction={!isTimeTravelling}
            pointsData={pointsData}
            pointColor="color"
            pointAltitude={(d: any) => (d.isActiveYear ? 0.018 : 0.012)}
            pointRadius="size"
            pointLabel={() => ''}
            ringsData={hoveredCrime ? [hoveredCrime] : []}
            ringColor={(d: any) => `${CAT_COLORS[d.category as CrimeCategory]}aa`}
            ringMaxRadius={4}
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            arcsData={selectedCrime ? arcsData : []}
            arcColor={(d: any) => [`${d.color}22`, `${d.color}aa`]}
            arcDashLength={0.5}
            arcDashGap={0.3}
            arcDashAnimateTime={2000}
            arcStroke={0.5}
            arcAltitude={0.3}
            labelsData={labelData}
            labelLat="lat"
            labelLng="lng"
            labelText="text"
            labelSize={0.4}
            labelDotRadius={0}
            labelResolution={0.8}
            labelColor={() => '#f0ecff'}
            labelLabel={() => ''}
            onPointHover={(point: any) => {
              setHoveredCrime((point as CrimeEvent) || null);
              if (containerRef.current) {
                containerRef.current.style.cursor = point ? 'crosshair' : isDragging ? 'grabbing' : 'grab';
              }
              if (!point) {
                setTooltip(null);
              }
            }}
            onPointClick={handlePointClick}
            onGlobeReady={() => {
              const globe = globeRef.current;
              if (!globe) return;
              setGlobeReady(true);
              onGlobeReady?.();
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), inset 0 -40px 120px rgba(2,6,22,0.28)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '18px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {[
          { key: 'reset', label: '⟳', action: resetView },
          { key: 'zin', label: '+', action: zoomIn },
          { key: 'zout', label: '-', action: zoomOut },
          { key: 'atm', label: '⊕', action: () => setShowAtmosphere((prev) => !prev) },
          { key: 'rot', label: '⏯', action: toggleRotation },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={btn.action}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'rgba(10,13,40,0.92)',
              color: 'var(--purple-glow)',
              backdropFilter: 'blur(14px)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {tooltip ? (
          <motion.div
            key={tooltip.crime.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: getTooltipPosition(tooltip.x, tooltip.y).left,
              top: getTooltipPosition(tooltip.x, tooltip.y).top,
              pointerEvents: 'none',
              zIndex: 70,
              maxWidth: '240px',
              background: 'rgba(6,7,24,0.98)',
              border: '1px solid var(--border-hover)',
              borderRadius: '9px',
              padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: CAT_COLORS[tooltip.crime.category],
                  flex: '0 0 auto',
                }}
              />
              <span
                style={{
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
              >
                {tooltip.crime.title}
              </span>
            </div>
            <div
              style={{
                marginTop: '6px',
                color: 'var(--text-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              {tooltip.crime.year}
              {tooltip.crime.yearEnd ? `-${tooltip.crime.yearEnd}` : ''} · {tooltip.crime.country}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {flashActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 180,
              background:
                timeTravelDirection === 'future'
                  ? 'radial-gradient(circle, rgba(200,118,42,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(131,110,249,0.15) 0%, transparent 70%)',
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {labelActive && labelYear !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: [0, 1, 0], scale: [2, 1, 0.98] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--text-3)',
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}
            >
              Travelling To
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '72px',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: directionColor,
                textShadow: '0 0 60px rgba(131,110,249,0.8)',
              }}
            >
              {labelYear < 0 ? `${Math.abs(labelYear)} BCE` : `${labelYear} CE`}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '20px',
                color: 'var(--text-2)',
              }}
            >
              {eraNameFromYear(labelYear)} Era
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default GlobeCanvas;

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCountUp } from './hooks/useCountUp';

interface IntroPageProps {
  isLeaving: boolean;
  onEnter: () => void;
}

const revealTimes = [0, 1200, 2400, 3600, 4400, 5200];

const featureCallouts = [
  {
    glyph: '⬡',
    color: '#836EF9',
    label: 'On-Chain Permanence',
    body: 'Every verified record is inscribed on Monad — immutable, uncensorable, permanent.',
  },
  {
    glyph: '◎',
    color: '#C8762A',
    label: '5,000 Years of History',
    body: 'From ancient Rome to modern genocide — every documented atrocity mapped to its exact location on Earth.',
  },
  {
    glyph: '✦',
    color: '#E53535',
    label: 'Community Verification',
    body: 'Historians, journalists, and witnesses submit and upvote records. Truth by consensus, preserved forever.',
  },
] as const;

const evidenceLines = [
  'The Cambodian genocide denied for 20 years.',
  'The Holodomor classified until 1991.',
  'The Rohingya crisis disputed while it happened.',
];

const beatContainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: 'easeOut',
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const beatItemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.08 * index },
  }),
};

const IntroPage = ({ isLeaving, onEnter }: IntroPageProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollPastThreshold, setScrollPastThreshold] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isEntering, setIsEntering] = useState(false);

  const atrocities = useCountUp(60, 1100, 0, revealed >= 5);
  const years = useCountUp(5000, 1500, 80, revealed >= 5);

  const stats = useMemo(
    () => [
      { value: `${atrocities}+`, line1: 'Documented', line2: 'Atrocities' },
      { value: `${years}`, line1: 'Years', line2: 'of Records' },
      { value: 'Monad', line1: 'Verified', line2: 'On-Chain' },
      { value: 'Open', line1: 'Source', line2: 'Forever' },
    ],
    [atrocities, years]
  );

  useEffect(() => {
    const timers = revealTimes.map((delay, index) =>
      window.setTimeout(() => {
        setRevealed(index + 1);
      }, delay)
    );
    const skipTimer = window.setTimeout(() => setShowSkip(true), 2000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(skipTimer);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      const scrollNode = scrollRef.current;
      const contentNode = contentRef.current;
      if (!scrollNode || !contentNode) return;
      setHasOverflow(contentNode.scrollHeight > window.innerHeight - 20);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [revealed]);

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const maxScroll = Math.max(1, node.scrollHeight - node.clientHeight);
    setScrollTop(node.scrollTop);
    setScrollPastThreshold(node.scrollTop / maxScroll > 0.1);
  };

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    onEnter();
  };

  const beatVisible = (index: number) => revealed >= index;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: isLeaving ? 'none' : 'auto' }}
    >
      <AnimatePresence>
        {showSkip ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleEnter}
            style={{
              position: 'fixed',
              top: '24px',
              right: '28px',
              zIndex: 100,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-4)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = 'var(--purple)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = 'var(--text-4)';
            }}
          >
            SKIP →
          </motion.button>
        ) : null}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '80px 0 56px' : '0',
        }}
      >
        <motion.div
          aria-hidden="true"
          className="intro-ambient-orb intro-ambient-orb-a"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], opacity: [0.16, 0.28, 0.18, 0.16] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          style={{ transform: `translateY(${Math.min(scrollTop * 0.08, 48)}px)` }}
        />
        <motion.div
          aria-hidden="true"
          className="intro-ambient-orb intro-ambient-orb-b"
          animate={{ x: [0, -60, 15, 0], y: [0, 20, -25, 0], opacity: [0.1, 0.2, 0.14, 0.1] }}
          transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          style={{ transform: `translateY(${Math.min(scrollTop * 0.05, 32)}px)` }}
        />
        <motion.div
          aria-hidden="true"
          className="intro-film-scan"
          animate={{ opacity: [0.08, 0.14, 0.08], y: ['-4%', '4%', '-4%'] }}
          transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <div aria-hidden="true" className="intro-vignette" />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 30%, rgba(131,110,249,0.08) 0%, rgba(5,7,22,0) 45%), linear-gradient(180deg, rgba(0,0,8,0.26) 0%, rgba(0,0,8,0.72) 100%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          animate={{ opacity: isEntering ? 0 : 1 }}
          transition={{ delay: isEntering ? 0.2 : 0, duration: 0.4, ease: 'easeOut' }}
          ref={contentRef}
          style={{
            position: 'relative',
            minHeight: isMobile ? 'auto' : '100vh',
            display: 'flex',
            alignItems: isMobile || hasOverflow ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '0 32px 64px' : '48px 32px 64px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '48px' : '56px',
              margin: isMobile ? '0 auto' : '0',
            }}
          >
            <motion.section
              initial="hidden"
              animate={beatVisible(1) ? 'visible' : 'hidden'}
              variants={beatContainerVariants}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                variants={beatItemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? '52px' : '88px',
                  fontWeight: 900,
                  color: '#F0ECFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.96,
                  textShadow:
                    '0 0 60px rgba(165,148,255,0.8), 0 0 120px rgba(131,110,249,0.4), 0 0 200px rgba(100,80,255,0.2)',
                  animation: 'flicker 4.8s infinite, intro-logo-drift 8s ease-in-out infinite',
                }}
              >
                VERIDICAL
              </motion.div>

              <motion.div
                variants={beatItemVariants}
                style={{
                  width: '80px',
                  height: '1px',
                  margin: '20px auto',
                  transformOrigin: 'center',
                  background: 'linear-gradient(to right, transparent, #836EF9, transparent)',
                }}
              />

              <motion.div
                variants={beatItemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? '16px' : '22px',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#7A76A0',
                  letterSpacing: '0.02em',
                }}
              >
                A Record of Human Darkness, Immutably Stored
              </motion.div>
            </motion.section>

            <motion.section
              initial="hidden"
              animate={beatVisible(2) ? 'visible' : 'hidden'}
              variants={beatContainerVariants}
              style={{ marginTop: isMobile ? '0' : '8px' }}
            >
              <motion.div
                variants={beatItemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: 900,
                  color: '#F0ECFF',
                  lineHeight: 1.1,
                }}
              >
                History is being erased.
              </motion.div>
              <motion.div
                variants={beatItemVariants}
                style={{
                  marginTop: '18px',
                  maxWidth: '600px',
                  fontFamily: 'var(--font-body)',
                  fontSize: isMobile ? '15px' : '18px',
                  fontWeight: 300,
                  color: '#7A76A0',
                  lineHeight: 1.7,
                }}
              >
                Governments deny. Records disappear. Perpetrators walk free.
              </motion.div>
            </motion.section>

            <motion.section
              initial="hidden"
              animate={beatVisible(3) ? 'visible' : 'hidden'}
              variants={beatContainerVariants}
            >
              <motion.div
                variants={beatItemVariants}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#836EF9',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                WHAT IS VERIDICAL
              </motion.div>
              <motion.div
                variants={beatItemVariants}
                style={{
                  maxWidth: '680px',
                  fontFamily: 'var(--font-body)',
                  fontSize: isMobile ? '15px' : '18px',
                  color: '#B8B4D8',
                  lineHeight: 1.8,
                }}
              >
                VERIDICAL is a living archive of humanity&apos;s gravest crimes — mapped onto the Earth where they happened, timestamped across 5,000 years of history, and permanently inscribed on the Monad blockchain where no government, no corporation, and no court order can erase them.
              </motion.div>

              <motion.div
                variants={beatItemVariants}
                style={{
                  marginTop: '40px',
                  padding: isMobile ? '24px 20px' : '28px 32px',
                  background: 'rgba(10,13,40,0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(131,110,249,0.18)',
                  borderRadius: '16px',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                  gap: '32px',
                }}
              >
                {featureCallouts.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={beatVisible(3) ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.18 + index * 0.14 }}
                    whileHover={isMobile ? undefined : { y: -4, boxShadow: '0 18px 40px rgba(5, 8, 28, 0.36)' }}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      padding: '10px 0',
                      borderBottom: isMobile && index < featureCallouts.length - 1 ? '1px solid rgba(131,110,249,0.1)' : 'none',
                    }}
                  >
                    <div style={{ color: item.color, fontSize: '28px', lineHeight: 1 }}>{item.glyph}</div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#F0ECFF',
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          marginTop: '8px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          fontWeight: 300,
                          color: '#7A76A0',
                          lineHeight: 1.7,
                        }}
                      >
                        {item.body}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.section
              initial="hidden"
              animate={beatVisible(4) ? 'visible' : 'hidden'}
              variants={beatContainerVariants}
            >
              <motion.div
                variants={beatItemVariants}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#836EF9',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                WHY IT MATTERS
              </motion.div>

              <motion.div
                variants={beatItemVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '40px',
                  padding: isMobile ? '24px 20px' : '32px',
                  background: 'rgba(10,13,40,0.5)',
                  border: '1px solid rgba(131,110,249,0.12)',
                  borderRadius: '16px',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={beatVisible(4) ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '80px',
                      color: 'rgba(131,110,249,0.3)',
                      lineHeight: 0.5,
                    }}
                  >
                    “
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={beatVisible(4) ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.24 }}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      color: '#B8B4D8',
                      lineHeight: 1.6,
                    }}
                  >
                    Those who cannot remember the past are condemned to repeat it.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={beatVisible(4) ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.65, ease: 'easeOut', delay: 0.32 }}
                    style={{
                      marginTop: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 300,
                      color: '#4E4A70',
                    }}
                  >
                    — George Santayana, 1905
                  </motion.div>
                </motion.div>

                <div style={{ display: 'grid', gap: '14px' }}>
                  {evidenceLines.map((line, index) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: 18 }}
                      animate={beatVisible(4) ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.18 + index * 0.12 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <motion.span
                          animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.18, 1] }}
                          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.25 }}
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#E53535',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: '#F0ECFF',
                          }}
                        >
                          {line}
                        </span>
                      </div>
                      {index < evidenceLines.length - 1 ? (
                        <div style={{ height: '1px', marginTop: '14px', background: 'rgba(131,110,249,0.12)' }} />
                      ) : null}
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={beatVisible(4) ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.62 }}
                    style={{
                      marginTop: '2px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#836EF9',
                    }}
                  >
                    The blockchain does not negotiate with governments.
                  </motion.div>
                </div>
              </motion.div>
            </motion.section>

            <motion.section
              initial="hidden"
              animate={beatVisible(5) ? 'visible' : 'hidden'}
              variants={beatContainerVariants}
            >
              <motion.div
                variants={beatItemVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                  alignItems: 'center',
                  gap: isMobile ? '24px 18px' : '24px',
                  padding: isMobile ? '0' : '0 16px',
                }}
              >
                {stats.map((item, index) => (
                  <motion.div
                    key={item.line1}
                    custom={index}
                    initial="hidden"
                    animate={beatVisible(5) ? 'visible' : 'hidden'}
                    variants={statVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: isMobile ? '0' : '24px',
                    }}
                  >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <motion.div
                        animate={beatVisible(5) ? { textShadow: ['0 0 18px rgba(165,148,255,0.2)', '0 0 34px rgba(165,148,255,0.38)', '0 0 18px rgba(165,148,255,0.2)'] } : { textShadow: '0 0 0 rgba(0,0,0,0)' }}
                        transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, delay: index * 0.18 }}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: isMobile ? '36px' : '56px',
                          fontWeight: 900,
                          color: '#A594FF',
                          lineHeight: 1,
                        }}
                      >
                        {item.value}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={beatVisible(5) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
                        style={{
                          marginTop: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#836EF9',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.line1}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={beatVisible(5) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
                        style={{
                          marginTop: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 300,
                          color: '#4E4A70',
                        }}
                      >
                        {item.line2}
                      </motion.div>
                    </div>
                    {!isMobile && index < stats.length - 1 ? (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0.2 }}
                        animate={beatVisible(5) ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.2 }}
                        transition={{ duration: 0.45, delay: 0.22 + index * 0.08 }}
                        style={{ width: '1px', height: '50px', background: 'rgba(131,110,249,0.15)', transformOrigin: 'center' }}
                      />
                    ) : null}
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, scale: 0.9 }}
              animate={beatVisible(6) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, duration: 0.8 }}
              style={{
                marginTop: '8px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '16px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={beatVisible(6) ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                style={{
                  width: isMobile ? '100%' : '420px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(131,110,249,0.28), transparent)',
                }}
              />
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97, y: 0 }}
                animate={isEntering ? { scale: 0.95, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={handleEnter}
                className="intro-cta"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.25em',
                  padding: '18px 48px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                <motion.span
                  animate={beatVisible(6) ? { letterSpacing: ['0.25em', '0.29em', '0.25em'] } : { letterSpacing: '0.25em' }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  style={{ display: 'inline-block' }}
                >
                  ENTER THE ARCHIVE
                </motion.span>
              </motion.button>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 300,
                  color: '#4E4A70',
                  letterSpacing: '0.1em',
                }}
              >
                No account required · Open source · Powered by Monad
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {hasOverflow && !scrollPastThreshold && !isEntering ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ width: '1px', height: '32px', background: 'rgba(131,110,249,0.18)', overflow: 'hidden' }}>
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.3, ease: 'easeInOut' }}
                style={{ width: '1px', height: '18px', background: 'rgba(165,148,255,0.65)' }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 300,
                color: '#4E4A70',
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}
            >
              Scroll
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isEntering ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, times: [0, 0.45, 1], ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'radial-gradient(circle at center, rgba(131,110,249,0.3) 0%, rgba(131,110,249,0.08) 40%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 90,
            }}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntroPage;
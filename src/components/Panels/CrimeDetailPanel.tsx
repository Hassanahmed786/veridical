import { AnimatePresence, motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMonad } from '../../hooks/useMonad';
import { useFilteredCrimes } from '../../hooks/useFilteredCrimes';
import { TransactionReceipt } from '../Blockchain/TransactionReceipt';

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

const SectionSep = ({ label }: { label: string }) => (
  <div className="section-separator" style={{ marginTop: '14px' }}>
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--purple)',
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  </div>
);

const createCrimeContentHash = (crime: NonNullable<ReturnType<typeof useAppStore.getState>['selectedCrime']>) => {
  const payload = JSON.stringify({
    id: crime.id,
    title: crime.title,
    era: crime.era,
    year: crime.year,
    yearEnd: crime.yearEnd ?? null,
    category: crime.category,
    severity: crime.severity,
    coordinates: crime.coordinates,
    country: crime.country,
    region: crime.region,
    perpetrators: crime.perpetrators,
    victims: crime.victims,
    summary: crime.summary,
    detail: crime.detail,
    sources: crime.sources,
  });

  return ethers.keccak256(ethers.toUtf8Bytes(payload));
};

const CrimeDetailPanel = () => {
  const { selectedCrime, setSelectedCrime, addToast, lastTransaction } = useAppStore();
  const { submitRecord, upvoteRecord, isConnected, isCorrectChain, isLoading } = useMonad();
  const crimes = useFilteredCrimes();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCloseHint, setShowCloseHint] = useState(false);
  const [showTransactionReceipt, setShowTransactionReceipt] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [shareCopied, setShareCopied] = useState(false);

  const positionInfo = useMemo(() => {
    if (!selectedCrime) return null;
    const sorted = [...crimes].sort((a, b) => a.year - b.year);
    const index = sorted.findIndex((crime) => crime.id === selectedCrime.id);
    if (index < 0) return null;
    return `Crime ${index + 1} of ${sorted.length}`;
  }, [selectedCrime, crimes]);

  const recordHash = useMemo(() => {
    if (!selectedCrime) return null;
    return createCrimeContentHash(selectedCrime);
  }, [selectedCrime]);

  useEffect(() => {
    if (!selectedCrime) return;
    if (localStorage.getItem('dp-hint-seen')) return;

    setShowCloseHint(true);
    const timer = window.setTimeout(() => {
      setShowCloseHint(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [selectedCrime]);

  useEffect(() => {
    if (lastTransaction) {
      setShowTransactionReceipt(true);
    }
  }, [lastTransaction]);

  const handleSubmit = async () => {
    if (!selectedCrime || !recordHash || isLoading) return;
    try {
      await submitRecord(selectedCrime.id, recordHash);
      setSelectedCrime({
        ...selectedCrime,
        onChainId: recordHash,
        verifiedAt: Date.now(),
      });
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleUpvote = async () => {
    if (!selectedCrime || isLoading) return;
    try {
      await upvoteRecord(selectedCrime.id);
      setSelectedCrime({ ...selectedCrime, upvotes: (selectedCrime.upvotes || 0) + 1 });
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedCrime) return;
    const shareText = `VERIDICAL: ${selectedCrime.title} (${selectedCrime.year}) — ${window.location.href}?crime=${selectedCrime.id}`;
    await navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2000);
  };

  const handleGenerateCard = () => {
    if (!selectedCrime) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#050719');
    grad.addColorStop(1, '#10153a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(131,110,249,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    ctx.fillStyle = 'rgba(131,110,249,0.2)';
    ctx.fillRect(54, 76, 240, 34);
    ctx.fillStyle = '#a594ff';
    ctx.font = '500 24px JetBrains Mono';
    ctx.fillText(selectedCrime.category.toUpperCase(), 66, 101);

    ctx.fillStyle = '#f0ecff';
    ctx.font = '700 56px Playfair Display';
    const title = selectedCrime.title.slice(0, 48);
    ctx.fillText(title, 54, 190);

    ctx.fillStyle = '#b8b4d8';
    ctx.font = '400 30px Inter';
    ctx.fillText(`${selectedCrime.year} · ${selectedCrime.country}`, 54, 242);

    ctx.fillStyle = '#c8762a';
    ctx.font = '400 34px Inter';
    ctx.fillText(`Victims: ${selectedCrime.victims.slice(0, 64)}`, 54, 300);

    ctx.fillStyle = '#f0ecff';
    ctx.font = '500 28px JetBrains Mono';
    ctx.fillText(`Severity ${selectedCrime.severity}/5`, 54, 356);

    ctx.fillStyle = '#7a76a0';
    ctx.font = '300 24px Inter';
    ctx.fillText(selectedCrime.summary.slice(0, 130), 54, 422);

    const previewHash = `${(recordHash || '').slice(0, 26)}...`;
    ctx.fillStyle = '#a594ff';
    ctx.font = '400 22px JetBrains Mono';
    ctx.fillText(`Hash: ${previewHash}`, 54, 592);

    ctx.fillStyle = 'rgba(240,236,255,0.22)';
    ctx.font = '900 84px Playfair Display';
    ctx.fillText('VERIDICAL', 740, 612);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `veridical-${selectedCrime.id}-record.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      {selectedCrime ? (
        <motion.aside
          id="detail-panel"
          className="panel"
          initial={isMobile ? { y: '100%' } : { x: '100%' }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            position: 'fixed',
            right: 0,
            top: isMobile ? 'auto' : '74px',
            bottom: 0,
            width: isMobile ? '100%' : '420px',
            height: isMobile ? '65vh' : 'calc(100vh - 74px)',
            zIndex: 130,
            borderLeft: isMobile ? 'none' : `4px solid ${CATEGORY_COLORS[selectedCrime.category]}`,
            borderTop: isMobile ? `2px solid ${CATEGORY_COLORS[selectedCrime.category]}` : 'none',
            boxShadow: `inset 0 2px 0 ${CATEGORY_COLORS[selectedCrime.category]}`,
            transition: 'border-color 0.3s ease',
            overflowY: 'auto',
          }}
        >
          {isMobile ? (
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '999px',
                background: 'rgba(131,110,249,0.4)',
                margin: '8px auto',
              }}
            />
          ) : null}

          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '10px 12px',
              background: 'rgba(6,7,24,0.92)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <button
              onClick={() => {
                localStorage.setItem('dp-hint-seen', '1');
                setShowCloseHint(false);
                setSelectedCrime(null);
              }}
              style={{
                height: '30px',
                border: '1px solid var(--border)',
                background: 'rgba(20,22,56,0.7)',
                color: 'var(--text-1)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--ls-wide)',
                borderRadius: '6px',
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              ← BACK
            </button>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wide)' }}>
              RECORD DETAIL
            </div>

            <button
              onClick={() => {
                localStorage.setItem('dp-hint-seen', '1');
                setShowCloseHint(false);
                setSelectedCrime(null);
              }}
              style={{
                width: '30px',
                height: '30px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'rgba(20,22,56,0.7)',
                fontSize: '20px',
                lineHeight: 1,
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          {showCloseHint ? (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-3)',
                letterSpacing: 'var(--ls-wide)',
                animation: 'filter-pulse 0.8s ease 2',
              }}
            >
              ← drag to close
            </div>
          ) : null}

          <div style={{ padding: '18px 24px 24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase',
                color: CATEGORY_COLORS[selectedCrime.category],
                border: `1px solid ${CATEGORY_COLORS[selectedCrime.category]}4d`,
                background: `${CATEGORY_COLORS[selectedCrime.category]}26`,
                borderRadius: '999px',
              }}
            >
              {selectedCrime.category.replace('-', ' ')}
            </div>

            <h2
              style={{
                margin: '14px 0 10px',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                lineHeight: 'var(--lh-tight)',
                letterSpacing: 'var(--ls-tight)',
                color: 'var(--text-1)',
                maxWidth: '92%',
              }}
            >
              {selectedCrime.title}
            </h2>

            <div
              style={{
                display: 'flex',
                gap: '18px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                fontWeight: 300,
                color: 'var(--text-2)',
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase',
              }}
            >
              <span>
                {selectedCrime.year}
                {selectedCrime.yearEnd ? `-${selectedCrime.yearEnd}` : ''}
              </span>
              <span>{selectedCrime.country}</span>
            </div>

            {positionInfo ? (
              <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wide)' }}>
                {positionInfo}
              </div>
            ) : null}

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index < selectedCrime.severity ? '#E53535' : 'var(--text-4)',
                    boxShadow: index < selectedCrime.severity ? '0 0 7px rgba(229,53,53,0.7)' : 'none',
                  }}
                />
              ))}
              <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: 'var(--ls-wider)' }}>
                SEVERITY
              </span>
            </div>

            <SectionSep label="Victims" />
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--amber)', lineHeight: 'var(--lh-relaxed)' }}>
              {selectedCrime.victims}
            </div>

            <SectionSep label="Perpetrators" />
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-2)', lineHeight: 'var(--lh-normal)' }}>
              {selectedCrime.perpetrators.join(', ')}
            </div>

            <SectionSep label="Summary" />
            <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 300, color: '#b8b4d8', lineHeight: 'var(--lh-relaxed)' }}>
              {selectedCrime.summary}
            </p>
            <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 300, color: '#b8b4d8', lineHeight: 'var(--lh-relaxed)' }}>
              {selectedCrime.detail}
            </p>

            {selectedCrime.sources.length ? (
              <>
                <SectionSep label="Sources" />
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedCrime.sources.map((source) => (
                    <a
                      key={source}
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--purple)',
                        textDecoration: 'none',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {source}
                    </a>
                  ))}
                </div>
              </>
            ) : null}

            <section
              style={{
                marginTop: '16px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'rgba(7,9,26,0.6)',
                padding: '16px',
              }}
            >
              <div className="section-separator">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--purple)',
                    letterSpacing: 'var(--ls-wider)',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  Monad Record
                </span>
              </div>

              {!selectedCrime.onChainId ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isConnected || !isCorrectChain || isLoading}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    height: '40px',
                    border: '1px solid rgba(131,110,249,0.5)',
                    color: 'var(--purple-glow)',
                    background: 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    letterSpacing: 'var(--ls-wide)',
                    textTransform: 'uppercase',
                  }}
                >
                  {isLoading ? 'Submitting to Monad...' : 'Submit Record'}
                </button>
              ) : (
                <div style={{ marginTop: '12px', color: 'var(--green-ok)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--ls-wide)' }}>
                  ✓ Record inscribed — The chain remembers.
                </div>
              )}

              <button
                onClick={handleUpvote}
                disabled={!isConnected || !isCorrectChain}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  height: '36px',
                  border: '1px solid var(--border)',
                  color: 'var(--purple-glow)',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  letterSpacing: 'var(--ls-wide)',
                }}
              >
                ▲ Upvote Record ({selectedCrime.upvotes || 0})
              </button>

              <button
                onClick={handleShare}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  height: '36px',
                  border: '1px solid var(--border)',
                  color: 'var(--purple-glow)',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  letterSpacing: 'var(--ls-wide)',
                }}
              >
                {shareCopied ? '✓ COPIED' : 'SHARE'}
              </button>

              <button
                onClick={handleGenerateCard}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  height: '36px',
                  border: '1px solid var(--border)',
                  color: 'var(--purple-glow)',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  letterSpacing: 'var(--ls-wide)',
                }}
              >
                GENERATE RECORD CARD
              </button>
            </section>
          </div>

          <TransactionReceipt
            transaction={lastTransaction}
            isVisible={showTransactionReceipt}
            onClose={() => setShowTransactionReceipt(false)}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

export default CrimeDetailPanel;

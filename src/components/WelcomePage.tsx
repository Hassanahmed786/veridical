import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronRight, Globe, Shield, Database, Zap } from 'lucide-react';

interface WelcomePageProps {
  onComplete: () => void;
}

const WelcomePage = ({ onComplete }: WelcomePageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides = [
    {
      title: "VERIDICAL",
      subtitle: "A Record of Human Darkness, Immutably Stored",
      content: "Welcome to VERIDICAL, the world's first blockchain-verified database of historical atrocities. Every crime against humanity is documented, verified, and stored forever on the Monad blockchain.",
      icon: <Globe size={64} />,
      color: "#836EF9"
    },
    {
      title: "Why VERIDICAL Matters",
      subtitle: "Truth Cannot Be Erased",
      content: "In an era of misinformation and historical revisionism, VERIDICAL ensures that the darkest chapters of human history remain accessible, verifiable, and immutable. No government, corporation, or algorithm can alter these records.",
      icon: <Shield size={64} />,
      color: "#E53535"
    },
    {
      title: "Blockchain Verification",
      subtitle: "Cryptographic Proof of Truth",
      content: "Each crime record is hashed and stored on Monad's high-performance blockchain. Community verification through upvotes ensures accuracy. Smart contracts prevent tampering and enable decentralized governance.",
      icon: <Database size={64} />,
      color: "#A594FF"
    },
    {
      title: "Interactive Exploration",
      subtitle: "Journey Through History",
      content: "Navigate through time and space with our 3D globe interface. Filter by era, category, and severity. Experience documentary mode for guided tours through humanity's darkest moments.",
      icon: <Zap size={64} />,
      color: "#C8762A"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        // Auto-complete after last slide
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500);
        }, 3000);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleSkip();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #07091A 0%, #03040A 60%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Background elements */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(131,110,249,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(197,118,42,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(229,53,53,0.05) 0%, transparent 50%)',
          }} />

          {/* Grain overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* Main content */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '600px',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{
                    color: slides[currentSlide].color,
                    marginBottom: '2rem',
                    filter: `drop-shadow(0 0 20px ${slides[currentSlide].color}40)`,
                  }}
                >
                  {slides[currentSlide].icon}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#EDE8FF',
                    marginBottom: '0.5rem',
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: '0.1em',
                    textShadow: '0 0 30px rgba(165,148,255,0.3)',
                  }}
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {/* Subtitle */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{
                    fontSize: '1.2rem',
                    color: '#A594FF',
                    marginBottom: '2rem',
                    fontFamily: "'Crimson Pro', serif",
                    fontStyle: 'italic',
                  }}
                >
                  {slides[currentSlide].subtitle}
                </motion.h2>

                {/* Content */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    color: '#8B87A8',
                    marginBottom: '3rem',
                    fontFamily: "'Crimson Pro', serif",
                    maxWidth: '500px',
                    margin: '0 auto 3rem',
                  }}
                >
                  {slides[currentSlide].content}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2rem',
            }}>
              {slides.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: index === currentSlide ? 1.2 : 1,
                    opacity: index === currentSlide ? 1 : 0.3,
                    backgroundColor: index === currentSlide ? slides[currentSlide].color : '#3F3D52',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                onClick={handleSkip}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(131,110,249,0.3)',
                  color: '#8B87A8',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontFamily: "'Courier New', monospace",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#836EF9';
                  (e.target as HTMLElement).style.color = '#A594FF';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = 'rgba(131,110,249,0.3)';
                  (e.target as HTMLElement).style.color = '#8B87A8';
                }}
              >
                SKIP
              </button>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: slides[currentSlide].color,
                  border: 'none',
                  color: '#EDE8FF',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 0 20px ${slides[currentSlide].color}40`,
                }}
              >
                {currentSlide === slides.length - 1 ? 'ENTER VERIDICAL' : 'NEXT'}
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePage;
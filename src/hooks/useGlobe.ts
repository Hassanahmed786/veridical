import { useState, useEffect, useRef } from 'react';

export const useGlobe = () => {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [globeRef, setGlobeRef] = useState<any>(null);
  const rotationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseRotation = () => setIsAutoRotating(false);
  const resumeRotation = () => setIsAutoRotating(true);

  useEffect(() => {
    const handleInteraction = () => {
      pauseRotation();

      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }

      rotationTimeoutRef.current = setTimeout(() => {
        resumeRotation();
        rotationTimeoutRef.current = null;
      }, 4000);
    };

    // Attach listeners to the window instead of the globe ref
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return {
    isAutoRotating,
    globeRef,
    setGlobeRef,
    pauseRotation,
    resumeRotation,
  };
};
import { useEffect, useState } from 'react';

export const useCountUp = (
  target: number,
  duration = 1400,
  delay = 300,
  enabled = true
) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }

    let frameId = 0;
    const timeout = window.setTimeout(() => {
      const start = performance.now();
      const frame = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) {
          frameId = requestAnimationFrame(frame);
        }
      };
      frameId = requestAnimationFrame(frame);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay, enabled]);

  return value;
};
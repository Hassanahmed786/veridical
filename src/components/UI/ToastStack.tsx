import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const borderByVariant = {
  success: '#4ade80',
  error: '#E53535',
  info: 'var(--purple)',
} as const;

const textByVariant = {
  success: '#4ade80',
  error: '#E53535',
  info: 'var(--purple-glow)',
} as const;

const ToastStack = () => {
  const { toasts, removeToast } = useAppStore();

  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 4000));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = toast.variant || 'info';
          return (
            <motion.div
              key={toast.id}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                minWidth: '300px',
                maxWidth: '420px',
                padding: '11px 18px',
                background: 'rgba(4,5,18,0.97)',
                borderRadius: 0,
                borderLeft: `3px solid ${borderByVariant[variant]}`,
                color: textByVariant[variant],
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '1.5px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
              }}
            >
              {toast.title}
              {toast.message ? ` ${toast.message}` : ''}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastStack;

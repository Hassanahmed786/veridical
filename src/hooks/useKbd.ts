import { useEffect } from 'react';

type Predicate = (event: KeyboardEvent) => boolean;
type Handler = (event: KeyboardEvent) => void;

const useKbd = (predicate: Predicate, handler: Handler, deps: any[] = []) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (predicate(event)) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [predicate, handler, ...deps]);
};

export const useCmdK = (handler: Handler, deps: any[] = []) => {
  const predicate = (event: KeyboardEvent) => (event.metaKey || event.ctrlKey) && event.key === 'k';
  useKbd(predicate, handler, deps);
};

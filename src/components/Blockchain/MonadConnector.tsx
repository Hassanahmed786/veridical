import { useEffect } from 'react';
import { useMonad } from '../../hooks/useMonad';

const MonadConnector = () => {
  const { isCorrectChain, switchToMonad } = useMonad();

  useEffect(() => {
    if (!isCorrectChain) {
      // Show banner or prompt to switch
    }
  }, [isCorrectChain]);

  return null; // Logic handled in hooks
};

export default MonadConnector;
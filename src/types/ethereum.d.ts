interface EthereumProvider {
  isMetaMask?: boolean;
  isPhantom?: boolean;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

interface PhantomNamespace {
  ethereum?: EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    phantom?: PhantomNamespace;
  }
}

export {};

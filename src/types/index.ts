export interface CrimeEvent {
  id: string;
  title: string;
  era: 'Ancient' | 'Medieval' | 'Colonial' | 'Modern' | 'Contemporary';
  year: number;
  yearEnd?: number;
  category: CrimeCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  coordinates: {
    lat: number;
    lng: number;
  };
  country: string;
  region: string;
  perpetrators: string[];
  victims: string;
  summary: string;
  detail: string;
  sources: string[];
  onChainId?: string;
  verifiedAt?: number;
  upvotes?: number;
}

export interface AppToast {
  id: string;
  title: string;
  message?: string;
  variant?: 'info' | 'success' | 'error';
}

export interface BlockchainTransactionReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  from: string;
  to?: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  crimeId?: string;
  contentHash?: string;
  action: 'submit' | 'upvote';
  confirmations: number;
}

export type CrimeCategory =
  | 'genocide'
  | 'war-crimes'
  | 'state-terror'
  | 'slavery'
  | 'colonial-atrocity'
  | 'organized-crime'
  | 'serial-crimes'
  | 'human-trafficking'
  | 'environmental-crime';

export interface AppState {
  selectedCrime: CrimeEvent | null;
  selectedYear: number | null;
  isTimeTravelling: boolean;
  timeTravelDirection: 'past' | 'future' | null;
  timeTravelTargetYear: number | null;
  timeTravelTargetMode: 'window' | 'era' | 'all';
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  txHash: string | null;
  documentaryMode: boolean;
  isSearchOpen: boolean;
  yearRange: [number, number];
  filters: {
    era: string;
    categories: CrimeCategory[];
    severity: number;
    search: string;
    yearFrom: number;
    yearTo: number;
  };
  crimes: CrimeEvent[];
  toasts: AppToast[];
  lastTransaction: BlockchainTransactionReceipt | null;
  transactionHistory: BlockchainTransactionReceipt[];
  setSelectedCrime: (crime: CrimeEvent | null) => void;
  setSelectedYear: (year: number | null) => void;
  setIsTimeTravelling: (value: boolean) => void;
  setTimeTravelDirection: (direction: 'past' | 'future' | null) => void;
  setTimeTravelTargetYear: (year: number | null) => void;
  setTimeTravelTargetMode: (mode: 'window' | 'era' | 'all') => void;
  setWalletAddress: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setTxHash: (hash: string | null) => void;
  setDocumentaryMode: (mode: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setYearRange: (range: [number, number]) => void;
  setFilters: (filters: AppState['filters']) => void;
  setCrimes: (crimes: CrimeEvent[]) => void;
  addToast: (toast: Omit<AppToast, 'id'>) => void;
  setLastTransaction: (tx: BlockchainTransactionReceipt | null) => void;
  addTransactionToHistory: (tx: BlockchainTransactionReceipt) => void;
  clearTransactionHistory: () => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}
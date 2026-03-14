import { create } from 'zustand';
import type { CrimeEvent, AppState } from '../types';

const ALL_CATEGORIES = [
  'genocide',
  'war-crimes',
  'state-terror',
  'slavery',
  'colonial-atrocity',
  'organized-crime',
  'serial-crimes',
  'human-trafficking',
  'environmental-crime',
] as const;

export const useAppStore = create<AppState>((set, get) => ({
  selectedCrime: null,
  selectedYear: null,
  isTimeTravelling: false,
  timeTravelDirection: null,
  timeTravelTargetYear: null,
  timeTravelTargetMode: 'all',
  walletAddress: null,
  isConnected: false,
  isLoading: false,
  txHash: null,
  documentaryMode: false,
  isSearchOpen: false,
  yearRange: [-3000, 2024],
  filters: {
    era: 'all',
    categories: [...ALL_CATEGORIES],
    severity: 1,
    search: '',
    yearFrom: -3000,
    yearTo: 2024,
  },
  crimes: [],
  toasts: [],
  lastTransaction: null,
  transactionHistory: [],

  setSelectedCrime: (crime: CrimeEvent | null) => set({ selectedCrime: crime }),
  setSelectedYear: (year: number | null) => set({ selectedYear: year }),
  setIsTimeTravelling: (value: boolean) => set({ isTimeTravelling: value }),
  setTimeTravelDirection: (direction: 'past' | 'future' | null) =>
    set({ timeTravelDirection: direction }),
  setTimeTravelTargetYear: (year: number | null) => set({ timeTravelTargetYear: year }),
  setTimeTravelTargetMode: (mode: 'window' | 'era' | 'all') => set({ timeTravelTargetMode: mode }),
  setWalletAddress: (address: string | null) => set({ walletAddress: address }),
  setIsConnected: (connected: boolean) => set({ isConnected: connected }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setTxHash: (hash: string | null) => set({ txHash: hash }),
  setDocumentaryMode: (mode: boolean) => set({ documentaryMode: mode }),
  setIsSearchOpen: (open: boolean) => set({ isSearchOpen: open }),
  setYearRange: (range: [number, number]) =>
    set((state) => ({
      yearRange: range,
      filters: {
        ...state.filters,
        yearFrom: range[0],
        yearTo: range[1],
      },
    })),
  setFilters: (filters) =>
    set({
      filters,
      yearRange: [filters.yearFrom, filters.yearTo],
    }),
  setCrimes: (crimes: CrimeEvent[]) => set({ crimes }),
  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
  setLastTransaction: (tx) => set({ lastTransaction: tx }),
  addTransactionToHistory: (tx) => {
    set((state) => ({
      transactionHistory: [tx, ...state.transactionHistory].slice(0, 50),
      lastTransaction: tx,
    }));
  },
  clearTransactionHistory: () => set({ transactionHistory: [], lastTransaction: null }),
}));
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { VERIDICAL_REGISTRY_ABI } from '../contracts/abi';
import { useAppStore } from '../store/useAppStore';
import type { BlockchainTransactionReceipt } from '../types';

type WalletKind = 'phantom' | 'metamask';
type WalletPreference = WalletKind | 'auto';
type InjectedProvider = NonNullable<Window['ethereum']>;

const MONAD_TESTNET = {
  chainId: '0x' + (10143).toString(16),
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const getInjectedProviders = () => {
  const phantom = window.phantom?.ethereum || (window.ethereum?.isPhantom ? window.ethereum : undefined);
  const metamask = window.ethereum?.isMetaMask ? window.ethereum : undefined;

  return {
    phantom,
    metamask,
  };
};

const resolveProvider = (preference: WalletPreference, fallbackKind: WalletKind | null) => {
  const providers = getInjectedProviders();

  if (preference === 'phantom' && providers.phantom) {
    return { provider: providers.phantom, kind: 'phantom' as WalletKind };
  }

  if (preference === 'metamask' && providers.metamask) {
    return { provider: providers.metamask, kind: 'metamask' as WalletKind };
  }

  if (preference === 'auto') {
    if (fallbackKind === 'phantom' && providers.phantom) {
      return { provider: providers.phantom, kind: 'phantom' as WalletKind };
    }
    if (fallbackKind === 'metamask' && providers.metamask) {
      return { provider: providers.metamask, kind: 'metamask' as WalletKind };
    }

    if (providers.phantom) {
      return { provider: providers.phantom, kind: 'phantom' as WalletKind };
    }
    if (providers.metamask) {
      return { provider: providers.metamask, kind: 'metamask' as WalletKind };
    }
  }

  return { provider: undefined, kind: null };
};

export const useMonad = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletKind | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  const { phantom, metamask } = getInjectedProviders();

  const requireConfiguredContract = () => {
    if (CONTRACT_ADDRESS !== ZERO_ADDRESS) return true;
    useAppStore.getState().addToast({
      variant: 'error',
      title: 'Contract not configured. Deploy VeridicalRegistry and set VITE_CONTRACT_ADDRESS.',
    });
    return false;
  };

  const checkChain = async (providerOverride?: InjectedProvider) => {
    const provider = providerOverride || resolveProvider('auto', walletType).provider;
    if (!provider) return false;

    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      const correct = chainId === MONAD_TESTNET.chainId;
      setIsCorrectChain(correct);
      return correct;
    } catch {
      return false;
    }
  };

  const switchToMonad = async () => {
    const selected = resolveProvider('auto', walletType);
    const provider = selected.provider;
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
      await checkChain(provider);
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
          await checkChain(provider);
        } catch (addError) {
          console.error('Failed to add Monad network:', addError);
        }
      }
    }
  };

  const connectWallet = async (preference: WalletPreference = 'auto') => {
    const selected = resolveProvider(preference, walletType);
    const provider = selected.provider;

    if (!provider || !selected.kind) {
      const message =
        preference === 'phantom'
          ? 'Phantom wallet not found. Install Phantom and enable EVM support.'
          : preference === 'metamask'
          ? 'MetaMask not found. Please install MetaMask.'
          : 'No compatible wallet found. Install Phantom or MetaMask.';
      useAppStore.getState().addToast({ variant: 'error', title: message });
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setWalletType(selected.kind);
      setIsConnected(true);

      const browserProvider = new ethers.BrowserProvider(provider);
      const balanceValue = await browserProvider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balanceValue).slice(0, 6));

      await checkChain(provider);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const submitRecord = async (eventId: string, contentHash: string) => {
    const provider = resolveProvider('auto', walletType).provider;
    if (!isConnected || !isCorrectChain || !provider || !requireConfiguredContract()) return;

    setIsLoading(true);
    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VERIDICAL_REGISTRY_ABI, signer);

      const tx = await contract.submitRecord(eventId, contentHash);
      setTxHash(tx.hash);
      useAppStore.getState().addToast({
        variant: 'info',
        title: 'Transaction pending...',
        message: `Submitting record: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      const explorerUrl = `https://testnet.monadexplorer.com/tx/${tx.hash}`;

      if (receipt) {
        const txRecord: BlockchainTransactionReceipt = {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString() || '0',
          gasPrice: receipt.gasPrice?.toString() || '0',
          from: receipt.from,
          to: receipt.to || undefined,
          status: receipt.status === 1 ? 'success' : 'failed',
          timestamp: Date.now(),
          crimeId: eventId,
          contentHash: contentHash,
          action: 'submit',
          confirmations: 1,
        };

        useAppStore.getState().addTransactionToHistory(txRecord);
        useAppStore.getState().addToast({
          variant: 'success',
          title: 'Record submitted on-chain!',
          message: `View on explorer: ${explorerUrl}`,
        });
      }

      setTxHash(null);
    } catch (error) {
      console.error('Failed to submit record:', error);
      useAppStore.getState().addToast({
        variant: 'error',
        title: 'Submission failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const upvoteRecord = async (eventId: string) => {
    const provider = resolveProvider('auto', walletType).provider;
    if (!isConnected || !isCorrectChain || !provider || !requireConfiguredContract()) return;

    setIsLoading(true);
    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VERIDICAL_REGISTRY_ABI, signer);

      const tx = await contract.upvoteRecord(eventId);
      setTxHash(tx.hash);
      useAppStore.getState().addToast({
        variant: 'info',
        title: 'Upvote pending...',
        message: `Transaction: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      const explorerUrl = `https://testnet.monadexplorer.com/tx/${tx.hash}`;

      if (receipt) {
        const txRecord: BlockchainTransactionReceipt = {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString() || '0',
          gasPrice: receipt.gasPrice?.toString() || '0',
          from: receipt.from,
          to: receipt.to || undefined,
          status: receipt.status === 1 ? 'success' : 'failed',
          timestamp: Date.now(),
          crimeId: eventId,
          action: 'upvote',
          confirmations: 1,
        };

        useAppStore.getState().addTransactionToHistory(txRecord);
        useAppStore.getState().addToast({
          variant: 'success',
          title: 'Upvote confirmed on-chain!',
          message: `View on explorer: ${explorerUrl}`,
        });
      }

      setTxHash(null);
    } catch (error) {
      console.error('Failed to upvote record:', error);
      useAppStore.getState().addToast({
        variant: 'error',
        title: 'Upvote failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecord = async (eventId: string) => {
    const provider = resolveProvider('auto', walletType).provider;
    if (!provider || !requireConfiguredContract()) return null;

    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VERIDICAL_REGISTRY_ABI, browserProvider);
      return await contract.getRecord(eventId);
    } catch (error) {
      console.error('Failed to get record:', error);
      return null;
    }
  };

  useEffect(() => {
    const selected = resolveProvider('auto', walletType);
    const provider = selected.provider;

    if (!provider || !selected.kind) return;

    const hydrateWallet = async () => {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletType(selected.kind);
          setIsConnected(true);
          const browserProvider = new ethers.BrowserProvider(provider);
          const balanceValue = await browserProvider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balanceValue).slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to read existing wallet session:', error);
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletType(selected.kind);
        setIsConnected(true);
      } else {
        setWalletAddress(null);
        setWalletType(null);
        setIsConnected(false);
      }
    };

    const handleChainChanged = () => {
      checkChain(provider);
    };

    hydrateWallet();
    checkChain(provider);

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [walletType]);

  return {
    connectWallet,
    switchToMonad,
    submitRecord,
    upvoteRecord,
    getRecord,
    isCorrectChain,
    walletAddress,
    walletType,
    hasPhantom: Boolean(phantom),
    hasMetaMask: Boolean(metamask),
    balance,
    isContractConfigured: CONTRACT_ADDRESS !== ZERO_ADDRESS,
    isConnected,
    isLoading,
    txHash,
    lastTransaction: useAppStore.getState().lastTransaction,
    transactionHistory: useAppStore.getState().transactionHistory,
  };
};

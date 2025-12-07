import { create } from 'zustand';
import { qubicService, QubicTransaction, QubicOraclePrice } from '@/services/qubicService';
import { smartContractService, RebalanceEvent, CompoundEvent } from '@/services/smartContractService';

export interface OracleData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  yield: number;
  category: 'real-estate' | 'commodity' | 'forex';
  allocation: number;
  lastUpdate: Date;
  confidence?: number;
  source?: string;
}

export interface UserPortfolio {
  qxBalance: number;
  sharesOwned: number;
  shareValue: number;
  totalValue: number;
  deposits: number[];
  compoundHistory: { timestamp: Date; amount: number; apy: number }[];
  transactions: QubicTransaction[];
  totalEarned: number;
  lastHarvest: Date | null;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'rejected';
  endDate: Date;
  quorum: number;
  userVoted?: boolean;
}

export interface ProtocolMetrics {
  tvl: number;
  totalUsers: number;
  dailyVolume: number;
  protocolRevenue: number;
  averageApy: number;
  rebalanceCount: number;
  lastRebalance: Date | null;
  nextRebalance: Date | null;
}

interface AppState {
  isConnected: boolean;
  walletAddress: string | null;
  isDemoMode: boolean;
  isAutoMode: boolean;
  oracleData: OracleData[];
  portfolio: UserPortfolio;
  proposals: GovernanceProposal[];
  currentApy: number;
  totalTvl: number;
  rebalanceHistory: RebalanceEvent[];
  compoundHistory: CompoundEvent[];
  protocolMetrics: ProtocolMetrics;
  isLoading: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  toggleDemoMode: () => void;
  toggleAutoMode: () => void;
  updateOracleData: (data: OracleData[]) => void;
  deposit: (amount: number) => Promise<void>;
  withdraw: (shares: number) => Promise<void>;
  vote: (proposalId: string, support: boolean) => void;
  rebalance: () => Promise<void>;
  compound: () => Promise<void>;
  requestFaucet: () => Promise<void>;
  setNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
  startOracleSubscription: () => void;
  updateMetrics: () => void;
}

const initialOracleData: OracleData[] = [
  {
    id: 'rei',
    name: 'Global Real Estate Index',
    symbol: 'REI',
    price: 2847.50,
    change24h: 0.85,
    yield: 12.0,
    category: 'real-estate',
    allocation: 45,
    lastUpdate: new Date(),
    confidence: 0.98,
    source: 'QUBIC_ORACLE_NODE_1',
  },
  {
    id: 'xau',
    name: 'Gold Spot',
    symbol: 'XAU',
    price: 2024.30,
    change24h: -0.32,
    yield: 10.0,
    category: 'commodity',
    allocation: 30,
    lastUpdate: new Date(),
    confidence: 0.97,
    source: 'QUBIC_ORACLE_NODE_2',
  },
  {
    id: 'usdtry',
    name: 'USD/TRY Carry',
    symbol: 'USD/TRY',
    price: 32.45,
    change24h: 1.24,
    yield: 8.0,
    category: 'forex',
    allocation: 25,
    lastUpdate: new Date(),
    confidence: 0.96,
    source: 'QUBIC_ORACLE_NODE_3',
  },
];

const initialPortfolio: UserPortfolio = {
  qxBalance: 0,
  sharesOwned: 0,
  shareValue: 1.0,
  totalValue: 0,
  deposits: [],
  compoundHistory: [],
  transactions: [],
  totalEarned: 0,
  lastHarvest: null,
};

const initialMetrics: ProtocolMetrics = {
  tvl: 2847500,
  totalUsers: 1247,
  dailyVolume: 458000,
  protocolRevenue: 14237,
  averageApy: 15.2,
  rebalanceCount: 0,
  lastRebalance: null,
  nextRebalance: new Date(Date.now() + 3600000), // 1 hour from now
};

const initialProposals: GovernanceProposal[] = [
  {
    id: '1',
    title: 'Add Bitcoin Treasury Basket',
    description: 'Proposal to add 10% allocation to BTC-backed treasury instruments for enhanced yield diversification.',
    votesFor: 12500,
    votesAgainst: 3200,
    status: 'active',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    quorum: 20000,
    userVoted: false,
  },
  {
    id: '2',
    title: 'Increase Real Estate Allocation',
    description: 'Increase real estate index allocation from 45% to 55% based on current yield performance.',
    votesFor: 8900,
    votesAgainst: 7100,
    status: 'active',
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    quorum: 15000,
    userVoted: false,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  isConnected: false,
  walletAddress: null,
  isDemoMode: false,
  isAutoMode: false,
  oracleData: initialOracleData,
  portfolio: initialPortfolio,
  proposals: initialProposals,
  currentApy: 0, // Will be calculated from oracle data
  totalTvl: 2847500,
  rebalanceHistory: [],
  compoundHistory: [],
  protocolMetrics: initialMetrics,
  isLoading: false,
  notification: null,

  connectWallet: async () => {
    set({ isLoading: true });
    try {
      const wallet = await qubicService.connectWallet();
      const state = get();
      
      // Calculate current APY from oracle data
      const totalYield = state.oracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
      
      set({
        isConnected: true,
        walletAddress: wallet.address,
        portfolio: {
          ...state.portfolio,
          qxBalance: wallet.balance,
        },
        currentApy: totalYield,
        isLoading: false
      });
      get().setNotification('Wallet connected successfully!', 'success');
      get().startOracleSubscription();
    } catch (error) {
      set({ isLoading: false });
      get().setNotification('Failed to connect wallet', 'error');
    }
  },

  disconnectWallet: () => {
    qubicService.disconnectWallet();
    set({
      isConnected: false,
      walletAddress: null,
      portfolio: initialPortfolio
    });
    get().setNotification('Wallet disconnected', 'info');
  },

  toggleDemoMode: () => {
    const newDemoMode = !get().isDemoMode;
    set({ isDemoMode: newDemoMode });
    if (newDemoMode) {
      get().setNotification('Demo mode activated - Live simulations running', 'info');
      // Start auto-compound in demo mode
      smartContractService.simulateAutoCompound();
    }
  },

  toggleAutoMode: () => {
    const newAutoMode = !get().isAutoMode;
    set({ isAutoMode: newAutoMode });
    get().setNotification(
      newAutoMode ? 'Auto-mode enabled - Automatic rebalancing active' : 'Auto-mode disabled',
      'info'
    );
  },

  updateOracleData: (data) => {
    set({ oracleData: data });
  },

  deposit: async (amount) => {
    const state = get();
    if (!state.walletAddress) {
      get().setNotification('Please connect wallet first', 'error');
      return;
    }
    
    set({ isLoading: true });
    try {
      const share = await smartContractService.deposit(amount, state.walletAddress);
      const sharesToMint = share.amount;
      
      set({
        portfolio: {
          ...state.portfolio,
          qxBalance: state.portfolio.qxBalance - amount,
          sharesOwned: state.portfolio.sharesOwned + sharesToMint,
          totalValue: (state.portfolio.sharesOwned + sharesToMint) * smartContractService.getCurrentShareValue(),
          deposits: [...state.portfolio.deposits, amount],
          shareValue: smartContractService.getCurrentShareValue(),
        },
        totalTvl: state.totalTvl + amount,
        isLoading: false,
      });
      
      get().setNotification(`Successfully deposited ${amount} QX`, 'success');
      get().updateMetrics();
    } catch (error: any) {
      set({ isLoading: false });
      get().setNotification(error.message || 'Deposit failed', 'error');
    }
  },

  withdraw: async (shares) => {
    const state = get();
    if (!state.walletAddress) {
      get().setNotification('Please connect wallet first', 'error');
      return;
    }
    
    if (shares <= 0 || shares > state.portfolio.sharesOwned) {
      get().setNotification('Invalid withdrawal amount', 'error');
      return;
    }
    
    set({ isLoading: true });
    try {
      const qxAmount = await smartContractService.withdraw(shares, state.walletAddress);
      const newSharesOwned = state.portfolio.sharesOwned - shares;
      const currentShareValue = smartContractService.getCurrentShareValue();
      
      set({
        portfolio: {
          ...state.portfolio,
          qxBalance: state.portfolio.qxBalance + qxAmount,
          sharesOwned: newSharesOwned,
          totalValue: newSharesOwned * currentShareValue,
          shareValue: currentShareValue,
        },
        totalTvl: Math.max(0, state.totalTvl - qxAmount),
        isLoading: false,
      });
      
      get().setNotification(`Successfully withdrew ${qxAmount.toFixed(2)} QX`, 'success');
      get().updateMetrics();
    } catch (error: any) {
      set({ isLoading: false });
      get().setNotification(error.message || 'Withdrawal failed', 'error');
    }
  },

  vote: (proposalId, support) => {
    const state = get();
    const shares = state.portfolio.sharesOwned;
    
    if (shares <= 0) {
      get().setNotification('You need YF shares to vote', 'error');
      return;
    }
    
    // Find the proposal and check if already voted
    const proposal = state.proposals.find(p => p.id === proposalId);
    if (proposal?.userVoted) {
      get().setNotification('You have already voted on this proposal', 'error');
      return;
    }
    
    // Create new proposals array with updated vote counts
    const updatedProposals = state.proposals.map((p) => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: support ? p.votesFor + shares : p.votesFor,
          votesAgainst: !support ? p.votesAgainst + shares : p.votesAgainst,
          userVoted: true,
        };
      }
      return p;
    });
    
    // Force state update with new array reference
    set({ proposals: updatedProposals });
    
    get().setNotification(`Vote cast successfully with ${shares.toFixed(2)} YF shares`, 'success');
  },

  rebalance: async () => {
    const state = get();
    set({ isLoading: true });
    
    try {
      const currentAllocations: Record<string, number> = {};
      const oraclePrices: Record<string, number> = {};
      const targetYields: Record<string, number> = {};
      
      state.oracleData.forEach(asset => {
        currentAllocations[asset.symbol] = asset.allocation;
        oraclePrices[asset.symbol] = asset.price;
        targetYields[asset.symbol] = asset.yield;
      });
      
      const rebalanceEvent = await smartContractService.rebalance(
        currentAllocations,
        oraclePrices,
        targetYields
      );
      
      // Update allocations based on rebalance
      const updatedOracleData = state.oracleData.map(asset => ({
        ...asset,
        allocation: rebalanceEvent.newAllocations[asset.symbol] || asset.allocation,
      }));
      
      // Recalculate APY based on new allocations
      const newApy = updatedOracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
      
      set({
        oracleData: updatedOracleData,
        rebalanceHistory: [...state.rebalanceHistory, rebalanceEvent],
        currentApy: newApy,
        isLoading: false,
      });
      
      get().setNotification('Portfolio rebalanced successfully', 'success');
      get().updateMetrics();
    } catch (error: any) {
      set({ isLoading: false });
      get().setNotification(error.message || 'Rebalance failed', 'error');
    }
  },

  compound: async () => {
    const state = get();
    set({ isLoading: true });
    
    try {
      const compoundEvent = await smartContractService.compound(state.currentApy);
      
      set({
        portfolio: {
          ...state.portfolio,
          shareValue: compoundEvent.newShareValue,
          totalValue: state.portfolio.sharesOwned * compoundEvent.newShareValue,
          compoundHistory: [
            ...state.portfolio.compoundHistory,
            {
              timestamp: compoundEvent.timestamp,
              amount: compoundEvent.amount,
              apy: compoundEvent.apy
            },
          ],
          totalEarned: state.portfolio.totalEarned + compoundEvent.amount,
          lastHarvest: new Date(),
        },
        compoundHistory: [...state.compoundHistory, compoundEvent],
        isLoading: false,
      });
      
      get().setNotification(`Yield compounded: +${compoundEvent.amount.toFixed(2)} QX`, 'success');
      get().updateMetrics();
    } catch (error: any) {
      set({ isLoading: false });
      get().setNotification(error.message || 'Compound failed', 'error');
    }
  },

  requestFaucet: async () => {
    set({ isLoading: true });
    try {
      const amount = await qubicService.requestFaucet();
      const state = get();
      
      set({
        portfolio: {
          ...state.portfolio,
          qxBalance: state.portfolio.qxBalance + amount,
        },
        isLoading: false,
      });
      
      get().setNotification(`Received ${amount} QX from testnet faucet!`, 'success');
    } catch (error: any) {
      set({ isLoading: false });
      get().setNotification('Faucet request failed', 'error');
    }
  },

  setNotification: (message, type) => {
    set({ notification: { message, type } });
    // Auto-clear after 5 seconds
    setTimeout(() => get().clearNotification(), 5000);
  },

  clearNotification: () => {
    set({ notification: null });
  },

  startOracleSubscription: () => {
    // Calculate initial APY
    const state = get();
    const initialApy = state.oracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
    set({ currentApy: initialApy });
    
    qubicService.subscribeToOracles((oraclePrice: QubicOraclePrice) => {
      const state = get();
      const updatedOracleData = state.oracleData.map(asset => {
        if (asset.symbol === oraclePrice.assetId) {
          const oldPrice = asset.price;
          const newPrice = oraclePrice.price;
          const change24h = ((newPrice - oldPrice) / oldPrice) * 100;
          
          return {
            ...asset,
            price: newPrice,
            change24h: asset.change24h + change24h,
            lastUpdate: oraclePrice.timestamp,
            confidence: oraclePrice.confidence,
            source: oraclePrice.source,
          };
        }
        return asset;
      });
      
      // Recalculate APY whenever oracle data updates
      const currentApy = updatedOracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
      
      set({
        oracleData: updatedOracleData,
        currentApy
      });
      
      // Auto-rebalance if enabled and threshold met
      if (state.isAutoMode) {
        const priceChanges = updatedOracleData.map(a => Math.abs(a.change24h));
        const maxChange = Math.max(...priceChanges);
        if (maxChange > 5) {
          get().rebalance();
        }
      }
    });
  },

  updateMetrics: () => {
    const state = get();
    const tvl = smartContractService.getTVL();
    const rebalanceHistory = smartContractService.getRebalanceHistory();
    
    set({
      protocolMetrics: {
        ...state.protocolMetrics,
        tvl,
        totalUsers: state.protocolMetrics.totalUsers + (Math.random() > 0.7 ? 1 : 0),
        dailyVolume: state.protocolMetrics.dailyVolume + (Math.random() * 10000),
        protocolRevenue: state.protocolMetrics.protocolRevenue + (tvl * 0.005 / 365),
        averageApy: state.currentApy,
        rebalanceCount: rebalanceHistory.length,
        lastRebalance: rebalanceHistory.length > 0 ? rebalanceHistory[rebalanceHistory.length - 1].timestamp : null,
        nextRebalance: new Date(Date.now() + 3600000),
      },
      totalTvl: tvl,
    });
  },
}));

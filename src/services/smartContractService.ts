// YieldForge Smart Contract Service
// Simulates Qubic smart contract interactions

import { qubicService, QubicTransaction } from './qubicService';

export interface YieldForgeShare {
  id: string;
  owner: string;
  amount: number;
  mintedAt: Date;
  currentValue: number;
  locked: boolean;
}

export interface RebalanceEvent {
  id: string;
  timestamp: Date;
  previousAllocations: Record<string, number>;
  newAllocations: Record<string, number>;
  reason: string;
  gasUsed: number;
  yieldGenerated: number;
}

export interface CompoundEvent {
  id: string;
  timestamp: Date;
  amount: number;
  newShareValue: number;
  apy: number;
  totalShares: number;
}

export interface IPOData {
  totalShares: number;
  circulatingSupply: number;
  sharePrice: number;
  marketCap: number;
  tradingVolume24h: number;
  holders: number;
}

class SmartContractService {
  private shares: Map<string, YieldForgeShare[]> = new Map();
  private rebalanceHistory: RebalanceEvent[] = [];
  private compoundHistory: CompoundEvent[] = [];
  private currentShareValue: number = 1.0;
  private totalSupply: number = 0;
  private lastRebalance: Date = new Date();
  private lastCompound: Date = new Date();
  
  // Contract constants (simulated)
  private readonly REBALANCE_THRESHOLD = 0.05; // 5% price change triggers rebalance
  private readonly COMPOUND_INTERVAL = 86400; // 24 hours in seconds
  private readonly MANAGEMENT_FEE = 0.005; // 0.5% annual fee
  private readonly MIN_DEPOSIT = 10; // Minimum 10 QX
  private readonly MAX_ALLOCATION = 0.8; // Max 80% in single asset
  
  // Deposit QX and mint shares
  async deposit(amount: number, userAddress: string): Promise<YieldForgeShare> {
    if (amount < this.MIN_DEPOSIT) {
      throw new Error(`Minimum deposit is ${this.MIN_DEPOSIT} QX`);
    }
    
    // Execute blockchain transaction
    const tx = await qubicService.executeTransaction('deposit', amount);
    
    // Calculate shares to mint
    const sharesToMint = amount / this.currentShareValue;
    
    // Create share record
    const share: YieldForgeShare = {
      id: 'SHARE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      owner: userAddress,
      amount: sharesToMint,
      mintedAt: new Date(),
      currentValue: amount,
      locked: false
    };
    
    // Store share
    if (!this.shares.has(userAddress)) {
      this.shares.set(userAddress, []);
    }
    this.shares.get(userAddress)!.push(share);
    
    // Update total supply
    this.totalSupply += sharesToMint;
    
    return share;
  }
  
  // Withdraw shares and receive QX
  async withdraw(shareAmount: number, userAddress: string): Promise<number> {
    const userShares = this.shares.get(userAddress) || [];
    const totalUserShares = userShares.reduce((sum, s) => sum + s.amount, 0);
    
    if (totalUserShares < shareAmount) {
      throw new Error('Insufficient shares');
    }
    
    // Calculate QX to return
    const qxAmount = shareAmount * this.currentShareValue;
    
    // Execute blockchain transaction
    await qubicService.executeTransaction('withdraw', qxAmount);
    
    // Update shares (simplified - in reality would handle partial shares)
    let remainingToWithdraw = shareAmount;
    const updatedShares = userShares.filter(share => {
      if (remainingToWithdraw <= 0) return true;
      
      if (share.amount <= remainingToWithdraw) {
        remainingToWithdraw -= share.amount;
        return false;
      } else {
        share.amount -= remainingToWithdraw;
        remainingToWithdraw = 0;
        return true;
      }
    });
    
    this.shares.set(userAddress, updatedShares);
    this.totalSupply -= shareAmount;
    
    return qxAmount;
  }
  
  // Auto-rebalance portfolio based on oracle prices
  async rebalance(
    currentAllocations: Record<string, number>,
    oraclePrices: Record<string, number>,
    targetYields: Record<string, number>
  ): Promise<RebalanceEvent> {
    // Calculate optimal allocations based on yield/risk
    const newAllocations: Record<string, number> = {};
    let totalScore = 0;
    
    // Score each asset based on yield and recent performance
    const scores: Record<string, number> = {};
    for (const [asset, yield_] of Object.entries(targetYields)) {
      const priceChange = this.calculatePriceChange(asset, oraclePrices[asset]);
      const score = yield_ * (1 + priceChange * 0.1); // Favor rising assets slightly
      scores[asset] = Math.max(0, score);
      totalScore += scores[asset];
    }
    
    // Calculate new allocations based on scores
    for (const [asset, score] of Object.entries(scores)) {
      let allocation = (score / totalScore) * 100;
      // Apply max allocation constraint
      allocation = Math.min(allocation, this.MAX_ALLOCATION * 100);
      newAllocations[asset] = Math.round(allocation * 100) / 100;
    }
    
    // Normalize to 100%
    const totalAllocation = Object.values(newAllocations).reduce((sum, a) => sum + a, 0);
    for (const asset in newAllocations) {
      newAllocations[asset] = (newAllocations[asset] / totalAllocation) * 100;
    }
    
    // Calculate yield generated from rebalance
    const yieldGenerated = this.calculateRebalanceYield(currentAllocations, newAllocations, targetYields);
    
    // Create rebalance event
    const event: RebalanceEvent = {
      id: 'REBAL_' + Date.now(),
      timestamp: new Date(),
      previousAllocations: currentAllocations,
      newAllocations,
      reason: this.determineRebalanceReason(currentAllocations, newAllocations),
      gasUsed: qubicService.calculateGasFee('rebalance'),
      yieldGenerated
    };
    
    this.rebalanceHistory.push(event);
    this.lastRebalance = new Date();
    
    // Execute rebalance transaction
    await qubicService.executeTransaction('rebalance', 0);
    
    return event;
  }
  
  // Auto-compound yields
  async compound(currentApy: number): Promise<CompoundEvent> {
    const timeSinceLastCompound = (Date.now() - this.lastCompound.getTime()) / 1000;
    
    if (timeSinceLastCompound < this.COMPOUND_INTERVAL) {
      throw new Error('Compound interval not reached');
    }
    
    // Calculate compound amount
    const dailyRate = currentApy / 365 / 100;
    const compoundFactor = 1 + dailyRate;
    const previousValue = this.currentShareValue;
    
    // Apply management fee
    const feeAdjustedFactor = compoundFactor * (1 - this.MANAGEMENT_FEE / 365);
    this.currentShareValue *= feeAdjustedFactor;
    
    const compoundAmount = (this.currentShareValue - previousValue) * this.totalSupply;
    
    // Create compound event
    const event: CompoundEvent = {
      id: 'COMP_' + Date.now(),
      timestamp: new Date(),
      amount: compoundAmount,
      newShareValue: this.currentShareValue,
      apy: currentApy,
      totalShares: this.totalSupply
    };
    
    this.compoundHistory.push(event);
    this.lastCompound = new Date();
    
    // Execute compound transaction
    await qubicService.executeTransaction('compound', 0);
    
    return event;
  }
  
  // Get IPO data
  getIPOData(): IPOData {
    return {
      totalShares: this.totalSupply,
      circulatingSupply: this.totalSupply * 0.7, // 70% circulating
      sharePrice: this.currentShareValue,
      marketCap: this.totalSupply * this.currentShareValue,
      tradingVolume24h: Math.random() * 100000 + 50000,
      holders: this.shares.size
    };
  }
  
  // Get user shares
  getUserShares(userAddress: string): YieldForgeShare[] {
    return this.shares.get(userAddress) || [];
  }
  
  // Get total value locked (TVL)
  getTVL(): number {
    return this.totalSupply * this.currentShareValue;
  }
  
  // Get rebalance history
  getRebalanceHistory(): RebalanceEvent[] {
    return this.rebalanceHistory;
  }
  
  // Get compound history
  getCompoundHistory(): CompoundEvent[] {
    return this.compoundHistory;
  }
  
  // Get current share value
  getCurrentShareValue(): number {
    return this.currentShareValue;
  }
  
  // Helper: Calculate price change percentage
  private calculatePriceChange(asset: string, currentPrice: number): number {
    // Simplified - in reality would track historical prices
    return (Math.random() - 0.5) * 0.1; // -5% to +5%
  }
  
  // Helper: Calculate yield from rebalance
  private calculateRebalanceYield(
    oldAllocations: Record<string, number>,
    newAllocations: Record<string, number>,
    yields: Record<string, number>
  ): number {
    let oldYield = 0;
    let newYield = 0;
    
    for (const asset in yields) {
      oldYield += (oldAllocations[asset] || 0) * yields[asset] / 100;
      newYield += (newAllocations[asset] || 0) * yields[asset] / 100;
    }
    
    return newYield - oldYield;
  }
  
  // Helper: Determine rebalance reason
  private determineRebalanceReason(
    oldAllocations: Record<string, number>,
    newAllocations: Record<string, number>
  ): string {
    let maxChange = 0;
    let changedAsset = '';
    
    for (const asset in newAllocations) {
      const change = Math.abs((newAllocations[asset] || 0) - (oldAllocations[asset] || 0));
      if (change > maxChange) {
        maxChange = change;
        changedAsset = asset;
      }
    }
    
    if (maxChange > 20) {
      return `Major reallocation: ${changedAsset} position adjusted by ${maxChange.toFixed(1)}%`;
    } else if (maxChange > 10) {
      return `Yield optimization: Rebalancing to capture higher yields`;
    } else {
      return `Routine rebalance: Minor adjustments for optimal performance`;
    }
  }
  
  // Simulate auto-compound (for demo mode)
  async simulateAutoCompound(): Promise<void> {
    // Run compound every 10 seconds in demo mode
    setInterval(async () => {
      try {
        const apy = 12 + Math.random() * 6; // 12-18% APY
        await this.compound(apy);
      } catch (error) {
        // Ignore interval errors
      }
    }, 10000);
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();
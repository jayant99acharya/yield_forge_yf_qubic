import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { portfolio, deposit, currentApy, oracleData } = useAppStore();
  
  // Calculate APY from current allocations if currentApy is 0
  const calculatedApy = oracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
  const displayApy = currentApy || calculatedApy;

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0 || depositAmount > portfolio.qxBalance) return;

    setIsProcessing(true);
    
    // Execute deposit through store
    await deposit(depositAmount);
    
    // Simulate transaction confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      onOpenChange(false);
    }, 2000);
  };

  const expectedShares = amount ? (parseFloat(amount) / portfolio.shareValue).toFixed(4) : '0';
  const expectedYield = amount ? ((parseFloat(amount) * displayApy / 100)).toFixed(2) : '0';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card p-6 relative overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Deposit Successful!</h3>
                <p className="text-muted-foreground">Your YieldForge shares have been minted.</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
                    <Wallet className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Deposit QX</h3>
                  <p className="text-muted-foreground text-sm mt-1">Convert QX tokens to YieldForge shares</p>
                </div>

                {/* Balance */}
                <div className="glass-card bg-secondary/30 p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Available Balance</span>
                    <span className="font-display font-bold text-foreground">{portfolio.qxBalance.toLocaleString()} QX</span>
                  </div>
                </div>

                {/* Input */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Deposit Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground text-lg font-display focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                      onClick={() => setAmount(portfolio.qxBalance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary/80"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2 mb-6">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setAmount((portfolio.qxBalance * percent / 100).toString())}
                      className="flex-1 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shares to receive</span>
                    <span className="text-foreground font-semibold">{expectedShares} YF</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current APY</span>
                    <span className="text-success font-semibold">{displayApy.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Est. yearly yield</span>
                    <span className="gold-text font-semibold">{expectedYield} QX</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > portfolio.qxBalance || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Deposit & Mint Shares
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Shares auto-compound daily via Qubic oracles
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

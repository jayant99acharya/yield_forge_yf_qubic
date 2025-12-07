import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowUp, Loader2, CheckCircle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [shares, setShares] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { portfolio, withdraw, currentApy } = useAppStore();

  const handleWithdraw = async () => {
    const shareAmount = parseFloat(shares);
    if (isNaN(shareAmount) || shareAmount <= 0 || shareAmount > portfolio.sharesOwned) return;

    setIsProcessing(true);
    
    // Execute withdrawal
    await withdraw(shareAmount);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setShares('');
      onOpenChange(false);
    }, 2000);
  };

  const expectedQX = shares ? (parseFloat(shares) * portfolio.shareValue).toFixed(2) : '0';
  const remainingShares = shares ? (portfolio.sharesOwned - parseFloat(shares)).toFixed(4) : portfolio.sharesOwned.toFixed(4);

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
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-destructive/20 rounded-full blur-3xl" />
            
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
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Withdrawal Successful!</h3>
                <p className="text-muted-foreground">Your QX tokens have been returned.</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/50 flex items-center justify-center mx-auto mb-3 shadow-glow-destructive">
                    <ArrowUp className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Withdraw Shares</h3>
                  <p className="text-muted-foreground text-sm mt-1">Convert YieldForge shares back to QX tokens</p>
                </div>

                {/* Balance */}
                <div className="glass-card bg-secondary/30 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Available Shares</span>
                    <span className="font-display font-bold text-foreground">{portfolio.sharesOwned.toFixed(4)} YF</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Current Value</span>
                    <span className="font-display font-bold text-foreground">
                      {portfolio.totalValue.toFixed(2)} QX
                    </span>
                  </div>
                </div>

                {/* Input */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Shares to Withdraw</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground text-lg font-display focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors"
                    />
                    <button
                      onClick={() => setShares(portfolio.sharesOwned.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-destructive hover:text-destructive/80"
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
                      onClick={() => setShares((portfolio.sharesOwned * percent / 100).toString())}
                      className="flex-1 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">QX to receive</span>
                    <span className="text-foreground font-semibold">{expectedQX} QX</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Share price</span>
                    <span className="text-foreground font-semibold">{portfolio.shareValue.toFixed(4)} QX</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining shares</span>
                    <span className="text-foreground font-semibold">{remainingShares} YF</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lost APY</span>
                    <span className="text-destructive font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {currentApy.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                  <p className="text-xs text-destructive">
                    ⚠️ Withdrawing will stop earning yields on these shares
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={!shares || parseFloat(shares) <= 0 || parseFloat(shares) > portfolio.sharesOwned || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw Shares
                      <ArrowUp className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
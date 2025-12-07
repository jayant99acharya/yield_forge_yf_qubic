import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Radio, Building, Gem, DollarSign } from 'lucide-react';
import { useAppStore, OracleData } from '@/lib/store';
import { cn } from '@/lib/utils';

const categoryIcons = {
  'real-estate': Building,
  commodity: Gem,
  forex: DollarSign,
};

const categoryColors = {
  'real-estate': 'text-primary',
  commodity: 'text-accent',
  forex: 'text-success',
};

export function OracleFeed() {
  const { oracleData, updateOracleData, isDemoMode, rebalance } = useAppStore();
  const [updatedId, setUpdatedId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      intervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * oracleData.length);
        const updatedData = oracleData.map((item, index) => {
          if (index === randomIndex) {
            const priceChange = (Math.random() - 0.5) * 0.02 * item.price;
            const newPrice = Math.max(0.01, item.price + priceChange);
            const newChange = ((newPrice - item.price) / item.price) * 100 + item.change24h;
            
            setUpdatedId(item.id);
            setTimeout(() => setUpdatedId(null), 1000);

            return {
              ...item,
              price: newPrice,
              change24h: Math.max(-10, Math.min(10, newChange)),
              lastUpdate: new Date(),
            };
          }
          return item;
        });

        updateOracleData(updatedData);
        
        // Auto-rebalance every 5th update
        if (Math.random() > 0.8) {
          rebalance();
        }
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDemoMode, oracleData, updateOracleData, rebalance]);

  return (
    <section id="oracles" className="py-20 px-4 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm mb-4">
            <Radio className={cn("w-4 h-4", isDemoMode ? "text-success animate-pulse" : "text-muted-foreground")} />
            <span className={isDemoMode ? "text-success" : "text-muted-foreground"}>
              {isDemoMode ? 'Live Oracle Feed' : 'Oracle Feed (Enable Demo)'}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time <span className="text-gradient-primary">Oracle Data</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Qubic oracles feed live RWA prices every tick — 15.5M updates per second
          </p>
        </motion.div>

        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">Asset</span>
            <span className="text-sm font-semibold text-muted-foreground text-right">Price</span>
            <span className="text-sm font-semibold text-muted-foreground text-right">24h Change</span>
            <span className="text-sm font-semibold text-muted-foreground text-right">Yield APY</span>
            <span className="text-sm font-semibold text-muted-foreground text-right">Last Update</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {oracleData.map((asset) => {
              const Icon = categoryIcons[asset.category];
              const colorClass = categoryColors[asset.category];
              const isUpdated = updatedId === asset.id;

              return (
                <motion.div
                  key={asset.id}
                  className={cn(
                    "grid grid-cols-5 gap-4 px-6 py-4 transition-colors",
                    isUpdated && "oracle-pulse"
                  )}
                  layout
                >
                  {/* Asset Name */}
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-secondary", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground">{asset.name}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex items-center justify-end">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={asset.price.toFixed(2)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="font-display font-bold text-foreground"
                      >
                        ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* 24h Change */}
                  <div className="text-right flex items-center justify-end gap-1">
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn(
                      "font-semibold",
                      asset.change24h >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>

                  {/* Yield */}
                  <div className="text-right flex items-center justify-end">
                    <span className="gold-text font-bold">{asset.yield}%</span>
                  </div>

                  {/* Last Update */}
                  <div className="text-right flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isUpdated ? "bg-success animate-pulse" : "bg-muted-foreground"
                      )} />
                      <span className="text-sm text-muted-foreground">
                        {asset.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Oracle Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Update Frequency', value: '15.5M/s', desc: 'Qubic TPS' },
            { label: 'Oracle Sources', value: '47', desc: 'Verified feeds' },
            { label: 'Latency', value: '<1ms', desc: 'Network delay' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="stat-card text-center"
            >
              <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-foreground font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

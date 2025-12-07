import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SimulatedAllocation {
  symbol: string;
  current: number;
  simulated: number;
  change: number;
}

export function RebalanceSimulator() {
  const { oracleData, isDemoMode } = useAppStore();
  const [scenario, setScenario] = useState<'gold-pump' | 're-crash' | 'forex-surge'>('gold-pump');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedAllocations, setSimulatedAllocations] = useState<SimulatedAllocation[]>([]);

  const scenarios = {
    'gold-pump': {
      label: 'Gold Pumps +5%',
      description: 'If gold price increases 5%, auto-shift to capture gains',
      changes: { REI: -10, XAU: 20, 'USD/TRY': -10 },
    },
    're-crash': {
      label: 'Real Estate -10%',
      description: 'If RE index drops, reduce exposure and diversify',
      changes: { REI: -25, XAU: 15, 'USD/TRY': 10 },
    },
    'forex-surge': {
      label: 'Forex Carry +15%',
      description: 'High carry trade yields attract reallocation',
      changes: { REI: -5, XAU: -10, 'USD/TRY': 15 },
    },
  };

  const runSimulation = () => {
    setIsSimulating(true);
    const currentScenario = scenarios[scenario];

    setTimeout(() => {
      const allocations: SimulatedAllocation[] = oracleData.map((asset) => {
        const change = currentScenario.changes[asset.symbol as keyof typeof currentScenario.changes] || 0;
        const newAllocation = Math.max(5, Math.min(80, asset.allocation + change));
        return {
          symbol: asset.symbol,
          current: asset.allocation,
          simulated: newAllocation,
          change: newAllocation - asset.allocation,
        };
      });

      setSimulatedAllocations(allocations);
      setIsSimulating(false);
    }, 1500);
  };

  useEffect(() => {
    if (isDemoMode) {
      runSimulation();
    }
  }, [isDemoMode, scenario]);

  return (
    <section id="rebalancer" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Auto-<span className="text-gradient-primary">Rebalance</span> Simulator
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Watch how YieldForge smart contracts auto-adjust allocations based on oracle price movements
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scenario Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Sliders className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Select Scenario</h3>
            </div>

            <div className="space-y-3 mb-6">
              {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                <button
                  key={key}
                  onClick={() => setScenario(key)}
                  className={cn(
                    "w-full p-4 rounded-lg border transition-all text-left",
                    scenario === key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold text-foreground">{scenarios[key].label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{scenarios[key].description}</div>
                </button>
              ))}
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Run Simulation
                </>
              )}
            </Button>
          </motion.div>

          {/* Allocation Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Allocation Changes
            </h3>

            {simulatedAllocations.length > 0 ? (
              <div className="space-y-6">
                {simulatedAllocations.map((allocation, i) => (
                  <motion.div
                    key={allocation.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{allocation.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{allocation.current}%</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span className={cn(
                          "font-bold",
                          allocation.change > 0 ? "text-success" : allocation.change < 0 ? "text-destructive" : "text-foreground"
                        )}>
                          {allocation.simulated}%
                        </span>
                        <span className={cn(
                          "text-sm",
                          allocation.change > 0 ? "text-success" : allocation.change < 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          ({allocation.change > 0 ? '+' : ''}{allocation.change}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="relative h-8 bg-secondary/50 rounded-lg overflow-hidden">
                      {/* Current */}
                      <motion.div
                        className="absolute top-0 left-0 h-4 bg-muted-foreground/30 rounded-t-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${allocation.current}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                      {/* Simulated */}
                      <motion.div
                        className={cn(
                          "absolute bottom-0 left-0 h-4 rounded-b-lg",
                          allocation.change > 0 ? "bg-success" : allocation.change < 0 ? "bg-destructive" : "bg-primary"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${allocation.simulated}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Summary */}
                <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Rebalance executed in <span className="text-primary font-bold">&lt;1 tick</span> on Qubic
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select a scenario and run simulation
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

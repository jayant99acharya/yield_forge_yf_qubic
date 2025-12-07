import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';

const COLORS = ['#00D4AA', '#FFB347', '#4ECDC4'];

export function PortfolioDashboard() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { portfolio, oracleData, currentApy, isConnected, connectWallet } = useAppStore();
  
  // Calculate APY from current allocations
  const calculatedApy = oracleData.reduce((acc, d) => acc + (d.yield * d.allocation / 100), 0);
  const displayApy = currentApy || calculatedApy;

  const pieData = oracleData.map((asset) => ({
    name: asset.symbol,
    value: asset.allocation,
    yield: asset.yield,
  }));

  const stats = [
    {
      label: 'Shares Owned',
      value: portfolio.sharesOwned.toFixed(4),
      suffix: ' YF',
      icon: Coins,
      color: 'text-primary',
    },
    {
      label: 'Share Value',
      value: portfolio.shareValue.toFixed(4),
      suffix: ' QX',
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'Total Value',
      value: portfolio.totalValue.toFixed(2),
      suffix: ' QX',
      icon: Wallet,
      color: 'text-accent',
    },
    {
      label: 'Current APY',
      value: displayApy.toFixed(1),
      suffix: '%',
      icon: ArrowUpRight,
      color: 'text-success',
    },
  ];

  return (
    <section id="dashboard" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-gradient-primary">Portfolio</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Track your RWA allocation, yields, and auto-compounding in real-time
          </p>
        </motion.div>

        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center max-w-lg mx-auto"
          >
            <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Connect to View</h3>
            <p className="text-muted-foreground mb-6">Connect your Qubic wallet to see your portfolio</p>
            <Button variant="hero" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="stat-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-muted-foreground text-sm">{stat.label}</span>
                  </div>
                  <div className={`font-display text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                    <span className="text-lg text-muted-foreground">{stat.suffix}</span>
                  </div>
                </motion.div>
              ))}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="col-span-2 glass-card p-6 flex gap-4"
              >
                <Button variant="hero" className="flex-1" onClick={() => setIsDepositOpen(true)}>
                  <ArrowDownRight className="w-5 h-5" />
                  Deposit QX
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={portfolio.sharesOwned <= 0}
                  onClick={() => setIsWithdrawOpen(true)}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  Withdraw
                </Button>
              </motion.div>
            </div>

            {/* Allocation Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-4">RWA Allocation</h3>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220 30% 10%)',
                        border: '1px solid hsl(220 30% 20%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(180 100% 95%)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-4">
                {oracleData.map((asset, i) => (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-sm text-muted-foreground">{asset.symbol}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{asset.allocation}%</span>
                      <span className="text-xs text-success ml-2">{asset.yield}% APY</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <DepositModal open={isDepositOpen} onOpenChange={setIsDepositOpen} />
      <WithdrawModal open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen} />
    </section>
  );
}

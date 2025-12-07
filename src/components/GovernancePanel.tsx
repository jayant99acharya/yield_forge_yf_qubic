import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function GovernancePanel() {
  const { proposals, portfolio, vote, isConnected } = useAppStore();

  const getTimeRemaining = (endDate: Date) => {
    const diff = endDate.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  const getVotePercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst;
    if (total === 0) return 50;
    return (votesFor / total) * 100;
  };

  return (
    <section id="governance" className="py-20 px-4 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            IPO <span className="text-gradient-primary">Governance</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            YieldForge shareholders vote on RWA basket changes. 1 share = 1 vote.
          </p>
        </motion.div>

        {/* Voting Power */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 mb-8 max-w-md mx-auto text-center"
        >
          <Users className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-muted-foreground text-sm mb-1">Your Voting Power</div>
          <div className="font-display text-4xl font-bold text-foreground">
            {portfolio.sharesOwned.toFixed(2)} <span className="text-primary text-lg">YF</span>
          </div>
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-2">Connect wallet to vote</p>
          )}
        </motion.div>

        {/* Proposals */}
        <div className="space-y-6">
          {proposals.map((proposal, i) => {
            const votePercent = getVotePercentage(proposal.votesFor, proposal.votesAgainst);
            const totalVotes = proposal.votesFor + proposal.votesAgainst;

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Proposal Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        proposal.status === 'active' 
                          ? "bg-primary/20 text-primary"
                          : proposal.status === 'passed'
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      )}>
                        {proposal.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeRemaining(proposal.endDate)}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {proposal.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{proposal.description}</p>

                    {/* Vote Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          For: {proposal.votesFor.toLocaleString()}
                        </span>
                        <span className="text-destructive flex items-center gap-1">
                          Against: {proposal.votesAgainst.toLocaleString()}
                          <XCircle className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                        <motion.div
                          className="h-full bg-success"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${votePercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                        <motion.div
                          className="h-full bg-destructive"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${100 - votePercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {totalVotes.toLocaleString()} total votes
                      </div>
                    </div>
                  </div>

                  {/* Vote Actions */}
                  {proposal.status === 'active' && isConnected && portfolio.sharesOwned > 0 && !proposal.userVoted && (
                    <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                      <Button
                        variant="outline"
                        className="flex-1 border-success text-success hover:bg-success/10"
                        onClick={() => vote(proposal.id, true)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Vote For
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => vote(proposal.id, false)}
                      >
                        <XCircle className="w-4 h-4" />
                        Vote Against
                      </Button>
                    </div>
                  )}
                  
                  {/* Show when user has voted */}
                  {proposal.status === 'active' && isConnected && proposal.userVoted && (
                    <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                      <div className="glass-card px-4 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Voted</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* IPO Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-6 text-center"
        >
          <Vote className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Qubic IPO Smart Contract Model
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            YieldForge shares are issued via Qubic's native IPO mechanism. Shareholders receive governance rights
            and can trade shares on-chain. All voting is executed through UPoW-validated smart contracts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

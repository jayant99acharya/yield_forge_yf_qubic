import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Menu, X, Wallet, ChevronDown, Zap, Activity, Droplets, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { 
    isConnected, 
    walletAddress, 
    connectWallet, 
    disconnectWallet,
    isDemoMode,
    isAutoMode,
    toggleDemoMode,
    toggleAutoMode,
    portfolio,
    requestFaucet,
    notification,
    clearNotification
  } = useAppStore();

  const navItems = [
    { href: '#dashboard', label: 'Portfolio' },
    { href: '#oracles', label: 'Oracle Feed' },
    { href: '#rebalancer', label: 'Rebalancer' },
    { href: '#governance', label: 'Governance' },
  ];

  // Show notifications
  useEffect(() => {
    if (notification) {
      toast({
        title: notification.type === 'success' ? '✅ Success' : notification.type === 'error' ? '❌ Error' : 'ℹ️ Info',
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
      clearNotification();
    }
  }, [notification, toast, clearNotification]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 10)}...${address.slice(-8)}`;
    }
    return address;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Hexagon className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xs">YF</span>
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">YieldForge</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Qubic RWA Optimizer</p>
                {isDemoMode && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-full animate-pulse">
                    DEMO
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Controls & Wallet */}
          <div className="hidden md:flex items-center gap-4">
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2 glass-card px-3 py-2">
              <Activity className={cn("w-4 h-4", isDemoMode ? "text-success animate-pulse" : "text-muted-foreground")} />
              <span className="text-xs text-muted-foreground">Demo</span>
              <Switch
                checked={isDemoMode}
                onCheckedChange={toggleDemoMode}
                className="scale-75"
              />
            </div>

            {/* Auto Mode Toggle */}
            {isConnected && (
              <div className="flex items-center gap-2 glass-card px-3 py-2">
                <Zap className={cn("w-4 h-4", isAutoMode ? "text-primary animate-pulse" : "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground">Auto</span>
                <Switch
                  checked={isAutoMode}
                  onCheckedChange={toggleAutoMode}
                  className="scale-75"
                />
              </div>
            )}

            {/* Wallet Section */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="glass-card px-4 py-2">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-sm font-bold text-foreground ml-2">
                    {portfolio.qxBalance.toLocaleString()} QX
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="font-mono text-xs">{truncateAddress(walletAddress || '')}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Qubic Testnet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={copyAddress}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={requestFaucet}>
                      <Droplets className="w-4 h-4 mr-2" />
                      Request Faucet (1000 QX)
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://testnet.qubic.org" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                      <X className="w-4 h-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="hero" onClick={connectWallet} className="group">
                <Wallet className="w-4 h-4 group-hover:animate-pulse" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-border">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                
                {/* Mobile Controls */}
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Demo Mode</span>
                    <Switch
                      checked={isDemoMode}
                      onCheckedChange={toggleDemoMode}
                    />
                  </div>
                  
                  {isConnected && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Auto Mode</span>
                      <Switch
                        checked={isAutoMode}
                        onCheckedChange={toggleAutoMode}
                      />
                    </div>
                  )}
                  
                  <div className="pt-3">
                    {isConnected ? (
                      <>
                        <div className="glass-card p-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Balance</span>
                            <span className="text-sm font-bold text-foreground">
                              {portfolio.qxBalance.toLocaleString()} QX
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 font-mono">
                            {truncateAddress(walletAddress || '')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={requestFaucet}
                          className="w-full mb-2"
                        >
                          <Droplets className="w-4 h-4 mr-2" />
                          Request Faucet
                        </Button>
                        <Button
                          variant="outline"
                          onClick={disconnectWallet}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button variant="hero" onClick={connectWallet} className="w-full">
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

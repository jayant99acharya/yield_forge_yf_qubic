import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { OracleFeed } from '@/components/OracleFeed';
import { RebalanceSimulator } from '@/components/RebalanceSimulator';
import { GovernancePanel } from '@/components/GovernancePanel';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <PortfolioDashboard />
        <OracleFeed />
        <RebalanceSimulator />
        <GovernancePanel />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

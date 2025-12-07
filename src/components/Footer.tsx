import { motion } from 'framer-motion';
import { Zap, Github, Twitter, FileText, ExternalLink } from 'lucide-react';

export function Footer() {
  const links = [
    { label: 'Documentation', href: '#', icon: FileText },
    { label: 'GitHub', href: '#', icon: Github },
    { label: 'Twitter', href: '#', icon: Twitter },
  ];

  const stats = [
    { label: 'TAM', value: '$10T', desc: 'Global RWA Market' },
    { label: 'TPS', value: '15.5M', desc: 'Qubic Network' },
    { label: 'Fee', value: '0.5%', desc: 'AUM Annual' },
  ];

  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-gradient-primary">{stat.value}</div>
              <div className="text-sm text-foreground font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.desc}</div>
            </div>
          ))}
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-foreground">
                YIELD<span className="text-primary">FORGE</span>
              </span>
              <div className="text-xs text-muted-foreground">Qubic Nostromo Hackathon</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
          </div>

          {/* Qubic Badge */}
          <a
            href="https://docs.qubic.org"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card px-4 py-2 flex items-center gap-2 text-sm hover:border-primary/50 transition-colors"
          >
            <span className="text-muted-foreground">Built on</span>
            <span className="font-display font-bold text-primary">Qubic</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 YieldForge. Oracle-powered RWA yield optimization on Qubic Network.
        </div>
      </div>
    </footer>
  );
}

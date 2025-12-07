# 🔷 YieldForge - Oracle-Powered RWA Yield Optimizer on Qubic

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 🚀 Overview

YieldForge is a cutting-edge DeFi protocol built on the Qubic blockchain that optimizes Real World Asset (RWA) yields through oracle-powered automatic rebalancing. By leveraging Qubic's ultra-fast consensus mechanism and smart contract capabilities, YieldForge delivers institutional-grade yields of 15%+ APY to retail investors.

### 🌐 Live Demo

**Visit the live application: []()**

### 🎯 Key Features

- **🏦 RWA Yield Optimization**: Access diversified yields from real estate, commodities, and forex markets
- **🔮 Oracle-Powered Rebalancing**: Real-time price feeds trigger automatic portfolio optimization
- **⚡ Qubic Speed**: Sub-second transactions with minimal fees on Qubic's UPoW consensus
- **🗳️ IPO Governance**: Democratic decision-making through Qubic's native IPO mechanism
- **🔄 Auto-Compounding**: Maximize returns with automated yield reinvestment
- **📊 Live Analytics**: Real-time portfolio tracking and performance metrics

## 💡 How It Works

1. **Deposit QX Tokens**: Users deposit Qubic's native QX tokens into the YieldForge smart contract
2. **Mint YF Shares**: Receive YieldForge (YF) shares representing your stake in the protocol
3. **Oracle Monitoring**: Qubic oracles continuously monitor RWA prices and yields
4. **Auto-Rebalancing**: Smart contracts automatically adjust allocations to maximize yields
5. **Compound Yields**: Earnings are automatically reinvested to compound returns
6. **Governance Participation**: YF shareholders vote on protocol changes and asset allocations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Portfolio │  │  Oracle  │  │Rebalancer│  │Govern- │ │
│  │Dashboard │  │   Feed   │  │Simulator │  │ ance   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    State Management                      │
│                      (Zustand Store)                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌──────────────────┐        ┌──────────────────────┐  │
│  │  Qubic Service   │        │Smart Contract Service│  │
│  │  - Wallet        │        │  - Deposits          │  │
│  │  - Transactions  │        │  - Withdrawals       │  │
│  │  - Oracles       │        │  - Rebalancing       │  │
│  └──────────────────┘        └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Qubic Blockchain                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Smart   │  │  Oracle  │  │   IPO    │  │  QX    │ │
│  │Contracts │  │  Nodes   │  │Governance│  │ Token  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4 for lightning-fast HMR
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for efficient state updates
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Blockchain**: Qubic testnet integration
- **Smart Contracts**: Qubic SC with UPoW consensus

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- Modern web browser with Web3 support

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayant99acharya/yield_forge_yf_qubic.git
   cd qubic-yield-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

### Build for Production

```bash
npm run build
# Preview the production build
npm run preview
```

## 🎮 Usage Guide

### Connect Wallet
1. Click "Connect Wallet" in the navigation bar
2. Approve the connection in your Qubic wallet
3. Your QX balance will be displayed

### Deposit Funds
1. Navigate to the Portfolio Dashboard
2. Click "Deposit" and enter the amount of QX tokens
3. Confirm the transaction in your wallet
4. Receive YF shares representing your stake

### Monitor Performance
- View real-time oracle price feeds
- Track your portfolio value and APY
- Monitor rebalancing events and yield history

### Participate in Governance
1. Go to the Governance section
2. Review active proposals
3. Cast your vote using YF shares (1 share = 1 vote)
4. Track proposal outcomes

### Withdraw Funds
1. Click "Withdraw" in the Portfolio Dashboard
2. Enter the number of YF shares to redeem
3. Receive QX tokens plus accumulated yields

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Qubic Network Configuration
VITE_QUBIC_NETWORK=testnet
VITE_QUBIC_RPC_URL=https://testnet.qubic.org/rpc
VITE_ORACLE_ENDPOINT=wss://oracle.qubic.org/feed

# Smart Contract Addresses
VITE_YIELDFORGE_CONTRACT=QUBIC_CONTRACT_ADDRESS_HERE
VITE_ORACLE_CONTRACT=ORACLE_CONTRACT_ADDRESS_HERE

# Feature Flags
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_AUTO_COMPOUND=true
```

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Lint Code
```bash
npm run lint
```

## 📊 Performance Metrics

- **Transaction Speed**: < 1 second on Qubic
- **Gas Fees**: Minimal (< 0.01 QX per transaction)
- **APY Range**: 12-18% depending on market conditions
- **Rebalancing Frequency**: Every 4 hours or 5% price deviation
- **Compound Frequency**: Daily auto-compound

## 🗺️ Roadmap

### Phase 1: Testnet Launch ✅
- [x] Core smart contracts deployment
- [x] Oracle integration
- [x] Web interface
- [x] Governance system

### Phase 2: Mainnet Preparation 🚧
- [ ] Security audits
- [ ] Stress testing
- [ ] Community beta testing
- [ ] Documentation improvements

### Phase 3: Mainnet Launch 📅
- [ ] Deploy to Qubic mainnet
- [ ] Launch liquidity incentives
- [ ] Mobile app development
- [ ] Cross-chain bridges

### Phase 4: Expansion 🌍
- [ ] Additional RWA integrations
- [ ] Institutional partnerships
- [ ] Advanced trading strategies
- [ ] DAO treasury management

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Qubic Foundation** for blockchain infrastructure
- **Chainlink** for oracle design inspiration
- **Yearn Finance** for yield optimization strategies
- **MakerDAO** for governance model reference
- **shadcn/ui** for beautiful UI components

## ⚠️ Disclaimer

YieldForge is experimental software running on Qubic testnet. Use at your own risk. This is not financial advice. Always do your own research before investing in DeFi protocols.

---

<div align="center">
  <strong>Built with ❤️ for the Qubic Ecosystem</strong>
  <br>
  <sub>Empowering DeFi through Real World Assets</sub>
</div>

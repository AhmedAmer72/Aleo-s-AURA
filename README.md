# 🌟 Aura Protocol

## Zero-Knowledge Income Attestation on Aleo

Aura is a decentralized protocol that enables **privacy-preserving income attestation** using zero-knowledge proofs on the Aleo blockchain. Get CreditBadges that prove your income tier without revealing your actual salary, employer, or banking details.

![Aura Protocol Banner](./docs/banner.png)

---

## 🔧 How It Works

Aura uses a **commitment-based attestation** approach:

1. **Email Parsing** - You paste your payroll/bank email source, which is parsed locally in your browser
2. **Income Extraction** - The system extracts income amounts from the email body using pattern matching
3. **Tier Calculation** - Annual income is calculated to determine your tier (Bronze/Silver/Gold)
4. **On-Chain Commitment** - A zero-knowledge proof is generated and your CreditBadge is minted on Aleo

> ⚠️ **Note**: This is a proof-of-concept. Full DKIM cryptographic signature verification would require additional backend infrastructure. The current implementation validates email structure and extracts income data locally.

---

## ✨ Features

### 🔐 Privacy-First Design
- Email content is **processed locally** and never leaves your browser
- Generate **zero-knowledge proofs** that reveal only your income tier
- Your salary, employer, and bank details remain **private**

### 🏆 CreditBadge System
Three tiers of verifiable income credentials:

| Tier | Annual Income | Max Loan | APY |
|------|---------------|----------|-----|
| 🥇 Gold | $150k+ | $30,000 | 6% |
| 🥈 Silver | $75k+ | $20,000 | 9% |
| 🥉 Bronze | $25k+ | $10,000 | 12% |

### 💸 DeFi Integration
- Access under-collateralized lending pools
- Better rates for verified income tiers
- Privacy-preserving loan applications

### 🎨 Beautiful UI/UX
- Stunning animations with Framer Motion
- Glassmorphism design language
- Fully responsive across all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- [Leo CLI](https://developer.aleo.org/leo/) (for smart contract development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/aura-protocol.git
cd aura-protocol

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Project Structure

```
aura/
├── aura_program/           # Leo smart contracts
│   └── src/
│       └── main.leo        # Core protocol logic
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Layout.jsx      # App layout wrapper
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Footer.jsx      # Site footer
│   │   └── ParticleBackground.jsx
│   ├── pages/              # Route pages
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── VerifyPage.jsx  # Income verification flow
│   │   ├── DashboardPage.jsx # User dashboard
│   │   ├── LendingPage.jsx # Lending pools
│   │   └── HowItWorksPage.jsx # Technical docs
│   ├── store/              # Zustand state management
│   ├── hooks/              # Custom React hooks
│   ├── workers/            # Email verification & Aleo integration
│   ├── lib/                # Utility functions
│   ├── data/               # Sample data & emails
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind + custom styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool with HMR
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation

### Blockchain
- **Aleo** - Zero-knowledge proof blockchain
- **Leo** - ZK programming language
- **@provablehq/sdk** - Aleo JavaScript SDK

### Privacy Features
- **BHP256** - ZK-friendly hashing for commitments
- **Email Parsing** - Local extraction of income data
- **Private Records** - Encrypted UTXO-based credentials on Aleo

---

## 📜 Smart Contract Overview

The Aura protocol is implemented in Leo with the following key components:

### Records (Private State)
```leo
record CreditBadge {
    owner: address,
    tier: u8,           // 1: Bronze, 2: Silver, 3: Gold
    income_bracket: u8,
    source_domain_hash: u128,
    verified_at: u64,
    expires_at: u64,
}

record LoanPosition {
    owner: address,
    principal: u64,
    interest_rate: u16,
    borrowed_at: u64,
    maturity: u64,
}
```

### Key Transitions
- `verify_income` - Verify email and mint CreditBadge
- `request_loan` - Borrow against verified income
- `repay_loan` - Repay loan and reclaim badge
- `renew_badge` - Extend badge expiration

---

## 🔒 Security Model

### How DKIM Verification Works

1. **Email Parsing**: Extract headers and DKIM-Signature from payroll email
2. **DNS Lookup**: Fetch RSA public key from sender's DNS
3. **Signature Verification**: Verify RSA-SHA256 signature matches
4. **Income Extraction**: Parse deposit amount from verified email
5. **ZK Proof Generation**: Create proof that income ≥ threshold
6. **On-chain Verification**: Leo program verifies proof and mints badge

### Privacy Guarantees
- ✅ Your salary amount is **never revealed**
- ✅ Your employer name is **never stored**
- ✅ Your bank details **stay private**
- ✅ Only income tier is proven on-chain

---

## 🧪 Testing

### Sample Emails
The project includes sample DKIM-signed emails for testing:

```javascript
import { sampleEmails, getSampleEmail } from './src/data/sampleEmails'

// Get a specific sample
const chaseEmail = getSampleEmail('chaseDeposit')  // Silver tier

// Get random sample
const { type, email } = getRandomSampleEmail()

// Get samples by tier
const goldEmails = getSampleEmailsByTier('gold')
```

### Running Tests
```bash
# Run frontend tests
npm run test

# Run Leo program tests
cd aura_program
leo test
```

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Leo smart contract implementation
- [x] React frontend with animations
- [x] DKIM email parsing
- [x] Mock verification flow

### Phase 2: Production (In Progress)
- [ ] Real DKIM signature verification
- [ ] Aleo testnet deployment
- [ ] Wallet integration (Leo Wallet)
- [ ] Multi-email verification

### Phase 3: DeFi Integration
- [ ] Lending pool contracts
- [ ] Liquidity provider rewards
- [ ] Cross-chain bridges
- [ ] Governance token

### Phase 4: Ecosystem
- [ ] Partner integrations
- [ ] Mobile app
- [ ] API for third-party apps
- [ ] Credit score aggregation

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Aleo](https://aleo.org) - Zero-knowledge blockchain platform
- [ZK Email](https://prove.email) - Inspiration for DKIM-based verification
- [Provable](https://provable.com) - Aleo SDK and tools

---

## 📞 Contact

- **Website**: [aura-protocol.xyz](https://aura-protocol.xyz)
- **Twitter**: [@AuraProtocol](https://twitter.com/AuraProtocol)
- **Discord**: [Join our community](https://discord.gg/aura-protocol)

---

<p align="center">
  <b>Built with 💜 for a privacy-preserving future</b>
</p>

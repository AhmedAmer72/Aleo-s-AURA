import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { 
  Mail, 
  Shield, 
  Zap, 
  Key,
  Lock,
  FileText,
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Globe,
  Cpu,
  Eye,
  EyeOff,
  Server,
  Fingerprint
} from 'lucide-react'

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The <span className="gradient-text">Technology</span> Behind Aura
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Combining DKIM email verification with zero-knowledge proofs to create 
            the first privacy-preserving income verification protocol on Aleo.
          </p>
        </motion.div>
      </section>

      {/* The Problem */}
      <TheProblem />

      {/* The Solution */}
      <TheSolution />

      {/* Technical Deep Dive */}
      <TechnicalDeepDive />

      {/* Security Features */}
      <SecurityFeatures />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTASection />
    </div>
  )
}

const TheProblem = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-aura-accent text-sm font-medium uppercase tracking-wider">The Problem</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Why Traditional Credit Doesn't Work in Web3
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-white mb-2">DeFi is Over-Collateralized</h3>
              <p className="text-gray-400">
                To borrow $1000, you need $1500 in collateral. This defeats the purpose of credit 
                and limits financial inclusion for billions.
              </p>
            </div>
            <div className="card border-l-4 border-orange-500">
              <h3 className="text-xl font-bold text-white mb-2">Privacy Invasion</h3>
              <p className="text-gray-400">
                Banks require 3 months of bank statements, revealing every transaction, every merchant, 
                every aspect of your financial life.
              </p>
            </div>
            <div className="card border-l-4 border-yellow-500">
              <h3 className="text-xl font-bold text-white mb-2">Security Nightmares</h3>
              <p className="text-gray-400">
                The Equifax breach exposed 147 million people. Every paystub uploaded is another 
                target for hackers.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Animated comparison */}
            <div className="glass rounded-2xl p-8">
              <h4 className="text-lg font-bold text-white mb-6">Traditional vs Aura</h4>
              
              <div className="space-y-4">
                {[
                  { traditional: 'Upload bank statements', aura: 'Forward one email' },
                  { traditional: 'Reveal exact salary', aura: 'Prove income tier only' },
                  { traditional: 'Expose all transactions', aura: 'Zero data exposure' },
                  { traditional: 'Wait days for approval', aura: 'Instant verification' },
                  { traditional: 'Data stored on servers', aura: 'Client-side only' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 text-sm text-red-400">
                      <EyeOff className="w-4 h-4" />
                      <span>{item.traditional}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-aura-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>{item.aura}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const TheSolution = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      icon: Mail,
      title: "Email with DKIM Signature",
      description: "Major email providers (Gmail, Outlook) sign every email with RSA-SHA256 (DKIM). This signature proves the email really came from that domain.",
      details: [
        "DKIM-Signature header contains cryptographic proof",
        "Public key is published in DNS TXT records",
        "Signature covers From, Subject, Date, and body"
      ]
    },
    {
      icon: FileText,
      title: "Parse & Extract",
      description: "The Aura circuit parses the email, verifies the DKIM signature, and uses pattern matching to extract only the income amount.",
      details: [
        "Regex-like pattern matching in ZK circuit",
        "Finds 'Your deposit of $X' patterns",
        "Extracts numeric value, discards everything else"
      ]
    },
    {
      icon: Zap,
      title: "Generate ZK Proof",
      description: "A zero-knowledge proof is generated that proves: (1) The email is authentic, (2) The income is above threshold, without revealing the actual number.",
      details: [
        "Proof is ~200 bytes, verifiable by anyone",
        "No trusted setup required (Aleo uses Marlin)",
        "Computation happens 100% client-side"
      ]
    },
    {
      icon: Shield,
      title: "Mint CreditBadge",
      description: "A private Record is minted to your Aleo wallet. This badge proves your income tier and can be used to access lending pools.",
      details: [
        "Record is encrypted, only you can view it",
        "Contains tier, expiry, and verification hash",
        "Composable with any Aleo DeFi protocol"
      ]
    }
  ]

  return (
    <section ref={ref} className="py-16 relative bg-gradient-to-b from-aura-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-aura-accent text-sm font-medium uppercase tracking-wider">The Solution</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            How Aura Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From email to CreditBadge in 4 cryptographically secure steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-aura-primary/50 to-transparent" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.15 }}
                className="relative"
              >
                <div className="card h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="pt-4">
                    <div className="w-14 h-14 rounded-xl bg-aura-primary/20 flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-aura-primary" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start text-xs text-gray-500">
                          <CheckCircle className="w-3 h-3 text-aura-success mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const TechnicalDeepDive = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-aura-accent text-sm font-medium uppercase tracking-wider">Technical Deep Dive</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Under the Hood
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* DKIM Verification */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-8 h-8 text-aura-primary" />
              <h3 className="text-xl font-bold text-white">DKIM Verification in ZK</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-400 text-sm">
                DomainKeys Identified Mail (DKIM) uses RSA-2048 signatures to prove 
                email authenticity. Our circuit verifies this signature inside the ZK proof.
              </p>
              
              <div className="glass rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Example DKIM Header</p>
                <pre className="text-xs font-mono text-aura-accent overflow-x-auto">
{`DKIM-Signature: v=1; a=rsa-sha256;
  d=chase.com; s=selector1;
  h=from:to:subject:date;
  bh=47DEQpj8HBSa+/TImW+5JCe...;
  b=dzdVyOfAKCdLXdJOc...`}
                </pre>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-aura-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-aura-success">1</span>
                </div>
                <p className="text-sm text-gray-400">Fetch public key from DNS (chase.com._domainkey)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-aura-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-aura-success">2</span>
                </div>
                <p className="text-sm text-gray-400">Hash the canonicalized headers and body</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-aura-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-aura-success">3</span>
                </div>
                <p className="text-sm text-gray-400">Verify RSA-SHA256 signature in circuit</p>
              </div>
            </div>
          </motion.div>

          {/* Leo Program */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Code className="w-8 h-8 text-aura-accent" />
              <h3 className="text-xl font-bold text-white">Leo Smart Contract</h3>
            </div>
            
            <div className="glass rounded-lg p-4 mb-4 overflow-x-auto">
              <pre className="text-xs font-mono text-gray-300">
{`record CreditBadge {
    owner: address,
    source_domain_hash: u128,
    income_bracket: u8,     // 1-3
    verification_timestamp: u32,
    expiry_timestamp: u32,
    is_active: bool,
    nonce: field,
}

transition verify_income(
    income_data: IncomeData,
    domain_hash: u128,
    email_signature: EmailSignature,
    current_timestamp: u32,
    badge_nonce: field
) -> CreditBadge {
    // Verify signature
    // Extract income tier
    // Mint private badge
    return CreditBadge { ... };
}`}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-aura-primary/20 text-aura-primary">Records</span>
              <span className="px-3 py-1 rounded-full text-xs bg-aura-accent/20 text-aura-accent">Transitions</span>
              <span className="px-3 py-1 rounded-full text-xs bg-aura-success/20 text-aura-success">Mappings</span>
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-400/20 text-yellow-400">Private by Default</span>
            </div>
          </motion.div>
        </div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 card"
        >
          <h3 className="text-xl font-bold text-white mb-6 text-center">System Architecture</h3>
          
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-sm text-white font-medium">User Email</p>
              <p className="text-xs text-gray-500">DKIM Signed</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-aura-primary" />
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-aura-primary/20 flex items-center justify-center mx-auto mb-2">
                <Cpu className="w-8 h-8 text-aura-primary" />
              </div>
              <p className="text-sm text-white font-medium">Browser WASM</p>
              <p className="text-xs text-gray-500">ZK Proof Gen</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-aura-primary" />
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-aura-accent/20 flex items-center justify-center mx-auto mb-2">
                <Globe className="w-8 h-8 text-aura-accent" />
              </div>
              <p className="text-sm text-white font-medium">Aleo Network</p>
              <p className="text-xs text-gray-500">Badge Minted</p>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            ✓ Email never leaves your browser • ✓ No centralized servers • ✓ Fully client-side
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const SecurityFeatures = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Lock,
      title: "Client-Side Only",
      description: "All proof generation happens in your browser. Email data never touches our servers."
    },
    {
      icon: Fingerprint,
      title: "Zero Knowledge",
      description: "Prove you earn above a threshold without revealing the exact amount or any other details."
    },
    {
      icon: Server,
      title: "No Data Storage",
      description: "We don't store emails, salaries, or any personal information. Period."
    },
    {
      icon: Shield,
      title: "Cryptographic Proof",
      description: "DKIM signatures are unforgeable. If the proof verifies, the email is authentic."
    },
    {
      icon: Eye,
      title: "Selective Disclosure",
      description: "Choose what to reveal. Show your badge tier without exposing the source email."
    },
    {
      icon: Database,
      title: "Private Records",
      description: "Your CreditBadge is an encrypted Aleo Record. Only you can view its contents."
    }
  ]

  return (
    <section ref={ref} className="py-16 relative bg-gradient-to-t from-aura-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-aura-accent text-sm font-medium uppercase tracking-wider">Security</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Privacy by Design
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className="card group"
            >
              <feature.icon className="w-8 h-8 text-aura-primary mb-4 group-hover:text-aura-accent transition-colors" />
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const faqs = [
    {
      q: "What emails are supported?",
      a: "Any email with a DKIM signature. This includes all major providers: Gmail, Outlook, Yahoo, and bank emails from Chase, Bank of America, Wells Fargo. Payroll emails from ADP, Gusto, Workday are also supported."
    },
    {
      q: "Is my email data stored anywhere?",
      a: "No. All processing happens in your browser using WebAssembly. The raw email never leaves your device. Only the cryptographic proof is submitted to the Aleo network."
    },
    {
      q: "Can I fake my income?",
      a: "No. DKIM signatures are cryptographically unforgeable. The proof verifies that the email was actually signed by the claimed domain (e.g., chase.com). Forging a signature is computationally impossible."
    },
    {
      q: "How long is my CreditBadge valid?",
      a: "Badges expire after 1 year. You'll need to re-verify with a recent email to maintain your credit standing. This ensures the badge reflects your current income."
    },
    {
      q: "What if I lose my wallet?",
      a: "Your CreditBadge is tied to your Aleo wallet. If you recover your wallet using your seed phrase, your badge will still be accessible. If you lose access permanently, you'll need to create a new verification."
    },
    {
      q: "Which DeFi protocols accept CreditBadge?",
      a: "Aura is designed to be composable. Any Aleo DeFi protocol can query your CreditBadge to offer better rates or higher loan limits. We're actively working with partners to expand the ecosystem."
    }
  ]

  return (
    <section ref={ref} className="py-16 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-aura-accent text-sm font-medium uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Common Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className="card"
            >
              <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="card text-center bg-gradient-to-br from-aura-primary/10 to-aura-accent/10 border border-aura-primary/30">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Prove Your Income?
          </h2>
          <p className="text-gray-400 mb-8">
            Get your CreditBadge in minutes and unlock DeFi credit without compromising your privacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/verify">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Start Verification</span>
              </motion.button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Code className="w-5 h-5" />
                <span>View on GitHub</span>
              </motion.button>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HowItWorksPage

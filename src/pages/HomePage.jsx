import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Zap, 
  ArrowRight, 
  Check, 
  Mail, 
  Coins,
  Eye,
  EyeOff,
  Globe,
  TrendingUp,
  Users,
  FileCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { useAuraStore } from '../store/auraStore'

const HomePage = () => {
  const { wallet, connectWallet } = useAuraStore()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Central glowing orb - teal theme */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orbiting elements - fewer, more subtle */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{
                transformOrigin: '0 0',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20 + i * 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 
                    ? `linear-gradient(135deg, #14b8a6, #06b6d4)`
                    : `linear-gradient(135deg, #f59e0b, #fbbf24)`,
                  marginLeft: `${120 + i * 60}px`,
                  boxShadow: i % 2 === 0 
                    ? '0 0 15px rgba(20, 184, 166, 0.4)'
                    : '0 0 15px rgba(245, 158, 11, 0.4)',
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border border-aura-primary/30 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-300">Powered by Aleo Zero-Knowledge Proofs</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="block text-white">Prove Your Income</span>
            <span className="block gradient-text glow-text">Without Revealing It</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12"
          >
            Get a <span className="text-aura-accent font-semibold">$50k loan on-chain</span> by proving you earn $200k/year — 
            without ever uploading a document or revealing your name to the lender.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/verify">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
              >
                <span>Verify Your Income</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                How It Works
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Network', value: 'Testnet', icon: Globe },
              { label: 'Credential Type', value: 'CreditBadge', icon: Shield },
              { label: 'Loan Pools', value: '3 Tiers', icon: Coins },
              { label: 'Privacy', value: 'ZK-Proof', icon: Lock },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-aura-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-aura-primary/50 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-aura-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* How It Works Preview */}
      <HowItWorksPreview />

      {/* Features Section */}
      <FeaturesSection />

      {/* Badge Tiers Section */}
      <BadgeTiersSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

const ProblemSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const problems = [
    {
      icon: Lock,
      title: "DeFi is Broken",
      description: "You can only borrow against assets you already have. We cannot build a real economy until we can borrow against future income.",
      color: "text-red-400"
    },
    {
      icon: Eye,
      title: "The Data Gap",
      description: "Banks verify income by demanding 3 months of bank statements — a massive privacy invasion. Crypto protocols have zero access to this data.",
      color: "text-orange-400"
    },
    {
      icon: FileCheck,
      title: "Identity Theft Risk",
      description: "Uploading paystubs to web portals is a security nightmare. Remember the Equifax breach? 147 million people exposed.",
      color: "text-yellow-400"
    }
  ]

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Problem with <span className="gradient-text">Traditional Credit</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The current financial system forces you to choose between privacy and access to credit.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-aura-dark to-aura-light flex items-center justify-center mb-6 ${problem.color}`}>
                <problem.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Arrow pointing to solution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center mt-16"
        >
          <div className="flex flex-col items-center">
            <span className="text-aura-accent text-lg font-medium mb-2">The Aleo Solution</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-8 h-8 text-aura-primary rotate-90" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const HowItWorksPreview = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      step: "01",
      icon: Mail,
      title: "Paste Email Source",
      description: "Copy the raw source of your income email (paystub, offer letter, deposit alert).",
      detail: "Works with Gmail, Chase, ADP, Gusto, and more"
    },
    {
      step: "02",
      icon: Zap,
      title: "Income Extracted",
      description: "The system parses your email locally and extracts the income amount.",
      detail: "Email content is processed locally in your browser"
    },
    {
      step: "03",
      icon: Shield,
      title: "Receive Your Badge",
      description: "A private CreditBadge is minted to your Aleo wallet, proving your income tier.",
      detail: "Gold, Silver, or Bronze based on income"
    },
    {
      step: "04",
      icon: Coins,
      title: "Access Credit",
      description: "Use your badge to borrow from DeFi lending pools with better rates.",
      detail: "No documents stored, privacy preserved"
    }
  ]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aura-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How <span className="gradient-text">Aura</span> Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Zero-knowledge proof of income in 4 simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-aura-primary/50 to-transparent z-0" />
              )}
              
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative card h-full z-10"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center text-white font-bold text-sm glow">
                  {item.step}
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-aura-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-aura-primary" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                <p className="text-xs text-aura-accent">{item.detail}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/how-it-works">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

const FeaturesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: EyeOff,
      title: "Complete Privacy",
      description: "Your email content is processed locally in your browser. Only the commitment hash goes on-chain."
    },
    {
      icon: Shield,
      title: "On-Chain Credentials",
      description: "Private CreditBadges are minted as encrypted records on Aleo, visible only to you."
    },
    {
      icon: Globe,
      title: "Universal Access",
      description: "Works with emails from major banks, payroll providers, and employers."
    },
    {
      icon: TrendingUp,
      title: "Better Rates",
      description: "Higher income verification = lower interest rates. Good credit finally matters in DeFi."
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "No waiting for document review. Verification happens in seconds in your browser."
    },
    {
      icon: Users,
      title: "Composable",
      description: "Your CreditBadge works across Aleo DeFi protocols. One verification, endless possibilities."
    }
  ]

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="gradient-text">Aura</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The most advanced privacy-preserving credit protocol in Web3
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aura-primary/20 to-aura-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-aura-primary group-hover:text-aura-accent transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-aura-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const BadgeTiersSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const tiers = [
    {
      name: "Bronze",
      icon: "🥉",
      income: "$25,000+",
      maxLoan: "$10,000",
      rate: "12% APY",
      color: "from-amber-700 to-amber-900",
      borderColor: "border-amber-700/50",
      features: ["Basic lending access", "Standard rates", "1x loan multiplier"]
    },
    {
      name: "Silver",
      icon: "🥈",
      income: "$75,000+",
      maxLoan: "$20,000",
      rate: "9% APY",
      color: "from-gray-400 to-gray-600",
      borderColor: "border-gray-400/50",
      features: ["Priority lending", "Reduced rates", "2x loan multiplier"]
    },
    {
      name: "Gold",
      icon: "🥇",
      income: "$150,000+",
      maxLoan: "$30,000",
      rate: "6% APY",
      color: "from-yellow-400 to-yellow-600",
      borderColor: "border-yellow-400/50",
      features: ["Premium pools", "Best rates", "3x loan multiplier"],
      featured: true
    }
  ]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-aura-darker via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="gradient-text">CreditBadge</span> Tiers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your verified income determines your badge tier and lending benefits
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative rounded-2xl p-8 ${
                tier.featured 
                  ? 'bg-gradient-to-br from-aura-light to-aura-dark border-2 border-yellow-400/30 glow-gold' 
                  : 'glass border border-aura-primary/10'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-black text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <motion.span 
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {tier.icon}
                </motion.span>
              </div>
              
              <h3 className={`text-2xl font-bold text-center mb-2 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                {tier.name} Badge
              </h3>
              
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">Annual Income</p>
                <p className="text-2xl font-bold text-white">{tier.income}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-aura-primary/10">
                  <span className="text-gray-400">Max Loan</span>
                  <span className="font-bold text-white">{tier.maxLoan}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-aura-primary/10">
                  <span className="text-gray-400">Interest Rate</span>
                  <span className="font-bold text-aura-success">{tier.rate}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-aura-success mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/verify" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    tier.featured
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:shadow-lg hover:shadow-yellow-400/25'
                      : 'btn-secondary'
                  }`}
                >
                  Get {tier.name} Badge
                </motion.button>
              </Link>
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
    <section ref={ref} className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-12 overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-aura-primary/20 to-aura-accent/20" />
          <div className="absolute inset-0 glass" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl neon-border" />
          
          {/* Content */}
          <div className="relative text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-32 h-32 bg-aura-accent/10 rounded-full blur-3xl"
            />
            
            <Sparkles className="w-12 h-12 text-aura-accent mx-auto mb-6" />
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Prove Your Worth?
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands who have unlocked DeFi credit without sacrificing their privacy. 
              Get your CreditBadge in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/verify">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
                >
                  <Shield className="w-5 h-5" />
                  <span>Start Verification</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <a 
                href="https://faucet.aleo.org" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Get Testnet Credits
                </motion.button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomePage

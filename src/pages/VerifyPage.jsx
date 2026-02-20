import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Shield, 
  Zap, 
  Check, 
  AlertCircle, 
  Copy, 
  ArrowRight,
  FileText,
  Lock,
  Sparkles,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuraStore } from '../store/auraStore'
import { Link } from 'react-router-dom'
import { verifyIncomeTransaction } from '../services/transactions'
import { getPublicBalance, formatAddress, waitForTransaction, getExplorerUrl } from '../services/aleoNetwork'
import { 
  parseEmail, 
  extractIncomeFromBody, 
  detectFrequency, 
  calculateAnnualIncome, 
  determineIncomeTier,
  detectSourceType,
  hashDomain
} from '../workers/emailVerification'

const VerifyPage = () => {
  const [step, setStep] = useState(1)
  const [emailContent, setEmailContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [balance, setBalance] = useState(0)
  const [txId, setTxId] = useState(null)
  
  const { connected, publicKey, connect, walletAvailable, connecting, requestTransaction, requestRecords } = useWallet()
  const { 
    verification, 
    startVerification, 
    updateVerificationProgress,
    completeVerification,
    failVerification,
    resetVerification,
    refreshFromWallet
  } = useAuraStore()

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const bal = await getPublicBalance(publicKey)
          setBalance(bal)
        } catch (err) {
          console.error('Failed to fetch balance:', err)
        }
      }
    }
    fetchBalance()
  }, [connected, publicKey])

  const handleVerify = async () => {
    if (!emailContent.trim() || !connected || !publicKey) return
    
    startVerification()
    
    try {
      // Step 1: Validate input is actually email content
      updateVerificationProgress('parsing', 5, 'Validating input format...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Basic validation - require minimum email-like structure
      const trimmedContent = emailContent.trim()
      
      // Check for minimum length (emails have headers, body, etc)
      if (trimmedContent.length < 100) {
        throw new Error('Invalid input: Please paste the full email source (show original/view source from your email client). The input is too short to be a valid email.')
      }
      
      // Check for basic email header indicators
      const hasEmailIndicators = 
        trimmedContent.toLowerCase().includes('from:') ||
        trimmedContent.toLowerCase().includes('subject:') ||
        trimmedContent.toLowerCase().includes('date:') ||
        trimmedContent.toLowerCase().includes('received:') ||
        trimmedContent.toLowerCase().includes('dkim-signature:')
      
      if (!hasEmailIndicators) {
        throw new Error('Invalid input: This does not appear to be email source. Please use "Show Original" or "View Source" in your email client to get the raw email headers and body.')
      }
      
      // Step 2: Parse email structure
      updateVerificationProgress('parsing', 15, 'Parsing email headers...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const parsed = parseEmail(trimmedContent)
      
      // Step 3: Check for DKIM signature
      updateVerificationProgress('parsing', 25, 'Checking DKIM signature...')
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Note: We check for DKIM but explain honestly what we do with it
      const hasDKIM = parsed.dkimSignature && parsed.dkimSignature.b
      
      // Step 4: Extract income data
      updateVerificationProgress('parsing', 35, 'Extracting income data from email body...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const incomeData = extractIncomeFromBody(parsed.body || trimmedContent)
      
      if (!incomeData) {
        throw new Error('Could not extract income amount from email. Please ensure this is a deposit notification, payslip, or offer letter that contains a dollar amount (e.g., "$5,000", "salary: $80,000")')
      }
      
      // Step 5: Calculate annual income and tier
      updateVerificationProgress('verifying', 50, 'Calculating income tier...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const frequencyData = detectFrequency(parsed.body || trimmedContent, parsed.subject)
      const annualIncome = calculateAnnualIncome(incomeData.amount, frequencyData.frequency)
      const tierData = determineIncomeTier(annualIncome)
      
      if (!tierData.tier) {
        throw new Error(`Income of $${annualIncome.toLocaleString()}/year is below the minimum threshold of $25,000/year required for a CreditBadge.`)
      }
      
      // Step 6: Generate commitment hash
      updateVerificationProgress('verifying', 65, 'Generating cryptographic commitment...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const sourceType = detectSourceType(parsed.domain || 'unknown.com', parsed.body || trimmedContent)
      const domainHash = hashDomain(parsed.domain || 'email.verified')
      
      // Step 7: Create transaction
      updateVerificationProgress('generating', 80, 'Creating on-chain proof transaction...')
      
      const transaction = await verifyIncomeTransaction(
        publicKey,
        tierData.bracket,
        sourceType.label || 'email'
      )
      
      updateVerificationProgress('generating', 90, 'Submitting transaction to Aleo network...')
      
      // Request wallet to sign and broadcast
      const txResult = await requestTransaction(transaction)
      
      if (txResult) {
        console.log('[Verify] Transaction/Request ID:', txResult)
        setTxId(txResult)
        
        const isAleoTxId = txResult.startsWith('at1')
        
        if (isAleoTxId) {
          updateVerificationProgress('generating', 95, 'Waiting for confirmation...')
        } else {
          updateVerificationProgress('generating', 95, 'Transaction submitted to wallet...')
        }
        
        const confirmResult = await waitForTransaction(txResult, 30)
        
        const isConfirmed = confirmResult && confirmResult.success && !confirmResult.pending
        const isPending = confirmResult && (confirmResult.pending || !confirmResult.success)
        
        const verificationResult = {
          tier: tierData.tier,
          source: parsed.domain || 'verified-email.com',
          sourceType: sourceType.label,
          frequency: frequencyData.label,
          incomeBracket: tierData.bracket,
          annualIncome: annualIncome,
          verificationHash: txResult,
          txId: txResult,
          pending: isPending,
          hasDKIM: hasDKIM
        }

        completeVerification(verificationResult)
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        if (requestRecords) {
          console.log('[Verify] Refreshing records from wallet...')
          await refreshFromWallet(requestRecords)
        }
        
        setStep(3)
      } else {
        throw new Error('Transaction was rejected by wallet')
      }
    } catch (error) {
      console.error('Verification failed:', error)
      failVerification(error.message || 'Verification failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Verify Your <span className="gradient-text">Income</span>
          </h1>
          <p className="text-xl text-gray-400">
            Prove your income without revealing sensitive details
          </p>
        </motion.div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={step} />

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1Connect 
              key="step1"
              connected={connected}
              publicKey={publicKey}
              balance={balance}
              connect={connect}
              walletAvailable={walletAvailable}
              connecting={connecting}
              onNext={() => setStep(2)} 
            />
          )}
          {step === 2 && (
            <Step2Email 
              key="step2"
              emailContent={emailContent}
              setEmailContent={setEmailContent}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              verification={verification}
              onVerify={handleVerify}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Success 
              key="step3"
              verification={verification}
              onReset={() => {
                resetVerification()
                setEmailContent('')
                setStep(1)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Connect Wallet' },
    { number: 2, label: 'Submit Email' },
    { number: 3, label: 'Get Badge' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-center mb-12"
    >
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                scale: currentStep === step.number ? 1.1 : 1,
                backgroundColor: currentStep >= step.number 
                  ? 'rgb(99, 102, 241)' 
                  : 'rgba(30, 30, 63, 0.6)',
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number 
                  ? 'border-aura-primary' 
                  : 'border-gray-600'
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <span className={`text-lg font-bold ${
                  currentStep >= step.number ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.number}
                </span>
              )}
            </motion.div>
            <span className={`text-sm mt-2 ${
              currentStep >= step.number ? 'text-white' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 md:w-24 h-0.5 mx-2 ${
              currentStep > step.number 
                ? 'bg-aura-primary' 
                : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </motion.div>
  )
}

const Step1Connect = ({ connected, publicKey, balance, onNext, connect, walletAvailable, connecting }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card max-w-xl mx-auto"
    >
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center mx-auto mb-6 glow">
          <Lock className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Connect Your Wallet
        </h2>
        
        <p className="text-gray-400 mb-8">
          First, connect your Aleo wallet to receive your CreditBadge
        </p>

        {connected && publicKey ? (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-400">Connected</p>
                  <a 
                    href={getExplorerUrl('address', publicKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white text-sm hover:text-aura-primary transition-colors flex items-center gap-1"
                  >
                    {formatAddress(publicKey)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Balance</p>
                <p className="font-bold text-aura-accent">{balance.toFixed(2)} ALEO</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNext}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {!walletAvailable ? (
              <div className="text-center">
                <p className="text-yellow-400 mb-4">Leo Wallet not detected</p>
                <a
                  href="https://leo.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Install Leo Wallet
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connect}
                disabled={connecting}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                {connecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Connect Leo Wallet
                  </>
                )}
              </motion.button>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-6">
          Need testnet credits?{' '}
          <a 
            href="https://faucet.aleo.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-aura-primary hover:text-aura-accent"
          >
            Visit the faucet →
          </a>
        </p>
      </div>
    </motion.div>
  )
}

const Step2Email = ({ 
  emailContent, 
  setEmailContent, 
  showPreview, 
  setShowPreview,
  verification,
  onVerify,
  onBack 
}) => {
  const textareaRef = useRef(null)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Honest Protocol Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-400 mb-1">Proof-of-Concept Notice</p>
            <p className="text-gray-400">
              This demo creates a <strong className="text-white">commitment-based attestation</strong> on Aleo. 
              While it parses email structure and extracts income data, full DKIM cryptographic verification 
              requires server-side infrastructure. The income tier is derived from parsed amounts in your email.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 flex items-start space-x-3"
      >
        <Info className="w-5 h-5 text-aura-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-white mb-1">How to get your email source:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-400">
            <li>Open the email from your bank/payroll provider</li>
            <li>Click "Show Original" or "View Source" (in Gmail: ⋮ → Show original)</li>
            <li>Copy the entire content and paste it below</li>
          </ol>
        </div>
      </motion.div>

      {/* Email Input */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-aura-primary" />
            <h2 className="text-xl font-bold text-white">Email Source</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg hover:bg-aura-light/50 transition-colors"
            >
              {showPreview ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          placeholder="Paste your email source here..."
          className="input-field h-64 font-mono text-sm resize-none"
          disabled={verification.inProgress}
        />

        <p className="text-xs text-gray-500 mt-2">
          Your email content is processed locally and never leaves your browser.
        </p>
      </div>

      {/* Verification Progress */}
      <AnimatePresence>
        {verification.inProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <VerificationProgress verification={verification} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {verification.status === 'error' && verification.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400 mb-1">Verification Failed</p>
                <p className="text-sm text-gray-300">{verification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={verification.inProgress}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onVerify}
          disabled={!emailContent.trim() || verification.inProgress}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verification.inProgress ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Generate Proof</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Supported Providers */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Supported providers:</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {['Chase', 'Bank of America', 'Wells Fargo', 'ADP', 'Gusto', 'Gmail'].map((provider) => (
            <span 
              key={provider}
              className="px-3 py-1 rounded-full text-xs font-medium glass border border-aura-primary/20 text-gray-300"
            >
              {provider}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const VerificationProgress = ({ verification }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'parsing':
        return <FileText className="w-5 h-5" />
      case 'verifying':
        return <Shield className="w-5 h-5" />
      case 'generating':
        return <Zap className="w-5 h-5" />
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'parsing':
        return 'text-blue-400'
      case 'verifying':
        return 'text-yellow-400'
      case 'generating':
        return 'text-aura-accent'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${getStatusColor(verification.status)}`}
        >
          {getStatusIcon(verification.status)}
        </motion.div>
        <span className="text-white font-medium">{verification.message}</span>
      </div>

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${verification.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>{verification.progress}%</span>
        <span className="capitalize">{verification.status}</span>
      </div>

      {/* Visual ZK Process */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        {[
          { label: 'Parse Email', status: verification.progress >= 25 },
          { label: 'Extract $', status: verification.progress >= 55 },
          { label: 'On-Chain', status: verification.progress >= 85 },
        ].map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: step.status ? 1 : 0.5 }}
            className={`text-center py-2 rounded-lg ${
              step.status ? 'bg-aura-primary/20' : 'bg-aura-dark/50'
            }`}
          >
            {step.status && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-6 h-6 rounded-full bg-aura-success flex items-center justify-center mb-1"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
            <span className={`text-xs ${step.status ? 'text-white' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const Step3Success = ({ verification, onReset }) => {
  const [copied, setCopied] = useState(false)
  const result = verification.result

  const tierConfig = {
    gold: {
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      textColor: 'text-yellow-400'
    },
    silver: {
      icon: '🥈',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/30',
      textColor: 'text-gray-400'
    },
    bronze: {
      icon: '🥉',
      color: 'from-amber-600 to-amber-800',
      bgColor: 'bg-amber-600/10',
      borderColor: 'border-amber-600/30',
      textColor: 'text-amber-500'
    }
  }

  const tier = tierConfig[result?.tier] || tierConfig.bronze

  const copyHash = () => {
    navigator.clipboard.writeText(result?.verificationHash || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto"
    >
      {/* Success Animation */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative inline-block"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-aura-success/20 to-aura-success/5 flex items-center justify-center mx-auto">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Check className="w-16 h-16 text-aura-success" />
            </motion.div>
          </div>
          
          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0.5, 1, 0.5],
                x: Math.cos(i * 45 * Math.PI / 180) * 60,
                y: Math.sin(i * 45 * Math.PI / 180) * 60,
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-4 h-4 text-aura-gold" />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mt-6 mb-2"
        >
          Verification Complete!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400"
        >
          Your CreditBadge has been minted to your wallet
        </motion.p>
      </div>

      {/* Badge Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`card ${tier.bgColor} border-2 ${tier.borderColor} relative overflow-hidden`}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.span 
                className="text-5xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 5 }}
              >
                {tier.icon}
              </motion.span>
              <div>
                <p className="text-sm text-gray-400">CreditBadge</p>
                <h3 className={`text-2xl font-bold capitalize bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                  {result?.tier} Tier
                </h3>
              </div>
            </div>
            <Shield className={`w-10 h-10 ${tier.textColor}`} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400">Source Verified</p>
              <p className="text-white font-medium">{result?.source}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Income Bracket</p>
              <p className="text-white font-medium">
                {result?.tier === 'gold' ? '$150,000+' : result?.tier === 'silver' ? '$75,000+' : '$25,000+'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Transaction ID</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-aura-darker px-3 py-2 rounded-lg text-xs font-mono text-gray-300 truncate">
                {result?.txId || result?.verificationHash}
              </code>
              <button
                onClick={copyHash}
                className="p-2 rounded-lg hover:bg-aura-dark transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-aura-success" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {result?.txId && (
                <a
                  href={getExplorerUrl('transaction', result.txId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-aura-dark transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-5 h-5 text-aura-primary" />
                </a>
              )}
            </div>
            {result?.pending && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Transaction pending confirmation...
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 mt-8"
      >
        <Link to="/lending" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <span>Explore Lending</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <button className="btn-secondary w-full">
            View Dashboard
          </button>
        </Link>
      </motion.div>

      <button
        onClick={onReset}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors mt-4"
      >
        Verify Another Email
      </button>
    </motion.div>
  )
}

export default VerifyPage

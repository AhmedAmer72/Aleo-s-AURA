import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Percent, 
  DollarSign, 
  TrendingUp,
  Lock,
  AlertCircle,
  Check,
  ChevronDown,
  Info,
  Wallet,
  ArrowRight,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuraStore } from '../store/auraStore'
import { requestLoanTransaction } from '../services/transactions'
import { waitForTransaction, getExplorerUrl, AURA_PROGRAM_ID } from '../services/aleoNetwork'

const LendingPage = () => {
  const { connected, publicKey, requestTransaction, requestRecords, requestRecordPlaintexts, connect, reconnect, walletAvailable, connecting } = useWallet()
  const { badges, lendingPools, refreshFromWallet } = useAuraStore()
  const [selectedPool, setSelectedPool] = useState(null)
  const [loanAmount, setLoanAmount] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState(null)
  const [walletRecords, setWalletRecords] = useState([])
  const [needsReconnect, setNeedsReconnect] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const userTier = badges.length > 0 ? badges[0].tier : null

  const tierOrder = { bronze: 1, silver: 2, gold: 3 }
  const canAccessPool = (requiredBadge) => {
    if (!userTier) return false
    return tierOrder[userTier] >= tierOrder[requiredBadge]
  }
  
  // Fetch records from wallet when connected
  const fetchWalletRecords = async () => {
    if (connected && requestRecords) {
      try {
        const result = await requestRecords(AURA_PROGRAM_ID)
        console.log('[Lending] Wallet records result:', result)
        // Handle { records: [...] } format
        const records = result?.records || result || []
        const recordsArray = Array.isArray(records) ? records : []
        // Filter out spent records
        const unspentRecords = recordsArray.filter(r => r?.spent !== true)
        console.log('[Lending] Wallet records array:', recordsArray)
        console.log('[Lending] Unspent records:', unspentRecords)
        setWalletRecords(unspentRecords)
        return unspentRecords
      } catch (error) {
        console.error('[Lending] Failed to fetch records:', error)
        setWalletRecords([])
        return []
      }
    }
    return []
  }
  
  useEffect(() => {
    fetchWalletRecords()
  }, [connected, requestRecords])

  const handleBorrow = async () => {
    if (!selectedPool || !loanAmount || !connected || !publicKey) return
    
    setIsProcessing(true)
    setTxStatus({ type: 'pending', message: 'Fetching your CreditBadge from wallet...' })
    
    try {
      // Fetch CreditBadge records from wallet
      let badgeRecord = null
      let badgeRecordRaw = null  // Keep raw record for potential JSON format
      
      try {
        // First try to get record plaintexts (preferred method for transaction inputs)
        let recordsArray = []
        
        if (requestRecordPlaintexts) {
          try {
            const plaintextResult = await requestRecordPlaintexts(AURA_PROGRAM_ID)
            console.log('[Lending] Fetched record plaintexts:', plaintextResult)
            recordsArray = Array.isArray(plaintextResult) ? plaintextResult : (plaintextResult?.records || [])
          } catch (plaintextErr) {
            console.warn('[Lending] requestRecordPlaintexts failed, falling back:', plaintextErr)
          }
        }
        
        // Fallback to regular requestRecords if plaintexts not available
        if (recordsArray.length === 0 && requestRecords) {
          const result = await requestRecords(AURA_PROGRAM_ID)
          console.log('[Lending] Fetched records result:', result)
          const records = result?.records || result || []
          recordsArray = Array.isArray(records) ? records : []
        }
        
        console.log('[Lending] Records array:', recordsArray)
        
        // Find a CreditBadge record
        if (recordsArray.length > 0) {
          for (const record of recordsArray) {
            console.log('[Lending] Checking record:', record)
            
            // Case 1: Record is already a plaintext string (from requestRecordPlaintexts)
            if (typeof record === 'string' && record.includes('owner:')) {
              console.log('[Lending] Found plaintext record string')
              badgeRecord = record
              break
            }
            
            // Case 2: Record has a 'plaintext' or 'record_plaintext' property
            if (record?.plaintext && typeof record.plaintext === 'string') {
              console.log('[Lending] Found record with plaintext property')
              badgeRecord = record.plaintext
              break
            }
            if (record?.record_plaintext && typeof record.record_plaintext === 'string') {
              console.log('[Lending] Found record with record_plaintext property')
              badgeRecord = record.record_plaintext
              break
            }
            
            // Case 3: Record is an object - try to use it directly first (Leo Wallet may accept JSON)
            // Check if this is a CreditBadge record
            const isCreditBadge = record?.recordName === 'CreditBadge' || 
                                  (record?.program_id === AURA_PROGRAM_ID && record?.data?.income_bracket)
            
            // Skip spent records - they can't be used in transactions
            if (record?.spent === true) {
              console.log('[Lending] Skipping spent record:', record.id)
              continue
            }
            
            if (isCreditBadge) {
              // Log all record properties for debugging
              console.log('[Lending] Found CreditBadge record object')
              console.log('[Lending] Record keys:', Object.keys(record))
              console.log('[Lending] Full record:', JSON.stringify(record, null, 2))
              
              // Check if record has ciphertext (encrypted record)
              if (record.ciphertext || record.record_ciphertext) {
                console.log('[Lending] Using record ciphertext')
                badgeRecord = record.ciphertext || record.record_ciphertext
                break
              }
              
              // Check if record is already a stringified plaintext
              if (record.plaintext) {
                console.log('[Lending] Using record.plaintext')
                badgeRecord = record.plaintext
                break
              }
              
              // Save raw record - Leo Wallet should accept the record object
              // The wallet internally has the ciphertext to prove ownership
              badgeRecordRaw = record
              
              // Try different formats the wallet might accept:
              const data = record.data || {}
              const owner = record.owner
              
              // Clean up values
              const cleanValue = (val) => {
                if (!val) return ''
                const str = String(val)
                return str.replace('.private', '').replace('.public', '')
              }
              
              // Format 1: If we have _nonce, build full plaintext
              if (data._nonce) {
                const recordPlaintext = `{
  owner: ${owner}.private,
  income_bracket: ${cleanValue(data.income_bracket)}.private,
  expiry_timestamp: ${cleanValue(data.expiry_timestamp)}.private,
  nonce: ${cleanValue(data.nonce)}field.private,
  _nonce: ${cleanValue(data._nonce)}group.public
}`
                console.log('[Lending] Using format with _nonce')
                badgeRecord = recordPlaintext
                break
              }
              
              // Format 2: Try stringified JSON with all record data (what wallet adapter example shows)
              const jsonRecord = JSON.stringify(record)
              console.log('[Lending] Will try JSON format:', jsonRecord)
              // Don't set badgeRecord yet - let it fall through to use badgeRecordRaw
              
              break
            }
          }
        }
      } catch (err) {
        console.warn('[Lending] Could not fetch records from wallet:', err)
      }
      
      // Determine which record format to use
      // Leo Wallet expects record objects from requestRecords()
      // The wallet uses the internal ID to look up the ciphertext
      let recordToUse = badgeRecordRaw || badgeRecord
      
      if (!recordToUse) {
        throw new Error('No CreditBadge found in your wallet. Please verify your income first on the Verify page.')
      }
      
      // If we have a raw record object, try to format it for the wallet
      // Leo Wallet needs to match this to a record it knows about
      if (typeof recordToUse === 'object' && recordToUse !== null) {
        console.log('[Lending] Using record object with ID:', recordToUse.id)
        console.log('[Lending] Full record object:', JSON.stringify(recordToUse, null, 2))
        
        // Leo Wallet expects the record in the exact format from requestRecords
        // Don't modify it - just pass it through
      } else {
        console.log('[Lending] Using record plaintext string:', recordToUse)
      }
      
      console.log('[Lending] Record type being passed:', typeof recordToUse)
      
      setTxStatus({ type: 'pending', message: 'Preparing loan transaction...' })
      
      // Create the loan transaction with actual record
      const transaction = await requestLoanTransaction(
        publicKey,
        recordToUse,
        parseInt(loanAmount),
        selectedPool.id
      )
      
      setTxStatus({ type: 'pending', message: 'Please approve the transaction in your wallet...' })
      
      // Request wallet to sign and broadcast
      const txResult = await requestTransaction(transaction)
      
      if (txResult) {
        console.log('[Lending] Transaction ID:', txResult)
        setTxStatus({ type: 'pending', message: 'Transaction submitted. Waiting for wallet to process...' })
        
        // Wait a moment for the wallet to process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Refresh records from wallet to get new CreditBadge and LoanPosition
        if (requestRecords) {
          console.log('[Lending] Refreshing records from wallet...')
          await refreshFromWallet(requestRecords)
          // Also refresh local wallet records state
          await fetchWalletRecords()
        }
        
        setTxStatus({ 
          type: 'success', 
          message: 'Loan submitted! Your records have been updated.',
          txId: txResult 
        })
        
        // Close modal after short delay
        setTimeout(() => {
          setShowModal(false)
          setLoanAmount('')
          setTxStatus(null)
          setSelectedPool(null)
        }, 3000)
      } else {
        throw new Error('Transaction was rejected')
      }
    } catch (error) {
      console.error('Loan request failed:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Failed to process loan request'
      let showReconnect = false
      
      // The actual error might be in a different property
      const fullError = String(error.message || error.name || error)
      
      if (fullError.includes('Unspent record not found') || fullError.includes('record not found')) {
        errorMessage = 'Your CreditBadge was already used in a previous transaction. Please refresh your records by reconnecting your wallet, or verify your income again to get a new badge.'
        showReconnect = true
      } else if (fullError.includes('not a valid record type') || fullError.includes('INVALID_PARAMS')) {
        errorMessage = 'Your wallet cannot find the CreditBadge record. This can happen if: (1) The verify income transaction is still pending, (2) Your wallet needs to sync with the network. Try reconnecting or waiting a few minutes.'
        showReconnect = true
      } else if (fullError.includes('Permission Not Granted') || fullError.includes('NOT_GRANTED')) {
        errorMessage = 'Wallet permission denied. Please reconnect with OnChainHistory permission to access your records.'
        showReconnect = true
      } else if (fullError.includes('No CreditBadge found')) {
        errorMessage = 'No CreditBadge found. Please verify your income first on the Verify page, and wait for the transaction to confirm.'
        showReconnect = false
      } else if (fullError.includes('unknown error') || fullError.includes('Unknown error')) {
        // Leo Wallet wraps errors with generic message - the actual error was in console
        errorMessage = 'Transaction failed. This usually means your CreditBadge record was already used (spent). Please click "Refresh" to update your records, or verify your income again to get a new badge.'
        showReconnect = true
      }
      
      setNeedsReconnect(showReconnect)
      setTxStatus({ 
        type: 'error', 
        message: errorMessage,
        showReconnect
      })
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Lending <span className="gradient-text">Pools</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Access undercollateralized loans with your CreditBadge. Better badge = better rates.
          </p>
        </motion.div>

        {/* Reconnect Warning Banner */}
        {needsReconnect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 glass rounded-xl p-4 border border-yellow-400/30 flex flex-col md:flex-row items-center justify-between"
          >
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Wallet Permission Required</p>
                <p className="text-gray-400 text-sm">Please reconnect your wallet to grant record access permissions</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await reconnect()
                  setNeedsReconnect(false)
                } catch (err) {
                  console.error('Reconnect failed:', err)
                }
              }}
              className="btn-primary px-4 py-2 text-sm"
            >
              Reconnect Wallet
            </button>
          </motion.div>
        )}

        {/* User Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {!connected || !publicKey ? (
            <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Wallet className="w-8 h-8 text-aura-primary" />
                <div>
                  <h3 className="text-lg font-bold text-white">Connect to Start Borrowing</h3>
                  <p className="text-gray-400">Connect your wallet and verify your income to access lending pools</p>
                </div>
              </div>
              {!walletAvailable ? (
                <a
                  href="https://leo.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Install Leo Wallet
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={connect}
                  disabled={connecting}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </>
                  )}
                </motion.button>
              )}
            </div>
          ) : badges.length === 0 && walletRecords.length === 0 ? (
            <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-yellow-400/30">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">No CreditBadge Found</h3>
                  <p className="text-gray-400">Verify your income first to unlock access to lending pools</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setIsRefreshing(true)
                    await fetchWalletRecords()
                    setIsRefreshing(false)
                  }}
                  disabled={isRefreshing}
                  className="btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh
                </button>
                <Link to="/verify">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Verify Income</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-aura-success/30">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {userTier === 'gold' ? '🥇' : userTier === 'silver' ? '🥈' : '🥉'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{userTier} Badge Active</h3>
                  <p className="text-gray-400">
                    You have access to {userTier === 'gold' ? 'all' : userTier === 'silver' ? 'Silver & Bronze' : 'Bronze'} tier pools
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button
                  onClick={async () => {
                    setIsRefreshing(true)
                    await fetchWalletRecords()
                    setIsRefreshing(false)
                  }}
                  disabled={isRefreshing}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Refresh records from wallet"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Max Loan</p>
                  <p className="text-xl font-bold text-aura-success">
                    ${(userTier === 'gold' ? 30000 : userTier === 'silver' ? 20000 : 10000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Lending Pools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lendingPools.map((pool, index) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              index={index}
              canAccess={canAccessPool(pool.requiredBadge)}
              userTier={userTier}
              onBorrow={() => {
                setSelectedPool(pool)
                setShowModal(true)
              }}
            />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total Value Locked', value: '$4.2M', icon: DollarSign },
            { label: 'Active Loans', value: '847', icon: TrendingUp },
            { label: 'Average APY', value: '8.5%', icon: Percent },
            { label: 'Default Rate', value: '0.2%', icon: Shield },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className="card text-center"
            >
              <stat.icon className="w-8 h-8 text-aura-primary mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Borrow Modal */}
      <AnimatePresence>
        {showModal && selectedPool && (
          <BorrowModal
            pool={selectedPool}
            amount={loanAmount}
            setAmount={setLoanAmount}
            onClose={() => {
              if (!isProcessing) {
                setShowModal(false)
                setLoanAmount('')
                setTxStatus(null)
              }
            }}
            onBorrow={handleBorrow}
            userTier={userTier}
            isProcessing={isProcessing}
            txStatus={txStatus}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const PoolCard = ({ pool, index, canAccess, userTier, onBorrow }) => {
  const utilizationPercent = (pool.utilized / pool.totalLiquidity) * 100
  
  const badgeConfig = {
    gold: { icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    silver: { icon: '🥈', color: 'text-gray-300', bg: 'bg-gray-400/10' },
    bronze: { icon: '🥉', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  }

  const config = badgeConfig[pool.requiredBadge]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`card relative overflow-hidden ${!canAccess ? 'opacity-60' : ''}`}
    >
      {/* Lock overlay for inaccessible pools */}
      {!canAccess && (
        <div className="absolute inset-0 bg-aura-darker/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Requires {pool.requiredBadge} badge</p>
          </div>
        </div>
      )}

      {/* Badge requirement */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg} mb-4`}>
        <span>{config.icon}</span>
        <span className={`text-sm font-medium ${config.color} capitalize`}>
          {pool.requiredBadge} Required
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{pool.name}</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Interest Rate</span>
          <span className="text-aura-success font-bold">{pool.apy}% APY</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Max Loan</span>
          <span className="text-white font-medium">${pool.maxLoan.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Available</span>
          <span className="text-white font-medium">
            ${((pool.totalLiquidity - pool.utilized) / 1000).toFixed(0)}K
          </span>
        </div>
      </div>

      {/* Utilization bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Pool Utilization</span>
          <span>{utilizationPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-aura-dark rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationPercent}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="h-full bg-gradient-to-r from-aura-primary to-aura-accent"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!canAccess}
        onClick={onBorrow}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Borrow Now
      </motion.button>
    </motion.div>
  )
}

const BorrowModal = ({ pool, amount, setAmount, onClose, onBorrow, userTier, isProcessing, txStatus }) => {
  const maxLoan = userTier === 'gold' ? 30000 : userTier === 'silver' ? 20000 : 10000
  const effectiveMax = Math.min(maxLoan, pool.maxLoan, pool.totalLiquidity - pool.utilized)
  
  const isValidAmount = amount && parseInt(amount) > 0 && parseInt(amount) <= effectiveMax

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-8 max-w-md w-full border border-aura-primary/20"
      >
        {/* Transaction Status Overlay */}
        {txStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-aura-darker/95 rounded-2xl flex items-center justify-center z-20"
          >
            <div className="text-center p-6">
              {txStatus.type === 'pending' && (
                <>
                  <Loader2 className="w-12 h-12 text-aura-primary mx-auto mb-4 animate-spin" />
                  <p className="text-white font-medium">{txStatus.message}</p>
                </>
              )}
              {txStatus.type === 'success' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-aura-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-aura-success" />
                  </div>
                  <p className="text-white font-medium mb-2">{txStatus.message}</p>
                  {txStatus.txId && (
                    <a
                      href={getExplorerUrl('transaction', txStatus.txId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-aura-primary hover:text-aura-accent text-sm flex items-center justify-center gap-1"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
              {txStatus.type === 'error' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-white font-medium mb-2">Transaction Failed</p>
                  <p className="text-red-400 text-sm mb-4">{txStatus.message}</p>
                  {txStatus.showReconnect && (
                    <button
                      onClick={async () => {
                        setTxStatus({ type: 'pending', message: 'Reconnecting wallet...' })
                        try {
                          await reconnect()
                          setTxStatus(null)
                          setNeedsReconnect(false)
                        } catch (err) {
                          setTxStatus({ type: 'error', message: 'Failed to reconnect. Please try manually.' })
                        }
                      }}
                      className="btn-primary mb-3"
                    >
                      Reconnect Wallet
                    </button>
                  )}
                  <button
                    onClick={() => onClose()}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
        
        <h2 className="text-2xl font-bold text-white mb-2">Borrow from {pool.name}</h2>
        <p className="text-gray-400 mb-6">Enter the amount you want to borrow</p>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Loan Amount (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              max={effectiveMax}
              className="input-field pl-12 text-2xl font-bold"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Min: $100</span>
            <span>Max: ${effectiveMax.toLocaleString()}</span>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[1000, 5000, 10000, effectiveMax].filter((value, index, arr) => arr.indexOf(value) === index).map((value, index) => (
            <button
              key={`amount-${index}-${value}`}
              onClick={() => setAmount(value.toString())}
              className="py-2 rounded-lg text-sm font-medium glass hover:bg-aura-light/50 transition-colors text-white"
            >
              {value >= 1000 ? `$${value / 1000}K` : `$${value}`}
            </button>
          ))}
        </div>

        {/* Loan Summary */}
        {amount && parseInt(amount) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-6 space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Principal</span>
              <span className="text-white">${parseInt(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Interest Rate</span>
              <span className="text-aura-success">{pool.apy}% APY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Est. Interest (1 year)</span>
              <span className="text-white">
                ${(parseInt(amount) * (pool.apy / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-aura-primary/20 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">Total Repayment</span>
                <span className="text-white">
                  ${(parseInt(amount) * (1 + pool.apy / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            disabled={!isValidAmount || isProcessing}
            onClick={onBorrow}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Confirm Borrow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center">
          <Info className="w-3 h-3 mr-1" />
          Loan terms: 12 months, no early repayment penalty
        </p>
      </motion.div>
    </motion.div>
  )
}

export default LendingPage

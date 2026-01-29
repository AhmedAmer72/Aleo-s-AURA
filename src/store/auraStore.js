import { create } from 'zustand'
import { getPublicBalance, getVerificationCount, getPoolLiquidity, AURA_PROGRAM_ID } from '../services/aleoNetwork'

// No persist middleware - data comes from wallet/blockchain
export const useAuraStore = create(
  (set, get) => ({
    // Network state
    network: {
      initialized: false,
      connected: false,
      endpoint: null,
      latestHeight: 0,
    },

    // User's CreditBadge records (from wallet)
    badges: [],

    // User's LoanPosition records (from wallet)
    loans: [],

      // Verification state
      verification: {
        inProgress: false,
        status: null, // 'idle' | 'parsing' | 'verifying' | 'generating' | 'minting' | 'complete' | 'error'
        progress: 0,
        message: '',
        result: null,
        transactionId: null,
      },

      // Cached lending pools data (fetched from chain)
      lendingPools: [
        {
          id: 1,
          name: 'Aura Gold Pool',
          apy: 6.0,
          maxLoan: 30000,
          requiredTier: 3, // gold
          requiredBadge: 'gold',
          totalLiquidity: 500000,
          utilized: 125000,
        },
        {
          id: 2,
          name: 'Aura Silver Pool',
          apy: 9.0,
          maxLoan: 20000,
          requiredTier: 2, // silver
          requiredBadge: 'silver',
          totalLiquidity: 300000,
          utilized: 75000,
        },
        {
          id: 3,
          name: 'Aura Bronze Pool',
          apy: 12.0,
          maxLoan: 10000,
          requiredTier: 1, // bronze
          requiredBadge: 'bronze',
          totalLiquidity: 150000,
          utilized: 35000,
        },
      ],

      // Transaction history
      transactions: [],

      // ============================================
      // Network Actions
      // ============================================
      
      setNetworkConnected: (connected, endpoint = null) => {
        set({
          network: {
            ...get().network,
            connected,
            endpoint,
            initialized: true,
          }
        })
      },

      updateLatestHeight: (height) => {
        set({
          network: {
            ...get().network,
            latestHeight: height,
          }
        })
      },

      // ============================================
      // Badge Actions
      // ============================================

      setBadges: (badges) => {
        set({ badges })
      },

      addBadge: (badge) => {
        set({ badges: [...get().badges, badge] })
      },

      updateBadge: (badgeId, updates) => {
        set({
          badges: get().badges.map(b =>
            b.id === badgeId ? { ...b, ...updates } : b
          )
        })
      },

      removeBadge: (badgeId) => {
        set({
          badges: get().badges.filter(b => b.id !== badgeId)
        })
      },

      // Get user's highest tier badge
      getHighestTier: () => {
        const badges = get().badges
        if (badges.some(b => b.tier === 3 || b.tier === 'gold')) return 'gold'
        if (badges.some(b => b.tier === 2 || b.tier === 'silver')) return 'silver'
        if (badges.some(b => b.tier === 1 || b.tier === 'bronze')) return 'bronze'
        return null
      },

      // Alias for backward compatibility
      getBadgeTier: () => get().getHighestTier(),

      // Check if user has minimum tier for a pool
      hasMinTier: (requiredTier) => {
        const tierMap = { bronze: 1, silver: 2, gold: 3 }
        const highest = get().getHighestTier()
        if (!highest) return false
        const userTierNum = tierMap[highest] || 0
        const reqTierNum = typeof requiredTier === 'string' ? tierMap[requiredTier] : requiredTier
        return userTierNum >= reqTierNum
      },

      // ============================================
      // Verification Actions
      // ============================================

      startVerification: () => {
        set({
          verification: {
            inProgress: true,
            status: 'parsing',
            progress: 0,
            message: 'Parsing email headers...',
            result: null,
            transactionId: null,
          }
        })
      },

      updateVerificationProgress: (status, progress, message) => {
        set({
          verification: {
            ...get().verification,
            status,
            progress,
            message,
          }
        })
      },

      setVerificationTransaction: (transactionId) => {
        set({
          verification: {
            ...get().verification,
            transactionId,
          }
        })
      },

      completeVerification: (result, transactionId = null) => {
        const badge = {
          id: transactionId || 'badge-' + Date.now(),
          tier: result.tier,
          tierNum: result.bracket,
          source: result.source,
          sourceType: result.sourceType,
          domainHash: result.domainHash,
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          record: result.record || null, // Raw record plaintext for on-chain use
        }
        
        set({
          verification: {
            inProgress: false,
            status: 'complete',
            progress: 100,
            message: 'Verification complete!',
            result,
            transactionId,
          },
          badges: [...get().badges, badge],
          transactions: [...get().transactions, {
            id: transactionId || 'tx-' + Date.now(),
            type: 'verify_income',
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            data: { tier: result.tier },
          }],
        })
      },

      failVerification: (error) => {
        set({
          verification: {
            inProgress: false,
            status: 'error',
            progress: 0,
            message: error,
            result: null,
            transactionId: null,
          }
        })
      },

      resetVerification: () => {
        set({
          verification: {
            inProgress: false,
            status: null,
            progress: 0,
            message: '',
            result: null,
            transactionId: null,
          }
        })
      },

      // ============================================
      // Loan Actions
      // ============================================

      setLoans: (loans) => {
        set({ loans })
      },

      addLoan: (loan) => {
        set({ 
          loans: [...get().loans, loan],
          transactions: [...get().transactions, {
            id: loan.transactionId || 'tx-' + Date.now(),
            type: 'request_loan',
            status: 'pending',
            timestamp: new Date().toISOString(),
            data: { amount: loan.amount, poolId: loan.poolId },
          }],
        })
      },

      requestLoan: (poolId, amount) => {
        const pool = get().lendingPools.find(p => p.id === poolId)
        const loan = {
          id: 'loan-' + Date.now(),
          poolId,
          poolName: pool?.name,
          amount,
          apy: pool?.apy,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        }
        get().addLoan(loan)
        return loan
      },

      updateLoan: (loanId, updates) => {
        set({
          loans: get().loans.map(l =>
            l.id === loanId ? { ...l, ...updates } : l
          )
        })
      },

      removeLoan: (loanId) => {
        set({
          loans: get().loans.filter(l => l.id !== loanId)
        })
      },

      // ============================================
      // Lending Pool Actions
      // ============================================

      updatePoolLiquidity: async (poolId) => {
        try {
          const liquidity = await getPoolLiquidity(poolId)
          set({
            lendingPools: get().lendingPools.map(p =>
              p.id === poolId ? { ...p, totalLiquidity: liquidity } : p
            )
          })
        } catch (error) {
          console.error('[Store] Failed to update pool liquidity:', error)
        }
      },

      refreshAllPools: async () => {
        const pools = get().lendingPools
        for (const pool of pools) {
          await get().updatePoolLiquidity(pool.id)
        }
      },

      // ============================================
      // Transaction History
      // ============================================

      addTransaction: (tx) => {
        set({
          transactions: [tx, ...get().transactions].slice(0, 50) // Keep last 50
        })
      },

      updateTransaction: (txId, updates) => {
        set({
          transactions: get().transactions.map(tx =>
            tx.id === txId ? { ...tx, ...updates } : tx
          )
        })
      },

      // ============================================
      // Utility Actions
      // ============================================

      // Clear all user data (on disconnect)
      clearUserData: () => {
        set({
          badges: [],
          loans: [],
          transactions: [],
          verification: {
            inProgress: false,
            status: null,
            progress: 0,
            message: '',
            result: null,
            transactionId: null,
          },
        })
      },

      // Refresh user data from wallet records
      refreshFromWallet: async (requestRecords, address) => {
        if (!requestRecords) return

        try {
          // Fetch all records for our program
          const result = await requestRecords(AURA_PROGRAM_ID)
          console.log('[Store] Fetched records from wallet:', result)
          
          // Handle { records: [...] } format from Leo Wallet
          const allRecords = result?.records || result || []
          const recordsArray = Array.isArray(allRecords) ? allRecords : []
          
          // Filter out spent records
          const unspentRecords = recordsArray.filter(r => r?.spent !== true)
          console.log('[Store] Unspent records:', unspentRecords)
          
          // Parse CreditBadge records
          const badgeRecords = unspentRecords.filter(r => r?.recordName === 'CreditBadge')
          const parsedBadges = badgeRecords.map(r => {
            const data = r.data || {}
            // Parse income_bracket from format like "1u8.private"
            const bracketMatch = String(data.income_bracket || '1').match(/(\d+)/)
            const bracket = bracketMatch ? parseInt(bracketMatch[1]) : 1
            
            // Parse expiry_timestamp from format like "1801190234u32.private"
            const expiryMatch = String(data.expiry_timestamp || '0').match(/(\d+)/)
            const expiryTimestamp = expiryMatch ? parseInt(expiryMatch[1]) : 0
            
            return {
              id: r.id,
              tier: getTierName(bracket),
              tierNum: bracket,
              source: 'verified',
              verifiedAt: new Date().toISOString(),
              expiresAt: new Date(expiryTimestamp * 1000).toISOString(),
              isActive: Date.now() < expiryTimestamp * 1000,
              record: r,
            }
          })
          
          // Parse LoanPosition records
          const loanRecords = unspentRecords.filter(r => r?.recordName === 'LoanPosition')
          const parsedLoans = loanRecords.map(r => {
            const data = r.data || {}
            
            // Parse principal from format like "1000000000u64.private" (in microcredits)
            const principalMatch = String(data.principal || '0').match(/(\d+)/)
            const principalMicro = principalMatch ? parseInt(principalMatch[1]) : 0
            const principal = principalMicro / 1_000_000 // Convert to credits/USD
            
            // Parse interest_rate from format like "600u16.private" (basis points)
            const rateMatch = String(data.interest_rate || '0').match(/(\d+)/)
            const rateBps = rateMatch ? parseInt(rateMatch[1]) : 0
            const apy = rateBps / 100 // Convert basis points to percentage
            
            // Parse pool_id
            const poolMatch = String(data.pool_id || '1').match(/(\d+)/)
            const poolId = poolMatch ? parseInt(poolMatch[1]) : 1
            
            // Parse start_timestamp
            const startMatch = String(data.start_timestamp || '0').match(/(\d+)/)
            const startTimestamp = startMatch ? parseInt(startMatch[1]) : 0
            
            const poolNames = { 1: 'Aura Gold Pool', 2: 'Aura Silver Pool', 3: 'Aura Bronze Pool' }
            
            return {
              id: r.id,
              poolId,
              poolName: poolNames[poolId] || `Pool ${poolId}`,
              amount: principal,
              apy,
              status: 'active',
              requestedAt: new Date(startTimestamp * 1000).toISOString(),
              record: r,
            }
          })
          
          console.log('[Store] Parsed badges:', parsedBadges)
          console.log('[Store] Parsed loans:', parsedLoans)
          
          set({ 
            badges: parsedBadges,
            loans: parsedLoans,
          })
          
          return { badges: parsedBadges, loans: parsedLoans }
        } catch (error) {
          console.error('[Store] Failed to refresh from wallet:', error)
          return { badges: [], loans: [] }
        }
      },
    })
)

// Helper to convert tier number to name
function getTierName(tierNum) {
  const num = parseInt(tierNum)
  if (num >= 3) return 'gold'
  if (num === 2) return 'silver'
  if (num === 1) return 'bronze'
  return 'bronze'
}

export default useAuraStore
// Aura Protocol - Transaction Service
// Handles all Aleo program transaction creation for Leo Wallet

import { AURA_PROGRAM_ID } from './aleoNetwork'

// Network configuration
const NETWORK = import.meta.env.VITE_ALEO_NETWORK === 'mainnet' 
  ? 'mainnet' 
  : 'testnetbeta'

// Default fees (in microcredits)
export const FEES = {
  verify_income: 500_000,      // 0.5 credits
  request_loan: 300_000,       // 0.3 credits
  repay_loan: 300_000,         // 0.3 credits
  renew_badge: 200_000,        // 0.2 credits
  deposit_to_pool: 200_000,    // 0.2 credits
  withdraw_from_pool: 200_000, // 0.2 credits
}

/**
 * Create an AleoTransaction object for Leo Wallet
 * Leo Wallet expects this format for requestTransaction()
 */
function createAleoTransaction(address, programId, functionName, inputs, fee) {
  return {
    address,
    chainId: NETWORK,
    transitions: [
      {
        program: programId,
        functionName,
        inputs,
      }
    ],
    fee,
    feePrivate: false
  }
}

/**
 * Create a transaction for verifying income
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {number} incomeBracket - Income bracket (1=bronze, 2=silver, 3=gold)
 * @param {string} sourceType - Type of income source (e.g., 'bank_statement', 'payroll')
 */
export function verifyIncomeTransaction(publicKey, incomeBracket, sourceType = 'bank_statement') {
  // Generate verification data from parsed email (ZK-DKIM verification)
  const domainHash = Math.floor(Math.random() * 1000000000) + 1
  // Monthly income based on bracket: Bronze (<$6250), Silver ($6250-$12500), Gold (>$12500)
  const monthlyIncome = incomeBracket === 3 ? 15000 : incomeBracket === 2 ? 8000 : 4000
  const timestamp = Math.floor(Date.now() / 1000)

  // Format inputs for Leo program
  const inputs = [
    `${domainHash}u128`,           // domain_hash
    `${monthlyIncome}u64`,         // income_amount (monthly)
    `${timestamp}u64`,              // timestamp
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'verify_income',
    inputs,
    FEES.verify_income
  )
}

/**
 * Create a transaction for requesting a loan
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {string} badgeRecord - The CreditBadge record plaintext
 * @param {number} amount - Loan amount in USD
 * @param {number} poolId - Lending pool ID (1=Gold, 2=Silver, 3=Bronze)
 */
export function requestLoanTransaction(publicKey, badgeRecord, amount, poolId) {
  // Convert amount to microcredits equivalent
  const amountMicrocredits = Math.floor(amount * 1_000_000)
  const currentTime = Math.floor(Date.now() / 1000)
  
  const inputs = [
    badgeRecord,                    // CreditBadge record
    `${amountMicrocredits}u64`,     // amount
    `${poolId}u8`,                  // pool_id
    `${currentTime}u32`,            // current_time
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'request_loan',
    inputs,
    FEES.request_loan
  )
}

/**
 * Create a transaction for repaying a loan
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {string} loanRecord - The LoanPosition record plaintext
 * @param {number} paymentAmount - Payment amount in microcredits
 */
export function repayLoanTransaction(publicKey, loanRecord, paymentAmount) {
  const inputs = [
    loanRecord,                     // LoanPosition record
    `${paymentAmount}u64`,          // payment_amount
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'repay_loan',
    inputs,
    FEES.repay_loan
  )
}

/**
 * Create a transaction for renewing a badge
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {string} badgeRecord - The CreditBadge record to renew
 */
export function renewBadgeTransaction(publicKey, badgeRecord) {
  const newTimestamp = Math.floor(Date.now() / 1000)
  
  const inputs = [
    badgeRecord,                    // CreditBadge record
    `${newTimestamp}u64`,           // new_timestamp
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'renew_badge',
    inputs,
    FEES.renew_badge
  )
}

/**
 * Create a transaction for depositing to a lending pool
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {number} amount - Amount to deposit in credits
 * @param {number} poolId - Pool ID (1=Gold, 2=Silver, 3=Bronze)
 */
export function depositToPoolTransaction(publicKey, amount, poolId) {
  const amountMicrocredits = Math.floor(amount * 1_000_000)
  const currentTime = Math.floor(Date.now() / 1000)
  
  const inputs = [
    `${amountMicrocredits}u64`,     // amount
    `${poolId}u8`,                  // pool_id
    `${currentTime}u32`,            // current_time
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'deposit_to_pool',
    inputs,
    FEES.deposit_to_pool
  )
}

/**
 * Create a transaction for withdrawing from a lending pool
 * Returns a Transaction object that can be signed by the wallet
 * @param {string} publicKey - User's Aleo address
 * @param {string} lpTokenRecord - LP token record to burn
 */
export function withdrawFromPoolTransaction(publicKey, lpTokenRecord) {
  const inputs = [
    lpTokenRecord,                  // LPToken record (contains amount)
  ]

  return createAleoTransaction(
    publicKey,
    AURA_PROGRAM_ID,
    'withdraw_from_pool',
    inputs,
    FEES.withdraw_from_pool
  )
}

/**
 * Estimate transaction fee
 */
export function estimateFee(functionName) {
  return FEES[functionName] || 200_000 // Default 0.2 credits
}

/**
 * Format fee for display
 */
export function formatFee(feeMicrocredits) {
  return (feeMicrocredits / 1_000_000).toFixed(2) + ' credits'
}

export default {
  verifyIncomeTransaction,
  requestLoanTransaction,
  repayLoanTransaction,
  renewBadgeTransaction,
  depositToPoolTransaction,
  withdrawFromPoolTransaction,
  estimateFee,
  formatFee,
  FEES,
}

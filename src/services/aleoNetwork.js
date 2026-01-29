// Aura Protocol - Aleo Network Service
// Real network integration with Aleo blockchain using REST API

// Network endpoints
const NETWORKS = {
  mainnet: 'https://api.explorer.provable.com/v1',
  testnet: 'https://api.explorer.provable.com/v1/testnet',
}

// Aura Protocol Program ID (V2 - Full Featured)
export const AURA_PROGRAM_ID = 'aurav2zkp.aleo'

// Get network endpoint
const getNetworkEndpoint = () => {
  const network = import.meta.env.VITE_ALEO_NETWORK || 'testnet'
  return NETWORKS[network] || NETWORKS.testnet
}

/**
 * Fetch from Aleo API
 */
async function fetchAleo(path) {
  const endpoint = getNetworkEndpoint()
  const response = await fetch(`${endpoint}${path}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

/**
 * Get account balance (public credits)
 */
export async function getPublicBalance(address) {
  try {
    const balance = await fetchAleo(`/program/credits.aleo/mapping/account/${address}`)
    
    if (balance) {
      // Balance is in microcredits (u64), convert to credits
      const balanceStr = typeof balance === 'string' ? balance : JSON.stringify(balance)
      const microcredits = parseInt(balanceStr.replace(/[^0-9]/g, ''))
      return microcredits / 1_000_000
    }
    return 0
  } catch (error) {
    console.error('[Aleo] Failed to get balance:', error)
    return 0
  }
}

/**
 * Get program from network
 */
export async function getProgram(programId) {
  try {
    const program = await fetchAleo(`/program/${programId}`)
    return program
  } catch (error) {
    console.error(`[Aleo] Failed to get program ${programId}:`, error)
    return null
  }
}

/**
 * Get mapping value from a program
 */
export async function getMappingValue(programId, mappingName, key) {
  try {
    const value = await fetchAleo(`/program/${programId}/mapping/${mappingName}/${key}`)
    return value
  } catch (error) {
    console.error(`[Aleo] Failed to get mapping ${mappingName}[${key}]:`, error)
    return null
  }
}

/**
 * Get transaction by ID
 */
export async function getTransaction(txId) {
  try {
    const tx = await fetchAleo(`/transaction/${txId}`)
    return tx
  } catch (error) {
    console.error(`[Aleo] Failed to get transaction ${txId}:`, error)
    return null
  }
}

/**
 * Get latest block height
 */
export async function getLatestHeight() {
  try {
    const height = await fetchAleo('/latest/height')
    return height
  } catch (error) {
    console.error('[Aleo] Failed to get latest height:', error)
    return 0
  }
}

/**
 * Get block by height
 */
export async function getBlock(height) {
  try {
    const block = await fetchAleo(`/block/${height}`)
    return block
  } catch (error) {
    console.error(`[Aleo] Failed to get block ${height}:`, error)
    return null
  }
}

/**
 * Check if a program is deployed
 */
export async function isProgramDeployed(programId) {
  try {
    const program = await getProgram(programId)
    return program !== null
  } catch {
    return false
  }
}

/**
 * Get verification count for an address from Aura program
 */
export async function getVerificationCount(address) {
  try {
    const value = await getMappingValue(AURA_PROGRAM_ID, 'verification_count', address)
    if (value) {
      return parseInt(value.replace('u64', ''))
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Get pool liquidity from Aura program
 */
export async function getPoolLiquidity(poolId) {
  try {
    const value = await getMappingValue(AURA_PROGRAM_ID, 'pool_liquidity', `${poolId}u8`)
    if (value) {
      return parseInt(value.replace('u64', '')) / 1_000_000
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Get public credit score from Aura program
 */
export async function getPublicCreditScore(address) {
  try {
    const value = await getMappingValue(AURA_PROGRAM_ID, 'public_credit_scores', address)
    if (value) {
      return parseInt(value.replace('u64', ''))
    }
    return null
  } catch {
    return null
  }
}

/**
 * Wait for transaction confirmation
 * @param {string} txId - Transaction ID (should start with 'at1' for Aleo transactions)
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} intervalMs - Interval between polls in milliseconds
 */
export async function waitForTransaction(txId, maxAttempts = 30, intervalMs = 2000) {
  // Validate transaction ID format
  if (!txId || typeof txId !== 'string') {
    console.warn('[Aleo] Invalid transaction ID:', txId)
    return { success: false, error: 'Invalid transaction ID' }
  }
  
  // Check if it's a valid Aleo transaction ID (starts with 'at1')
  if (!txId.startsWith('at1')) {
    console.warn('[Aleo] Transaction ID is not in Aleo format (expected at1...):', txId)
    // This might be a wallet request ID - we can't poll for it on the network
    // Return success with pending status so the UI can handle it
    return { 
      success: true, 
      pending: true, 
      requestId: txId,
      message: 'Transaction submitted to wallet. Check your wallet for status.' 
    }
  }
  
  console.log('[Aleo] Waiting for transaction:', txId)
  
  for (let i = 0; i < maxAttempts; i++) {
    const tx = await getTransaction(txId)
    
    // Transaction found on network
    if (tx) {
      // Check if it's a deploy or execute transaction (they have 'type' field)
      if (tx.type === 'deploy' || tx.type === 'execute') {
        console.log('[Aleo] Transaction confirmed:', txId)
        return { success: true, transaction: tx }
      }
      // For transactions with explicit status
      if (tx.status === 'confirmed') {
        console.log('[Aleo] Transaction confirmed:', txId)
        return { success: true, transaction: tx }
      }
      if (tx.status === 'rejected') {
        console.log('[Aleo] Transaction rejected:', txId)
        return { success: false, error: 'Transaction rejected', transaction: tx }
      }
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  
  console.log('[Aleo] Transaction timeout:', txId)
  return { success: false, error: 'Transaction timeout', pending: true }
}

/**
 * Parse Aleo record from string
 */
export function parseRecord(recordString) {
  try {
    // Parse record format: { owner: aleo1..., field1: value1, ... }
    const cleaned = recordString.replace(/\s+/g, ' ').trim()
    const match = cleaned.match(/\{([^}]+)\}/)
    if (!match) return null

    const fields = {}
    const parts = match[1].split(',')
    for (const part of parts) {
      const [key, value] = part.split(':').map(s => s.trim())
      if (key && value) {
        fields[key] = value
      }
    }
    return fields
  } catch {
    return null
  }
}

/**
 * Format credits for display
 */
export function formatCredits(microcredits, decimals = 2) {
  const credits = microcredits / 1_000_000
  return credits.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format address for display
 */
export function formatAddress(address, startChars = 6, endChars = 4) {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Validate Aleo address
 */
export function isValidAddress(address) {
  if (!address) return false
  return /^aleo1[a-z0-9]{58}$/.test(address)
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txId, type = 'transaction') {
  const network = import.meta.env.VITE_ALEO_NETWORK || 'testnet'
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.provable.com'
    : 'https://testnet.explorer.provable.com'
  
  switch (type) {
    case 'transaction':
      return `${baseUrl}/transaction/${txId}`
    case 'program':
      return `${baseUrl}/program/${txId}`
    case 'address':
      return `${baseUrl}/address/${txId}`
    default:
      return baseUrl
  }
}

export default {
  getPublicBalance,
  getProgram,
  getMappingValue,
  getTransaction,
  getLatestHeight,
  getBlock,
  isProgramDeployed,
  getVerificationCount,
  getPoolLiquidity,
  getPublicCreditScore,
  waitForTransaction,
  parseRecord,
  formatCredits,
  formatAddress,
  isValidAddress,
  getExplorerUrl,
  AURA_PROGRAM_ID,
}

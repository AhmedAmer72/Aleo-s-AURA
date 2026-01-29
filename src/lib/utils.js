import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency value
 */
export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value) {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value}`
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}

/**
 * Truncate string in middle
 */
export function truncateMiddle(str, startChars = 6, endChars = 4) {
  if (!str) return ''
  if (str.length <= startChars + endChars) return str
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`
}

/**
 * Delay utility
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Generate random ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Format relative time
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const diff = now - then
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

/**
 * Format date
 */
export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Parse query string
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

/**
 * Build query string
 */
export function buildQueryString(params) {
  return new URLSearchParams(params).toString()
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Get badge tier info
 */
export function getBadgeTierInfo(tier) {
  const tiers = {
    gold: {
      icon: '🥇',
      color: 'yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      textColor: 'text-yellow-400',
      minIncome: 150000,
      maxLoan: 30000,
      rate: 6,
    },
    silver: {
      icon: '🥈',
      color: 'gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/30',
      textColor: 'text-gray-400',
      minIncome: 75000,
      maxLoan: 20000,
      rate: 9,
    },
    bronze: {
      icon: '🥉',
      color: 'amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-500',
      minIncome: 25000,
      maxLoan: 10000,
      rate: 12,
    },
  }
  return tiers[tier] || tiers.bronze
}

/**
 * Validate Aleo address format
 */
export function isValidAleoAddress(address) {
  if (!address) return false
  return /^aleo1[a-z0-9]{58}$/.test(address)
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(key) {
  if (!key) return false
  return /^APrivateKey1zkp[a-zA-Z0-9]{50,}$/.test(key)
}

/**
 * Calculate loan repayment
 */
export function calculateRepayment(principal, apy, months = 12) {
  const monthlyRate = apy / 100 / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return {
    monthlyPayment: payment,
    totalPayment: payment * months,
    totalInterest: payment * months - principal,
  }
}

/**
 * Get network info
 */
export function getNetworkInfo(network = 'testnet') {
  const networks = {
    mainnet: {
      name: 'Aleo Mainnet',
      chainId: 1,
      endpoint: 'https://api.explorer.provable.com/v1',
      explorer: 'https://explorer.provable.com',
    },
    testnet: {
      name: 'Aleo Testnet',
      chainId: 0,
      endpoint: 'https://api.explorer.provable.com/v1/testnet',
      explorer: 'https://testnet.explorer.provable.com',
      faucet: 'https://faucet.aleo.org',
    },
  }
  return networks[network] || networks.testnet
}

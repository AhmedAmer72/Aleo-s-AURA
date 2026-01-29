import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuraStore } from '../store/auraStore'

/**
 * Custom hook for wallet connection
 */
export function useWallet() {
  const { wallet, connectWallet, disconnectWallet } = useAuraStore()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await connectWallet()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }, [connectWallet])

  const disconnect = useCallback(() => {
    disconnectWallet()
    setError(null)
  }, [disconnectWallet])

  return {
    wallet,
    isConnected: wallet.isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}

/**
 * Custom hook for verification process
 */
export function useVerification() {
  const {
    verification,
    startVerification,
    updateVerificationProgress,
    completeVerification,
    failVerification,
    resetVerification,
  } = useAuraStore()

  return {
    ...verification,
    start: startVerification,
    updateProgress: updateVerificationProgress,
    complete: completeVerification,
    fail: failVerification,
    reset: resetVerification,
  }
}

/**
 * Custom hook for badges
 */
export function useBadges() {
  const { badges, getBadgeTier } = useAuraStore()
  
  const highestTier = badges.length > 0 ? getBadgeTier() : null
  const hasBadge = badges.length > 0
  
  return {
    badges,
    hasBadge,
    highestTier,
    badgeCount: badges.length,
  }
}

/**
 * Custom hook for loans
 */
export function useLoans() {
  const { loans, lendingPools, requestLoan, repayLoan } = useAuraStore()
  
  const activeLoans = loans.filter(l => l.status === 'active')
  const totalBorrowed = activeLoans.reduce((sum, l) => sum + l.amount, 0)
  const totalPending = loans.filter(l => l.status === 'pending').length
  
  return {
    loans,
    activeLoans,
    totalBorrowed,
    totalPending,
    lendingPools,
    requestLoan,
    repayLoan,
  }
}

/**
 * Custom hook for local storage state
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

/**
 * Custom hook for media queries
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

/**
 * Custom hook for responsive design
 */
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  
  return { isMobile, isTablet, isDesktop }
}

/**
 * Custom hook for scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      setScrollPosition(position)
      setIsScrolled(position > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollPosition, isScrolled }
}

/**
 * Custom hook for intersection observer
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      ...options,
    })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])

  return { ref, isIntersecting, hasIntersected }
}

/**
 * Custom hook for debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for countdown timer
 */
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

/**
 * Custom hook for copy to clipboard
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }, [])

  return { copied, copy }
}

/**
 * Custom hook for animation on mount
 */
export function useAnimateOnMount(delay = 0) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return mounted
}

/**
 * Custom hook for outside click detection
 */
export function useOutsideClick(callback) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [callback])

  return ref
}

/**
 * Custom hook for keyboard shortcuts
 */
export function useKeyboardShortcut(key, callback, modifiers = {}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { ctrl = false, shift = false, alt = false, meta = false } = modifiers
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, modifiers])
}

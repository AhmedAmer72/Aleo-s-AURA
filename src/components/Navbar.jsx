import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Wallet, 
  Shield, 
  ChevronDown,
  LogOut,
  User,
  Coins,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuraStore } from '../store/auraStore'
import { getPublicBalance, formatAddress, getExplorerUrl } from '../services/aleoNetwork'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [balance, setBalance] = useState(0)
  const location = useLocation()
  
  // Custom wallet context
  const { connected, connecting, publicKey, connect, disconnect, walletAvailable } = useWallet()
  
  // Store for user data management
  const { clearUserData } = useAuraStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      getPublicBalance(publicKey).then(setBalance).catch(console.error)
    } else {
      setBalance(0)
    }
  }, [connected, publicKey])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      clearUserData()
      setShowWalletMenu(false)
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Verify Income', path: '/verify' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Lending', path: '/lending' },
    { name: 'How It Works', path: '/how-it-works' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-dark shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 rounded-xl overflow-hidden glow"
            >
              <img src="/aura-badge.png" alt="Aura" className="w-full h-full object-cover" />
            </motion.div>
            <span className="text-2xl font-bold gradient-text">AURA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-white bg-aura-primary/20 border border-aura-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:block relative">
            {connected && publicKey ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl glass border border-aura-primary/30 hover:border-aura-primary/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Connected</p>
                    <p className="text-sm font-medium text-white font-mono">
                      {formatAddress(publicKey)}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 glass rounded-xl border border-aura-primary/20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-aura-primary/10">
                        <div className="flex items-center space-x-3">
                          <Coins className="w-5 h-5 text-aura-gold" />
                          <div>
                            <p className="text-xs text-gray-400">Balance</p>
                            <p className="text-lg font-bold text-white">{balance.toFixed(2)} ALEO</p>
                          </div>
                        </div>
                      </div>
                      <a
                        href={getExplorerUrl(publicKey, 'address')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>View on Explorer</span>
                      </a>
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Disconnect</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aura-primary to-aura-secondary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>{walletAvailable ? 'Connect Wallet' : 'Install Leo Wallet'}</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-aura-primary/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-white bg-aura-primary/20 border border-aura-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-aura-primary/10">
                {connected && publicKey ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-gray-400">Balance:</span>
                      <span className="font-bold text-white">{balance.toFixed(2)} ALEO</span>
                    </div>
                    <button
                      onClick={() => {
                        handleDisconnect()
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleConnect()
                      setIsOpen(false)
                    }}
                    disabled={connecting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-aura-primary to-aura-secondary text-white font-medium disabled:opacity-50"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>{walletAvailable ? 'Connect Wallet' : 'Install Leo Wallet'}</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

// Custom Wallet Connect Button
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, ExternalLink, Copy, Check, Loader2, ChevronDown } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { formatAddress, getExplorerUrl, getPublicBalance } from '../services/aleoNetwork'

export function WalletButton({ className = '' }) {
  const { 
    connected, 
    connecting, 
    publicKey, 
    walletAvailable,
    connect, 
    disconnect 
  } = useWallet()
  
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState(0)

  // Fetch balance when connected
  React.useEffect(() => {
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

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Connect failed:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setShowMenu(false)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  if (connected && publicKey) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-aura-primary/20 to-aura-secondary/20 border border-aura-primary/30 hover:border-aura-primary/50 transition-all ${className}`}
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-medium">{formatAddress(publicKey)}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 rounded-xl bg-aura-darker/95 backdrop-blur-xl border border-aura-primary/20 shadow-xl z-50"
            >
              <div className="p-4 border-b border-aura-primary/10">
                <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm">{formatAddress(publicKey, 8, 6)}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-aura-light/30 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-4 border-b border-aura-primary/10">
                <p className="text-xs text-gray-400 mb-1">Balance</p>
                <p className="text-xl font-bold text-white">{balance.toFixed(2)} <span className="text-aura-primary text-sm">ALEO</span></p>
              </div>

              <div className="p-2">
                <a
                  href={getExplorerUrl('address', publicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-aura-light/30 transition-colors text-gray-300 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View on Explorer</span>
                </a>
                
                <button
                  onClick={handleDisconnect}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Disconnect</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleConnect}
      disabled={connecting}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aura-primary to-aura-secondary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 ${className}`}
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
  )
}

export default WalletButton

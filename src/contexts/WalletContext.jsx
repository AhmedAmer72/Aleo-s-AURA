// Custom Aleo Wallet Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AURA_PROGRAM_ID } from '../services/aleoNetwork'

const WalletContext = createContext(null)

// Constants
const DecryptPermission = {
  NoDecrypt: 'NO_DECRYPT',
  UponRequest: 'UPON_REQUEST',
  AutoDecrypt: 'AUTO_DECRYPT',
}

const WalletAdapterNetwork = {
  Mainnet: 'mainnet',
  Testnet: 'testnet',
  TestnetBeta: 'testnetbeta',
}

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [walletAvailable, setWalletAvailable] = useState(false)

  // Get the wallet object from window
  const getWallet = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Leo Wallet injects itself as window.leoWallet
      return window.leoWallet || window.leo || null
    }
    return null
  }, [])

  // Check if wallet extension is available
  useEffect(() => {
    const checkWallet = () => {
      const leoWallet = getWallet()
      setWalletAvailable(!!leoWallet)
      
      // If wallet is connected, update state
      if (leoWallet && leoWallet.publicKey) {
        setWallet(leoWallet)
        setPublicKey(leoWallet.publicKey)
        setConnected(true)
        console.log('[Wallet] Already connected:', leoWallet.publicKey)
      }
    }

    // Handle account changes
    const handleAccountChange = (event) => {
      console.log('[Wallet] Account changed:', event)
      const leoWallet = getWallet()
      if (leoWallet && leoWallet.publicKey) {
        setPublicKey(leoWallet.publicKey)
      }
    }

    // Handle disconnect
    const handleDisconnect = () => {
      console.log('[Wallet] Disconnected')
      setWallet(null)
      setPublicKey(null)
      setConnected(false)
    }

    // Check immediately
    checkWallet()
    
    // Check again after a delay (extension might load slowly)
    const timer = setTimeout(checkWallet, 1000)
    
    // Listen for wallet events
    const leoWallet = getWallet()
    if (leoWallet) {
      leoWallet.on?.('accountChange', handleAccountChange)
      leoWallet.on?.('disconnect', handleDisconnect)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('load', checkWallet)
    }

    return () => {
      clearTimeout(timer)
      if (leoWallet) {
        leoWallet.off?.('accountChange', handleAccountChange)
        leoWallet.off?.('disconnect', handleDisconnect)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', checkWallet)
      }
    }
  }, [getWallet])

  // Connect to wallet
  const connect = useCallback(async () => {
    const leoWallet = getWallet()
    
    if (!leoWallet) {
      // Open Leo Wallet download page
      window.open('https://www.leo.app/', '_blank')
      return
    }

    try {
      setConnecting(true)
      console.log('[Wallet] Requesting connection...')
      console.log('[Wallet] Available methods:', Object.keys(leoWallet))
      
      // Leo Wallet expects specific parameters for connect
      // DecryptPermission: "NO_DECRYPT" | "DECRYPT" | "AUTO_DECRYPT" | "UponRequest" | "OnChainHistory"
      // Network: "testnet" | "mainnet"
      // We need OnChainHistory to get record plaintexts for transactions
      const decryptPermission = 'OnChainHistory'
      const network = 'testnetbeta'
      const programs = [AURA_PROGRAM_ID] // Authorize our program
      
      let result
      try {
        // Try connect with parameters
        result = await leoWallet.connect(decryptPermission, network, programs)
        console.log('[Wallet] Connect result:', result)
      } catch (e1) {
        console.log('[Wallet] Connect with params failed, trying without:', e1.message)
        try {
          // Try without parameters
          result = await leoWallet.connect()
          console.log('[Wallet] Connect (no params) result:', result)
        } catch (e2) {
          console.log('[Wallet] Connect without params failed:', e2.message)
          // Try requestAccess as last resort (Puzzle Wallet style)
          if (leoWallet.requestAccess) {
            result = await leoWallet.requestAccess()
            console.log('[Wallet] requestAccess result:', result)
          }
        }
      }
      
      // After connect, check for the address in various places
      await new Promise(resolve => setTimeout(resolve, 200))
      
      let address = null
      
      // Check different possible locations for the address
      if (result && typeof result === 'string') {
        address = result
      } else if (result && result.address) {
        address = result.address
      } else if (result && result.publicKey) {
        address = result.publicKey
      } else if (leoWallet.publicKey) {
        address = leoWallet.publicKey
      } else if (leoWallet.address) {
        address = leoWallet.address
      }
      
      // Try getSelectedAccount if available
      if (!address && leoWallet.getSelectedAccount) {
        try {
          const account = await leoWallet.getSelectedAccount()
          console.log('[Wallet] getSelectedAccount:', account)
          address = account?.address || account
        } catch (e) {
          console.log('[Wallet] getSelectedAccount failed:', e.message)
        }
      }
      
      if (address) {
        setWallet(leoWallet)
        setPublicKey(address)
        setConnected(true)
        console.log('[Wallet] Connected successfully:', address)
      } else {
        console.warn('[Wallet] Connected but no address found. Wallet state:', {
          publicKey: leoWallet.publicKey,
          address: leoWallet.address,
          result
        })
      }
    } catch (error) {
      console.error('[Wallet] Connection failed:', error)
      // Don't throw - just log the error so button stays clickable
    } finally {
      setConnecting(false)
    }
  }, [getWallet])

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    const leoWallet = getWallet()
    
    if (leoWallet) {
      try {
        await leoWallet.disconnect()
      } catch (error) {
        console.error('[Wallet] Disconnect error:', error)
      }
    }
    
    setWallet(null)
    setPublicKey(null)
    setConnected(false)
  }, [getWallet])

  // Reconnect with proper permissions (disconnect then connect)
  const reconnect = useCallback(async () => {
    console.log('[Wallet] Reconnecting with proper permissions...')
    await disconnect()
    // Small delay to ensure disconnect completes
    await new Promise(resolve => setTimeout(resolve, 500))
    await connect()
  }, [disconnect, connect])

  // Request transaction
  const requestTransaction = useCallback(async (transaction) => {
    const leoWallet = getWallet()
    
    if (!leoWallet || !connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await leoWallet.requestTransaction(transaction)
      // Log full result for debugging
      console.log('[Wallet] Full transaction result:', result)
      console.log('[Wallet] Result type:', typeof result)
      if (typeof result === 'object') {
        console.log('[Wallet] Result keys:', Object.keys(result || {}))
      }
      
      // Leo Wallet adapter should return the transaction ID string directly
      // But the raw wallet might return { transactionId: string } or other formats
      let txId = null
      
      if (typeof result === 'string') {
        txId = result
      } else if (result?.transactionId) {
        txId = result.transactionId
      } else if (result?.id) {
        txId = result.id
      } else if (result?.txId) {
        txId = result.txId
      } else if (result?.transaction_id) {
        txId = result.transaction_id
      }
      
      console.log('[Wallet] Extracted transaction ID:', txId)
      
      // Validate it looks like an Aleo transaction ID (starts with 'at1')
      if (txId && typeof txId === 'string') {
        if (txId.startsWith('at1')) {
          return txId
        } else {
          // It's a tracking/request ID, not the actual blockchain tx ID
          console.warn('[Wallet] Received request ID instead of transaction ID:', txId)
          // Return it anyway - the UI will handle the pending state
          return txId
        }
      }
      
      return null
    } catch (error) {
      console.error('[Wallet] Transaction failed:', error)
      throw error
    }
  }, [getWallet, connected])

  // Request records
  const requestRecords = useCallback(async (programId) => {
    const leoWallet = getWallet()
    
    if (!leoWallet || !connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await leoWallet.requestRecords(programId)
      return result
    } catch (error) {
      console.error('[Wallet] Get records failed:', error)
      throw error
    }
  }, [getWallet, connected])

  // Request record plaintexts (for transaction inputs)
  // This returns records in plaintext format suitable for transaction inputs
  const requestRecordPlaintexts = useCallback(async (programId) => {
    const leoWallet = getWallet()
    
    if (!leoWallet || !connected) {
      throw new Error('Wallet not connected')
    }

    try {
      // Try requestRecordPlaintexts first (requires OnChainHistory permission)
      if (leoWallet.requestRecordPlaintexts) {
        const result = await leoWallet.requestRecordPlaintexts(programId)
        console.log('[Wallet] requestRecordPlaintexts result:', result)
        return result
      }
      
      // Fallback: get records and try to get plaintext from them
      const records = await leoWallet.requestRecords(programId)
      console.log('[Wallet] Falling back to requestRecords:', records)
      
      // Records from Leo Wallet may have a 'plaintext' property
      // or we need to format them ourselves
      const recordsArray = records?.records || records || []
      
      return recordsArray.map(record => {
        // If record has plaintext property, use it
        if (record.plaintext) {
          return record.plaintext
        }
        // Otherwise return the record as-is (will be formatted in the component)
        return record
      })
    } catch (error) {
      console.error('[Wallet] Get record plaintexts failed:', error)
      throw error
    }
  }, [getWallet, connected])

  // Sign message
  const signMessage = useCallback(async (message) => {
    const leoWallet = getWallet()
    
    if (!leoWallet || !connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await leoWallet.signMessage(message)
      return result
    } catch (error) {
      console.error('[Wallet] Sign message failed:', error)
      throw error
    }
  }, [getWallet, connected])

  const value = {
    wallet,
    publicKey,
    connected,
    connecting,
    walletAvailable,
    connect,
    disconnect,
    reconnect,
    requestTransaction,
    requestRecords,
    requestRecordPlaintexts,
    signMessage,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export default WalletProvider

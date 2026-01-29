// Custom Leo Wallet hook that directly interfaces with the wallet extension
import { useState, useEffect, useCallback } from 'react'

export function useLeoWallet() {
  const [wallet, setWallet] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  // Check if Leo Wallet is available
  const isLeoWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.leoWallet !== undefined
  }, [])

  // Get the wallet object
  const getWallet = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.leoWallet || window.leo || null
    }
    return null
  }, [])

  // Connect to wallet
  const connect = useCallback(async () => {
    const leoWallet = getWallet()
    
    if (!leoWallet) {
      window.open('https://www.leo.app/', '_blank')
      return
    }

    try {
      setConnecting(true)
      
      // Request connection
      const result = await leoWallet.connect(
        DecryptPermission.UponRequest,
        WalletAdapterNetwork.TestnetBeta
      )
      
      if (result) {
        setWallet(leoWallet)
        setPublicKey(result.address || result)
        setConnected(true)
      }
    } catch (error) {
      console.error('[Leo Wallet] Connection failed:', error)
      throw error
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
        console.error('[Leo Wallet] Disconnect failed:', error)
      }
    }
    
    setWallet(null)
    setPublicKey(null)
    setConnected(false)
  }, [getWallet])

  // Request transaction
  const requestTransaction = useCallback(async (transaction) => {
    const leoWallet = getWallet()
    
    if (!leoWallet || !connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await leoWallet.requestTransaction(transaction)
      // Log full result for debugging
      console.log('[Leo Wallet] Full transaction result:', result)
      
      // Extract transaction ID from various possible formats
      let txId = null
      
      if (typeof result === 'string') {
        txId = result
      } else if (result?.transactionId) {
        txId = result.transactionId
      } else if (result?.id) {
        txId = result.id
      }
      
      console.log('[Leo Wallet] Extracted transaction ID:', txId)
      return typeof txId === 'string' ? txId : null
    } catch (error) {
      console.error('[Leo Wallet] Transaction failed:', error)
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
      console.error('[Leo Wallet] Get records failed:', error)
      throw error
    }
  }, [getWallet, connected])

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const leoWallet = getWallet()
      
      if (leoWallet && leoWallet.publicKey) {
        setWallet(leoWallet)
        setPublicKey(leoWallet.publicKey)
        setConnected(true)
      }
    }

    // Wait a bit for the extension to inject
    const timer = setTimeout(checkConnection, 500)
    return () => clearTimeout(timer)
  }, [getWallet])

  return {
    wallet,
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    requestTransaction,
    requestRecords,
    isLeoWalletAvailable: isLeoWalletAvailable(),
  }
}

// Constants from aleo-wallet-adapter-base
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

export default useLeoWallet

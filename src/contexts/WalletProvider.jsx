import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base'

export function WalletProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  // Wait for window to be available (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize wallet adapters
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const leoAdapter = new LeoWalletAdapter({
        appName: 'Aura Protocol',
      })
      console.log('[Wallet] Leo adapter created:', leoAdapter)
      return [leoAdapter]
    } catch (error) {
      console.error('[Wallet] Failed to create adapter:', error)
      return []
    }
  }, [mounted])

  // Handle wallet errors
  const onError = useCallback((error) => {
    console.error('[Wallet Error]', error)
  }, [])

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect={false}
      onError={onError}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  )
}

export default WalletProvider

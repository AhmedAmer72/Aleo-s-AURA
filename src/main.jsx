import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import App from './App.jsx'
import './index.css'

// Remove initial loader after React mounts
const removeLoader = () => {
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    loader.style.opacity = '0'
    setTimeout(() => loader.remove(), 500)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </WalletProvider>
  </React.StrictMode>,
)

// Remove loader after a short delay
setTimeout(removeLoader, 1000)

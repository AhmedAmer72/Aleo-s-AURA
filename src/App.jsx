import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import VerifyPage from './pages/VerifyPage'
import DashboardPage from './pages/DashboardPage'
import LendingPage from './pages/LendingPage'
import HowItWorksPage from './pages/HowItWorksPage'

function App() {
  return (
    <div className="noise relative">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lending" element={<LendingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </div>
  )
}

export default App

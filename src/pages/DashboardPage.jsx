import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  Plus,
  Settings,
  Bell
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuraStore } from '../store/auraStore'
import { getPublicBalance, formatAddress, getExplorerUrl } from '../services/aleoNetwork'

const DashboardPage = () => {
  const { connected, publicKey, requestRecords, connect, walletAvailable, connecting } = useWallet()
  const { badges, loans, transactions, refreshFromWallet } = useAuraStore()
  const [balance, setBalance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch balance and records on mount and when wallet changes
  useEffect(() => {
    const fetchData = async () => {
      if (connected && publicKey && requestRecords) {
        setIsRefreshing(true)
        try {
          const bal = await getPublicBalance(publicKey)
          setBalance(bal)
          
          // Refresh badges and loans from wallet records
          await refreshFromWallet(requestRecords)
          setIsLoaded(true)
        } catch (err) {
          console.error('Failed to fetch wallet data:', err)
        }
        setIsRefreshing(false)
      }
    }
    fetchData()
  }, [connected, publicKey, requestRecords, refreshFromWallet])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (connected && publicKey) {
        const bal = await getPublicBalance(publicKey)
        setBalance(bal)
        if (requestRecords) {
          await refreshFromWallet(requestRecords)
        }
      }
    } catch (err) {
      console.error('Refresh failed:', err)
    }
    setIsRefreshing(false)
  }

  if (!connected || !publicKey) {
    return <ConnectPrompt connect={connect} walletAvailable={walletAvailable} connecting={connecting} />
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your CreditBadges and loans
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl glass border border-aura-primary/20 hover:border-aura-primary/40 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-xl glass border border-aura-primary/20 hover:border-aura-primary/40 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
            </button>
            <a 
              href={getExplorerUrl('address', publicKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl glass border border-aura-primary/20 hover:border-aura-primary/40 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Credit Score"
            value={badges.length > 0 ? (badges[0].tier === 'gold' ? '850' : badges[0].tier === 'silver' ? '720' : '650') : '--'}
            change={badges.length > 0 ? '+12%' : null}
            trend="up"
            icon={TrendingUp}
          />
          <StatCard
            title="Active Badges"
            value={badges.length.toString()}
            icon={Shield}
            color="aura-accent"
          />
          <StatCard
            title="Total Borrowed"
            value={`$${loans.filter(l => l.status === 'approved' || l.status === 'active').reduce((acc, l) => acc + (l.amount || 0), 0).toLocaleString()}`}
            icon={ArrowDownRight}
          />
          <StatCard
            title="Available Credit"
            value={badges.length > 0 ? `$${(badges[0].tier === 'gold' ? 30000 : badges[0].tier === 'silver' ? 20000 : 10000).toLocaleString()}` : '$0'}
            icon={ArrowUpRight}
            color="aura-success"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badges Section */}
            <BadgesSection badges={badges} />
            
            {/* Active Loans */}
            <LoansSection loans={loans} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions hasBadge={badges.length > 0} />
            
            {/* Activity Feed */}
            <ActivityFeed badges={badges} loans={loans} />
          </div>
        </div>
      </div>
    </div>
  )
}

const ConnectPrompt = ({ connect, walletAvailable, connecting }) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-aura-primary to-aura-accent flex items-center justify-center mx-auto mb-6 glow">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400 mb-8">
          Connect your Aleo wallet to view your CreditBadges, loans, and manage your account.
        </p>
        <div className="flex flex-col items-center space-y-4">
          {!walletAvailable ? (
            <div className="text-center">
              <p className="text-yellow-400 mb-4">Leo Wallet not detected</p>
              <a
                href="https://leo.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                Install Leo Wallet
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connect}
              disabled={connecting}
              className="btn-primary px-8 py-3 flex items-center gap-2"
            >
              {connecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Connect Leo Wallet
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const StatCard = ({ title, value, change, trend, icon: Icon, color = 'aura-primary' }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-aura-success' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}

const BadgesSection = ({ badges }) => {
  const tierConfig = {
    gold: { icon: '🥇', color: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400/30' },
    silver: { icon: '🥈', color: 'from-gray-400 to-gray-600', border: 'border-gray-400/30' },
    bronze: { icon: '🥉', color: 'from-amber-600 to-amber-800', border: 'border-amber-600/30' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Your CreditBadges</h2>
        <Link to="/verify">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-2 text-sm text-aura-primary hover:text-aura-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Badge</span>
          </motion.button>
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No badges yet</p>
          <Link to="/verify">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="btn-primary"
            >
              Get Your First Badge
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {badges.map((badge, index) => {
            const config = tierConfig[badge.tier] || tierConfig.bronze
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-xl p-4 border ${config.border} flex items-center justify-between`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{config.icon}</span>
                  <div>
                    <h3 className={`font-bold capitalize bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                      {badge.tier} Badge
                    </h3>
                    <p className="text-sm text-gray-400">
                      Source: {badge.source || 'Verified Email'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Verified</p>
                  <p className="text-white text-sm">
                    {new Date(badge.verificationDate).toLocaleDateString()}
                  </p>
                  {badge.isActive && (
                    <span className="inline-flex items-center text-xs text-aura-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-aura-success mr-1" />
                      Active
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

const LoansSection = ({ loans }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Active Loans</h2>
        <Link to="/lending">
          <button className="text-sm text-aura-primary hover:text-aura-accent transition-colors">
            View All Pools →
          </button>
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No active loans</p>
          <Link to="/lending">
            <button className="text-sm text-aura-primary hover:text-aura-accent transition-colors">
              Explore Lending Pools →
            </button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-aura-primary/10">
                <th className="pb-3">Pool</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">APY</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aura-primary/10">
              {loans.map((loan) => (
                <tr key={loan.id} className="text-sm">
                  <td className="py-3 text-white font-medium">{loan.poolName}</td>
                  <td className="py-3 text-white">${loan.amount?.toLocaleString()}</td>
                  <td className="py-3 text-aura-accent">{loan.apy}%</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'approved' || loan.status === 'active'
                        ? 'bg-aura-success/20 text-aura-success' 
                        : loan.status === 'pending'
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-gray-400/20 text-gray-400'
                    }`}>
                      {loan.status === 'pending' && (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      {loan.status === 'active' ? 'Active' : loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}

const QuickActions = ({ hasBadge }) => {
  const actions = [
    { label: 'Verify Income', icon: Shield, path: '/verify', color: 'aura-primary' },
    { label: 'Borrow Funds', icon: ArrowDownRight, path: '/lending', color: 'aura-accent', disabled: !hasBadge },
    { label: 'Repay Loan', icon: ArrowUpRight, path: '/lending', color: 'aura-success' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.disabled ? '#' : action.path}
            className={action.disabled ? 'pointer-events-none' : ''}
          >
            <motion.button
              whileHover={!action.disabled ? { x: 4 } : {}}
              disabled={action.disabled}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                action.disabled 
                  ? 'bg-aura-dark/30 text-gray-500 cursor-not-allowed' 
                  : 'glass hover:bg-aura-light/50 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <action.icon className={`w-5 h-5 ${action.disabled ? 'text-gray-600' : `text-${action.color}`}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

const ActivityFeed = ({ badges, loans }) => {
  const activities = [
    ...badges.map(b => ({
      type: 'badge',
      message: `${b.tier.charAt(0).toUpperCase() + b.tier.slice(1)} Badge earned`,
      timestamp: b.verificationDate,
      icon: Shield,
      color: 'aura-accent'
    })),
    ...loans.map(l => ({
      type: 'loan',
      message: `$${l.amount?.toLocaleString()} loan ${l.status}`,
      timestamp: l.requestedAt,
      icon: l.status === 'approved' ? Check : Clock,
      color: l.status === 'approved' ? 'aura-success' : 'yellow-400'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card"
    >
      <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className={`w-8 h-8 rounded-full bg-${activity.color}/20 flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 text-${activity.color}`} />
              </div>
              <div>
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default DashboardPage

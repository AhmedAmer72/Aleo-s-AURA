import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const tierStyles = {
  gold: {
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    border: 'border-yellow-400/30',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    ring: 'ring-yellow-400/20',
    bg: 'bg-yellow-400/10',
    icon: '🥇',
    label: 'Gold',
  },
  silver: {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    border: 'border-gray-400/30',
    glow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]',
    ring: 'ring-gray-400/20',
    bg: 'bg-gray-400/10',
    icon: '🥈',
    label: 'Silver',
  },
  bronze: {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    ring: 'ring-amber-500/20',
    bg: 'bg-amber-500/10',
    icon: '🥉',
    label: 'Bronze',
  },
}

export function Badge({
  tier = 'bronze',
  size = 'md',
  animated = true,
  showLabel = true,
  className,
}) {
  const style = tierStyles[tier]
  
  const sizes = {
    sm: 'w-12 h-16',
    md: 'w-20 h-28',
    lg: 'w-32 h-44',
    xl: 'w-48 h-64',
  }

  return (
    <motion.div
      className={cn('relative flex flex-col items-center', className)}
      initial={animated ? { scale: 0, rotate: -10 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Badge Shape */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          sizes[size],
          style.glow,
          'rounded-t-full rounded-b-2xl',
          'border-2',
          style.border,
          animated && 'animate-float'
        )}
        style={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)`,
        }}
      >
        {/* Inner gradient */}
        <div
          className={cn(
            'absolute inset-1 rounded-t-full rounded-b-xl',
            'bg-gradient-to-br',
            style.gradient,
            'opacity-20'
          )}
        />
        
        {/* Icon */}
        <motion.span
          className={cn(
            size === 'sm' && 'text-xl',
            size === 'md' && 'text-4xl',
            size === 'lg' && 'text-6xl',
            size === 'xl' && 'text-8xl',
          )}
          animate={animated ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          } : false}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {style.icon}
        </motion.span>

        {/* Shimmer effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-t-full rounded-b-xl"
            initial={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ translateX: ['100%', '-100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}

        {/* Star decorations */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <motion.div
            className={cn(
              'w-3 h-3 rounded-full',
              'bg-gradient-to-br',
              style.gradient
            )}
            animate={animated ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : false}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div
          className={cn(
            'mt-2 px-3 py-1 rounded-lg',
            style.bg,
            'border',
            style.border
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span
            className={cn(
              'text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent',
              style.gradient
            )}
          >
            {style.label}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

export function BadgeMini({ tier = 'bronze', className }) {
  const style = tierStyles[tier]
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        style.bg,
        'border',
        style.border,
        className
      )}
    >
      <span>{style.icon}</span>
      <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', style.gradient)}>
        {style.label}
      </span>
    </span>
  )
}

export function BadgeRequirement({ tier, className }) {
  const requirements = {
    gold: { income: '$150k+', loan: '$30k', rate: '6%' },
    silver: { income: '$75k+', loan: '$20k', rate: '9%' },
    bronze: { income: '$25k+', loan: '$10k', rate: '12%' },
  }
  
  const style = tierStyles[tier]
  const req = requirements[tier]

  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        style.bg,
        'border',
        style.border,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{style.icon}</span>
        <span className={cn('font-semibold bg-gradient-to-r bg-clip-text text-transparent', style.gradient)}>
          {style.label} Tier
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-300">
        <p>Min Income: <span className="text-white">{req.income}</span></p>
        <p>Max Loan: <span className="text-white">{req.loan}</span></p>
        <p>APY Rate: <span className="text-white">{req.rate}</span></p>
      </div>
    </div>
  )
}

export default Badge

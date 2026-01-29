import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-white/5 border-white/10',
  glass: 'bg-white/[0.03] backdrop-blur-xl border-white/[0.08]',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
  glow: 'bg-white/5 border-aura-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  solid: 'bg-aura-dark/80 border-aura-primary/20',
}

export function Card({
  children,
  variant = 'default',
  className,
  hover = true,
  padding = true,
  onClick,
  as = 'div',
  ...props
}) {
  const Component = onClick ? motion.button : motion[as] || motion.div

  return (
    <Component
      className={cn(
        'relative rounded-2xl border overflow-hidden',
        variants[variant],
        padding && 'p-6',
        hover && 'transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-semibold text-white', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-gray-400 text-sm', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-white/10 flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export default Card

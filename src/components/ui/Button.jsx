import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-aura-primary hover:bg-aura-primary/90 text-white',
  secondary: 'bg-aura-secondary hover:bg-aura-secondary/90 text-white',
  outline: 'border-2 border-aura-primary text-aura-primary hover:bg-aura-primary hover:text-white',
  ghost: 'text-aura-primary hover:bg-aura-primary/10',
  gradient: 'bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent text-white hover:opacity-90',
  glow: 'bg-aura-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)]',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-10 py-4 text-xl',
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-aura-primary/50 focus:ring-offset-2 focus:ring-offset-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  )
}

export default Button

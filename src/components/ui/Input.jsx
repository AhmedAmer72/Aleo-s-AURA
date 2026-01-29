import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-white/5 border-white/10 focus:border-aura-primary',
  glass: 'bg-white/[0.03] backdrop-blur-xl border-white/[0.08] focus:border-aura-primary/50',
  ghost: 'bg-transparent border-transparent focus:bg-white/5 focus:border-aura-primary/30',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
}

export const Input = forwardRef(function Input(
  {
    type = 'text',
    variant = 'default',
    size = 'md',
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    className,
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded-xl border transition-all duration-300',
            'text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-aura-primary/30',
            variants[variant],
            sizes[size],
            icon && iconPosition === 'left' && 'pl-12',
            icon && iconPosition === 'right' && 'pr-12',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  {
    variant = 'default',
    size = 'md',
    label,
    error,
    hint,
    className,
    rows = 4,
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-xl border transition-all duration-300',
          'text-white placeholder:text-gray-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-aura-primary/30',
          variants[variant],
          sizes[size],
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
})

export default Input

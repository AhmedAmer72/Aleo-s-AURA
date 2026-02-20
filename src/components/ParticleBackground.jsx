import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const ParticleBackground = () => {
  const containerRef = useRef(null)
  
  // Generate random particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-aura-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-aura-accent/10 blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-aura-secondary/5 blur-[150px]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.id % 3 === 0 
              ? `rgba(245, 158, 11, ${0.2 + Math.random() * 0.3})`  // amber accent
              : `rgba(20, 184, 166, ${0.2 + Math.random() * 0.4})`, // teal
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.15, 0.6, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full opacity-8">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(4)].map((_, i) => (
          <motion.line
            key={i}
            x1="0%"
            y1={`${20 + i * 18}%`}
            x2="100%"
            y2={`${30 + i * 18}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 8,
              delay: i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default ParticleBackground

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Github, 
  Twitter, 
  MessageCircle,
  ExternalLink,
  Mail
} from 'lucide-react'

const Footer = () => {
  const footerLinks = {
    Protocol: [
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Verify Income', path: '/verify' },
      { name: 'Lending Pools', path: '/lending' },
      { name: 'Documentation', path: '#', external: true },
    ],
    Developers: [
      { name: 'GitHub', path: 'https://github.com', external: true },
      { name: 'API Reference', path: '#', external: true },
      { name: 'Leo Programs', path: '#', external: true },
      { name: 'Audit Reports', path: '#', external: true },
    ],
    Community: [
      { name: 'Discord', path: 'https://discord.com', external: true },
      { name: 'Twitter', path: 'https://twitter.com', external: true },
      { name: 'Blog', path: '#', external: true },
      { name: 'Forum', path: '#', external: true },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: MessageCircle, href: 'https://discord.com', label: 'Discord' },
    { icon: Mail, href: 'mailto:hello@aura.finance', label: 'Email' },
  ]

  return (
    <footer className="relative mt-20 border-t border-aura-primary/10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-aura-darker to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/aura-badge.png" alt="Aura" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold gradient-text">AURA</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              The Zero-Knowledge Proof of Income Protocol. Prove your creditworthiness 
              without revealing your identity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-aura-light/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-aura-primary/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-400 hover:text-white transition-colors group"
                      >
                        {link.name}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-aura-primary/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2026 Aura Protocol. Built on{' '}
            <a 
              href="https://aleo.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-aura-primary hover:text-aura-accent transition-colors"
            >
              Aleo
            </a>
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center text-gray-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Network: Testnet
            </span>
            <a 
              href="https://faucet.aleo.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-aura-primary hover:text-aura-accent transition-colors"
            >
              Get Testnet Credits →
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

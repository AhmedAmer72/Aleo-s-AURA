import Navbar from './Navbar'
import Footer from './Footer'
import ParticleBackground from './ParticleBackground'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type NavItem = { label: string; href: string; isAnchor?: boolean }

const dappLinks: NavItem[] = [
  { label: 'Balance', href: '/balance', isAnchor: false },
  { label: 'Contract', href: '/contract', isAnchor: false },
  { label: 'Verify', href: '/verify',  isAnchor: false },
]

export default function AppNavigation() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isApp = location.pathname !== '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (navRef.current) {
      gsap.to(navRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 })
    }
  }, [])

  const anchors: NavItem[] = isApp
    ? []
    : [
        { label: 'Network', href: '#network', isAnchor: true },
        { label: 'Products', href: '#products', isAnchor: true },
        { label: 'Developers', href: '#developers', isAnchor: true },
        { label: 'About', href: '#about', isAnchor: true },
      ]

  const allLinks = [...anchors, ...dappLinks]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.isAnchor) {
      e.preventDefault()
      const el = document.querySelector(item.href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      setMobileOpen(false)
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 lg:px-20 transition-all duration-300 opacity-0"
        style={{
          background: scrolled || isApp ? 'rgba(0,0,0,0.85)' : 'transparent',
          backdropFilter: scrolled || isApp ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled || isApp ? 'blur(16px)' : 'none',
        }}
      >
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="url(#logoGrad2)" strokeWidth="2" fill="none" />
              <path d="M14 8L8 11.5v5L14 20l6-3.5v-5L14 8z" stroke="url(#logoGrad2)" strokeWidth="1.5" fill="none" opacity="0.6" />
              <circle cx="14" cy="14" r="2" fill="#10B981" opacity="0.8" />
            </svg>
            <span className="text-white font-medium text-sm tracking-[0.02em]">HalalChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {allLinks.map((item) => {
              const Content = (
                <>
                  {item.label}
                  {!item.isAnchor && <span className="ml-2 text-[10px] text-[#10B981] font-mono">APP</span>}
                </>
              )
              if (item.isAnchor) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleClick(e, item)}
                    className="relative text-sm text-white/50 hover:text-white/90 transition-colors duration-300 group"
                  >
                    {Content}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full" />
                  </a>
                )
              }
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative text-sm text-white/50 hover:text-white/90 transition-colors duration-300 group"
                >
                  {Content}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isApp ? (
              <>
                <a href="#" className="text-sm text-white hover:underline transition-all">Documentation</a>
                <Link to="/balance" className="px-5 py-2 rounded-full text-[13px] font-medium bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                  Launch App
                </Link>
              </>
            ) : (
              <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
                Back to Home
              </Link>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-[20px] flex flex-col items-center justify-center">
          <button className="absolute top-5 right-6 text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-8">
            {allLinks.map((item) => {
              if (item.isAnchor) {
                return (
                  <a key={item.href} href={item.href} onClick={(e) => handleClick(e, item)}
                    className="text-white/80 hover:text-white text-4xl font-light transition-colors">
                    {item.label}
                  </a>
                )
              }
              return (
                <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                  className="text-white/80 hover:text-white text-4xl font-light transition-colors">
                  {item.label}
                </Link>
              )
            })}
            <Link to="/balance" onClick={() => setMobileOpen(false)}
              className="mt-4 px-8 py-3 rounded-full text-sm font-medium bg-[#10B981] text-black">
              Launch App
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

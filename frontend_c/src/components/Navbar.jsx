import { useState, useEffect } from 'react'
import { Button } from './ui'

const NAV_LINKS = [
  { label: 'How It Works', page: 'how-it-works' },
  { label: 'Services',     page: 'services' },
  { label: 'Mission',      page: 'mission' },
  { label: 'About',        page: 'about' },
  { label: 'Blog',         page: 'blog' },
  { label: 'FAQ',          page: 'faq' },
]

export default function Navbar({ onLoginClick, onRegisterClick, navigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNav = (page) => {
    navigate(page)
    setMenuOpen(false)
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-[var(--warm-white)]/92 backdrop-blur-xl shadow-sm border-b border-[var(--border)]'
          : 'bg-transparent'}
      `}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <nav className="flex items-center justify-between py-4">

          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 group cursor-pointer bg-transparent border-0">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--ember)] to-[var(--gold)] rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--ember)] to-[var(--ember-light)] flex items-center justify-center">
                <span className="text-white font-display font-black text-base leading-none">G</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-[var(--ink)] tracking-tight">Gaza</span>
              <span className="font-display font-bold text-lg text-[var(--ember)] tracking-tight -mt-0.5">Bridge</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, page }) => (
              <li key={label}>
                <button
                  onClick={() => handleNav(page)}
                  className={`
                    relative font-body text-sm transition-colors duration-300 cursor-pointer bg-transparent border-0
                    after:content-[''] after:absolute after:bottom-[-3px] after:left-0
                    after:h-[1.5px] after:bg-[var(--ember)] after:transition-all after:duration-300
                    ${currentPage === page
                      ? 'text-[var(--ember)] after:w-full'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] after:w-0 hover:after:w-full'}
                  `}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={onLoginClick} size="sm">Sign In</Button>
            <Button variant="primary" onClick={onRegisterClick} size="sm">
              Join Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer bg-transparent border-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[var(--ink)] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[var(--ink)] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[var(--ink)] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-[var(--warm-white)]/95 backdrop-blur-xl border-b border-[var(--border)] ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-6 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, page }) => (
            <button
              key={label}
              onClick={() => handleNav(page)}
              className={`font-body text-base text-left transition-colors cursor-pointer bg-transparent border-0 ${currentPage === page ? 'text-[var(--ember)]' : 'text-[var(--ink)] hover:text-[var(--ember)]'}`}
            >
              {label}
            </button>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={onLoginClick}>Sign In</Button>
            <Button variant="primary" onClick={onRegisterClick}>Join Free →</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
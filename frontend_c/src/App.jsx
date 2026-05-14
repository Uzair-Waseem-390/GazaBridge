import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ServicesPage from './pages/ServicesPage'
import FAQPage from './pages/FAQPage'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import MissionPage from './pages/MissionPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import TermsPage from './pages/legal/TermsPage'
import CookiePage from './pages/legal/CookiePage'

const PAGES = {
  home:           LandingPage,
  'how-it-works': HowItWorksPage,
  services:       ServicesPage,
  faq:            FAQPage,
  about:          AboutPage,
  blog:           BlogPage,
  mission:        MissionPage,
  privacy:        PrivacyPage,
  terms:          TermsPage,
  cookies:        CookiePage,
}

export default function App() {
  const [page, setPage] = useState('home')
  const [showLogin, setShowLogin] = useState(false)       // # placeholder
  const [showRegister, setShowRegister] = useState(false) // # placeholder

  const navigate = (to) => {
    setPage(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sharedProps = {
    navigate,
    currentPage: page,
    onLoginClick:    () => setShowLogin(true),
    onRegisterClick: () => setShowRegister(true),
  }

  const PageComponent = PAGES[page] || LandingPage

  return (
    <div className="grain-overlay">
      <PageComponent {...sharedProps} />
    </div>
  )
}
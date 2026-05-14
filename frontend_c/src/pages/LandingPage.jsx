import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MarqueeBanner from '../components/MarqueeBanner'
import HowItWorksSection from '../components/HowItWorksSection'
import SkillsSection from '../components/SkillsSection'
import VolunteersSection from '../components/VolunteersSection'
import StatsSection from '../components/StatsSection'
import TestimonialsSection from '../components/TestimonialsSection'
import VolunteerCTA from '../components/VolunteerCTA'
import Footer from '../components/Footer'

export default function LandingPage({ navigate, currentPage, onLoginClick, onRegisterClick }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <Navbar navigate={navigate} currentPage={currentPage} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <Hero onRegisterClick={onRegisterClick} onLoginClick={onLoginClick} />
      <MarqueeBanner />
      <HowItWorksSection navigate={navigate} />
      <SkillsSection />
      <StatsSection />
      <VolunteersSection onRegisterClick={onRegisterClick} />
      <TestimonialsSection />
      <VolunteerCTA navigate={navigate} onRegisterClick={onRegisterClick} />
      <Footer navigate={navigate} onRegisterClick={onRegisterClick} />
    </div>
  )
}
// frontend/src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import TrustUs from './components/TrustUs';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentProgress = (window.scrollY / totalScroll) * 100;
    setScrollProgress(currentProgress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Services />
        <TrustUs />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
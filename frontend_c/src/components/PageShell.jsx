import Navbar from './Navbar'
import Footer from './Footer'

export default function PageShell({ children, navigate, currentPage, onLoginClick, onRegisterClick }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)]">
      <Navbar
        navigate={navigate}
        currentPage={currentPage}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer navigate={navigate} onRegisterClick={onRegisterClick} />
    </div>
  )
}
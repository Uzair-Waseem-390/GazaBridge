import { Button } from './ui'

export default function VolunteerCTA({ navigate, onRegisterClick }) {
  return (
    <section className="py-24 bg-[var(--canvas)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-b from-[var(--ember)]/6 to-transparent blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 md:px-12 text-center">
        <div
          className="opacity-0-start animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ember)]/8 border border-[var(--ember)]/20 mb-8"
          style={{ animationFillMode: 'forwards' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ember)] animate-pulse" />
          <span className="font-mono text-xs text-[var(--ember)] tracking-widest uppercase">Open to everyone · Always free</span>
        </div>

        <h2
          className="opacity-0-start animate-fade-up font-display font-black text-5xl md:text-6xl text-[var(--ink)] mb-6 leading-tight"
          style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
        >
          Your skill could be<br />
          <span className="italic text-[var(--ember)] relative">
            someone's lifeline.
            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
              <path d="M0 5 Q100 1 200 4 Q300 7 400 3" stroke="var(--gold)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
        </h2>

        <p
          className="opacity-0-start animate-fade-up text-lg text-[var(--muted)] mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          Spend just a few hours a month. Teach what you know. Change a life in Gaza — and maybe your own.
        </p>

        <div
          className="opacity-0-start animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
        >
          <Button variant="primary" onClick={onRegisterClick} size="lg">
            Start Volunteering — It's Free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Button>
          <Button variant="secondary" onClick={() => navigate('how-it-works')} size="lg">
            Learn How It Works
          </Button>
        </div>
      </div>
    </section>
  )
}
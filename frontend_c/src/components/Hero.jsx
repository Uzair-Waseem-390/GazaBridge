import { Button, AvatarCluster, Badge } from './ui'

const AVATARS = ['AM', 'SR', 'KH', 'LM', 'TR']

export default function Hero({ onRegisterClick, onLoginClick }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">

      {/* ── Background Layers ─────────────────────────── */}
      {/* Warm radial canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--warm-white)] via-[var(--canvas)] to-[#ede5d0]" />

      {/* Large decorative circle top-right */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[var(--ember)]/8 to-[var(--gold)]/5 blur-3xl pointer-events-none" />

      {/* Small circle bottom-left */}
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[var(--olive)]/8 to-transparent blur-3xl pointer-events-none" />

      {/* Geometric lines — decorative SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#4a5c3f" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating orbs */}
      <div className="animate-float absolute top-[20%] right-[12%] w-16 h-16 rounded-full bg-gradient-to-br from-[var(--ember)]/20 to-[var(--gold)]/10 border border-[var(--ember)]/20 backdrop-blur-sm" />
      <div className="animate-float-delayed absolute top-[60%] right-[8%] w-8 h-8 rounded-full bg-gradient-to-br from-[var(--olive)]/20 to-transparent border border-[var(--olive)]/20" />
      <div className="animate-float absolute bottom-[25%] left-[6%] w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)]/15 to-transparent border border-[var(--gold)]/20" />

      {/* ── Content ───────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column */}
          <div className="flex flex-col gap-8">

            {/* Eyebrow */}
            <div
              className="opacity-0-start animate-fade-up"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--olive)]/8 border border-[var(--olive)]/15">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--olive)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--olive)]" />
                </span>
                <span className="font-mono text-xs text-[var(--olive)] tracking-widest uppercase font-medium">
                  Free · No Barriers · Global Community
                </span>
              </div>
            </div>

            {/* Headline */}
            <div
              className="opacity-0-start animate-fade-up"
              style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
            >
              <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[var(--ink)]">
                Building
                <span className="block italic text-[var(--ember)] relative">
                  Futures
                  {/* Underline stroke */}
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
                    <path d="M0 5 Q75 1 150 4 Q225 7 300 3" stroke="var(--gold)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="block">Across Borders</span>
              </h1>
            </div>

            {/* Subheadline */}
            <div
              className="opacity-0-start animate-fade-up"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              <p className="text-lg text-[var(--muted)] leading-relaxed max-w-lg font-body font-light">
                GazaBridge connects volunteers worldwide with people in Gaza—
                teaching <strong className="text-[var(--ink)] font-medium">digital skills</strong>, opening doors to
                <strong className="text-[var(--ink)] font-medium"> remote careers</strong>, and building
                <strong className="text-[var(--ink)] font-medium"> lasting hope</strong>. Completely free. Always.
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className="opacity-0-start animate-fade-up flex flex-wrap items-center gap-4"
              style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}
            >
              <Button variant="primary" onClick={onRegisterClick} size="lg">
                Start Learning Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              <Button variant="secondary" onClick={onRegisterClick} size="lg">
                Volunteer Today
              </Button>
            </div>

            {/* Social Proof */}
            <div
              className="opacity-0-start animate-fade-up"
              style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-4 pt-2">
                <AvatarCluster avatars={AVATARS} />
                <div>
                  <div className="text-sm font-body font-semibold text-[var(--ink)]">
                    2,400+ learners & volunteers
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">from 60+ countries joined this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Visual Card Stack */}
          <div className="hidden lg:flex items-center justify-center relative h-[540px]">

            {/* Rotating ring */}
            <div className="animate-rotate-slow absolute w-80 h-80 rounded-full border border-dashed border-[var(--ember)]/20" />
            <div className="animate-rotate-slow absolute w-64 h-64 rounded-full border border-[var(--gold)]/15" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />

            {/* Main featured card */}
            <div
              className="animate-float opacity-0-start animate-scale-in absolute z-10 w-72 bg-[var(--warm-white)] rounded-3xl shadow-2xl p-6 border border-[var(--border)]"
              style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--ember)] to-[var(--gold)] flex items-center justify-center text-white text-xl">
                  💻
                </div>
                <div>
                  <div className="font-body font-semibold text-[var(--ink)] text-sm">Web Development</div>
                  <div className="text-xs text-[var(--muted)]">Session in progress</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              {[
                { label: 'HTML & CSS', pct: '85%' },
                { label: 'JavaScript', pct: '62%' },
                { label: 'React',      pct: '40%' },
              ].map(({ label, pct }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                    <span>{label}</span><span>{pct}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--sand)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--ember)] to-[var(--gold)] transition-all duration-1000"
                      style={{ width: pct }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--olive)] to-[var(--olive-light)] flex items-center justify-center text-white text-xs font-bold">S</div>
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">Sarah M. — Volunteer</div>
                  <div className="text-xs text-[var(--muted)]">California, USA</div>
                </div>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div
              className="opacity-0-start animate-fade-up animate-float-delayed absolute top-10 right-8 z-20 bg-[var(--warm-white)] rounded-2xl shadow-xl px-4 py-3 border border-[var(--border)]"
              style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">New Certificate!</div>
                  <div className="text-xs text-[var(--muted)]">Ahmed completed UI Design</div>
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div
              className="opacity-0-start animate-fade-up animate-float absolute bottom-14 left-4 z-20 bg-[var(--ink)] rounded-2xl shadow-xl px-4 py-3"
              style={{ animationDelay: '1100ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <div>
                  <div className="text-xs font-semibold text-white">60+ Countries</div>
                  <div className="text-xs text-white/50">Volunteering today</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="opacity-0-start animate-fade-up mt-20 pt-10 border-t border-[var(--border)] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-[var(--border)]"
          style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
        >
          {[
            { n: '2.4K+', label: 'Active Learners' },
            { n: '840+',  label: 'Volunteer Mentors' },
            { n: '60+',   label: 'Countries Represented' },
            { n: '100%',  label: 'Free Forever' },
          ].map(({ n, label }) => (
            <div key={label} className="flex flex-col items-start md:items-center gap-1 md:px-8">
              <span className="font-display font-black text-4xl text-[var(--ink)]">{n}</span>
              <span className="text-sm text-[var(--muted)] font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-float">
        <span className="font-mono text-xs text-[var(--muted)] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--muted)] to-transparent" />
      </div>
    </section>
  )
}
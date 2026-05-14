import { Section, Container } from './ui'

const STATS = [
  { n: '2,400+', label: 'Active Learners', icon: '🎓', desc: 'People building skills right now' },
  { n: '840+',   label: 'Volunteers',       icon: '🌍', desc: 'From 60+ countries worldwide' },
  { n: '12K+',   label: 'Sessions Held',    icon: '📅', desc: 'Live learning hours delivered' },
  { n: '100%',   label: 'Free Forever',     icon: '❤️', desc: 'No fees, no paywalls, ever' },
]

export default function StatsSection() {
  return (
    <Section className="bg-gradient-to-br from-[var(--ink)] to-[#1c2a14] overflow-hidden relative">
      {/* texture */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%"><defs><pattern id="st" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#st)"/></svg>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--ember)]/10 blur-3xl pointer-events-none" />

      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="opacity-0-start animate-fade-up flex flex-col items-start md:items-center text-left md:text-center md:px-10 gap-2"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}
            >
              <span className="text-3xl mb-1">{s.icon}</span>
              <span className="font-display font-black text-5xl text-white leading-none">{s.n}</span>
              <span className="font-body font-semibold text-sm text-[var(--ember)]">{s.label}</span>
              <span className="font-body text-xs text-white/40 leading-relaxed">{s.desc}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
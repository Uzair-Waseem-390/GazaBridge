import { Section, Container, SectionHeading } from './ui'

const STEPS = [
  { num: '01', icon: '🙋', title: 'Sign Up Free', desc: 'Create your account in under a minute — as a Learner or Volunteer. No cost, ever.', color: 'var(--ember)', bg: 'rgba(200,92,42,0.06)' },
  { num: '02', icon: '🤝', title: 'Get Matched', desc: 'Our system pairs you by skills, goals, timezone, and language preference.', color: 'var(--gold)', bg: 'rgba(201,168,76,0.06)' },
  { num: '03', icon: '📚', title: 'Learn & Grow', desc: 'Attend live sessions, access curated resources, build real portfolio projects.', color: 'var(--olive)', bg: 'rgba(74,92,63,0.06)' },
  { num: '04', icon: '🚀', title: 'Land a Career', desc: 'Connect with remote job boards and a global employer network valuing skills over location.', color: 'var(--ember)', bg: 'rgba(200,92,42,0.06)' },
]

export default function HowItWorksSection({ navigate }) {
  return (
    <Section id="how-it-works" className="bg-[var(--canvas)]">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title={<>Four steps to<br /><em>transform</em> a life.</>}
          subtitle="From zero experience to a thriving digital career — our pathway is open to everyone."
          align="center"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="opacity-0-start animate-fade-up card-lift rounded-3xl p-8 border border-[var(--border)] relative overflow-hidden group"
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards', background: `linear-gradient(135deg,var(--warm-white),${s.bg})` }}
            >
              <div className="absolute top-4 right-5 font-display font-black text-7xl leading-none select-none pointer-events-none transition-all duration-500 group-hover:scale-110" style={{ color: s.color, opacity: 0.07 }}>{s.num}</div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:-rotate-6" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>{s.icon}</div>
              <div className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: s.color }}>Step {s.num}</div>
              <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-3">{s.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate('how-it-works')}
            className="group inline-flex items-center gap-2 text-sm font-body font-medium text-[var(--ember)] hover:text-[var(--ink)] transition-colors duration-300 cursor-pointer bg-transparent border-0"
          >
            See the full guide
            <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </Container>
    </Section>
  )
}
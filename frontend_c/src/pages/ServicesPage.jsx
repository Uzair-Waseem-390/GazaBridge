import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button, Badge } from '../components/ui'

const SERVICES = [
  {
    icon: '🎓',
    title: '1-on-1 Mentorship',
    desc: 'Get paired with a dedicated volunteer mentor who works with you personally on your goals. Live sessions via WhatsApp, Zoom, or any platform you prefer.',
    features: ['Personalized learning path', 'Regular live sessions', 'Progress tracking', 'Flexible scheduling'],
    color: 'var(--ember)',
    bg: 'rgba(200,92,42,0.06)',
    tag: 'Most Popular',
  },
  {
    icon: '📚',
    title: 'Skill Courses & Tracks',
    desc: 'Structured learning paths across the most in-demand digital skills — from beginner to job-ready, guided by volunteer instructors.',
    features: ['Web Dev, Design, Data & more', 'Project-based learning', 'Portfolio building', 'Certificate on completion'],
    color: 'var(--olive)',
    bg: 'rgba(74,92,63,0.06)',
    tag: null,
  },
  {
    icon: '📄',
    title: 'CV & Career Support',
    desc: 'Expert volunteers review your CV, help you craft a professional profile, and guide you through applying for remote jobs and freelance gigs.',
    features: ['CV review & rewriting', 'LinkedIn optimization', 'Interview preparation', 'Portfolio feedback'],
    color: 'var(--gold)',
    bg: 'rgba(201,168,76,0.06)',
    tag: null,
  },
  {
    icon: '🌐',
    title: 'Language Learning',
    desc: 'Practice English and other languages with native-speaker volunteers. Improve your communication skills for work and daily life.',
    features: ['English for work', 'Conversational practice', 'Writing & grammar', 'Business communication'],
    color: 'var(--ember)',
    bg: 'rgba(200,92,42,0.06)',
    tag: null,
  },
  {
    icon: '💼',
    title: 'Freelance Launchpad',
    desc: 'Learn how to start earning online as a freelancer. Volunteers guide you through platforms like Upwork, Fiverr, and direct client outreach.',
    features: ['Platform setup & optimization', 'Proposal writing', 'Pricing your skills', 'First client acquisition'],
    color: 'var(--olive)',
    bg: 'rgba(74,92,63,0.06)',
    tag: null,
  },
  {
    icon: '🤝',
    title: 'Community & Networking',
    desc: 'Join WhatsApp groups, peer circles, and alumni networks. Connect with other learners, share opportunities, and grow together.',
    features: ['Peer learning groups', 'Job opportunity sharing', 'Volunteer-run Q&A sessions', 'Alumni support network'],
    color: 'var(--gold)',
    bg: 'rgba(201,168,76,0.06)',
    tag: null,
  },
]

function ServiceCard({ s, i }) {
  return (
    <div
      className="opacity-0-start animate-fade-up card-lift group rounded-3xl border border-[var(--border)] p-8 relative overflow-hidden flex flex-col"
      style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards', background: `linear-gradient(135deg, var(--warm-white), ${s.bg})` }}
    >
      {s.tag && (
        <div className="absolute top-5 right-5">
          <Badge color="ember">{s.tag}</Badge>
        </div>
      )}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:-rotate-6" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
        {s.icon}
      </div>
      <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-3 group-hover:text-[var(--ember)] transition-colors duration-300">{s.title}</h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-6 flex-1">{s.desc}</p>
      <ul className="flex flex-col gap-2">
        {s.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ServicesPage(props) {
  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="Our Services"
        title={<>Everything you need<br />to <span className="italic text-[var(--ember)]">succeed online.</span></>}
        subtitle="From learning your first skill to landing your first client — GazaBridge provides every service you need, at zero cost."
      />

      <div className="py-20 md:py-28 bg-[var(--warm-white)]">
        <Container>
          {/* Free badge */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--ink)] text-white">
              <span className="text-xl">❤️</span>
              <span className="font-body font-medium text-sm">All services are 100% free — forever</span>
              <span className="font-mono text-xs text-white/50">No upsells. No premium.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {SERVICES.map((s, i) => <ServiceCard key={s.title} s={s} i={i} />)}
          </div>

          {/* Bottom CTA */}
          <div className="rounded-3xl bg-gradient-to-br from-[var(--ink)] to-[#1c2a14] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]">
              <svg width="100%" height="100%"><defs><pattern id="svc" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#svc)"/></svg>
            </div>
            <div className="relative">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                Start using any service today — <span className="text-shimmer">for free.</span>
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">No credit card. No application process. Just sign up and start.</p>
              <Button variant="primary" onClick={props.onRegisterClick} size="lg">
                Create Your Free Account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
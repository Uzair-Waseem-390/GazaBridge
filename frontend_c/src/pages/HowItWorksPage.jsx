import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button, Badge } from '../components/ui'

const VOLUNTEER_STEPS = [
  { n: '1', icon: '📧', title: 'Create a free account', desc: 'Sign up using Google or email in under 60 seconds. No credit card required.' },
  { n: '2', icon: '👤', title: 'Complete your profile', desc: 'Add your skills, languages, availability, and optionally your LinkedIn and WhatsApp contact.' },
  { n: '3', icon: '📢', title: 'Post an offer', desc: 'Describe what you can teach or help with — e.g. English lessons, coding, CV help, digital marketing.' },
  { n: '4', icon: '🔍', title: 'Browse Needs', desc: 'Explore requests from people who need your exact skills and message them directly through the platform.' },
  { n: '5', icon: '💬', title: 'Connect & teach', desc: 'Use platform messages, WhatsApp chat, or invite them to your WhatsApp group — however works best.' },
]

const SEEKER_STEPS = [
  { n: '1', icon: '📧', title: 'Create a free account', desc: 'Sign up using Google or email. Always free — no payment info needed, ever.' },
  { n: '2', icon: '👤', title: 'Complete your profile', desc: 'Add your location, languages, and contact info (WhatsApp or Telegram) so volunteers can reach you.' },
  { n: '3', icon: '✍️', title: 'Post your request', desc: 'Describe what help you need — "I want to learn English", "I need help with my CV", or any digital skill.' },
  { n: '4', icon: '🔍', title: 'Browse volunteers', desc: 'Find someone with the skills you need and send them a message directly — it only takes a moment.' },
  { n: '5', icon: '🎓', title: 'Start learning for free', desc: 'Everything is completely free — volunteers are here to help you with no cost, no catch, no conditions.' },
]

function StepFlow({ steps, color, bg }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex gap-6 relative">
          {/* vertical line */}
          {i < steps.length - 1 && (
            <div className="absolute left-[27px] top-14 w-px h-[calc(100%-24px)] bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(${color}, transparent)`, opacity: 0.2 }} />
          )}
          {/* circle */}
          <div className="flex-shrink-0 mt-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative z-10 transition-transform duration-300 hover:-rotate-6 cursor-default"
              style={{ background: bg, border: `1px solid ${color}30` }}
            >
              {s.icon}
            </div>
          </div>
          <div
            className="opacity-0-start animate-fade-up pb-10"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color }}>{`Step ${s.n}`}</div>
            <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2">{s.title}</h3>
            <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HowItWorksPage(props) {
  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="How It Works"
        title={<>Free. Simple.<br /><span className="italic text-[var(--ember)]">Life-changing.</span></>}
        subtitle="A free platform connecting skilled volunteers worldwide with people in Gaza — and anyone who needs digital skills to build a better future."
      />

      {/* Note banner */}
      <div className="bg-[var(--gold)]/10 border-b border-[var(--gold)]/20">
        <Container>
          <div className="py-5 flex items-start gap-3">
            <span className="text-xl mt-0.5">💡</span>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              <strong>Open to everyone:</strong> While GazaBridge specifically focuses on supporting people of Gaza, seekers from anywhere in the world are welcome. Our primary mission is Gaza, but learning has no borders.
            </p>
          </div>
        </Container>
      </div>

      {/* Two columns */}
      <div className="py-20 md:py-28 bg-[var(--warm-white)]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Volunteers */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--olive)]/10 border border-[var(--olive)]/20 flex items-center justify-center text-2xl">🙌</div>
                <div>
                  <h2 className="font-display font-bold text-3xl text-[var(--ink)]">For Volunteers</h2>
                  <p className="text-sm text-[var(--muted)]">Share your skills — change a life</p>
                </div>
              </div>
              <StepFlow steps={VOLUNTEER_STEPS} color="var(--olive)" bg="rgba(74,92,63,0.07)" />
            </div>

            {/* Seekers */}
            <div className="lg:border-l lg:border-[var(--border)] lg:pl-16">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--ember)]/10 border border-[var(--ember)]/20 flex items-center justify-center text-2xl">🌟</div>
                <div>
                  <h2 className="font-display font-bold text-3xl text-[var(--ink)]">For People in Gaza</h2>
                  <p className="text-sm text-[var(--muted)]">Get the skills to build your future</p>
                </div>
              </div>
              <StepFlow steps={SEEKER_STEPS} color="var(--ember)" bg="rgba(200,92,42,0.07)" />
            </div>
          </div>
        </Container>
      </div>

      {/* CTA */}
      <div className="py-20 bg-[var(--canvas)] text-center">
        <Container>
          <h2 className="font-display font-bold text-4xl text-[var(--ink)] mb-4">Ready to get started?</h2>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Create your free account today — takes less than a minute.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={props.onRegisterClick} size="lg">Join as Volunteer</Button>
            <Button variant="secondary" onClick={props.onRegisterClick} size="lg">Join as Learner</Button>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
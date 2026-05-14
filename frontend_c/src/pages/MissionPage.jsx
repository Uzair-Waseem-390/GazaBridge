import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button } from '../components/ui'

const PILLARS = [
  {
    icon: '🎓',
    title: 'Skills Over Charity',
    desc: 'We believe the most sustainable form of support is a skill that lasts a lifetime. Not a one-time donation — a permanent capability. Every session on GazaBridge gives someone a tool they will use forever.',
    color: 'var(--ember)',
  },
  {
    icon: '🌍',
    title: 'Borderless by Design',
    desc: 'Geography should not determine who gets access to opportunity. We designed GazaBridge to work across borders, languages, and time zones — because talent is universal, even when circumstance is not.',
    color: 'var(--olive)',
  },
  {
    icon: '❤️',
    title: 'Radical Generosity',
    desc: 'Everything on GazaBridge is free. Not freemium. Not "free for now." Permanently, unconditionally free — because we refuse to put a price on human potential.',
    color: 'var(--gold)',
  },
  {
    icon: '🤝',
    title: 'Human-to-Human',
    desc: 'We don\'t replace human connection with algorithms. GazaBridge is a place where real people teach real people — a volunteer in Canada connecting with a learner in Gaza, person to person.',
    color: 'var(--ember)',
  },
]

const GOALS = [
  { n: '10,000', label: 'Learners trained by 2026', progress: 24 },
  { n: '2,500',  label: 'Active volunteers worldwide', progress: 34 },
  { n: '1,000',  label: 'Remote jobs secured for Gazans', progress: 12 },
  { n: '50+',    label: 'Skill tracks & courses available', progress: 60 },
]

export default function MissionPage(props) {
  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="Our Mission"
        title={<>We exist to prove<br /><span className="italic text-[var(--ember)]">borders don't limit potential.</span></>}
        subtitle="GazaBridge is on a mission to make digital skills, mentorship, and career opportunities universally accessible — starting with Gaza."
      />

      {/* Mission statement */}
      <div className="py-20 md:py-28 bg-[var(--warm-white)]">
        <Container>
          <div className="max-w-3xl mb-20">
            <div className="font-mono text-xs tracking-widest uppercase text-[var(--olive)] mb-5">What We're Trying to Do</div>
            <div className="flex flex-col gap-5 text-lg text-[var(--muted)] leading-[1.85]">
              <p>
                <strong className="text-[var(--ink)]">Gaza has extraordinary human capital.</strong> It has young, educated, motivated people who want to work, build, and contribute. What it lacks — due to circumstances entirely outside their control — is access.
              </p>
              <p>
                Access to mentors. Access to networks. Access to the kind of informal knowledge transfer that happens when you're embedded in a tech ecosystem or business environment.
              </p>
              <p>
                GazaBridge was created to provide exactly that access — at zero cost, at scale, powered by the generosity of skilled people worldwide who simply want to help.
              </p>
              <p>
                Our mission is not charity. It is <strong className="text-[var(--ink)]">equalization</strong>. We want a young developer in Gaza to have the same access to a senior mentor as someone in Silicon Valley. We want a graphic designer in Rafah to compete on equal footing for remote clients as someone in London.
              </p>
              <p>
                That's what GazaBridge is building. One session at a time.
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="mb-24">
            <div className="font-mono text-xs tracking-widest uppercase text-[var(--olive)] mb-3">What We Believe</div>
            <h2 className="font-display font-bold text-4xl text-[var(--ink)] mb-12">The principles that guide us.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className="opacity-0-start animate-fade-up card-lift rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-8 flex gap-5"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                    style={{ background: `${p.color}12`, border: `1px solid ${p.color}25` }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--ink)] mb-2">{p.title}</h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals / Progress */}
          <div>
            <div className="font-mono text-xs tracking-widest uppercase text-[var(--olive)] mb-3">Where We're Headed</div>
            <h2 className="font-display font-bold text-4xl text-[var(--ink)] mb-12">Our goals for the next 12 months.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GOALS.map((g, i) => (
                <div
                  key={g.label}
                  className="opacity-0-start animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--warm-white)] p-8"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="font-display font-black text-4xl text-[var(--ink)] mb-1">{g.n}</div>
                  <div className="text-sm text-[var(--muted)] mb-5">{g.label}</div>
                  <div className="h-2 rounded-full bg-[var(--sand)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--ember)] to-[var(--gold)] transition-all duration-1000"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-2 font-mono">{g.progress}% of goal reached</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Join the mission */}
      <div className="py-20 bg-gradient-to-br from-[var(--ink)] to-[#1c2a14] relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.04]"><svg width="100%" height="100%"><defs><pattern id="mpt" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#mpt)"/></svg></div>
        <Container>
          <h2 className="relative font-display font-bold text-4xl md:text-5xl text-white mb-5">
            Join the mission. <span className="text-shimmer">Make history.</span>
          </h2>
          <p className="relative text-white/60 max-w-lg mx-auto mb-10">
            Every volunteer, every learner, every shared skill brings us closer to a world where opportunity is truly borderless.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={props.onRegisterClick} size="lg">Volunteer Today</Button>
            <Button variant="outline_white" onClick={props.onRegisterClick} size="lg">Start Learning</Button>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button } from '../components/ui'

const TEAM = [
  {
    name: 'Sana Adeel',
    role: 'Founder',
    bio: 'The visionary behind GazaBridge. Sana built this platform with one belief: that knowledge is the most powerful gift you can give. She has been at the intersection of technology and social impact for years, driven by a deep commitment to human dignity and opportunity.',
    initials: 'SA',
    gradient: 'from-[var(--ember)] to-[var(--gold)]',
    linkedin: null,
  },
  {
    name: 'Mir Sadat Bin Rakib',
    role: 'Co-Founder',
    bio: 'Sadat brings strategic vision and operational depth to GazaBridge. He co-architected the platform\'s model of volunteer-led, zero-cost education — ensuring every decision serves the community first.',
    initials: 'MS',
    gradient: 'from-[var(--olive)] to-[var(--olive-light)]',
    linkedin: null,
  },
  {
    name: 'Uzair Waseem',
    role: 'Backend Engineer',
    bio: 'Uzair builds the invisible infrastructure that makes GazaBridge work — from secure user accounts to real-time messaging. He is passionate about engineering systems that are reliable, scalable, and built for social good.',
    initials: 'UW',
    gradient: 'from-[#3a5c8a] to-[#5a80aa]',
    linkedin: null,
  },
  {
    name: 'Saja',
    role: 'Frontend Developer',
    bio: 'Saja crafts the visual experience of GazaBridge — every component, every animation, every pixel of the interface that learners and volunteers interact with. She believes beautiful design is never superficial: it communicates care.',
    initials: 'SJ',
    gradient: 'from-[#7a4a8a] to-[#9a6aaa]',
    linkedin: null,
  },
  {
    name: 'Zohaib Adnan',
    role: 'SEO & Growth',
    bio: 'Zohaib ensures GazaBridge reaches the people who need it most. Through search strategy, content, and organic growth, he works to make sure no one who needs this platform goes without finding it.',
    initials: 'ZA',
    gradient: 'from-[#4a7a5a] to-[#6a9a7a]',
    linkedin: null,
  },
]

function TeamCard({ member, index }) {
  return (
    <div
      className="opacity-0-start animate-fade-up card-lift group bg-[var(--warm-white)] rounded-3xl border border-[var(--border)] overflow-hidden"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className={`h-2 bg-gradient-to-r ${member.gradient}`} />
      <div className="p-8">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-display font-black text-2xl mb-6 group-hover:-rotate-3 transition-transform duration-300`}>
          {member.initials}
        </div>
        <div className="mb-4">
          <h3 className="font-display font-bold text-xl text-[var(--ink)]">{member.name}</h3>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--ember)]">{member.role}</span>
        </div>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{member.bio}</p>
      </div>
    </div>
  )
}

export default function AboutPage(props) {
  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="About Us"
        title={<>Built by humans<br /><span className="italic text-[var(--ember)]">for humanity.</span></>}
        subtitle="GazaBridge was born from a simple belief — that skills are the most durable form of aid. We are a small, dedicated team on a mission to make digital opportunity borderless."
      />

      {/* Origin Story */}
      <div className="py-20 md:py-28 bg-[var(--warm-white)]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            <div>
              <div className="font-mono text-xs tracking-widest uppercase text-[var(--olive)] mb-5">Our Story</div>
              <h2 className="font-display font-bold text-4xl text-[var(--ink)] leading-tight mb-6">
                A bridge built on the belief that <em>knowledge changes everything.</em>
              </h2>
              <div className="flex flex-col gap-4 text-base text-[var(--muted)] leading-relaxed">
                <p>GazaBridge started with a question: in a world full of platforms, why is it still so hard for someone in Gaza to access a skilled mentor who simply wants to help?</p>
                <p>The answer wasn't a lack of willing people — it was the absence of the right bridge. So we built one. A place where a developer in California, a designer in Berlin, and a marketer in Karachi can all connect directly with someone in Gaza who needs their skills.</p>
                <p>No fees. No bureaucracy. No borders. Just human beings teaching human beings.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '2024', label: 'Founded', icon: '🌱' },
                { n: '60+',  label: 'Countries', icon: '🌍' },
                { n: '5',    label: 'Team Members', icon: '💛' },
                { n: '∞',    label: 'Mission', icon: '🕊️' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="opacity-0-start animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-6 flex flex-col gap-2"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-display font-black text-4xl text-[var(--ink)]">{s.n}</span>
                  <span className="text-sm text-[var(--muted)]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-8">
            <div className="font-mono text-xs tracking-widest uppercase text-[var(--olive)] mb-3">The Team</div>
            <h2 className="font-display font-bold text-4xl text-[var(--ink)] mb-12">Meet the people<br /><em>behind the bridge.</em></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {TEAM.slice(0, 3).map((m, i) => <TeamCard key={m.name} member={m} index={i} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {TEAM.slice(3).map((m, i) => <TeamCard key={m.name} member={m} index={i + 3} />)}
          </div>
        </Container>
      </div>

      {/* Contact / Join */}
      <div className="py-20 bg-[var(--canvas)] text-center">
        <Container>
          <h2 className="font-display font-bold text-4xl text-[var(--ink)] mb-4">Want to be part of this?</h2>
          <p className="text-[var(--muted)] mb-8 max-w-lg mx-auto">We're always looking for passionate volunteers, contributors, and partners. Reach out — we'd love to hear from you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={props.onRegisterClick} size="lg">Join as Volunteer</Button>
            <a href="mailto:hello@gazabridge.org">
              <Button variant="secondary" size="lg">Email the Team</Button>
            </a>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
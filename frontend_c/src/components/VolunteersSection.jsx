import { Section, Container, SectionHeading, Button } from './ui'

const VOLUNTEERS = [
  { initials: 'SM', name: 'Sarah Mitchell', country: '🇺🇸 California, USA', skills: ['React', 'Node.js', 'Mentorship'], sessions: 48, rating: 4.9, color: 'from-[var(--ember)] to-[var(--gold)]', bio: 'Full-stack engineer at a Y-Combinator startup. Passionate about tech education.' },
  { initials: 'AK', name: 'Ahmed Khalid',   country: '🇩🇪 Berlin, Germany',  skills: ['UI/UX', 'Figma', 'Branding'],   sessions: 36, rating: 5.0, color: 'from-[var(--olive)] to-[var(--olive-light)]', bio: 'Senior product designer. Has helped 30+ Gazans build their design portfolios.' },
  { initials: 'LT', name: 'Lena Torres',    country: '🇬🇧 London, UK',       skills: ['Copywriting', 'SEO', 'Content'], sessions: 22, rating: 4.8, color: 'from-[#3a5c8a] to-[#5a7caa]', bio: 'Content strategist and freelance writer helping others launch writing careers.' },
  { initials: 'RN', name: 'Rahul Nair',     country: '🇨🇦 Toronto, Canada',  skills: ['Python', 'Data', 'Excel'],       sessions: 61, rating: 4.9, color: 'from-[#7a4a8a] to-[#9a6aaa]', bio: 'Data analyst. Teaches practical Excel and Python from the ground up.' },
]

function VolunteerCard({ v, index }) {
  return (
    <div
      className="opacity-0-start animate-fade-up card-lift group bg-[var(--warm-white)] rounded-3xl border border-[var(--border)] overflow-hidden"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'forwards' }}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${v.color}`} />

      <div className="p-7">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white font-display font-black text-xl flex-shrink-0 group-hover:-rotate-3 transition-transform duration-300`}>
            {v.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-base text-[var(--ink)] truncate">{v.name}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">{v.country}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[var(--gold)] text-xs">{'★'.repeat(5)}</span>
              <span className="text-xs font-mono text-[var(--muted)]">{v.rating}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">{v.bio}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {v.skills.map(s => (
            <span key={s} className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--sand)] text-[var(--muted)]">{s}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink)]">{v.sessions}</span> sessions held
          </div>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ember)] hover:text-[var(--ink)] transition-colors cursor-pointer bg-transparent border-0 group/btn">
            Message
            <svg className="transition-transform group-hover/btn:translate-x-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VolunteersSection({ onRegisterClick }) {
  return (
    <Section id="volunteers" className="bg-[var(--canvas)]">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <SectionHeading
            eyebrow="Featured Volunteers"
            title={<>Meet the humans<br />behind the <em>bridge.</em></>}
            subtitle="Real people from around the world — donating their time and expertise, completely free."
          />
          <div className="flex-shrink-0 pb-1">
            <Button variant="secondary" onClick={onRegisterClick} size="sm">Become a Volunteer</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VOLUNTEERS.map((v, i) => <VolunteerCard key={v.name} v={v} index={i} />)}
        </div>
      </Container>
    </Section>
  )
}
import { Section, Container, SectionHeading } from './ui'

const TESTIMONIALS = [
  {
    quote: "I had zero coding knowledge. Within three months, thanks to my volunteer mentor, I landed my first remote frontend job. GazaBridge literally changed my life.",
    name: "Mahmoud R.",
    role: "Learner → Frontend Developer",
    location: "Gaza City",
    initials: "MR",
    color: "var(--ember)",
  },
  {
    quote: "I've volunteered with many platforms but GazaBridge is different. The gratitude from learners is immense, and seeing their growth week by week is the most rewarding thing I do.",
    name: "Jessica H.",
    role: "Volunteer — UI/UX Design",
    location: "Sydney, Australia",
    initials: "JH",
    color: "var(--olive)",
  },
  {
    quote: "As a data analyst, I thought teaching online would be hard. The platform makes it seamless. I've now helped 12 people build Excel and Python skills for real jobs.",
    name: "Omar F.",
    role: "Volunteer — Data Analysis",
    location: "Toronto, Canada",
    initials: "OF",
    color: "var(--gold)",
  },
  {
    quote: "My English tutor from GazaBridge helped me pass job interviews. I'm now working remotely for a company in Europe. I will never forget this kindness.",
    name: "Nour A.",
    role: "Learner → Content Writer",
    location: "Rafah, Gaza",
    initials: "NA",
    color: "var(--ember)",
  },
]

function TestimonialCard({ t, index }) {
  return (
    <div
      className="opacity-0-start animate-fade-up card-lift bg-[var(--warm-white)] rounded-3xl border border-[var(--border)] p-8 flex flex-col gap-6"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Quote mark */}
      <div className="font-display font-black text-6xl leading-none" style={{ color: t.color, opacity: 0.15 }}>"</div>

      <blockquote className="text-sm text-[var(--muted)] leading-relaxed font-body flex-1 -mt-6">
        "{t.quote}"
      </blockquote>

      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-display font-bold flex-shrink-0"
          style={{ background: t.color }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--ink)]">{t.name}</div>
          <div className="text-xs text-[var(--muted)]">{t.role}</div>
          <div className="text-xs text-[var(--muted)] opacity-70">{t.location}</div>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <Section className="bg-[var(--warm-white)]">
      <Container>
        <SectionHeading
          eyebrow="Stories"
          title={<>Real people.<br />Real <em>change.</em></>}
          subtitle="Every number is a person. These are a few of the voices from our community."
          align="center"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
        </div>
      </Container>
    </Section>
  )
}
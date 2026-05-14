import { Section, Container, SectionHeading, Badge } from './ui'

const SKILLS = [
  {
    icon: '🌐',
    title: 'Web Development',
    tags: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
    count: '320 learners',
    color: '#c85c2a',
    gradient: 'from-[#c85c2a]/10 to-[#e07040]/5',
  },
  {
    icon: '🎨',
    title: 'UI/UX Design',
    tags: ['Figma', 'Design Systems', 'Prototyping'],
    count: '184 learners',
    color: '#c9a84c',
    gradient: 'from-[#c9a84c]/10 to-[#e8c87a]/5',
  },
  {
    icon: '📊',
    title: 'Data Analysis',
    tags: ['Excel', 'Python', 'Tableau', 'SQL'],
    count: '215 learners',
    color: '#4a5c3f',
    gradient: 'from-[#4a5c3f]/10 to-[#6b7f5e]/5',
  },
  {
    icon: '📱',
    title: 'Mobile Dev',
    tags: ['React Native', 'Flutter', 'iOS', 'Android'],
    count: '97 learners',
    color: '#c85c2a',
    gradient: 'from-[#c85c2a]/8 to-transparent',
  },
  {
    icon: '📈',
    title: 'Digital Marketing',
    tags: ['SEO', 'Social Media', 'Email Marketing'],
    count: '278 learners',
    color: '#c9a84c',
    gradient: 'from-[#c9a84c]/8 to-transparent',
  },
  {
    icon: '✍️',
    title: 'Copywriting',
    tags: ['Content', 'SEO Writing', 'Storytelling'],
    count: '143 learners',
    color: '#4a5c3f',
    gradient: 'from-[#4a5c3f]/8 to-transparent',
  },
  {
    icon: '🤖',
    title: 'AI & Automation',
    tags: ['ChatGPT', 'Prompt Eng.', 'No-Code AI'],
    count: '389 learners',
    color: '#c85c2a',
    gradient: 'from-[#c85c2a]/10 to-[#c9a84c]/5',
    featured: true,
  },
  {
    icon: '🛒',
    title: 'E-Commerce',
    tags: ['Shopify', 'Amazon FBA', 'Etsy'],
    count: '162 learners',
    color: '#4a5c3f',
    gradient: 'from-[#4a5c3f]/8 to-transparent',
  },
]

function SkillCard({ skill, index }) {
  return (
    <div
      className="opacity-0-start animate-fade-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div
        className={`
          card-lift group relative p-6 rounded-2xl border cursor-pointer overflow-hidden h-full
          ${skill.featured
            ? 'border-[var(--ember)]/30 bg-gradient-to-br from-[var(--ember)]/8 to-[var(--gold)]/5'
            : `border-[var(--border)] bg-gradient-to-br ${skill.gradient} bg-[var(--warm-white)]`
          }
        `}
      >
        {skill.featured && (
          <div className="absolute top-3 right-3">
            <Badge color="ember">Trending 🔥</Badge>
          </div>
        )}

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${skill.color}12`, border: `1px solid ${skill.color}25` }}
        >
          {skill.icon}
        </div>

        <h3 className="font-display font-bold text-lg text-[var(--ink)] mb-3 group-hover:text-[var(--ember)] transition-colors duration-300">
          {skill.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--sand)] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)] font-body">{skill.count}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
            style={{ background: skill.color, color: 'white' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkillsSection() {
  return (
    <Section id="skills" className="bg-[var(--warm-white)]">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="Skills & Tracks"
            title={<>Every skill you need<br />to go <em>remote.</em></>}
            subtitle="Expert volunteers teach in-demand digital skills — from beginner to job-ready."
          />
          <div className="flex-shrink-0 pb-1">
            <button className="group inline-flex items-center gap-2 text-sm font-body font-medium text-[var(--ember)] hover:text-[var(--ink)] transition-colors duration-300">
              Browse all skills
              <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SKILLS.map((skill, i) => (
            <SkillCard key={skill.title} skill={skill} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
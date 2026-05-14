const SKILLS_MARQUEE = [
  '🌐 Web Development',
  '🎨 UI/UX Design',
  '📊 Data Analysis',
  '📱 Mobile Development',
  '✍️ Copywriting',
  '📈 Digital Marketing',
  '🔐 Cybersecurity',
  '🤖 AI & Prompt Engineering',
  '🛒 E-Commerce',
  '📹 Video Editing',
  '🖼️ Graphic Design',
  '⚙️ Freelancing Skills',
]

function MarqueeTrack({ items, reverse = false }) {
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <div
        className="flex gap-6 items-center"
        style={{
          animation: `marquee ${reverse ? '22s' : '28s'} linear infinite ${reverse ? 'reverse' : ''}`,
          willChange: 'transform',
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--warm-white)] text-sm font-body text-[var(--muted)] flex-shrink-0 hover:border-[var(--ember)]/40 hover:text-[var(--ink)] transition-colors duration-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeBanner() {
  return (
    <div className="py-12 border-y border-[var(--border)] bg-[var(--canvas)] overflow-hidden">
      <div className="flex flex-col gap-4">
        <MarqueeTrack items={SKILLS_MARQUEE} />
        <MarqueeTrack items={[...SKILLS_MARQUEE].reverse()} reverse />
      </div>
    </div>
  )
}
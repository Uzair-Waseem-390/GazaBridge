// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', onClick, className = '', size = 'md' }) {
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-7 py-3.5 text-sm',
    lg: 'px-9 py-4 text-base',
  }

  const variants = {
    primary: `
      btn-primary inline-flex items-center gap-2 rounded-full font-body font-medium tracking-wide
      bg-gradient-to-br from-[var(--ember)] to-[var(--ember-light)]
      text-white cursor-pointer border-0
      ${sizes[size]}
    `,
    secondary: `
      btn-primary inline-flex items-center gap-2 rounded-full font-body font-medium tracking-wide
      bg-transparent border border-[var(--ink)] text-[var(--ink)]
      hover:bg-[var(--ink)] hover:text-[var(--canvas)] cursor-pointer
      transition-colors duration-300
      ${sizes[size]}
    `,
    ghost: `
      inline-flex items-center gap-2 rounded-full font-body font-medium tracking-wide
      bg-transparent text-[var(--muted)] hover:text-[var(--ink)]
      transition-colors duration-300 cursor-pointer border-0
      ${sizes[size]}
    `,
    outline_white: `
      btn-primary inline-flex items-center gap-2 rounded-full font-body font-medium tracking-wide
      bg-transparent border border-white/40 text-white
      hover:bg-white/10 cursor-pointer
      transition-colors duration-300
      ${sizes[size]}
    `,
  }

  return (
    <button onClick={onClick} className={`${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'olive' }) {
  const colors = {
    olive: 'bg-[var(--olive)]/10 text-[var(--olive)] border-[var(--olive)]/20',
    ember: 'bg-[var(--ember)]/10 text-[var(--ember)] border-[var(--ember)]/20',
    gold:  'bg-[var(--gold)]/15  text-[#8a6c20]  border-[var(--gold)]/30',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border tracking-wider uppercase ${colors[color]}`}>
      {children}
    </span>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
export function Section({ children, className = '', id = '' }) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className}`}>
      {children}
    </section>
  )
}

// ─── Container ────────────────────────────────────────────────────────────────
export function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 md:px-12 ${className}`}>
      {children}
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────────
export function SectionHeading({ eyebrow, title, subtitle, align = 'left', light = false }) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  return (
    <div className={`flex flex-col gap-4 mb-16 ${alignClass}`}>
      {eyebrow && <Badge color="olive">{eyebrow}</Badge>}
      <h2 className={`font-display font-bold leading-tight text-4xl md:text-5xl ${light ? 'text-white' : 'text-[var(--ink)]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-xl text-base leading-relaxed ${light ? 'text-white/70' : 'text-[var(--muted)]'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ number, suffix = '', label, delay = '0' }) {
  return (
    <div
      className="opacity-0-start animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex flex-col gap-1">
        <div className="font-display font-black text-5xl md:text-6xl text-[var(--ink)] leading-none">
          {number}
          <span className="text-[var(--ember)]">{suffix}</span>
        </div>
        <div className="text-sm text-[var(--muted)] font-body tracking-wide">{label}</div>
      </div>
    </div>
  )
}

// ─── Avatar Cluster ───────────────────────────────────────────────────────────
export function AvatarCluster({ avatars }) {
  return (
    <div className="flex -space-x-3">
      {avatars.map((src, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-full border-2 border-[var(--canvas)] overflow-hidden bg-gradient-to-br from-[var(--sand)] to-[var(--olive-light)]"
          style={{ zIndex: avatars.length - i }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold font-mono">
            {src}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Decorative Line ──────────────────────────────────────────────────────────
export function DecorLine({ className = '' }) {
  return (
    <div className={`divider-olive ${className}`} />
  )
}
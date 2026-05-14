import { Badge } from './ui'

export default function PageHero({ eyebrow, title, subtitle, gradient = 'from-[var(--ink)] to-[#1c2a14]', children }) {
  return (
    <div className={`relative pt-32 pb-20 bg-gradient-to-br ${gradient} overflow-hidden`}>
      {/* grid texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%"><defs><pattern id="ph-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#ph-grid)"/></svg>
      </div>
      {/* glow orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--ember)]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[var(--olive)]/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {eyebrow && (
          <div className="mb-5 opacity-0-start animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <Badge color="ember">{eyebrow}</Badge>
          </div>
        )}
        <h1
          className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 opacity-0-start animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-white/60 text-lg font-body font-light max-w-2xl leading-relaxed opacity-0-start animate-fade-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8 opacity-0-start animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
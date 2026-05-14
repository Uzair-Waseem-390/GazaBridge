import { Button } from './ui'

const FOOTER_LINKS = {
  Platform: [
    { label: 'How It Works',  page: 'how-it-works' },
    { label: 'Services',      page: 'services' },
    { label: 'For Volunteers',page: 'how-it-works' },
    { label: 'For Learners',  page: 'how-it-works' },
    { label: 'FAQ',           page: 'faq' },
  ],
  Company: [
    { label: 'About Us',  page: 'about' },
    { label: 'Mission',   page: 'mission' },
    { label: 'Blog',      page: 'blog' },
  ],
  Community: [
    { label: 'Volunteer',       page: null, href: '#' },
    { label: 'Find a Mentor',   page: null, href: '#' },
    { label: 'WhatsApp Groups', page: null, href: '#' },
    { label: 'Join Discord',    page: null, href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy',   page: 'privacy' },
    { label: 'Terms of Service', page: 'terms' },
    { label: 'Cookie Policy',    page: 'cookies' },
  ],
}

export default function Footer({ navigate, onRegisterClick }) {
  const handleLink = (link) => {
    if (link.page) navigate(link.page)
  }

  return (
    <footer className="bg-[var(--ink)] text-white relative overflow-hidden">
      {/* Top decorative line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--ember)]/40 to-transparent" />

      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%"><defs><pattern id="fp" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#fp)"/></svg>
      </div>

      {/* CTA Banner */}
      <div className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
                Ready to make a difference?
              </h2>
              <p className="text-white/60 font-body text-base leading-relaxed">
                Whether you have skills to share or dreams to pursue — GazaBridge is your free gateway to connection, learning, and opportunity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Button variant="primary" onClick={onRegisterClick} size="lg">
                Join as Volunteer
              </Button>
              <Button variant="outline_white" onClick={onRegisterClick} size="lg">
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12">

          {/* Brand Column */}
          <div className="md:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--ember)] to-[var(--gold)] rotate-6" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--ember)] to-[var(--ember-light)] flex items-center justify-center">
                  <span className="text-white font-display font-black text-base">G</span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg text-white tracking-tight">Gaza</span>
                <span className="font-display font-bold text-lg text-[var(--ember)] tracking-tight -mt-0.5">Bridge</span>
              </div>
            </div>

            <p className="text-white/50 text-sm font-body leading-relaxed mb-6 max-w-xs">
              A free platform connecting skilled volunteers worldwide with people in Gaza — teaching digital skills, opening careers, building futures.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-3 mb-6">
              <a
                href="mailto:hello@gazabridge.org"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[var(--ember)] transition-colors duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.2"/></svg>
                hello@gazabridge.org
              </a>
              <a
                href="https://www.linkedin.com/company/gazabridge/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[var(--ember)] transition-colors duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.3 0H2.7C1.2 0 0 1.2 0 2.7v10.6C0 14.8 1.2 16 2.7 16h10.6c1.5 0 2.7-1.2 2.7-2.7V2.7C16 1.2 14.8 0 13.3 0zM5.3 13.3H3V6h2.3v7.3zM4.2 5C3.4 5 2.7 4.4 2.7 3.5S3.4 2 4.2 2s1.5.6 1.5 1.5S5 5 4.2 5zm9.1 8.3h-2.3V9.8c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.2.8-.1.2-.1.4-.1.6v3.6H6.3V6h2.3v1c.3-.5.9-1.1 2.1-1.1 1.6 0 2.7 1 2.7 3.2v4.2z"/></svg>
                LinkedIn
              </a>
            </div>

            {/* Mini badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-xs text-white/50 tracking-wider">100% Free · Always</span>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="md:col-span-1">
              <h4 className="font-mono text-xs tracking-widest uppercase text-white/40 mb-5">{group}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLink(link)}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-0 text-left font-body"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-body">
            © {new Date().getFullYear()} GazaBridge. Built with ❤️ for Gaza. All rights reserved.
          </p>
          <p className="text-white/20 text-xs font-mono tracking-wide">
            FREE · OPEN · BORDERLESS
          </p>
        </div>
      </div>
    </footer>
  )
}
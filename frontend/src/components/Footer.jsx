
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// ─── Noise overlay ─────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-footer">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-footer)" />
    </svg>
  );
}

// ─── Marquee ───────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['Web Development', '✦', 'UI/UX Design', '✦', 'Data Science', '✦', 'Digital Marketing', '✦', 'Freelancing', '✦', 'AI & Machine Learning', '✦', 'Cybersecurity', '✦', 'Mobile Apps', '✦'];
  const doubled = [...items, ...items];

  return (
    <div
      className="relative py-4 overflow-hidden border-y z-10 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(252, 236, 222, 0.6)',
        borderColor: 'rgba(128, 128, 0, 0.15)'
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex items-center gap-8 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-sm font-bold tracking-wide"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: item === '✦' ? '#808000' : '#111111'
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Link data ────────────────────────────────────────────────────────────
const footerLinks = {
  Platform: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Services',     href: '/services' },
    { name: 'Resources',    href: '/resources' },
    { name: 'Community',    href: '/posts' },
    { name: 'FAQ',          href: '/faq' },
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Mission',  href: '/mission' },
    { name: 'Blog',     href: '/blog' },
  ],
  Community: [
    { name: 'Volunteers',      href: '/#' },
    { name: 'Success Stories', href: '/#' },
    { name: 'Forum',           href: '/#' },
    { name: 'Events',          href: '/#' },
  ],
  Legal: [
    { name: 'Privacy Policy',  href: '/privacy-policy' },
    { name: 'Terms of Service',href: '/terms-of-service' },
    { name: 'Cookie Policy',   href: '/cookie-policy' },
  ],
};

// ─── Social icons ─────────────────────────────────────────────────────────
const socials = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/gazabridge/posts/?feedView=all',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@gazabridge.org',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────
// MAIN FOOTER
// ─────────────────────────────────────────────────────────────────────────
export default function Footer() {
  const location  = useLocation();
  const footerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const bgTextY = useTransform(scrollYProgress, [0, 1], [60, -20]);

  if (location.pathname === '/chat') return null;

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAF3E8', color: '#1a1a1a' }}
    >
      <NoiseOverlay />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,0,1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#808000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[300px] h-[200px] bg-[#C26100]/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Scrolling marquee strip */}
      <MarqueeStrip />

      {/* ── Main grid ── */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-8 md:pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-x-8 gap-y-10 md:gap-y-14 mb-16 md:mb-20">

          {/* ── Brand column ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 0 }}
                  initial={{ rotate: 12 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-gradient-to-br from-[#808000] to-[#949413] rounded-xl shadow-md shadow-[#808000]/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <span
                className="text-xl font-bold bg-gradient-to-r from-[#C26100] to-[#E07A1B] bg-clip-text text-transparent"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                GazaBridge
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Empowering people in Gaza through free digital skills education.
              Connecting passionate volunteers with talented learners — worldwide, forever free.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  className="w-9 h-9 rounded-xl bg-black/[0.05] border border-black/[0.08] flex items-center justify-center text-gray-500 hover:text-[#C26100] hover:bg-[#C26100]/10 hover:border-[#C26100]/20 transition-colors duration-200"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>

            {/* Email chip */}
            <motion.a
              href="mailto:hello@gazabridge.org"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#C26100] transition-colors group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#808000] group-hover:animate-pulse" />
              hello@gazabridge.org
            </motion.a>
          </motion.div>

          {/* ── Link columns ── */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px w-4 bg-[#808000]/60" />
                <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400">
                  {category}
                </h4>
              </div>

              <ul className="space-y-2.5">
                {links.map((link, li) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.08 + li * 0.04, duration: 0.4 }}
                  >
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 text-sm text-gray-500 hover:text-[#C26100] transition-colors duration-200"
                    >
                      <motion.span
                        className="w-0 h-px bg-[#C26100] group-hover:w-3 transition-all duration-300"
                      />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border-t border-black/[0.07] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left"
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              © {new Date().getFullYear()} GazaBridge.
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400">
              Made with{' '}
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="inline-block"
              >
                ❤️
              </motion.span>
              {' '}for Gaza.
            </span>
          </div>

          {/* Centre */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#C26100]/10 border border-[#C26100]/20 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C26100] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#C26100] tracking-wide uppercase">
              100% Free Forever
            </span>
          </motion.div>

          {/* Right */}
          <div className="flex items-center gap-5">
            {[
              { name: 'Privacy Policy',   href: '/privacy-policy' },
              { name: 'Terms of Service', href: '/terms-of-service' },
            ].map((l) => (
              <Link
                key={l.name}
                to={l.href}
                className="text-xs text-gray-400 hover:text-[#C26100] transition-colors duration-200"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Massive background wordmark — parallax ── */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          style={{ y: bgTextY }}
          className="text-center leading-none"
        >
          <span
            className="text-[clamp(6rem,18vw,16rem)] font-bold text-black/[0.03]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            GazaBridge
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
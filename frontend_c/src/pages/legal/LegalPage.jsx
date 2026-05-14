import PageShell from '../../components/PageShell'
import PageHero from '../../components/PageHero'
import { Container } from '../../components/ui'

export default function LegalPage({ title, eyebrow, lastUpdated, sections, ...props }) {
  return (
    <PageShell {...props}>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        subtitle={`Last updated: ${lastUpdated}`}
      />
      <div className="py-20 bg-[var(--warm-white)]">
        <Container>
          <div className="max-w-3xl">
            {sections.map((s, i) => (
              <div key={i} className="mb-10 pb-10 border-b border-[var(--border)] last:border-0 last:pb-0">
                {s.heading && (
                  <h2 className="font-display font-bold text-2xl text-[var(--ink)] mb-4">{s.heading}</h2>
                )}
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-base text-[var(--muted)] leading-relaxed mb-4 last:mb-0">{p}</p>
                ))}
              </div>
            ))}

            {/* Contact */}
            <div className="mt-12 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] p-8">
              <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2">Questions about this policy?</h3>
              <p className="text-sm text-[var(--muted)] mb-4">Contact us at any time — we're here to help.</p>
              <a href="mailto:hello@gazabridge.org" className="font-mono text-sm text-[var(--ember)] hover:underline">hello@gazabridge.org</a>
            </div>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
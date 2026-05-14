import { useState } from 'react'
import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button } from '../components/ui'

const FAQS = [
  {
    q: 'Is GazaBridge completely free?',
    a: 'Yes — completely free for everyone, always. This includes volunteers, learners in Gaza, and anyone else using the platform. There are no hidden fees, premium tiers, or paywalls. We believe opportunity should not have a price tag.',
    cat: 'General',
  },
  {
    q: 'How do I contact a volunteer?',
    a: 'Click "Message" on any volunteer card to send them a direct message through the platform. You can also use their WhatsApp number if they have shared one, or join their WhatsApp group if they have created one for their sessions.',
    cat: 'General',
  },
  {
    q: 'Can I be both a volunteer and seek help at the same time?',
    a: 'Absolutely! When completing your profile, you can select both roles. Many of our members teach one skill while learning another — for example, someone might volunteer as an English tutor while learning web development.',
    cat: 'General',
  },
  {
    q: 'What languages are supported on the platform?',
    a: 'The platform supports all languages. You can write your offers, requests, and messages in Arabic, English, or any other language. Many of our volunteers speak Arabic and can communicate directly with people in Gaza in their native language.',
    cat: 'General',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Your profile is only visible to logged-in users. You have full control over what contact information you choose to share — WhatsApp, Telegram, email, or none. We never sell your data to third parties.',
    cat: 'Privacy',
  },
  {
    q: 'Do I need to be from Gaza to join as a learner?',
    a: 'No. While GazaBridge specifically focuses on supporting people of Gaza, anyone from anywhere in the world can join as a learner. Our priority is Gaza, but we welcome all seekers of knowledge.',
    cat: 'General',
  },
  {
    q: 'How do I become a volunteer?',
    a: 'Create a free account, complete your profile with your skills and availability, and post an offer describing what you can teach. You can also browse existing "Needs" posts and message learners directly. The whole process takes under 10 minutes.',
    cat: 'Volunteers',
  },
  {
    q: 'What skills can I learn on GazaBridge?',
    a: 'We cover a wide range of digital skills including web development, UI/UX design, data analysis, mobile development, digital marketing, copywriting, AI & prompt engineering, e-commerce, video editing, graphic design, English language, CV writing, and freelancing skills.',
    cat: 'Learning',
  },
  {
    q: 'How many hours do I need to commit as a volunteer?',
    a: 'There is no minimum commitment. You set your own availability when creating your profile. Even one hour a month can make a meaningful difference. Many volunteers run one weekly session, while others do occasional workshops.',
    cat: 'Volunteers',
  },
  {
    q: 'What happens after I learn a skill — can GazaBridge help me find a job?',
    a: 'Yes. We provide resources and guidance on finding remote work — connecting graduates with remote job boards, freelance platforms like Upwork and Fiverr, and a network of employers who actively look for talent from Gaza.',
    cat: 'Learning',
  },
  {
    q: 'How do live sessions work?',
    a: 'Sessions are arranged directly between the volunteer and learner. Most use WhatsApp video calls, Zoom, Google Meet, or any platform both parties prefer. There is no mandatory tool — flexibility is built into how we work.',
    cat: 'Learning',
  },
  {
    q: 'Is GazaBridge affiliated with any government or political organization?',
    a: 'No. GazaBridge is an independent, non-political platform. We are a community of humans who believe in education, solidarity, and opportunity — regardless of politics or borders.',
    cat: 'General',
  },
]

const CATS = ['All', 'General', 'Volunteers', 'Learning', 'Privacy']

function AccordionItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="opacity-0-start animate-fade-up border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-6 text-left cursor-pointer bg-[var(--warm-white)] hover:bg-[var(--sand)]/30 transition-colors duration-300 border-0"
      >
        <span className="font-body font-semibold text-base text-[var(--ink)] leading-snug">{faq.q}</span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center transition-all duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', background: open ? 'var(--ember)' : 'transparent', borderColor: open ? 'var(--ember)' : undefined }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke={open ? 'white' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-6 pb-6 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-4 bg-[var(--warm-white)]">
          {faq.a}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage(props) {
  const [activeCat, setActiveCat] = useState('All')
  const filtered = activeCat === 'All' ? FAQS : FAQS.filter(f => f.cat === activeCat)

  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="FAQ"
        title={<>Frequently Asked<br /><span className="italic text-[var(--ember)]">Questions.</span></>}
        subtitle="Everything you need to know about GazaBridge. Can't find your answer? Email us at hello@gazabridge.org"
      />

      <div className="py-20 md:py-28 bg-[var(--warm-white)]">
        <Container>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-300 cursor-pointer border ${
                  activeCat === cat
                    ? 'bg-[var(--ember)] text-white border-[var(--ember)]'
                    : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--ember)] hover:text-[var(--ember)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-col gap-3">
              {filtered.map((faq, i) => <AccordionItem key={faq.q} faq={faq} index={i} />)}
            </div>
          </div>

          {/* Still have questions */}
          <div className="mt-16 max-w-3xl">
            <div className="rounded-3xl bg-gradient-to-br from-[var(--canvas)] to-[var(--sand)] border border-[var(--border)] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="text-4xl">💬</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2">Still have questions?</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">Reach out to our team directly. We're happy to help — usually within 24 hours.</p>
              </div>
              <a href="mailto:hello@gazabridge.org">
                <Button variant="primary" size="sm">Email Us</Button>
              </a>
            </div>
          </div>
        </Container>
      </div>
    </PageShell>
  )
}
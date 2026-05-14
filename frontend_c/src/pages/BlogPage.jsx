import { useState } from 'react'
import PageShell from '../components/PageShell'
import PageHero from '../components/PageHero'
import { Container, Button, Badge } from '../components/ui'

const POSTS = [
  {
    id: 1,
    tag: 'Gaza',
    tagColor: 'ember',
    title: 'The Digital Skills Gap in Gaza: Why Remote Work Is a Lifeline',
    excerpt: 'With over 60% youth unemployment and restricted movement, digital skills represent one of the few paths to economic independence for people in Gaza. Here\'s what the data shows — and what can be done.',
    author: 'GazaBridge Team',
    date: 'May 2025',
    readTime: '6 min read',
    emoji: '📊',
    gradient: 'from-[var(--ember)]/10 to-[var(--gold)]/5',
    content: `Gaza has one of the youngest, most educated populations in the Middle East — and one of the highest unemployment rates in the world. For young graduates, the physical borders that limit movement have made traditional employment nearly impossible to access.

But the internet has no border.

Remote work — software development, content writing, graphic design, customer support, data entry — represents a genuine path forward. And the barrier isn't talent. The barrier is access to skills training, mentorship, and the networks that open doors.

That's exactly the gap GazaBridge was built to close.

Studies show that even basic digital literacy — knowing how to build a professional online profile, how to communicate in professional English, how to submit a freelance proposal — can dramatically increase a person's chances of earning remotely.

GazaBridge connects people in Gaza with skilled volunteers who teach these skills one-on-one, for free, through flexible sessions that work around the realities of daily life in Gaza.

The need is urgent. The solution exists. The only thing missing is more bridges.`,
  },
  {
    id: 2,
    tag: 'GazaBridge',
    tagColor: 'olive',
    title: 'How GazaBridge Works: A Platform Built on Human Generosity',
    excerpt: 'We built GazaBridge differently — no courses to sell, no subscriptions to renew. Just a platform that gets out of the way and lets skilled humans teach other humans. Here\'s how we think about it.',
    author: 'Sana Adeel, Founder',
    date: 'April 2025',
    readTime: '4 min read',
    emoji: '🌉',
    gradient: 'from-[var(--olive)]/10 to-transparent',
    content: `Most edtech platforms are built around a product. GazaBridge is built around a relationship.

The core insight behind GazaBridge is simple: the world has an enormous surplus of skilled, generous people who want to help — and an enormous deficit of structured ways to do that. Most existing platforms either charge fees that exclude those who need help most, or they create bureaucratic barriers that exhaust the volunteers before they've taught a single lesson.

We removed both.

On GazaBridge, a volunteer creates a profile, posts what they can teach, and connects directly with someone who needs that skill. A learner describes what they need, browses volunteers, and starts learning the same day they sign up.

No application process. No waiting list. No cost.

We also made a deliberate choice to support multiple communication channels — WhatsApp, Telegram, platform messages — because we know that infrastructure in Gaza is unreliable, and flexibility is not a feature, it's a necessity.

GazaBridge is early. We have a small, passionate team. But we believe that the most powerful form of aid is a skill that lasts forever — and we are committed to building the infrastructure that makes that happen at scale.

If you have a skill to share, we'd love to have you.`,
  },
]

function BlogCard({ post, onRead }) {
  return (
    <div
      className="card-lift group bg-[var(--warm-white)] rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col cursor-pointer opacity-0-start animate-fade-up"
      style={{ animationFillMode: 'forwards' }}
      onClick={() => onRead(post)}
    >
      {/* Top visual */}
      <div className={`h-36 bg-gradient-to-br ${post.gradient} flex items-center justify-center text-6xl relative`}>
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%"><defs><pattern id={`bg${post.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#000"/></pattern></defs><rect width="100%" height="100%" fill={`url(#bg${post.id})`}/></svg>
        </div>
        <span className="relative">{post.emoji}</span>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <Badge color={post.tagColor}>{post.tag}</Badge>
          <span className="text-xs text-[var(--muted)] font-mono">{post.readTime}</span>
        </div>
        <h2 className="font-display font-bold text-xl text-[var(--ink)] leading-snug mb-3 group-hover:text-[var(--ember)] transition-colors duration-300">
          {post.title}
        </h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed flex-1 mb-6">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--ember)] to-[var(--gold)] flex items-center justify-center text-white text-xs font-bold">
              {post.author[0]}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">{post.author}</div>
              <div className="text-xs text-[var(--muted)]">{post.date}</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ember)] group-hover:gap-2 transition-all">
            Read
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>
    </div>
  )
}

function PostView({ post, onBack }) {
  return (
    <div className="py-20 md:py-28 bg-[var(--warm-white)]">
      <Container>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-10 cursor-pointer bg-transparent border-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M15 8H1M6 1l-5 7 5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Blog
          </button>

          <Badge color={post.tagColor}>{post.tag}</Badge>
          <h1 className="font-display font-black text-4xl md:text-5xl text-[var(--ink)] mt-5 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ember)] to-[var(--gold)] flex items-center justify-center text-white text-xs font-bold">
                {post.author[0]}
              </div>
              <span className="text-sm font-medium text-[var(--ink)]">{post.author}</span>
            </div>
            <span className="text-[var(--muted)] text-sm">{post.date}</span>
            <span className="font-mono text-xs text-[var(--muted)]">{post.readTime}</span>
          </div>

          <div className="prose-content">
            {post.content.split('\n\n').map((para, i) => (
              para.trim() && (
                <p key={i} className="text-base text-[var(--muted)] leading-[1.9] mb-6 font-body">
                  {para}
                </p>
              )
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default function BlogPage(props) {
  const [reading, setReading] = useState(null)

  return (
    <PageShell {...props}>
      <PageHero
        eyebrow="Blog"
        title={<>Stories, insights,<br /><span className="italic text-[var(--ember)]">and updates.</span></>}
        subtitle="Writing about Gaza, digital skills, remote work, and the mission behind GazaBridge."
      />

      {reading ? (
        <PostView post={reading} onBack={() => setReading(null)} />
      ) : (
        <div className="py-20 md:py-28 bg-[var(--warm-white)]">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {POSTS.map(post => (
                <BlogCard key={post.id} post={post} onRead={setReading} />
              ))}
            </div>

            {/* More coming soon */}
            <div className="mt-16 max-w-4xl">
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
                <div className="text-3xl mb-4">✍️</div>
                <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2">More stories coming soon</h3>
                <p className="text-sm text-[var(--muted)] max-w-md mx-auto">We're documenting the journeys of learners and volunteers. Want to share your story? Reach out.</p>
                <a href="mailto:hello@gazabridge.org" className="inline-block mt-4">
                  <Button variant="secondary" size="sm">Share Your Story</Button>
                </a>
              </div>
            </div>
          </Container>
        </div>
      )}
    </PageShell>
  )
}
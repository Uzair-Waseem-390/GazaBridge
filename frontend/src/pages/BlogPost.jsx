// frontend/src/pages/BlogPost.jsx
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts } from '../data/blog';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <article className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-8 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <div className="text-6xl mb-6">{post.image}</div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>By {post.author}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-16 p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Want to get involved?</h3>
              <p className="text-gray-600 mb-6">Join our community of volunteers and learners making a difference.</p>
              <Link
                to="/#"
                className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
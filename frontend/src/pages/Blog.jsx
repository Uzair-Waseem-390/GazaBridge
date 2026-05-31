// frontend/src/pages/Blog.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';

export default function Blog() {
  return (
    <div className="pt-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EA] via-white to-[#FAF3E8]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-[#FDFCF8] text-[#6B6A2E] rounded-full text-sm font-semibold mb-4 border border-[#6B6A2E]/20">
              Our Blog
            </span>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#C26100] to-[#808000] bg-clip-text text-transparent">Insights</span>

            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read about our mission, impact, and the people we serve.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 h-full group">
                    <div className="text-6xl mb-6">{post.image}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#808000] transition-colors">

                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-500">By {post.author}</span>
                      <span className="text-sm font-medium text-[#808000] group-hover:translate-x-1 transition-transform inline-block">

                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
// frontend/src/pages/dashboard/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { postsAPI } from '../../api/posts';
import { coursesAPI } from '../../api/courses';

export default function UserDashboard() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [stats, setStats] = useState({
    offers: 0,
    requests: 0,
    courses: 0,
    liveSections: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [offersRes, requestsRes, coursesRes] = await Promise.all([
          postsAPI.getOffers({ user_id: user?.id, page_size: 100 }),
          postsAPI.getRequests({ user_id: user?.id, page_size: 100 }),
          coursesAPI.getCourses({ user_id: user?.id, page_size: 100 }),
        ]);

        const offers = offersRes.data.results || offersRes.data || [];
        const requests = requestsRes.data.results || requestsRes.data || [];
        const courses = coursesRes.data.results || coursesRes.data || [];

        setStats({
          offers: offers.length,
          requests: requests.length,
          courses: courses.length,
          liveSections: 0,
        });

        // Combine and sort recent posts
        const allPosts = [
          ...offers.map(o => ({ ...o, postType: 'offer' })),
          ...requests.map(r => ({ ...r, postType: 'request' })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        setRecentPosts(allPosts);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const getInitials = () => {
    const first = profile?.first_name?.[0] || user?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getStatAccent = (label) => ({
    Offers: 'from-[#8A9A5B] to-[#6B7C4E]',
    Requests: 'from-[#A7B47A] to-[#6B7C4E]',
    Courses: 'from-[#6B7C4E] to-[#B8B08A]',
    'Live Sections': 'from-[#8A9A5B] to-[#D6C8A8]',
  }[label] || 'from-[#8A9A5B] to-[#6B7C4E]');

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome Section */}
        <div className="bg-[rgba(237,232,220,0.15)] backdrop-blur-xl rounded-3xl shadow-lg shadow-[#6B7C4E]/5 p-8 mb-8 border border-[rgba(237,232,220,0.30)]">
          <div className="flex items-center gap-6">

            <div className="w-20 h-20 bg-gradient-to-br from-[#8A9A5B] to-[#6B7C4E] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#6B7C4E]/20">
              {getInitials()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2F3525]">
                Welcome back, {profile?.first_name || user?.first_name || 'User'}!
              </h1>
              <p className="text-[#6F675C] mt-1">{user?.email}</p>
              <div className="flex gap-2 mt-3">
                {user?.roles?.map(role => (
                  <span key={role.id || role} className="px-3 py-1 bg-olive-10 text-olive-dark rounded-full text-xs font-semibold capitalize border border-olive-15">
                    {typeof role === 'string' ? role : role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {[
            { label: 'Offers', value: stats.offers, icon: '🙌', color: 'from-blue-500 to-cyan-500', path: '/posts' },
            { label: 'Requests', value: stats.requests, icon: '🌟', color: 'from-purple-500 to-pink-500', path: '/posts' },
            { label: 'Courses', value: stats.courses, icon: '📚', color: 'from-olive to-[#F5F0E6]0', path: '/courses' },
            { label: 'Live Sections', value: stats.liveSections, icon: '📡', color: 'from-orange-500 to-red-500', path: '/live-sections' },
          ].map(stat => (
            <Link key={stat.label} to={stat.path}>
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#FAF8F2]/75 backdrop-blur-xl rounded-2xl shadow-lg shadow-[#6B7C4E]/5 p-6 border border-[#D9D0BD]/70 hover:bg-[#F5F0E8]/90 hover:border-olive-20 hover:shadow-xl hover:shadow-[#6B7C4E]/10 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${getStatAccent(stat.label)} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm shadow-[#6B7C4E]/20`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#2F3525]">{stat.value}</div>
                <div className="text-[#6F675C] text-sm mt-1">{stat.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="bg-[rgba(237,232,220,0.15)] backdrop-blur-xl rounded-3xl shadow-lg shadow-[#6B7C4E]/5 p-8 border border-[rgba(237,232,220,0.30)]">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2F3525]">Recent Posts</h2>
            <Link to="/posts" className="text-olive hover:text-olive-dark font-semibold text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-[rgba(237,232,220,0.18)] rounded-xl animate-pulse">

                  <div className="h-4 bg-[rgba(237,232,220,0.25)] rounded w-3/4 mb-2" />

                  <div className="h-3 bg-[#D9D0BD] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8 text-[#6F675C]">
              <div className="text-4xl mb-4">📝</div>
              <p>No posts yet. Create your first offer or request!</p>
              <Link to="/posts" className="text-olive font-semibold mt-2 inline-block">
                Create Post →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map(post => (
                <Link
                  key={post.id}
                  to={post.postType === 'offer' ? `/offers/${post.id}` : `/posts`}
                  className="flex items-start gap-4 p-4 bg-[#EDE8DC]/55 rounded-xl border border-[#D9D0BD]/50 hover:bg-olive-10 hover:border-olive-20 transition-colors"
                >
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                    post.postType === 'offer'
                      ? 'bg-olive-10 text-olive-dark'
                      : 'bg-[#EDE8DC] text-[#5A653B]'
                  }`}>
                    {post.postType === 'offer' ? 'Offer' : 'Request'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2F3525]">
                      {post.postType === 'offer' ? post.offer_name : post.request_name}
                    </h3>
                    <p className="text-sm text-[#6F675C] mt-1 line-clamp-2">{post.description}</p>
                    <p className="text-xs text-[#8C8375] mt-2">
                      {new Date(post.created_at).toLocaleDateString()} • {post.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

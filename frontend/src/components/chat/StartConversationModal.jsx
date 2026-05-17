// frontend/src/components/chat/StartConversationModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../../api/users';
import { chatAPI } from '../../api/chat';

/**
 * Modal for starting a new 1-on-1 conversation by searching for a user by email.
 * On success it calls onStarted(conversation) so the parent can switch to that chat.
 */
export default function StartConversationModal({ onClose, onStarted }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [starting, setStarting] = useState(null); // user id being started

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchDone(false);
    setResults([]);
    try {
      const res = await usersAPI.getUsers({ search: query.trim(), page_size: 10 });
      const data = res.data?.results || res.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('User search error:', err);
    } finally {
      setSearching(false);
      setSearchDone(true);
    }
  };

  /**
   * Starting a conversation works by opening the WebSocket to /ws/chat/<user_id>/
   * which auto-creates the Conversation row (via get_or_create_conversation in consumers.py).
   * We also fetch the conversation list so we can find the conv id.
   * Simplest approach: tell parent about the user, let parent normalise the chat object.
   */
  const handleStartChat = async (targetUser) => {
    setStarting(targetUser.id);
    try {
      // Load (or create via first WS message) conversation list
      // We represent the "pending" conversation with enough info for ChatWindow to connect
      const chatObject = {
        type: 'dm',
        id: null, // conv id unknown until first message — ChatWindow handles that
        otherUser: {
          id: targetUser.id,
          email: targetUser.email,
          first_name: targetUser.first_name,
          last_name: targetUser.last_name,
        },
      };
      onStarted(chatObject);
    } catch (err) {
      console.error('Start chat error:', err);
    } finally {
      setStarting(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">New Conversation</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchDone(false); }}
                placeholder="Search by name or email..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={searching || !query.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 hover:shadow-md transition-all"
              >
                {searching ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : 'Search'}
              </button>
            </form>

            {/* Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {u.first_name?.[0] || u.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(u)}
                    disabled={starting === u.id}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {starting === u.id ? '...' : 'Chat'}
                  </button>
                </div>
              ))}

              {searchDone && results.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No users found.</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

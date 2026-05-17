// frontend/src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/chat';
import { useWebSocket } from '../../hooks/useWebSocket';
import GroupInfoModal from './GroupInfoModal';
import StartConversationModal from './StartConversationModal';

export default function ChatWindow({ chat, onNewConversation, onUpdate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showStartConv, setShowStartConv] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const wsUrl = chat.type === 'dm'
    ? `/ws/chat/${chat.otherUser?.id}/`
    : `/ws/chat/group/${chat.id}/`;

  const { sendMessage } = useWebSocket(wsUrl, {
    enabled: !!chat,
    onMessage: (data) => {
      if (data.type === 'error') {
        console.error(data.message);
        return;
      }
      setMessages(prev => [...prev, data]);
    },
    onOpen: () => {
      console.log('Chat WebSocket connected');
    },
  });

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        let response;
        if (chat.type === 'dm') {
          response = await chatAPI.getConversationMessages(chat.id, { page_size: 50 });
        } else {
          response = await chatAPI.getGroupMessages(chat.id, { page_size: 50 });
        }
        setMessages(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    if (chat) {
      fetchMessages();
      setMessages([]);
    }
  }, [chat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat?.id, chat?.type]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ content: input.trim() });
    setInput('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            chat.type === 'dm'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-purple-400 to-pink-500'
          }`}>
            {chat.type === 'dm'
              ? (chat.otherUser?.first_name?.[0] || '?')
              : (chat.group?.name?.[0]?.toUpperCase() || 'G')}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {chat.type === 'dm'
                ? `${chat.otherUser?.first_name} ${chat.otherUser?.last_name}`
                : chat.group?.name}
            </h2>
            {chat.type === 'group' && (
              <p className="text-xs text-gray-500">{chat.group?.member_count} members</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {chat.type === 'dm' && (
            <button
              onClick={() => setShowStartConv(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          {chat.type === 'group' && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              title="Group info"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            const showDate = index === 0 || 
              new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

            return (
              <div key={msg.id || index}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                    {!isMe && chat.type === 'group' && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_email}</p>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'text-left ml-1'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>

      {/* Modals */}
      <AnimatePresence>
        {showGroupInfo && (
          <GroupInfoModal
            groupId={chat.id}
            onClose={() => setShowGroupInfo(false)}
            onUpdate={onUpdate}
          />
        )}
        {showStartConv && (
          <StartConversationModal
            onClose={() => setShowStartConv(false)}
            onStarted={(conv) => {
              setShowStartConv(false);
              onNewConversation(conv);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
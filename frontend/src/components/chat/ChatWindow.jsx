// frontend/src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/chat';
import { useWebSocket } from '../../hooks/useWebSocket';
import GroupInfoModal from './GroupInfoModal';
import StartConversationModal from './StartConversationModal';

/**
 * ChatWindow
 * ----------
 * Handles both DM and group chats.
 *
 * chat prop shape:
 *   DM    → { type: 'dm',    id: <convId>, otherUser: { id, email, first_name, last_name } }
 *   Group → { type: 'group', id: <groupId>, group: { id, name, description, member_count } }
 *
 * WebSocket protocol (matches consumers.py):
 *   SEND:    { "content": "hello" }
 *   RECEIVE: { "id": 1, "sender_id": 5, "sender_email": "a@b.com", "content": "hello", "created_at": "..." }
 *         OR { "type": "error", "message": "..." }
 *
 * Fixes applied:
 *   - Auto-marks messages as read when chat opens and on every new incoming WS message
 *   - Scroll uses scrollTop on the container ref (NOT scrollIntoView which jumps the page)
 *
 * Auth: JWT sent as query param ?token=<access_token>  (see ws_auth.py)
 */
export default function ChatWindow({ chat, onNewConversation, onUpdate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting'); // 'connecting' | 'open' | 'closed'
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showStartConv, setShowStartConv] = useState(false);
  // Use container ref for scroll — direct scrollTop avoids scrollIntoView jumping the window
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // ── WebSocket URL ──────────────────────────────────────────────────────────
  // DM:    /ws/chat/<other_user_id>/
  // Group: /ws/chat/group/<group_id>/
  const wsPath = chat?.type === 'dm'
    ? `/ws/chat/${chat.otherUser?.id}/`
    : `/ws/chat/group/${chat?.id}/`;

  /**
   * markUnread — fire-and-forget read receipts for a list of messages.
   * Only marks messages NOT sent by the current user.
   */
  const markUnread = useCallback((msgs, isGroup) => {
    msgs.forEach((msg) => {
      const senderId = msg.sender_id ?? msg.sender;
      if (!msg.is_read && senderId !== user?.id) {
        if (isGroup) {
          chatAPI.markGroupMessageRead(msg.id).catch(() => {});
        } else {
          chatAPI.markMessageRead(msg.id).catch(() => {});
        }
      }
    });
  }, [user?.id]);

  const handleWsMessage = useCallback((data) => {
    if (data.type === 'error') {
      console.error('[Chat] WS error from server:', data.message);
      return;
    }
    // Append new real-time message
    setMessages((prev) => {
      // Deduplicate by id in case REST load and WS overlap
      if (data.id && prev.some((m) => m.id === data.id)) return prev;
      return [...prev, data];
    });
    // Auto-mark incoming message as read (user is actively in this chat)
    const senderId = data.sender_id ?? data.sender;
    if (data.id && senderId !== user?.id) {
      const isGroup = chat?.type === 'group';
      if (isGroup) {
        chatAPI.markGroupMessageRead(data.id).catch(() => {});
      } else {
        chatAPI.markMessageRead(data.id).catch(() => {});
      }
    }
  }, [user?.id, chat?.type]);

  const { sendMessage } = useWebSocket(wsPath, {
    enabled: !!chat,
    onMessage: handleWsMessage,
    onOpen: () => setWsStatus('open'),
    onClose: () => setWsStatus('closed'),
    onError: () => setWsStatus('closed'),
  });

  // ── Load historical messages via REST ─────────────────────────────────────
  useEffect(() => {
    if (!chat) return;

    let cancelled = false;
    setMessages([]);
    setLoading(true);

    const fetchMessages = async () => {
      try {
        let res;
        if (chat.type === 'dm' && chat.id) {
          res = await chatAPI.getConversationMessages(chat.id, { page_size: 50 });
        } else if (chat.type === 'group') {
          res = await chatAPI.getGroupMessages(chat.id, { page_size: 50 });
        } else {
          // Brand-new DM — no history yet
          if (!cancelled) setLoading(false);
          return;
        }

        if (!cancelled) {
          const data = res.data;
          const msgs = Array.isArray(data) ? data : (data.results || []);
          setMessages(msgs);
          // ── Auto-mark all unread messages as read ─────────────────────
          markUnread(msgs, chat.type === 'group');
        }
      } catch (err) {
        console.error('[Chat] Failed to fetch message history:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [chat?.id, chat?.type, markUnread]);

  // ── Auto-scroll (use scrollTop, NOT scrollIntoView — scrollIntoView jumps the page) ──
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    // Use requestAnimationFrame so the DOM has painted before we measure scrollHeight
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // ── Focus input ───────────────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat?.id, chat?.type]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Send over WebSocket (consumers.py saves & broadcasts)
    sendMessage({ content: text });
    setInput('');
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSameDay = (a, b) =>
    new Date(a).toDateString() === new Date(b).toDateString();

  // ── Render ────────────────────────────────────────────────────────────────
  const chatName = chat?.type === 'dm'
    ? `${chat.otherUser?.first_name ?? ''} ${chat.otherUser?.last_name ?? ''}`.trim() || chat.otherUser?.email
    : (chat?.group?.name ?? 'Group');

  const avatarLetter = chat?.type === 'dm'
    ? (chat.otherUser?.first_name?.[0] || '?').toUpperCase()
    : (chat?.group?.name?.[0] || 'G').toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-full bg-white" id="chat-window">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
            chat?.type === 'dm'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-purple-400 to-pink-500'
          }`}>
            {avatarLetter}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight">{chatName}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                wsStatus === 'open' ? 'bg-emerald-400' : wsStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
              }`} />
              <span className="text-xs text-gray-400">
                {wsStatus === 'open' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}
              </span>
              {chat?.type === 'group' && (
                <span className="text-xs text-gray-400 ml-2">· {chat?.group?.member_count ?? 0} members</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {chat?.type === 'dm' && (
            <button
              id="start-new-conv-btn"
              onClick={() => setShowStartConv(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          {chat?.type === 'group' && (
            <button
              id="group-info-btn"
              onClick={() => setShowGroupInfo(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              title="Group info"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Area ──────────────────────────────────────────────── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gradient-to-b from-slate-50/50 to-white" id="messages-area">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
              chat?.type === 'dm' ? 'bg-emerald-50' : 'bg-purple-50'
            }`}>
              {chat?.type === 'dm' ? '💬' : '👥'}
            </div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id || msg.sender === user?.id;
            const showDate =
              index === 0 ||
              !isSameDay(msg.created_at, messages[index - 1]?.created_at);

            return (
              <div key={msg.id ?? `msg-${index}`}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender name in group */}
                    {!isMe && chat?.type === 'group' && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_email}</p>
                    )}

                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }`}>
                      {msg.content}
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
      </div>

      {/* ── Input Area ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-gray-100 bg-white"
        id="chat-input-form"
      >
        <div className="flex gap-2 items-end">
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={wsStatus === 'open' ? 'Type a message…' : 'Connecting…'}
            disabled={wsStatus !== 'open'}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none bg-gray-50 placeholder:text-gray-400 disabled:opacity-60"
          />
          <motion.button
            id="chat-send-btn"
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || wsStatus !== 'open'}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGroupInfo && (
          <GroupInfoModal
            key="group-info"
            groupId={chat?.id}
            onClose={() => setShowGroupInfo(false)}
            onUpdate={() => { onUpdate?.(); setShowGroupInfo(false); }}
          />
        )}
        {showStartConv && (
          <StartConversationModal
            key="start-conv"
            onClose={() => setShowStartConv(false)}
            onStarted={(conv) => {
              setShowStartConv(false);
              onNewConversation?.(conv);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
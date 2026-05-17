// frontend/src/api/chat.js
import api from './axios';

/**
 * chatAPI — all REST calls for the chat app.
 *
 * WebSocket connections are handled via useWebSocket hook (NOT here).
 * This file is only for HTTP REST calls:
 *   - Loading conversation/group lists
 *   - Fetching historical messages
 *   - Group management (create, add/remove member, make admin)
 *   - Block/unblock users
 *   - Marking messages as read
 */
export const chatAPI = {
  // ── Conversations ─────────────────────────────────────────────────────────

  /** GET /chat/conversations/ — list all conversations for the current user */
  getConversations: (params = {}) =>
    api.get('/chat/conversations/', { params }),

  /** GET /chat/conversations/<conv_id>/messages/ — paginated message history */
  getConversationMessages: (convId, params = {}) =>
    api.get(`/chat/conversations/${convId}/messages/`, { params }),

  // ── Read Receipts ─────────────────────────────────────────────────────────

  /** PATCH /chat/messages/<id>/read/ */
  markMessageRead: (messageId) =>
    api.patch(`/chat/messages/${messageId}/read/`),

  /** PATCH /chat/messages/<id>/read-group/ */
  markGroupMessageRead: (messageId) =>
    api.patch(`/chat/messages/${messageId}/read-group/`),

  // ── Block / Unblock ───────────────────────────────────────────────────────

  /** POST /chat/block/<user_id>/ */
  blockUser: (userId) =>
    api.post(`/chat/block/${userId}/`),

  /** DELETE /chat/unblock/<user_id>/ */
  unblockUser: (userId) =>
    api.delete(`/chat/unblock/${userId}/`),

  /** GET /chat/blocked/ */
  getBlockedUsers: () =>
    api.get('/chat/blocked/'),

  // ── Groups ────────────────────────────────────────────────────────────────

  /** POST /chat/groups/create/ — { name, description? } */
  createGroup: (data) =>
    api.post('/chat/groups/create/', data),

  /** GET /chat/groups/ — list all groups for the current user */
  getGroups: (params = {}) =>
    api.get('/chat/groups/', { params }),

  /** GET /chat/groups/<id>/ */
  getGroupDetail: (groupId) =>
    api.get(`/chat/groups/${groupId}/`),

  /** DELETE /chat/groups/<id>/ */
  deleteGroup: (groupId) =>
    api.delete(`/chat/groups/${groupId}/`),

  /** GET /chat/groups/<id>/messages/ — paginated group message history */
  getGroupMessages: (groupId, params = {}) =>
    api.get(`/chat/groups/${groupId}/messages/`, { params }),

  /** POST /chat/groups/<id>/add-member/ — { email } */
  addGroupMember: (groupId, email) =>
    api.post(`/chat/groups/${groupId}/add-member/`, { email }),

  /** DELETE /chat/groups/<group_id>/remove-member/<user_id>/ */
  removeGroupMember: (groupId, userId) =>
    api.delete(`/chat/groups/${groupId}/remove-member/${userId}/`),

  /** POST /chat/groups/<group_id>/make-admin/<user_id>/ */
  makeGroupAdmin: (groupId, userId) =>
    api.post(`/chat/groups/${groupId}/make-admin/${userId}/`),
};

// frontend/src/components/chat/GroupInfoModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/chat';

export default function GroupInfoModal({ groupId, onClose, onUpdate }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // member id being acted on

  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError]     = useState('');

  const fetchGroup = async () => {
    try {
      const res = await chatAPI.getGroupDetail(groupId);
      setGroup(res.data);
    } catch (err) {
      console.error('Failed to fetch group:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const isOwner = group?.owner === user?.id;
  const currentMembership = group?.members?.find((m) => m.id === user?.id);
  const isAdmin = isOwner || currentMembership?.is_admin;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAddLoading(true);
    setAddError('');
    try {
      await chatAPI.addGroupMember(groupId, addEmail.trim());
      setAddEmail('');
      await fetchGroup();
      onUpdate?.();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to add member.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setActionLoading(memberId);
    try {
      await chatAPI.removeGroupMember(groupId, memberId);
      await fetchGroup();
      onUpdate?.();
    } catch (err) {
      console.error('Remove member error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    setActionLoading(memberId);
    try {
      await chatAPI.makeGroupAdmin(groupId, memberId);
      await fetchGroup();
      onUpdate?.();
    } catch (err) {
      console.error('Make admin error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group permanently?')) return;
    try {
      await chatAPI.deleteGroup(groupId);
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error('Delete group error:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setLeaveLoading(true);
    setLeaveError('');
    try {
      await chatAPI.leaveGroup(groupId);
      onUpdate?.();
      onClose();
    } catch (err) {
      setLeaveError(err.response?.data?.detail || 'Failed to leave the group.');
    } finally {
      setLeaveLoading(false);
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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {group?.name?.[0]?.toUpperCase() || 'G'}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{group?.name || 'Group Info'}</h2>
                <p className="text-xs text-gray-500">{group?.member_count} members</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Description */}
                {group?.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{group.description}</p>
                )}

                {/* Add Member (admin only) */}
                {isAdmin && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Member</h3>
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <input
                        type="email"
                        value={addEmail}
                        onChange={(e) => { setAddEmail(e.target.value); setAddError(''); }}
                        placeholder="user@email.com"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={addLoading || !addEmail.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 hover:shadow-md transition-all"
                      >
                        {addLoading ? '...' : 'Add'}
                      </button>
                    </form>
                    {addError && <p className="text-red-500 text-xs mt-1">{addError}</p>}
                  </div>
                )}

                {/* Members List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Members ({group?.members?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {group?.members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {member.first_name?.[0] || member.email?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                              {member.id === group.owner && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Owner</span>
                              )}
                              {member.is_admin && member.id !== group.owner && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Admin</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>

                        {/* Actions (admin only, not for self or owner) */}
                        {isAdmin && member.id !== user?.id && member.id !== group.owner && (
                          <div className="flex gap-1">
                            {!member.is_admin && (
                              <button
                                onClick={() => handleMakeAdmin(member.id)}
                                disabled={actionLoading === member.id}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                                title="Make admin"
                              >
                                {actionLoading === member.id ? '...' : '↑ Admin'}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={actionLoading === member.id}
                              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Remove member"
                            >
                              {actionLoading === member.id ? '...' : 'Remove'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone (owner only) */}
                {isOwner && (
                  <div className="border border-red-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <button
                      onClick={handleDeleteGroup}
                      className="w-full py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      Delete Group
                    </button>
                  </div>
                )}

                {/* Leave Group (non-owner members only) */}
                {!isOwner && currentMembership && (
                  <div className="border border-orange-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-orange-600 mb-2">Leave Group</h3>
                    {leaveError && (
                      <p className="text-red-500 text-xs mb-2">{leaveError}</p>
                    )}
                    <button
                      onClick={handleLeaveGroup}
                      disabled={leaveLoading}
                      className="w-full py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {leaveLoading ? 'Leaving…' : 'Leave Group'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

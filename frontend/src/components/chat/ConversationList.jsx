// frontend/src/components/chat/ConversationList.jsx
import { motion } from 'framer-motion';

export default function ConversationList({ conversations, groups, activeChat, activeTab, onSelectConversation, onSelectGroup }) {
  return (
    <div className="divide-y divide-gray-100">
      {/* Direct Messages */}
      {(activeTab === 'all' || activeTab === 'dms') && conversations.map(conv => (
        <motion.button
          key={`dm-${conv.id}`}
          whileHover={{ backgroundColor: '#f9fafb' }}
          onClick={() => onSelectConversation(conv)}
          className={`w-full p-4 text-left transition-colors ${
            activeChat?.type === 'dm' && activeChat?.id === conv.id
              ? 'bg-emerald-50 border-l-4 border-emerald-500'
              : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {conv.other_user?.first_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 truncate">
                  {conv.other_user?.first_name} {conv.other_user?.last_name}
                </span>
                {conv.unread_count > 0 && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conv.last_message?.content || 'Start a conversation'}
              </p>
            </div>
          </div>
        </motion.button>
      ))}

      {/* Groups */}
      {(activeTab === 'all' || activeTab === 'groups') && groups.map(group => (
        <motion.button
          key={`group-${group.id}`}
          whileHover={{ backgroundColor: '#f9fafb' }}
          onClick={() => onSelectGroup(group)}
          className={`w-full p-4 text-left transition-colors ${
            activeChat?.type === 'group' && activeChat?.id === group.id
              ? 'bg-purple-50 border-l-4 border-purple-500'
              : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {group.name[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 truncate">{group.name}</span>
                <span className="text-xs text-gray-400 ml-2">{group.member_count} members</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{group.description || 'Group chat'}</p>
            </div>
          </div>
        </motion.button>
      ))}

      {conversations.length === 0 && groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No conversations yet</p>
        </div>
      )}
    </div>
  );
}
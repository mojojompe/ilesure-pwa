import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton, ChatItemSkeleton } from '../../components/ui/SkeletonLoader';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { Search01Icon, BubbleChatIcon } from '@hugeicons/react';
import { chatService, Conversation } from '../../api/chatService';
import { formatDistanceToNow, format } from 'date-fns';

export function ChatsList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        // Map to match RN ChatPreview
        const formattedChats = response.data.chats.map(chat => ({
          id: chat.id,
          participantId: chat.participant?._id || '',
          name: chat.participant?.fullName || 'Unknown User',
          avatar: chat.participant?.avatar,
          lastMessage: chat.lastMessage || 'No messages yet',
          timestamp: chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'h:mm a') : '',
          unreadCount: chat.unreadCount || 0,
          isOnline: false, // We'd get this from sockets in a full impl
          type: chat.participant?.role || 'user',
          propertyTitle: chat.listingId?.title,
          listingId: chat.listingId?._id,
        }));
        setChats(formattedChats);
      }
    } catch (error) {
      console.error('Failed to fetch chats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      chat.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AppShell>
      <div className="px-5 pt-safe-top pb-6 min-h-full bg-background flex flex-col relative overflow-hidden">
        {/* RN background pattern approximation */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] -z-10" />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 mb-6"
        >
          <h1 className="text-[28px] font-black text-textPrimary tracking-tight mb-1">Chats</h1>
          <p className="text-textSecondary text-sm">Your conversations</p>
        </motion.div>

        {/* Search Bar */}
        <div className="flex flex-row items-center bg-surfaceLight rounded-xl px-4 py-3 mb-6 shadow-sm">
          <Search01Icon size={18} className="text-textTertiary mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base text-textPrimary placeholder:text-textTertiary"
          />
        </div>

        {/* Content */}
        <RefreshIndicator isRefreshing={refreshing} />
        
        <div className="flex-1">
          {loading && !refreshing ? (
            <div className="flex flex-col">
              <ChatItemSkeleton />
              <ChatItemSkeleton />
              <ChatItemSkeleton />
              <ChatItemSkeleton />
            </div>
          ) : filteredChats.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px] flex flex-col gap-3"
            >
              {filteredChats.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${item.id}`)}
                  className="flex flex-row items-center p-4 bg-surface rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight cursor-pointer active:bg-surfaceLight transition-colors"
                >
                  <div className="relative mr-4 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-base font-bold">
                          {item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>
                    {item.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-status-success rounded-full border-2 border-surface" />
                    )}
                    {item.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-error rounded-full flex items-center justify-center border-2 border-surface">
                        <span className="text-[10px] text-white font-bold">{item.unreadCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                    <div className="flex flex-row justify-between items-center mb-0.5">
                      <h3 className="text-base font-bold text-textPrimary truncate mr-2">{item.name}</h3>
                      <span className="text-xs font-semibold text-textTertiary shrink-0">{item.timestamp}</span>
                    </div>
                    {item.propertyTitle && (
                      <p className="text-[11px] font-semibold text-primary truncate mb-0.5">
                        {item.propertyTitle}
                      </p>
                    )}
                    <p className={`text-sm truncate ${item.unreadCount > 0 ? 'text-textPrimary font-semibold' : 'text-textSecondary'}`}>
                      {item.lastMessage}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-surfaceLight flex items-center justify-center mb-4">
                <BubbleChatIcon size={32} className="text-textTertiary" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">No chats found</h3>
              <p className="text-sm text-textSecondary px-8">
                {searchQuery 
                  ? "We couldn't find any chats matching your search."
                  : "Reach out to a landlord from a listing to start chatting."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

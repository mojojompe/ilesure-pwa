import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton, NotificationSkeleton } from '../../components/ui/SkeletonLoader';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { 
  Notification01Icon, 
  Cancel01Icon,
  Home01Icon,
  UserMultipleIcon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  InformationCircleIcon
} from '@hugeicons/react';
import { notificationService } from '../../api/notificationService';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  match: { icon: UserMultipleIcon, color: '#E1AD01', bg: '#FEF3C7' },
  listing: { icon: Home01Icon, color: '#3E1F0A', bg: '#F2F0EC' },
  booking: { icon: CheckmarkBadge01Icon, color: '#4CAF50', bg: '#E8F5E9' },
  alert: { icon: Alert02Icon, color: '#FF9800', bg: '#FFF3E0' },
  system: { icon: InformationCircleIcon, color: '#2196F3', bg: '#E3F2FD' },
};

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await notificationService.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notif: any) => {
    // In a real app, open modal or navigate. Here we just mark as read.
    if (!notif.readAt && notif.id !== 'system-bank-account-req') {
      try {
        await notificationService.markAsRead(notif.id || notif._id);
        setNotifications(prev =>
          prev.map(n => (n.id || n._id) === (notif.id || notif._id) ? { ...n, readAt: new Date().toISOString() } : n)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDelete = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => (n.id || n._id) !== notifId));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.readAt && !n.read).length;
  }, [notifications]);

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
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-bl-[100px] -z-10" />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 mb-6"
        >
          <div className="flex flex-row justify-between items-center mb-1">
            <div className="flex flex-row items-center gap-2">
              <h1 className="text-[28px] font-black text-textPrimary tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <div className="bg-accent rounded-full px-2 py-0.5 flex items-center justify-center">
                  <span className="text-primary text-xs font-extrabold">{unreadCount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-row justify-between items-center">
            <p className="text-textSecondary text-sm">Stay updated with your activity</p>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="active:opacity-70 transition-opacity"
              >
                <span className="text-accent text-sm font-semibold">Mark all read</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <RefreshIndicator isRefreshing={refreshing} />
        
        <div className="flex-1">
          {loading && !refreshing ? (
            <div className="flex flex-col">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : notifications.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px] flex flex-col gap-3"
            >
              <AnimatePresence>
                {notifications.map((notif) => {
                  const id = notif.id || notif._id;
                  const isUnread = !notif.readAt && !notif.read;
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                  const Icon = config.icon;

                  return (
                    <motion.div 
                      key={id} 
                      variants={itemVariants}
                      exit={{ opacity: 0, x: -50 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNotificationPress(notif)}
                      className={`flex flex-row items-start p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border cursor-pointer active:opacity-90 transition-all ${
                        isUnread 
                          ? 'bg-surfaceLight border-l-4 border-l-primary border-t-borderLight border-r-borderLight border-b-borderLight' 
                          : 'bg-surface border-borderLight'
                      }`}
                    >
                      <div 
                        className="w-11 h-11 rounded-full flex items-center justify-center mr-4 shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon size={22} style={{ color: config.color }} />
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-row items-center gap-2 mb-1">
                          <h3 className={`text-sm truncate ${isUnread ? 'font-extrabold text-textPrimary' : 'font-semibold text-textPrimary'}`}>
                            {notif.title}
                          </h3>
                          {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-sm text-textSecondary leading-[20px] mb-2 line-clamp-2">
                          {notif.body || notif.message}
                        </p>
                        <span className="text-xs text-textTertiary font-medium">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button 
                        onClick={(e) => handleDelete(id, e)}
                        className="p-1 -mt-1 -mr-1 active:scale-90 transition-transform"
                      >
                        <Cancel01Icon size={18} className="text-textTertiary hover:text-error" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-surfaceLight flex items-center justify-center mb-4">
                <Notification01Icon size={32} className="text-textTertiary" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">No notifications</h3>
              <p className="text-sm text-textSecondary px-8">
                You're all caught up! New notifications will appear here.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

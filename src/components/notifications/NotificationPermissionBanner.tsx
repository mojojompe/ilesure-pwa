import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification01Icon, Cancel01Icon, Home01Icon, UserMultipleIcon, BubbleChatIcon } from '@hugeicons/react';
import { pushNotificationService } from '../../api/pushNotificationService';
import { notificationService } from '../../api/notificationService';

export function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [doNotRemind, setDoNotRemind] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      // Don't show if push is not supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      const permission = Notification.permission;
      const suppressed = localStorage.getItem('push-banner-suppressed');

      // Show banner if permission is 'default' and user hasn't checked 'do not remind me'
      if (permission === 'default' && suppressed !== 'true') {
        // Double check if backend already thinks we are subscribed 
        // (unlikely if permission is default, but just in case)
        try {
          const settings = await notificationService.getSettings();
          if (!settings.data?.push) {
            setIsVisible(true);
          }
        } catch {
          setIsVisible(true);
        }
      }
    };

    // Small delay to allow the app to render first
    const timer = setTimeout(checkPermission, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    const permission = await pushNotificationService.requestPermission();
    if (permission === 'granted') {
      await pushNotificationService.subscribeUserToPush();
      // Update backend settings to enable push
      await notificationService.updateSettings({ push: true });
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    if (doNotRemind) {
      localStorage.setItem('push-banner-suppressed', 'true');
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleDismiss}
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] px-6 pt-3 pb-safe-bottom"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />

            {/* Icon Badge */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-[24px] bg-primary flex items-center justify-center shadow-lg">
                <Notification01Icon size={36} className="text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <h2 className="text-[22px] font-extrabold text-[#1A1A1A] text-center mb-2">
              Enable Notifications
            </h2>
            <p className="text-[15px] text-[#6B7280] text-center leading-relaxed mb-6 px-2">
              Don't miss booking updates, new matches, and important messages. Stay in the loop!
            </p>

            {/* Feature Highlights */}
            <div className="bg-[#F9F5EE] rounded-2xl p-4 mb-6 flex flex-col gap-3">
              {[
                { icon: Home01Icon, text: 'Instant booking confirmations & updates' },
                { icon: UserMultipleIcon, text: 'New roommate match alerts' },
                { icon: BubbleChatIcon, text: 'Message & chat notifications' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-primary"><item.icon size={20} variant="solid" /></span>
                  <span className="text-[14px] font-medium text-[#374151]">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Do not remind checkbox */}
            <div className="flex items-center gap-2 mb-5 px-1">
              <input
                type="checkbox"
                id="doNotRemind"
                checked={doNotRemind}
                onChange={(e) => setDoNotRemind(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <label htmlFor="doNotRemind" className="text-sm text-[#9CA3AF] cursor-pointer">
                Don't remind me again
              </label>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleEnable}
              className="w-full py-4 bg-primary text-white text-[15px] font-bold rounded-[50px] shadow-sm active:opacity-90 transition-opacity mb-3"
            >
              Enable Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-[15px] font-semibold text-[#6B7280] active:opacity-70 transition-opacity"
            >
              Not Now
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


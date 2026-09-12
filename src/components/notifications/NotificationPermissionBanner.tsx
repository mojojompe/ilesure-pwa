import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification01Icon, Cancel01Icon } from '@hugeicons/react';
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
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md bg-mustard-pale border border-mustard/30 p-4 rounded-clay shadow-clay-lg flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-mustard/20 flex items-center justify-center flex-shrink-0">
              <Notification01Icon className="w-5 h-5 text-mustard" />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="text-[15px] font-bold text-textPrimary mb-1">
                Enable Notifications
              </h4>
              <p className="text-sm text-textSecondary leading-snug">
                Stay updated on bookings, matches, and messages instantly.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-black/5 rounded-full transition-colors text-textTertiary hover:text-textSecondary"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="doNotRemind"
              checked={doNotRemind}
              onChange={(e) => setDoNotRemind(e.target.checked)}
              className="w-4 h-4 rounded text-mustard focus:ring-mustard border-clay-border bg-white"
            />
            <label htmlFor="doNotRemind" className="text-xs text-textSecondary cursor-pointer">
              Do not remind me again
            </label>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 text-sm font-semibold text-textSecondary bg-white border border-clay-border rounded-lg active:bg-gray-50 transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleEnable}
              className="flex-1 py-2 text-sm font-bold text-white bg-mustard rounded-lg shadow-sm active:bg-mustard-dark transition-colors"
            >
              Enable Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

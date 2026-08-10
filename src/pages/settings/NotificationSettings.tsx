import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { clsx } from 'clsx';
import notificationService from '../../api/notificationService';
import { customAlert } from '../../stores/alertStore';

const NOTIFICATION_SETTINGS = [
  { id: 'bookings', title: 'Booking Updates', description: 'Get notified about booking status changes', hasSwitch: true },
  { id: 'messages', title: 'New Messages', description: 'Receive alerts when you get new messages', hasSwitch: true },
  { id: 'listings', title: 'New Listings', description: 'Get notified about new listings in your area', hasSwitch: true },
  { id: 'matches', title: 'Roommate Matches', description: 'Alerts about new roommate compatibility', hasSwitch: true },
  { id: 'price', title: 'Price Drops', description: 'Get notified when saved listings have price changes', hasSwitch: true },
  { id: 'reminders', title: 'Payment Reminders', description: 'Reminders for upcoming payments', hasSwitch: true },
];

const PUSH_NOTIFICATIONS = [
  { id: 'push', title: 'Push Notifications', description: 'Receive notifications on your device', hasSwitch: true },
  { id: 'email', title: 'Email Notifications', description: 'Receive notifications via email', hasSwitch: true },
];

const DEFAULTS: Record<string, boolean> = {
  bookings: true,
  messages: true,
  listings: false,
  matches: true,
  price: false,
  reminders: true,
  push: true,
  email: true,
};

export function NotificationSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, boolean>>(DEFAULTS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await notificationService.getSettings();
        setSettings(prev => ({ ...prev, ...(response.data || {}) }));
      } catch (error: any) {
        customAlert(error.response?.data?.error?.message || 'Failed to load settings', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = async (id: string) => {
    const updated = { ...settings, [id]: !settings[id] };
    setSettings(updated);
    try {
      await notificationService.updateSettings(updated);
    } catch (error: any) {
      setSettings(settings); // Revert on failure
      customAlert('Failed to update setting', 'Error', 'error');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Notification Settings" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-6 uppercase">
            NOTIFICATION TYPES
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
            {NOTIFICATION_SETTINGS.map((item, idx) => (
              <div 
                key={item.id} 
                className={clsx(
                  "flex justify-between items-center px-4 py-4",
                  idx < NOTIFICATION_SETTINGS.length - 1 && "border-b border-borderLight"
                )}
              >
                <div className="flex-1 mr-4">
                  <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">{item.title}</h4>
                  <p className="text-sm text-textSecondary leading-snug">{item.description}</p>
                </div>
                {item.hasSwitch && (
                  <button 
                    className={clsx(
                      "w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300",
                      settings[item.id] ? "bg-accent" : "bg-border"
                    )}
                    onClick={() => toggleSetting(item.id)}
                  >
                    <div className={clsx(
                      "w-5 h-5 bg-surface rounded-full shadow-sm transition-transform duration-300",
                      settings[item.id] ? "translate-x-6" : ""
                    )} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-4 uppercase">
            DELIVERY METHODS
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {PUSH_NOTIFICATIONS.map((item, idx) => (
              <div 
                key={item.id} 
                className={clsx(
                  "flex justify-between items-center px-4 py-4",
                  idx < PUSH_NOTIFICATIONS.length - 1 && "border-b border-borderLight"
                )}
              >
                <div className="flex-1 mr-4">
                  <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">{item.title}</h4>
                  <p className="text-sm text-textSecondary leading-snug">{item.description}</p>
                </div>
                {item.hasSwitch && (
                  <button 
                    className={clsx(
                      "w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300",
                      settings[item.id] ? "bg-accent" : "bg-border"
                    )}
                    onClick={() => toggleSetting(item.id)}
                  >
                    <div className={clsx(
                      "w-5 h-5 bg-surface rounded-full shadow-sm transition-transform duration-300",
                      settings[item.id] ? "translate-x-6" : ""
                    )} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={handleReset}
            className="w-full text-center py-6 mt-4 active:opacity-70 transition-opacity"
          >
            <span className="text-[15px] font-bold text-error">Reset to Default</span>
          </button>
          
        </div>
      </div>
    </AppShell>
  );
}

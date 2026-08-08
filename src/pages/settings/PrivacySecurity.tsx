import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { ArrowRight01Icon } from '@hugeicons/react';
import { clsx } from 'clsx';

const PRIVACY_OPTIONS = [
  { id: 'profile', title: 'Profile Visibility', subtitle: 'Who can see your profile', value: 'Everyone' },
  { id: 'location', title: 'Location Services', subtitle: 'Allow app to access your location', enabled: true },
  { id: 'analytics', title: 'Analytics', subtitle: 'Help improve iléSure with usage data', enabled: true },
];

const SECURITY_OPTIONS = [
  { id: 'biometric', title: 'Biometric Login', subtitle: 'Use fingerprint or face ID', enabled: false },
  { id: '2fa', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security', enabled: false },
];

export function PrivacySecurity() {
  const navigate = useNavigate();
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean>>({
    location: true,
    analytics: true,
  });
  const [securitySettings, setSecuritySettings] = useState<Record<string, boolean>>({
    biometric: false,
    '2fa': false,
  });

  const togglePrivacy = (id: string) => {
    setPrivacySettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSecurity = (id: string) => {
    setSecuritySettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Privacy & Security" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-6 uppercase">
            PRIVACY
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
            {PRIVACY_OPTIONS.map((item, idx) => (
              <div 
                key={item.id} 
                className={clsx(
                  "flex justify-between items-center px-4 py-4",
                  idx < PRIVACY_OPTIONS.length - 1 && "border-b border-borderLight"
                )}
              >
                <div className="flex-1 mr-4">
                  <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">{item.title}</h4>
                  <p className="text-sm text-textSecondary leading-snug">{item.subtitle}</p>
                </div>
                {item.enabled !== undefined ? (
                  <button 
                    className={clsx(
                      "w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300",
                      privacySettings[item.id] ? "bg-accent" : "bg-border"
                    )}
                    onClick={() => togglePrivacy(item.id)}
                  >
                    <div className={clsx(
                      "w-5 h-5 bg-surface rounded-full shadow-sm transition-transform duration-300",
                      privacySettings[item.id] ? "translate-x-6" : ""
                    )} />
                  </button>
                ) : (
                  <button className="flex items-center gap-1 active:opacity-70">
                    <span className="text-sm text-textSecondary">{item.value}</span>
                    <ArrowRight01Icon size={18} className="text-textTertiary" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-4 uppercase">
            SECURITY
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
            {SECURITY_OPTIONS.map((item, idx) => (
              <div 
                key={item.id} 
                className={clsx(
                  "flex justify-between items-center px-4 py-4",
                  idx < SECURITY_OPTIONS.length - 1 && "border-b border-borderLight"
                )}
              >
                <div className="flex-1 mr-4">
                  <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">{item.title}</h4>
                  <p className="text-sm text-textSecondary leading-snug">{item.subtitle}</p>
                </div>
                <button 
                  className={clsx(
                    "w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300",
                    securitySettings[item.id] ? "bg-accent" : "bg-border"
                  )}
                  onClick={() => toggleSecurity(item.id)}
                >
                  <div className={clsx(
                    "w-5 h-5 bg-surface rounded-full shadow-sm transition-transform duration-300",
                    securitySettings[item.id] ? "translate-x-6" : ""
                  )} />
                </button>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-4 uppercase">
            DATA
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <button className="w-full flex justify-between items-center px-4 py-4 border-b border-borderLight active:bg-surfaceLight transition-colors text-left">
              <div className="flex-1 mr-4">
                <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">Download My Data</h4>
                <p className="text-sm text-textSecondary leading-snug">Get a copy of your account data</p>
              </div>
              <ArrowRight01Icon size={18} className="text-textTertiary" />
            </button>
            <button className="w-full flex justify-between items-center px-4 py-4 active:bg-surfaceLight transition-colors text-left">
              <div className="flex-1 mr-4">
                <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">Delete Account</h4>
                <p className="text-sm text-textSecondary leading-snug">Permanently delete your account and data</p>
              </div>
              <ArrowRight01Icon size={18} className="text-textTertiary" />
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

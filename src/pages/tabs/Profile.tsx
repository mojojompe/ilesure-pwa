import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';
import { useNavigate } from 'react-router-dom';
import { customConfirm } from '../../stores/alertStore';
import { 
  PencilEdit02Icon,
  FavouriteIcon,
  UserMultipleIcon,
  CreditCardIcon,
  Notification01Icon,
  LockKeyIcon,
  HelpCircleIcon,
  Note01Icon,
  Logout01Icon,
  Camera01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  Time02Icon,
  Mortarboard01Icon
} from '@hugeicons/react';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { listingService } from '../../api/listingService';

export function Profile() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0); // Optional: add roommateService if needed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // We only have listingService.getSavedListings() ready in PWA typically
      // Fallback matches count to 0 for now
      try {
        const savedData = await listingService.getSavedListings();
        if (savedData.success) {
          setSavedCount(savedData.data?.listings?.length || 0);
        }
      } catch (err) {
        // ignore
      }
      
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    const isConfirmed = await customConfirm('Are you sure you want to log out?', 'Logout', 'warning');
    if (!isConfirmed) return;
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    } finally {
      clearAuth();
      navigate('/auth/choice', { replace: true });
    }
  };

  const accountItems = [
    { id: 'edit', icon: PencilEdit02Icon, label: 'Edit Profile', badge: null, path: '/settings/edit-profile' },
    { id: 'verification', icon: CheckmarkBadge01Icon, label: 'Verification', badge: user?.ninVerified ? 'Done' : 'Pending', path: '/booking/kyc/temp' },
    { id: 'saved', icon: FavouriteIcon, label: 'Saved Listings', badge: savedCount > 0 ? savedCount.toString() : null, path: '/saved-listings' },
    ...(user?.role !== 'individual' ? [{ id: 'roommate', icon: UserMultipleIcon, label: 'Roommate Profile', badge: null, path: '/roommate-profile' }] : []),
    { id: 'payments', icon: CreditCardIcon, label: 'Payment History', badge: null, path: '/payment-history' },
  ];

  const settingsItems = [
    { id: 'notifs', icon: Notification01Icon, label: 'Notification Settings', path: '/settings/notifications' },
    { id: 'privacy', icon: LockKeyIcon, label: 'Privacy & Security', path: '/settings/privacy' },
    { id: 'help', icon: HelpCircleIcon, label: 'Help & Support', path: '/support' },
    { id: 'terms', icon: Note01Icon, label: 'Terms & Privacy Policy', path: '/terms' },
  ];

  return (
    <AppShell>
      <div className="px-5 pt-safe-top pb-6 min-h-full bg-background flex flex-col relative overflow-hidden">
        {/* RN background pattern approximation */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] -z-10" />

        <RefreshIndicator isRefreshing={refreshing} />

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pt-6 pb-6"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-primary to-accent shadow-md">
              <div className="w-full h-full rounded-full bg-surfaceLight flex items-center justify-center overflow-hidden border-2 border-white">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-primary">
                    {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'IS'}
                  </span>
                )}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface active:scale-95 transition-transform">
              <Camera01Icon size={14} className="text-white" />
            </button>
          </div>

          <h2 className="text-[22px] font-extrabold text-textPrimary mb-1">
            {user?.fullName || 'iléSure User'}
          </h2>
          <p className="text-[15px] text-textSecondary mb-4">
            {user?.email || 'user@ilesure.com'}
          </p>

          <div className="flex flex-row flex-wrap justify-center gap-2">
            {user?.ninVerified ? (
              <div className="flex flex-row items-center gap-1 bg-[#E8F5E9] border border-[#C8E6C9] px-2 py-1 rounded-md">
                <CheckmarkBadge01Icon size={12} className="text-[#2E7D32]" />
                <span className="text-[11px] font-bold text-[#2E7D32]">
                  {user?.role === 'individual' ? 'Verified Account' : 'Verified Student'}
                </span>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-1 bg-[#FFF3E0] border border-[#FFE0B2] px-2 py-1 rounded-md">
                <Time02Icon size={12} className="text-[#E65100]" />
                <span className="text-[11px] font-bold text-[#E65100]">Verification Pending</span>
              </div>
            )}
            
            {user?.role !== 'individual' && (
              <div className="flex flex-row items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
                <Mortarboard01Icon size={12} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">
                  {(user as any)?.university || 'Lead City University'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          {/* Stats Row */}
          <div className="flex flex-row gap-4 mb-6">
            <div className="flex-1 bg-surface rounded-[16px] p-4 flex flex-col items-center shadow-sm border border-borderLight">
              <span className="text-2xl font-black text-primary mb-1">{savedCount}</span>
              <span className="text-xs font-semibold text-textSecondary">Saved</span>
            </div>
            <div className="flex-1 bg-surface rounded-[16px] p-4 flex flex-col items-center shadow-sm border border-borderLight">
              <span className="text-2xl font-black text-primary mb-1">{matchesCount}</span>
              <span className="text-xs font-semibold text-textSecondary">Matches</span>
            </div>
          </div>

          {/* Account Section */}
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-2 px-1 uppercase">
            My Account
          </h3>
          <div className="bg-surface rounded-2xl border border-borderLight overflow-hidden shadow-sm mb-6">
            {accountItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-row items-center w-full px-4 py-4 bg-white active:bg-surfaceLight transition-colors ${
                    idx < accountItems.length - 1 ? 'border-b border-borderLight' : ''
                  }`}
                >
                  <div className="w-8 flex items-center justify-center mr-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="flex-1 text-left text-[15px] font-medium text-textPrimary">
                    {item.label}
                  </span>
                  {item.badge && (
                    <div className="bg-accent px-2 py-0.5 rounded-md min-w-[22px] flex items-center justify-center mr-2">
                      <span className="text-[10px] font-extrabold text-white">{item.badge}</span>
                    </div>
                  )}
                  <ArrowRight01Icon size={18} className="text-textTertiary" />
                </button>
              );
            })}
          </div>

          {/* Settings Section */}
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-2 px-1 uppercase">
            Settings
          </h3>
          <div className="bg-surface rounded-2xl border border-borderLight overflow-hidden shadow-sm mb-6">
            {settingsItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => item.path === '#' ? undefined : navigate(item.path)}
                  className={`flex flex-row items-center w-full px-4 py-4 bg-white active:bg-surfaceLight transition-colors ${
                    idx < settingsItems.length - 1 ? 'border-b border-borderLight' : ''
                  }`}
                >
                  <div className="w-8 flex items-center justify-center mr-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="flex-1 text-left text-[15px] font-medium text-textPrimary">
                    {item.label}
                  </span>
                  <ArrowRight01Icon size={18} className="text-textTertiary" />
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleLogout}
            className="flex flex-row items-center justify-center gap-2 py-4 w-full active:opacity-70 transition-opacity"
          >
            <Logout01Icon size={18} className="text-error" />
            <span className="text-[15px] font-bold text-error">Log Out</span>
          </button>
          
          <div className="mt-8 pb-12 flex flex-col items-center">
            <span className="text-[13px] font-semibold text-textTertiary">
              Sponsored by Waltik Labs
            </span>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

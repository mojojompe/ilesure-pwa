import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { UserMultipleIcon, PencilEdit02Icon, Search01Icon } from '@hugeicons/react';
import { Button } from '../../components/ui/Button';
import roommateService, { RoommateProfile as ProfileType } from '../../api/roommateService';
import { customAlert } from '../../stores/alertStore';
import { motion } from 'framer-motion';
import { Skeleton } from '../../components/ui/SkeletonLoader';

const LIFESTYLE_LABELS: Record<string, string> = {
  noiseTolerance: 'Noise Tolerance',
  cleanliness: 'Cleanliness',
  sleepSchedule: 'Sleep Schedule',
  studySchedule: 'Study Habits',
  socialActivity: 'Social Activity',
  guestComfort: 'Guest Comfort',
  cookingFrequency: 'Cooking',
  smokingAlcohol: 'Smoking & Alcohol',
  powerUsage: 'Power Usage',
};

export function RoommateProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await roommateService.getProfile();
        if (response.data) {
          setProfile(response.data as ProfileType);
        }
      } catch (error: any) {
        console.error('Failed to load roommate profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const renderLifestyleRow = (key: string, yourVal?: string) => {
    if (!yourVal) return null;
    const label = LIFESTYLE_LABELS[key] || key;
    return (
      <div key={key} className="flex justify-between items-center py-3 border-b border-borderLight last:border-0">
        <span className="text-sm font-medium text-textSecondary">{label}</span>
        <span className="text-sm font-bold text-textPrimary text-right max-w-[60%]">{yourVal}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full bg-background relative">
          <MobileHeader title="Roommate Profile" onBack={() => navigate(-1)} />
          <div className="flex-1 px-5 pt-6 space-y-4">
            <Skeleton height={100} className="w-full rounded-2xl" />
            <Skeleton height={200} className="w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full bg-background relative">
          <MobileHeader title="Roommate Profile" onBack={() => navigate(-1)} />
          <div className="flex-1 px-5 pt-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <UserMultipleIcon size={48} className="text-primary" variant="solid" />
            </div>
            <h2 className="text-xl font-bold text-textPrimary mb-3 text-center">Your Roommate Profile</h2>
            <p className="text-sm text-textSecondary text-center mb-10 px-4 leading-relaxed">
              Create your lifestyle profile to find compatible roommates and make the best match.
            </p>
            <Button
              className="w-full max-w-[280px] shadow-sm py-4 rounded-[50px]"
              onClick={() => navigate('/lifestyle-survey')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] -z-10" />
        
        <MobileHeader 
          title="Your Roommate Profile" 
          onBack={() => navigate(-1)} 
          rightAction={
            <button 
              onClick={() => navigate('/lifestyle-survey')} 
              className="w-10 h-10 flex items-center justify-center bg-surfaceLight rounded-full active:scale-95 transition-transform"
            >
              <PencilEdit02Icon size={20} className="text-primary" />
            </button>
          }
        />
        
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-20">
          
          {/* Looking For */}
          {profile.lookingFor && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-borderLight"
            >
              <h3 className="text-xs font-bold text-textTertiary tracking-wider mb-4 uppercase">Looking For</h3>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Search01Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-textPrimary leading-tight mb-1">
                    A {profile.lookingFor}{profile.budgetMax ? ` (₦${profile.budgetMin?.toLocaleString()} - ₦${profile.budgetMax?.toLocaleString()})` : ''}
                  </p>
                  {profile.preferredAreaClusters && profile.preferredAreaClusters.length > 0 && (
                    <p className="text-sm text-textSecondary">
                      Preferred areas: {profile.preferredAreaClusters.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Age */}
          {profile.age && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-borderLight"
            >
              <h3 className="text-xs font-bold text-textTertiary tracking-wider mb-2 uppercase">Age</h3>
              <p className="text-[15px] font-medium text-textPrimary">{profile.age} years old</p>
            </motion.div>
          )}

          {/* Linked Listing */}
          {profile.listingId && typeof profile.listingId === 'object' && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-borderLight"
            >
              <h3 className="text-xs font-bold text-textTertiary tracking-wider mb-3 uppercase">Linked Listing</h3>
              <p className="text-[15px] font-bold text-textPrimary leading-tight mb-1">
                {(profile.listingId as any).title || 'Property'}
              </p>
              {(profile.listingId as any).areaCluster && (
                <p className="text-sm text-textSecondary">
                  {(profile.listingId as any).areaCluster}, {(profile.listingId as any).state}
                </p>
              )}
            </motion.div>
          )}

          {/* Lifestyle */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-borderLight"
          >
            <h3 className="text-xs font-bold text-textTertiary tracking-wider mb-3 uppercase">Lifestyle & Habits</h3>
            <div className="flex flex-col">
              {Object.keys(LIFESTYLE_LABELS).map((key) => 
                renderLifestyleRow(key, (profile as any)[key])
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </AppShell>
  );
}

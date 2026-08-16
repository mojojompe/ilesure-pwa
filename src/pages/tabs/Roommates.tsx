import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { MatchCard } from '../../components/roommate/MatchCard';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { 
  UserMultipleIcon, 
  Settings02Icon,
  Mail01Icon,
  Home01Icon,
  ArrowRight01Icon,
  Search01Icon
} from '@hugeicons/react';
import roommateService, { MatchResult } from '../../api/roommateService';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

export function Roommates() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [roommateListings, setRoommateListings] = useState<any[]>([]);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [profileRes, listingsRes] = await Promise.all([
        roommateService.getProfile(),
        apiClient.get<any>('/listings?needsRoommate=true&limit=5').catch(() => null),
      ]);
      
      if (!profileRes.data) {
        setHasProfile(false);
        return;
      }
      setHasProfile(true);

      if (listingsRes?.data?.listings) {
        setRoommateListings(listingsRes.data.listings);
      }

      const response = await roommateService.getMatches();
      if (response.success && response.data) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      console.error('Failed to fetch matches', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleInterest = async (matchId: string) => {
    try {
      // Optimistic update
      setMatches(prev => prev.map(m => m.userId === matchId ? { ...m, isInterested: true } : m));
      await roommateService.expressInterest(matchId);
    } catch (error) {
      // Revert if error
      setMatches(prev => prev.map(m => m.userId === matchId ? { ...m, isInterested: false } : m));
      console.error('Failed to express interest', error);
    }
  };

  const handlePass = async (matchId: string) => {
    try {
      setMatches(prev => prev.filter(m => m.userId !== matchId));
      await roommateService.passOnMatch(matchId);
    } catch (error) {
      console.error('Failed to pass', error);
    }
  };

  if (user?.role !== 'student') {
    return <Navigate to="/discover" replace />;
  }

  if (loading && !refreshing) {
    return (
      <AppShell>
        <div className="flex-1 px-5 pt-safe-top pb-6 min-h-full bg-background flex flex-col pt-20 gap-4">
          <Skeleton height={200} className="w-full rounded-2xl" />
          <Skeleton height={200} className="w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!hasProfile && !loading) {
    return (
      <AppShell>
        <div className="flex-1 px-6 pt-24 pb-8 flex flex-col items-center text-center">
          <UserMultipleIcon size={80} className="text-textTertiary mb-6" />
          <h2 className="text-2xl font-bold text-textPrimary mb-3">Set Up Your Profile</h2>
          <p className="text-textSecondary text-base leading-relaxed mb-8 px-4">
            Complete your roommate preferences to find your perfect living companion
          </p>
          <Button 
            onClick={() => navigate('/lifestyle-survey')} 
            className="w-full max-w-[280px] bg-primary"
            size="lg"
          >
            Get Started
          </Button>
        </div>
      </AppShell>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
          className="flex flex-row justify-between items-start pt-4 mb-6"
        >
          <div>
            <h1 className="text-[28px] font-black text-textPrimary tracking-tight mb-1">Roommate Matches</h1>
            <p className="text-textSecondary text-sm">Find your ideal living companion</p>
          </div>
          <div className="flex flex-row gap-2">
            <button 
              onClick={() => navigate('/incoming-requests')}
              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center active:scale-95 transition-transform shadow-sm border border-borderLight"
            >
              <Mail01Icon size={20} className="text-accent" />
            </button>
            <button 
              onClick={() => navigate('/lifestyle-survey')}
              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center active:scale-95 transition-transform shadow-sm border border-borderLight"
            >
              <Settings02Icon size={20} className="text-primary" />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <RefreshIndicator isRefreshing={refreshing} />
        
        <div className="flex-1">
          {roommateListings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-5 mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-borderLight"
            >
              <h3 className="text-xs font-bold text-textTertiary tracking-wide uppercase mb-4">
                Listings needing roommates
              </h3>
              <div className="flex flex-col gap-0">
                {roommateListings.map((l: any, index: number) => (
                  <button
                    key={l._id}
                    onClick={() => navigate(`/listing/${l._id}`)}
                    className={`flex flex-row items-center gap-3 py-3 w-full text-left active:bg-surfaceLight transition-colors ${
                      index !== roommateListings.length - 1 ? 'border-b border-borderLight' : ''
                    }`}
                  >
                    <Home01Icon size={20} className="text-primary shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-textPrimary truncate">{l.title}</p>
                      <p className="text-[11px] text-textSecondary mt-0.5 truncate">
                        {l.areaCluster} — ₦{l.rentAnnual?.toLocaleString()}/yr
                      </p>
                    </div>
                    <ArrowRight01Icon size={18} className="text-textTertiary shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {matches.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px]"
            >
              {matches.map((item) => (
                <motion.div key={item.userId} variants={itemVariants}>
                  <MatchCard 
                    item={item}
                    onPress={() => navigate(`/match/${item.userId}`)}
                    onPass={() => handlePass(item.userId)}
                    onInterest={() => handleInterest(item.userId)}
                  />
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
                <Search01Icon size={32} className="text-textTertiary" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">No matches yet</h3>
              <p className="text-sm text-textSecondary">Check back as more people join</p>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

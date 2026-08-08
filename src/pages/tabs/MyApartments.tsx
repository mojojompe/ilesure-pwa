import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  Home01Icon, 
  Chatting01Icon
} from '@hugeicons/react';
import { bookingService } from '../../api/bookingService';

export function MyApartments() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'booked' | 'current'>('booked');
  const [apartments, setApartments] = useState<{ booked: any[], current: any[] }>({ booked: [], current: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApartments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await bookingService.getMyApartments();
      if (response.success && response.data) {
        setApartments({
          booked: response.data.booked || [],
          current: response.data.currentAndPrevious || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch apartments', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        fetchApartments();
      } catch (error) {
        console.error('Failed to cancel booking', error);
      }
    }
  };

  const handleChatWithListing = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app we'd resolve participantId and call chatService.startChat, 
    // then navigate to the chat room. For now we navigate to Chats tab.
    navigate('/chats');
  };

  const displayedData = activeFilter === 'booked' ? apartments.booked : apartments.current;

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

  const renderBooking = (item: any) => {
    const listing = item.listingId;
    const listingTitle = listing?.title ?? 'Listing';
    const listingArea = listing?.areaCluster ?? 'Location not available';
    const isShortlet = listing?.propertyType?.toLowerCase() === 'shortlet';
    const shortletPricingUsed = item.shortletPricingUsed;
    const durationUnit = item.durationUnit as string;
    
    const unitToPriceKey: Record<string, string> = { hour: 'hourly', day: 'daily', week: 'weekly', month: 'monthly' };
    const priceKey = durationUnit ? unitToPriceKey[durationUnit] : null;
    const listingRent = listing?.rentAnnual;
    const payFreq = listing?.paymentFrequency;
    
    const progress = item.totalInstallments > 1 ? Math.round((item.installmentsPaid / item.totalInstallments) * 100) : null;

    let statusColor = '#EF4444'; // error
    let bgStatusColor = '#FEE2E2';
    if (item.status === 'confirmed') {
      statusColor = '#E1AD01'; // accent
      bgStatusColor = '#FEF3C7';
    } else if (item.status === 'completed') {
      statusColor = '#4CAF50';
      bgStatusColor = '#E8F5E9';
    } else if (item.status === 'pending') {
      statusColor = '#F59E0B';
      bgStatusColor = '#FEF3C7';
    }

    return (
      <motion.div
        key={item._id}
        variants={itemVariants}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/booking/${item._id}`)}
        className="bg-surface rounded-[24px] mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-borderLight overflow-hidden cursor-pointer"
      >
        <div className="relative h-[150px] w-full">
          {listing?.images?.[0] ? (
            <img src={listing.images[0]} alt={listingTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surfaceLight flex items-center justify-center">
              <Home01Icon size={32} className="text-textTertiary" />
            </div>
          )}
          
          <div 
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md"
            style={{ backgroundColor: bgStatusColor }}
          >
            <span className="text-[10px] font-extrabold tracking-wide uppercase" style={{ color: statusColor }}>
              {item.status}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-textPrimary leading-tight truncate">{listingTitle}</h3>
          <p className="text-sm text-textSecondary mt-1 truncate">{listingArea}</p>
          
          <div className="flex flex-row justify-between items-center mt-4">
            <div className="flex-1">
              {isShortlet && shortletPricingUsed && priceKey ? (
                <p className="text-lg font-extrabold text-primary">
                  ₦{shortletPricingUsed[priceKey]?.toLocaleString() ?? '—'}/{durationUnit === 'hour' ? 'hr' : durationUnit === 'day' ? 'day' : durationUnit === 'week' ? 'wk' : 'mo'}
                </p>
              ) : (
                <p className="text-lg font-extrabold text-primary">
                  ₦{listingRent?.toLocaleString() ?? '—'}/{payFreq === 'monthly' ? 'mo' : payFreq === 'quarterly' ? 'qtr' : payFreq === 'bi-annually' ? '6mo' : payFreq === 'custom' ? 'plan' : 'yr'}
                </p>
              )}
            </div>
            
            <button 
              onClick={(e) => handleChatWithListing(item, e)}
              className="w-9 h-9 rounded-full bg-surfaceLight flex items-center justify-center mr-3 active:scale-95 transition-transform"
            >
              <Chatting01Icon size={20} className="text-primary" />
            </button>
            
            <span className="text-sm text-textSecondary">
              {new Date(item.moveInDate || item.createdAt).toLocaleDateString()}
            </span>
          </div>

          {progress !== null && (
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="h-1.5 rounded-full bg-borderLight overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-accent">{item.installmentsPaid}/{item.totalInstallments} paid</span>
                {item.nextDueDate && (
                  <span className="text-[11px] text-textTertiary">Next: {new Date(item.nextDueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {(item.status === 'pending' || item.status === 'confirmed') && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleCancelBooking(item._id); }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#FEE2E2] active:bg-[#FCA5A5] transition-colors"
            >
              <span className="text-sm font-bold text-error">Cancel Booking</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AppShell>
      <div className="px-5 pt-safe-top pb-6 min-h-full bg-background flex flex-col relative overflow-hidden">
        {/* RN background pattern approximation */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2F0EC] rounded-bl-[100px] -z-10" />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 mb-6"
        >
          <div className="flex flex-row items-center gap-2 mb-1">
            <h1 className="text-[28px] font-black text-textPrimary tracking-tight">My Apartments</h1>
            {apartments.booked.length > 0 && (
              <div className="bg-primary rounded-full px-2 py-0.5 flex items-center justify-center">
                <span className="text-white text-xs font-extrabold">{apartments.booked.length}</span>
              </div>
            )}
          </div>
          <p className="text-textSecondary text-sm">Manage your current and booked apartments</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-row gap-2 mb-6">
          {(['booked', 'current'] as const).map(filter => {
            const count = filter === 'booked' ? apartments.booked.length : apartments.current.length;
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-surface border-border text-textSecondary hover:bg-surfaceLight'
                }`}
              >
                {filter === 'current' ? 'Current & Past' : 'Booked'}
                {count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <RefreshIndicator isRefreshing={refreshing} />

        <div className="flex-1">
          {loading && !refreshing ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-textSecondary mt-4 text-sm font-medium">Loading apartments...</p>
            </div>
          ) : displayedData.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px]"
            >
              {displayedData.map(renderBooking)}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-surfaceLight flex items-center justify-center mb-4">
                <Home01Icon size={32} className="text-textTertiary" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">No bookings yet</h3>
              <p className="text-sm text-textSecondary mb-6">You don't have any apartments in this category.</p>
              <button 
                onClick={() => navigate('/discover')}
                className="px-6 py-3 bg-primary rounded-xl"
              >
                <span className="text-white font-bold">Browse Listings</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { 
  Home01Icon, 
  Time02Icon, 
  CheckmarkBadge01Icon,
  CancelCircleIcon,
  Alert01Icon,
  Calendar01Icon
} from '@hugeicons/react';
import { sharedBookingService, SharedBooking } from '../../api/sharedBookingService';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending_payment: { color: '#E29C45', bg: '#E29C4515', label: 'Awaiting Payment', icon: Time02Icon },
  partially_paid: { color: '#1565C0', bg: '#1565C015', label: 'Partially Paid', icon: Alert01Icon },
  fully_paid: { color: '#2E7D32', bg: '#2E7D3215', label: 'Fully Paid', icon: CheckmarkBadge01Icon },
  confirmed: { color: '#2E7D32', bg: '#2E7D3215', label: 'Confirmed', icon: CheckmarkBadge01Icon },
  expired: { color: '#C62828', bg: '#C6282815', label: 'Expired', icon: CancelCircleIcon },
  refunded: { color: '#757575', bg: '#75757515', label: 'Refunded', icon: CancelCircleIcon },
};

export function SharedBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<SharedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);
      const response = await sharedBookingService.getSharedBooking(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch shared booking', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const getMyParticipant = () => {
    if (!booking || !user) return null;
    return booking.participants.find((p: any) => (p.userId?._id || p.userId) === user.id);
  };

  const getOtherParticipant = () => {
    if (!booking || !user) return null;
    return booking.participants.find((p: any) => (p.userId?._id || p.userId) !== user.id);
  };

  const getTimeRemaining = (): string => {
    if (!booking) return '';
    const deadline = new Date(booking.paymentDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const handlePay = async () => {
    if (!booking) return;
    try {
      setPaying(true);
      const result = await sharedBookingService.payForSharedBooking(booking._id);
      if (result.data?.authorizationUrl) {
        // In a real app we'd redirect to the URL or open a modal. For PWA demo:
        window.location.href = result.data.authorizationUrl;
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Could not process payment');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('This will cancel the shared booking and initiate refunds for any payments made. Are you sure?')) {
      try {
        await sharedBookingService.cancelSharedBooking(id!);
        alert('Refunds have been initiated where applicable.');
        navigate(-1);
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Failed to cancel');
      }
    }
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Shared Booking" onBack={() => navigate(-1)} />
        <div className="p-4 space-y-4">
          <Skeleton height={80} className="w-full rounded-2xl" />
          <Skeleton height={150} className="w-full rounded-2xl" />
          <Skeleton height={200} className="w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Shared Booking" onBack={() => navigate(-1)} />
        <div className="flex-1 flex justify-center items-center text-textSecondary">
          Booking not found
        </div>
      </AppShell>
    );
  }

  const myParticipant = getMyParticipant();
  const otherParticipant = getOtherParticipant();
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_payment;
  const StatusIcon = statusConfig.icon;
  const myPaid = myParticipant?.status === 'paid';
  const isPayable = !myPaid && (booking.status === 'pending_payment' || booking.status === 'partially_paid');
  const canCancel = booking.status !== 'confirmed' && booking.status !== 'expired' && booking.status !== 'refunded';

  const otherName = otherParticipant?.userId && typeof otherParticipant.userId === 'object'
    ? otherParticipant.userId.fullName
    : 'Your roommate';

  const progressPct = Math.min(100, (booking.totalPaid / booking.totalRequired) * 100);

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title="Shared Booking" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[100px] space-y-4">
          
          {/* Status Banner */}
          <div 
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ backgroundColor: statusConfig.bg }}
          >
            <StatusIcon size={28} style={{ color: statusConfig.color }} />
            <span className="text-base font-bold flex-1" style={{ color: statusConfig.color }}>
              {statusConfig.label}
            </span>
            {['confirmed', 'expired', 'refunded'].indexOf(booking.status) === -1 && (
              <span className="text-sm font-semibold text-textSecondary">
                {getTimeRemaining()}
              </span>
            )}
          </div>

          {/* Property Info */}
          {booking.listingId && (
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">PROPERTY</h3>
              <div className="flex items-center gap-4">
                {booking.listingId.images?.[0] ? (
                  <img src={booking.listingId.images[0]} alt="Property" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-surfaceLight flex items-center justify-center">
                    <Home01Icon size={24} className="text-textTertiary" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-base font-bold text-textPrimary truncate">{booking.listingId.title}</h4>
                  <p className="text-sm text-textSecondary mt-0.5 truncate">
                    {booking.listingId.areaCluster} — ₦{booking.listingId.rentAnnual?.toLocaleString()}/yr
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Progress */}
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">PAYMENT PROGRESS</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-black text-textPrimary">₦{booking.totalPaid?.toLocaleString()}</span>
              <span className="text-base text-textTertiary">/</span>
              <span className="text-base font-medium text-textSecondary">₦{booking.totalRequired?.toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-surfaceLight overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPct}%`, backgroundColor: statusConfig.color }} 
              />
            </div>
          </div>

          {/* Participants */}
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">PARTICIPANTS</h3>
            
            {/* Me */}
            <div className="flex items-center gap-3 py-3 border-b border-borderLight">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                myPaid ? "bg-[#2E7D32]" : "bg-primary"
              )}>
                <span className="text-white font-bold text-lg">{user?.fullName?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-textPrimary truncate">{user?.fullName || 'You'} (You)</p>
                <p className="text-sm text-textSecondary mt-0.5">₦{myParticipant?.amountDue?.toLocaleString() || '—'}</p>
              </div>
              <div className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-bold",
                myPaid ? "bg-[#2E7D3215] text-[#2E7D32]" : "bg-[#E29C4515] text-[#E29C45]"
              )}>
                {myPaid ? 'Paid' : 'Pending'}
              </div>
            </div>

            {/* Other */}
            <div className="flex items-center gap-3 py-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                otherParticipant?.status === 'paid' ? "bg-[#2E7D32]" : "bg-textTertiary"
              )}>
                <span className="text-white font-bold text-lg">{otherName?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-textPrimary truncate">{otherName}</p>
                <p className="text-sm text-textSecondary mt-0.5">₦{otherParticipant?.amountDue?.toLocaleString() || '—'}</p>
              </div>
              <div className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-bold",
                otherParticipant?.status === 'paid' ? "bg-[#2E7D3215] text-[#2E7D32]" : "bg-[#E29C4515] text-[#E29C45]"
              )}>
                {otherParticipant?.status === 'paid' ? 'Paid' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Deadline */}
          {['confirmed', 'expired', 'refunded'].indexOf(booking.status) === -1 && (
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">DEADLINE</h3>
              <div className="flex items-center gap-2">
                <Calendar01Icon size={20} className="text-textSecondary" />
                <span className="text-sm font-bold text-textPrimary">
                  {new Date(booking.paymentDeadline).toLocaleDateString('en-NG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2">
            {isPayable && (
              <Button 
                fullWidth 
                onClick={handlePay}
                disabled={paying}
                className="shadow-[0_4px_12px_rgba(107,79,58,0.25)]"
              >
                {paying ? 'Processing...' : `Pay My Share (₦${myParticipant?.amountDue?.toLocaleString()})`}
              </Button>
            )}
            
            {myPaid && !booking.status.includes('confirmed') && (
              <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <Time02Icon size={20} className="text-primary" />
                <span className="text-sm font-bold text-primary flex-1">
                  {otherParticipant?.status === 'paid'
                    ? 'Both payments received! Confirming...'
                    : `Waiting for ${otherName} to pay`}
                </span>
              </div>
            )}
            
            {canCancel && (
              <Button fullWidth variant="secondary" onClick={handleCancel}>
                Cancel Booking
              </Button>
            )}
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}

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
import { customAlert, customConfirm } from '../../stores/alertStore';
import { clsx } from 'clsx';
import { getApiErrorMessage } from '../../api/client';
import { InfoTip } from '../../components/ui/InfoTip';
import { BOOKING_INFO } from '../../constants/bookingInfo';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending_payment: { color: '#E29C45', bg: '#E29C4515', label: 'Awaiting Payment', icon: Time02Icon },
  partially_paid: { color: '#1565C0', bg: '#1565C015', label: 'Partially Paid', icon: Alert01Icon },
  fully_paid: { color: '#2E7D32', bg: '#2E7D3215', label: 'Fully Paid', icon: CheckmarkBadge01Icon },
  confirmed: { color: '#2E7D32', bg: '#2E7D3215', label: 'Confirmed', icon: CheckmarkBadge01Icon },
  expired: { color: '#C62828', bg: '#C6282815', label: 'Expired', icon: CancelCircleIcon },
  refunded: { color: '#757575', bg: '#75757515', label: 'Refunded', icon: CancelCircleIcon },
  // BUGFIX (QA-PAY-022): a cancellation whose refund failed is 'cancelled', not 'refunded',
  // telling a renter their money is back when it is not is the worst thing this screen can do.
  cancelled: { color: '#C62828', bg: '#C6282815', label: 'Cancelled', icon: CancelCircleIcon },
};

// Each roommate's place stands on its own: paid is a confirmed place, released is one that
// was not paid for in time (or was given up) and went back on the market.
const PLACE_BADGE: Record<string, { label: string; className: string; avatar: string }> = {
  paid: { label: 'Paid', className: 'bg-[#2E7D3215] text-[#2E7D32]', avatar: 'bg-[#2E7D32]' },
  pending: { label: 'Pending', className: 'bg-[#E29C4515] text-[#E29C45]', avatar: 'bg-textTertiary' },
  released: { label: 'Released', className: 'bg-[#75757515] text-[#757575]', avatar: 'bg-textTertiary' },
  refunded: { label: 'Refunded', className: 'bg-[#75757515] text-[#757575]', avatar: 'bg-textTertiary' },
};
const placeBadge = (status?: string) => PLACE_BADGE[status || 'pending'] || PLACE_BADGE.pending;

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
      customAlert(getApiErrorMessage(error, 'Could not process payment'), 'Error', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    const otherHasPaid = getOtherParticipant()?.status === 'paid';
    const isConfirmed = await customConfirm(otherHasPaid
      ? 'This will give up your place in this apartment. Your roommate has paid, so their place stays confirmed. Are you sure?'
      : 'Nobody has paid yet, so this will cancel the shared booking for both of you. Are you sure?');
    if (isConfirmed) {
      try {
        const res: any = await sharedBookingService.cancelSharedBooking(id!);
        await customAlert(res?.message || 'Your place has been released.', 'Success', 'success');
        navigate(-1);
      } catch (error: any) {
        customAlert(getApiErrorMessage(error, 'Failed to cancel'), 'Error', 'error');
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
  const myPaid = myParticipant?.status === 'paid';
  const myPlace: string = myParticipant?.status || 'pending';
  const isOpen = booking.status === 'pending_payment' || booking.status === 'partially_paid';
  // The banner speaks for MY place: a booking can be confirmed for the roommate who paid
  // while mine was released, and mine is confirmed as soon as I pay.
  const statusConfig = myPaid
    ? { ...STATUS_CONFIG.confirmed, label: 'Your place is confirmed' }
    : myPlace === 'released'
      ? { ...STATUS_CONFIG.expired, label: 'Your place was released' }
      : myPlace === 'refunded'
        ? { ...STATUS_CONFIG.refunded, label: 'Your payment was refunded' }
        : STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_payment;
  const StatusIcon = statusConfig.icon;
  const isPayable = myPlace === 'pending' && isOpen;
  const canCancel = myPlace === 'pending' && isOpen;

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
              <InfoTip {...BOOKING_INFO.sharedStatus} />
            </span>
            {isOpen && !myPaid && (
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
                    {booking.listingId.areaCluster}, ₦{booking.listingId.rentAnnual?.toLocaleString()}/yr
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Progress */}
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">PAYMENT PROGRESS<InfoTip {...BOOKING_INFO.sharedProgress} /></h3>
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
            <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">PARTICIPANTS<InfoTip {...BOOKING_INFO.sharedParticipants} /></h3>

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
              <div className={clsx("px-2.5 py-1 rounded-md text-xs font-bold", placeBadge(myPlace).className)}>
                {placeBadge(myPlace).label}
              </div>
            </div>

            {/* Other */}
            <div className="flex items-center gap-3 py-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                placeBadge(otherParticipant?.status).avatar
              )}>
                <span className="text-white font-bold text-lg">{otherName?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-textPrimary truncate">{otherName}</p>
                <p className="text-sm text-textSecondary mt-0.5">₦{otherParticipant?.amountDue?.toLocaleString() || '—'}</p>
              </div>
              <div className={clsx("px-2.5 py-1 rounded-md text-xs font-bold", placeBadge(otherParticipant?.status).className)}>
                {placeBadge(otherParticipant?.status).label}
              </div>
            </div>
          </div>

          {/* Deadline */}
          {isOpen && (
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">DEADLINE<InfoTip {...BOOKING_INFO.sharedDeadline} /></h3>
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
              <div className="mt-8">
                {booking.hasChatted === false ? (
                  <div className="bg-mustard-pale text-mustard-dark p-3 rounded-lg text-sm text-center mb-3">
                    You must communicate with your roommate via chat before proceeding to payment.
                  </div>
                ) : null}
                <Button 
                  fullWidth 
                  onClick={handlePay} 
                  loading={paying}
                  disabled={booking.hasChatted === false}
                  className="bg-mustard text-white font-bold py-4 rounded-xl shadow-clay active:scale-95 transition-transform"
                >
                  Pay My Share (₦{myParticipant?.amountDue?.toLocaleString('en-NG')})
                </Button>
              </div>
            )}

            {myPaid && otherParticipant?.status === 'pending' && isOpen && (
              <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <Time02Icon size={20} className="text-primary" />
                <span className="text-sm font-bold text-primary flex-1">
                  Your place is paid for and confirmed. {otherName} has until the deadline to pay for theirs.
                </span>
              </div>
            )}

            {myPaid && otherParticipant?.status === 'released' && (
              <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <Alert01Icon size={20} className="text-primary" />
                <span className="text-sm font-bold text-primary flex-1">
                  {otherName} did not take their place, so it is back on the market. Your own place is not affected.
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

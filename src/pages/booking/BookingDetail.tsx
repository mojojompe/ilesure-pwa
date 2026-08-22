import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { Home01Icon, Chatting01Icon } from '@hugeicons/react';
import { bookingService } from '../../api/bookingService';
import { RentRenewal } from '../../components/ui/RentRenewal';
import { chatService } from '../../api/chatService';
import { clsx } from 'clsx';
import { customAlert, customConfirm } from '../../stores/alertStore';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (error) {
        console.error('Failed to fetch booking details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    const isConfirmed = await customConfirm('Are you sure you want to cancel this booking?');
    if (isConfirmed) {
      try {
        await bookingService.cancelBooking(id!);
        await customAlert('Booking has been cancelled.', 'Success', 'success');
        navigate(-1);
      } catch (error) {
        console.error(error);
        customAlert('Failed to cancel the booking.', 'Error', 'error');
      }
    }
  };

  const handlePay = () => {
    navigate(`/booking/payment/${id}`);
  };

  const handleChat = async () => {
    if (!booking?.listingId) return;
    const listing = booking.listingId;
    let participantId: string | null = null;
    if (listing.agentId?._id) participantId = listing.agentId._id;
    else if (typeof listing.agentId === 'string') participantId = listing.agentId;
    else if (listing.companyId?._id) participantId = listing.companyId._id;
    else if (typeof listing.companyId === 'string') participantId = listing.companyId;
    else if (listing.landlordId?._id) participantId = listing.landlordId._id;
    else if (typeof listing.landlordId === 'string') participantId = listing.landlordId;
    
    if (!participantId) {
      navigate('/chats');
      return;
    }
    
    try {
      const chatResponse = await chatService.startChat(participantId, listing._id);
      navigate(`/chat/${chatResponse.data?.id || participantId}`);
    } catch {
      navigate('/chats');
    }
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Booking Details" onBack={() => navigate(-1)} />
        <div className="p-4 space-y-4">
          <Skeleton height={180} className="w-full rounded-2xl" />
          <Skeleton height={150} className="w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Booking Details" onBack={() => navigate(-1)} />
        <div className="flex-1 flex justify-center items-center text-textSecondary">
          Booking not found
        </div>
      </AppShell>
    );
  }

  const listing = typeof booking.listingId === 'object' ? booking.listingId : null;
  const listingTitle = listing?.title || 'Property';
  const listingImage = listing?.images?.[0];
  const payFreq = listing?.paymentFrequency;
  const customPlan = listing?.customPaymentPlan;
  const isShortlet = listing?.propertyType?.toLowerCase() === 'shortlet';
  const shortletPricingUsed = booking.shortletPricingUsed;
  const durationUnit = booking.durationUnit;
  const unitToPriceKey: Record<string, string> = { hour: 'hourly', day: 'daily', week: 'weekly', month: 'monthly' };
  const priceKey = durationUnit ? unitToPriceKey[durationUnit] : null;
  
  const paidCount = booking.installmentsPaid || 0;
  const totalInstallments = booking.totalInstallments || 1;
  const progress = totalInstallments > 1 ? Math.round((paidCount / totalInstallments) * 100) : 100;

  let statusColor = '#EF4444';
  let bgStatusColor = '#FEE2E2';
  if (booking.status === 'confirmed') {
    statusColor = '#E1AD01'; // accent
    bgStatusColor = '#FEF3C7';
  } else if (booking.status === 'completed') {
    statusColor = '#4CAF50';
    bgStatusColor = '#E8F5E9';
  } else if (booking.status === 'pending') {
    statusColor = '#F59E0B';
    bgStatusColor = '#FEF3C7';
  }

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-borderLight last:border-0">
      <span className="text-sm text-textSecondary">{label}</span>
      <span className="text-sm font-semibold text-textPrimary capitalize">{value}</span>
    </div>
  );

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title="Booking Details" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[100px] space-y-6">
          
          {/* Property Card */}
          <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {listingImage ? (
              <img src={listingImage} alt="Property" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-surfaceLight flex items-center justify-center">
                <Home01Icon size={32} className="text-textTertiary" />
              </div>
            )}
            <div className="p-4 bg-surface">
              <h2 className="text-lg font-bold text-textPrimary mb-1">{listingTitle}</h2>
              <p className="text-sm text-textSecondary">{listing?.areaCluster || ''}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div 
            className="flex items-center justify-center py-3 rounded-xl shadow-sm"
            style={{ backgroundColor: bgStatusColor }}
          >
            <span className="text-sm font-extrabold tracking-wide uppercase" style={{ color: statusColor }}>
              {booking.status}
            </span>
          </div>

          {/* Payment Progress */}
          {totalInstallments > 1 && (
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-bold text-textPrimary mb-3">Payment Progress</h3>
              <div className="h-2 rounded-full bg-borderLight overflow-hidden mb-2">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm font-semibold text-accent mb-1">{paidCount} of {totalInstallments} payments completed</p>
              {booking.nextDueDate && (
                <p className="text-xs text-textTertiary">Next due: {new Date(booking.nextDueDate).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Rent Renewal */}
          {!isShortlet && booking.nextRentDue && (
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-bold text-textPrimary mb-3">Rent Renewal</h3>
              <RentRenewal bookingId={booking._id} nextRentDue={booking.nextRentDue} />
            </div>
          )}

          {/* Details */}
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-textPrimary">Details</h3>
              <button 
                onClick={handleChat}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-95 transition-transform"
              >
                <Chatting01Icon size={20} variant="solid" />
              </button>
            </div>
            
            <DetailRow label="Status" value={booking.status} />
            
            {isShortlet && shortletPricingUsed && priceKey ? (
              <DetailRow 
                label={durationUnit === 'hour' ? 'Hourly' : durationUnit === 'day' ? 'Daily' : durationUnit === 'week' ? 'Weekly' : 'Monthly'} 
                value={`₦${shortletPricingUsed[priceKey]?.toLocaleString() ?? '—'}`} 
              />
            ) : (
              <DetailRow label="Rent" value={`₦${listing?.rentAnnual?.toLocaleString() || '—'}`} />
            )}
            
            {payFreq && (
              <DetailRow 
                label="Payment" 
                value={payFreq === 'custom' ? `${customPlan?.installments} x ₦${customPlan?.amountPerInstallment?.toLocaleString()} (${customPlan?.interval})` : payFreq} 
              />
            )}
            
            <DetailRow label="Booked on" value={new Date(booking.createdAt).toLocaleDateString()} />
            {booking.moveInDate && (
              <DetailRow label="Move-in" value={new Date(booking.moveInDate).toLocaleDateString()} />
            )}
          </div>

          {/* Actions */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex flex-col gap-3">
              <Button fullWidth onClick={handlePay} className="shadow-[0_4px_12px_rgba(107,79,58,0.25)]">
                Make Payment
              </Button>
              <Button fullWidth variant="secondary" onClick={handleCancel}>
                Cancel Booking
              </Button>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { Calendar01Icon, Tick01Icon } from '@hugeicons/react';
import { bookingService, BookingSummaryResponse } from '../../api/bookingService';
import { clsx } from 'clsx';

export function Checkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedContract, setAgreedContract] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        if (!id) return;
        setLoading(true);
        // Using mock structure similar to RN's BookingSummaryScreen for parity
        const response = await bookingService.getBookingSummary({ listingId: id });
        if (response.success) {
          setSummary({
            ...response.data,
            // Add some mock fields for visual parity if API doesn't return them yet
            paymentFrequency: 'annually',
            isShortlet: false,
            roommateMatchingFee: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch booking summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  const handlePay = () => {
    if (!agreedTerms || !agreedContract) return;
    // Equivalent to navigating to ContractSigning in RN
    navigate(`/booking/signature/${id}`);
  };

  const Row = ({ label, value, bold, highlight }: { label: string; value?: number; bold?: boolean; highlight?: boolean }) => (
    <div className="flex justify-between items-center mb-3 last:mb-0">
      <span className={clsx("text-sm text-textSecondary", bold && "font-bold text-textPrimary")}>{label}</span>
      <span className={clsx(
        "text-sm font-semibold text-textPrimary",
        bold && "font-bold",
        highlight && "text-lg text-primary font-black"
      )}>
        ₦{value?.toLocaleString() ?? '0'}
      </span>
    </div>
  );

  const CheckItem = ({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) => (
    <div 
      className="flex items-center gap-3 mb-3 cursor-pointer active:opacity-70 transition-opacity" 
      onClick={onToggle}
    >
      <div className={clsx(
        "w-6 h-6 rounded flex items-center justify-center shrink-0 border-2 transition-colors",
        checked ? "bg-primary border-primary text-white" : "border-textTertiary"
      )}>
        {checked && <Tick01Icon size={16} variant="solid" />}
      </div>
      <span className="text-sm text-textSecondary flex-1 leading-relaxed">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Booking Summary" onBack={() => navigate(-1)} />
        <div className="p-4 space-y-4">
          <Skeleton height={80} className="w-full rounded-2xl" />
          <Skeleton height={250} className="w-full rounded-2xl" />
          <Skeleton height={120} className="w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!summary) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Booking Summary" onBack={() => navigate(-1)} />
        <div className="flex-1 flex justify-center items-center p-4 text-textSecondary">
          Failed to load booking summary.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title="Booking Summary" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[100px]">
          
          {/* Property Info */}
          <div className="bg-surface rounded-2xl p-4 mb-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-textPrimary mb-1">{summary.title}</h2>
            {summary.durationLabel && (
              <p className="text-sm text-textSecondary">{summary.durationLabel}</p>
            )}
          </div>

          {/* Fee Breakdown */}
          <h3 className="text-base font-bold text-textPrimary mb-4">Fee Breakdown</h3>
          <div className="bg-surface rounded-2xl p-4 mb-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            
            {summary.paymentFrequency && !summary.isShortlet && (
              <div className="inline-flex items-center gap-1.5 bg-[#FFF8E1] border border-[#FFE88A] rounded-lg px-2.5 py-1.5 mb-4">
                <Calendar01Icon size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent">
                  Paid {summary.paymentFrequency === 'monthly' ? 'Monthly' : summary.paymentFrequency === 'quarterly' ? 'Quarterly' : summary.paymentFrequency === 'bi-annually' ? 'Bi-annually' : summary.paymentFrequency === 'custom' ? `Custom (${summary.customPaymentPlan?.installments} installments)` : 'Annually'}
                  {summary.perPeriodCost ? ` — ₦${summary.perPeriodCost.toLocaleString()}/${summary.paymentFrequency === 'monthly' ? 'mo' : summary.paymentFrequency === 'quarterly' ? 'qtr' : summary.paymentFrequency === 'bi-annually' ? '6mo' : 'yr'}` : ''}
                </span>
              </div>
            )}

            <Row 
              label={summary.isShortlet ? 'Booking Cost' : summary.paymentFrequency === 'annually' || !summary.paymentFrequency ? 'Annual Rent' : `Rent (${summary.paymentFrequency})`} 
              value={summary.rentAmount} 
            />
            
            {!summary.isShortlet && <Row label="Caution Fee" value={summary.cautionFee} />}
            {!summary.isShortlet && <Row label="Agency Fee" value={summary.agencyFee} />}
            <Row label="Platform Fee (5%)" value={summary.platformFee} />
            
            {summary.roommateMatchingFee > 0 && (
              <Row label="Roommate Matching Fee (1%)" value={summary.roommateMatchingFee} />
            )}
            
            <div className="w-full h-px bg-borderLight my-3" />
            
            <Row label="Total to Pay" value={summary.total} bold highlight />
          </div>

          {/* Confirmation Steps */}
          <h3 className="text-base font-bold text-textPrimary mb-4">Confirmations</h3>
          <div className="bg-surface rounded-2xl p-4 mb-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
            <CheckItem
              checked={agreedTerms}
              onToggle={() => setAgreedTerms(!agreedTerms)}
              label="I have reviewed the booking details and fee breakdown"
            />
            <div className="w-full h-px bg-borderLight my-3" />
            <CheckItem
              checked={agreedContract}
              onToggle={() => setAgreedContract(!agreedContract)}
              label="I agree to review and sign the tenancy agreement"
            />
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-border z-30 pb-safe-bottom">
          <Button 
            fullWidth 
            onClick={handlePay}
            disabled={!agreedTerms || !agreedContract}
            className="shadow-[0_4px_12px_rgba(107,79,58,0.25)]"
          >
            {summary?.isShortlet ? 'Proceed to Sign & Pay' : 'Proceed to Sign & Pay'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

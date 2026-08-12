import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { CreditCardIcon, CheckmarkCircle02Icon, Alert01Icon } from '@hugeicons/react';
import { clsx } from 'clsx';
import { bookingService } from '../../api/bookingService';

// SECURITY-FIX (P-H4): this screen no longer fabricates a successful payment with a
// hardcoded amount/reference. Payment is server-authoritative: we ask the backend to
// initiate a Paystack transaction (which derives the amount) and redirect the user to
// the backend-provided `authorizationUrl`. Confirmation happens ONLY after Paystack
// redirects back to `/payment/callback`, which verifies the reference with the backend.
export function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async () => {
    if (!id) return;
    setError(null);
    setInitiating(true);
    try {
      const result = await bookingService.payForBooking(id);
      const url = result?.data?.authorizationUrl;
      if (url) {
        // Hand off to Paystack. The user returns via /payment/callback for verification.
        window.location.href = url;
      } else {
        setError('Could not start payment. Please try again.');
        setInitiating(false);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          'Failed to initiate payment. Please try again.'
      );
      setInitiating(false);
    }
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Payment" onBack={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 flex flex-col">
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0E6] flex items-center justify-center mb-4">
              <CreditCardIcon size={30} className="text-primary" />
            </div>
            <h2 className="text-xl font-black text-textPrimary mb-2">Secure Payment</h2>
            <p className="text-sm text-textSecondary leading-relaxed mb-4">
              You'll be redirected to our payment partner (Paystack) to complete your
              payment securely. The exact amount is calculated and confirmed by iléSure.
            </p>

            <div className="w-full space-y-2 text-left mt-2">
              <div className="flex items-center gap-2">
                <CheckmarkCircle02Icon size={18} className="text-[#388E3C]" variant="solid" />
                <span className="text-sm text-textSecondary">Bank-grade encrypted checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckmarkCircle02Icon size={18} className="text-[#388E3C]" variant="solid" />
                <span className="text-sm text-textSecondary">Verified on return, no fake confirmations</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl p-4 mt-4">
              <Alert01Icon size={18} className="text-status-error" />
              <span className="text-sm text-status-error flex-1">{error}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface">
          <button
            onClick={handleProceed}
            disabled={initiating}
            className={clsx(
              'w-full py-4 rounded-xl flex items-center justify-center transition-transform',
              initiating ? 'bg-primary/50' : 'bg-primary active:scale-[0.98]'
            )}
          >
            {initiating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-[15px] font-bold">Redirecting to Paystack...</span>
              </div>
            ) : (
              <span className="text-white text-[15px] font-bold">Pay Securely</span>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { CheckmarkCircle02Icon, Alert01Icon } from '@hugeicons/react';
import { paymentService } from '../../api/paymentService';

type Status = 'verifying' | 'success' | 'failed';

// SECURITY-FIX (P-H5): the backend sets `callbackUrl = {origin}/payment/callback` when
// initiating Paystack payments, but the PWA had no such route, so real payments landed
// on a 404 and were never verified client-side. This page reads the Paystack `reference`
// from the query and verifies it with the backend (paymentService.verifyPayment) before
// showing success/failure. Success is derived ONLY from the server verification result.
export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');

  useEffect(() => {
    // Paystack returns `reference` (and sometimes `trxref`).
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }

    let active = true;
    const verify = async () => {
      try {
        const result = await paymentService.verifyPayment(reference);
        if (!active) return;
        setStatus(result.status === 'success' ? 'success' : 'failed');
      } catch {
        if (active) setStatus('failed');
      }
    };
    verify();

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full items-center justify-center bg-background px-6 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <h1 className="text-lg font-black text-textPrimary mb-1">Verifying Payment</h1>
            <p className="text-sm text-textSecondary">
              Please wait while we confirm your transaction...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-5">
              <CheckmarkCircle02Icon size={44} className="text-[#2E7D32]" variant="solid" />
            </div>
            <h1 className="text-2xl font-black text-textPrimary mb-2">Payment Successful!</h1>
            <p className="text-sm text-textSecondary mb-6">
              Your payment has been confirmed. You can now track your booking.
            </p>
            <button
              onClick={() => navigate('/my-apartments', { replace: true })}
              className="w-full max-w-xs bg-primary text-white text-[15px] font-bold py-4 rounded-xl active:scale-[0.98] transition-transform"
            >
              Go to My Apartments
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-[#FFEBEE] flex items-center justify-center mb-5">
              <Alert01Icon size={44} className="text-status-error" />
            </div>
            <h1 className="text-2xl font-black text-textPrimary mb-2">Payment Not Confirmed</h1>
            <p className="text-sm text-textSecondary mb-6">
              We couldn't verify your payment. If you were charged, it will be reconciled
              automatically. You can try again from your booking.
            </p>
            <button
              onClick={() => navigate('/my-apartments', { replace: true })}
              className="w-full max-w-xs bg-primary text-white text-[15px] font-bold py-4 rounded-xl active:scale-[0.98] transition-transform"
            >
              Back to My Apartments
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default PaymentCallback;

import { useState } from 'react';
import { CheckmarkBadge01Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';
import { bookingService } from '../../api/bookingService';
import { customAlert } from '../../stores/alertStore';
import { getApiErrorMessage } from '../../api/apiError';

/**
 * The inspection fee on a booking: what it costs (fee + 1.5%) and a button to pay it.
 * Paid to iléSure before the viewing; the inspection cannot be confirmed until it is paid.
 */

interface InspectionFeeBooking {
  _id?: string;
  id?: string;
  inspectionFee?: { amount: number; processingFee: number; total: number; status: 'unpaid' | 'paid' };
  inspectionFeeDue?: boolean;
}

function naira(n: number): string {
  return `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function InspectionFeeCard({ booking, compact = false }: { booking: InspectionFeeBooking; compact?: boolean }) {
  const [paying, setPaying] = useState(false);
  const fee = booking?.inspectionFee;
  if (!fee || !(fee.total > 0)) return null;

  const bookingId = booking._id || booking.id;

  if (fee.status === 'paid') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#166534]">
        <CheckmarkBadge01Icon size={16} variant="solid" className="shrink-0" />
        Inspection fee paid ({naira(fee.total)})
      </div>
    );
  }

  const handlePay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!bookingId || paying) return;
    setPaying(true);
    try {
      const res = await bookingService.payInspectionFee(bookingId);
      const url = res?.data?.authorizationUrl;
      if (!url) throw new Error('No checkout link');
      window.location.href = url;
    } catch (err) {
      customAlert(getApiErrorMessage(err, 'Could not start the payment. Please try again.'), 'Payment', 'error');
      setPaying(false);
    }
  };

  return (
    <div className={`rounded-xl border border-accent/40 bg-accent/5 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-sm font-bold text-textPrimary mb-2">Inspection fee</p>
      <div className="space-y-1 text-xs text-textSecondary mb-3">
        <div className="flex justify-between"><span>Inspection fee</span><span>{naira(fee.amount)}</span></div>
        <div className="flex justify-between"><span>Processing (1.5%)</span><span>{naira(fee.processingFee)}</span></div>
        <div className="flex justify-between font-bold text-textPrimary pt-1 border-t border-borderLight">
          <span>Total</span><span>{naira(fee.total)}</span>
        </div>
      </div>
      {booking.inspectionFeeDue ? (
        <>
          <p className="text-xs text-textSecondary mb-2">Pay the inspection fee to confirm your inspection.</p>
          <Button size="sm" fullWidth loading={paying} onClick={handlePay}>
            Pay {naira(fee.total)}
          </Button>
        </>
      ) : (
        <p className="text-xs text-textSecondary">Online payment is not open yet. You can still go for the inspection.</p>
      )}
    </div>
  );
}

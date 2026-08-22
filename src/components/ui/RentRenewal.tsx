import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { RefreshIcon } from '@hugeicons/react';
import { bookingService, type NextRentDue } from '../../api/bookingService';

// Lightweight live countdown to the next yearly rent renewal. Uses a single
// setInterval that is cleaned up on unmount. Renders the amount + label and,
// when the period is payable (due/overdue), a "Pay / Renew" button that
// initiates the same Paystack redirect flow as the initial rent payment.

function formatCountdown(dueMs: number, now: number): { text: string; overdue: boolean } {
  const diff = dueMs - now;
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);

  if (overdue) {
    if (days > 0) return { text: `Overdue by ${days} day${days === 1 ? '' : 's'}`, overdue };
    if (hours > 0) return { text: `Overdue by ${hours}h ${minutes}m`, overdue };
    return { text: `Overdue by ${minutes}m`, overdue };
  }
  // Far out: show whole days.
  if (days >= 2) return { text: `Renews in ${days} days`, overdue };
  // Under 2 days: show hours / minutes (and seconds when in the last hour).
  if (days === 1) return { text: `Renews in 1d ${hours}h ${minutes}m`, overdue };
  if (hours > 0) return { text: `Renews in ${hours}h ${minutes}m`, overdue };
  return { text: `Renews in ${minutes}m ${seconds}s`, overdue };
}

interface RentRenewalProps {
  bookingId: string;
  nextRentDue: NextRentDue;
  className?: string;
}

export function RentRenewal({ bookingId, nextRentDue, className }: RentRenewalProps) {
  const dueMs = new Date(nextRentDue.dueDate).getTime();
  const [now, setNow] = useState(() => Date.now());
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { text, overdue } = formatCountdown(dueMs, now);
  // Overdue → red warning; payable-but-not-overdue (due) → accent; upcoming → neutral.
  const accent = overdue ? '#EF4444' : nextRentDue.payable ? '#E1AD01' : '#6B4F3A';

  const handlePay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (paying) return;
    setPaying(true);
    try {
      const result = await bookingService.payForPeriod(bookingId, nextRentDue.index);
      const url = result?.data?.authorizationUrl;
      if (url) {
        window.location.href = url;
      } else {
        setPaying(false);
      }
    } catch (err) {
      console.error('Failed to initiate renewal payment', err);
      setPaying(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        'rounded-xl p-3 border',
        overdue ? 'bg-[#FEE2E2] border-[#FCA5A5]' : 'bg-surfaceLight border-borderLight',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <RefreshIcon size={14} style={{ color: accent }} />
          <span className="text-sm font-bold truncate" style={{ color: accent }}>{text}</span>
        </div>
        <span className="text-xs text-textTertiary whitespace-nowrap">{nextRentDue.label}</span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-base font-extrabold text-primary">
          ₦{nextRentDue.amount.toLocaleString()}
        </span>
        {nextRentDue.payable && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-60"
          >
            {paying ? 'Redirecting…' : 'Pay / Renew'}
          </button>
        )}
      </div>
    </div>
  );
}

export default RentRenewal;

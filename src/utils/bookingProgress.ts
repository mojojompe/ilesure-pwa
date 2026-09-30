/**
 * Where a renter's booking stands. KEEP IN SYNC with the mobile copy
 * (IleSure/src/utils/bookingProgress.ts).
 *
 * Payability is decided by the SERVER: bookings carry `paymentEligibility`
 * (GET /bookings, /bookings/my-apartments, /bookings/:id). The client only falls back to a
 * minimal status-based guess when an older response lacks the field.
 *
 * The backend only ever writes `timelineStep` 1-3 (2 = inspection scheduled or missed,
 * 3 = inspection outcome recorded); it never writes 4, so a client that waited for
 * step 4 could never offer payment.
 */

import type { PaymentBlocker, PaymentEligibility } from '../contracts/generated';

/** Why payment is blocked; the contract's PAYMENT_BLOCKERS. */
export type PaymentIneligibleReason = PaymentBlocker;
export type { PaymentEligibility } from '../contracts/generated';

export interface BookingProgress {
  /** 1 Requested, 2 Inspection, 3 Inspection verified, 4 Payment, 5 Paid / move in. */
  currentStep: number;
  /** The raw `timelineStep` the server stored (1-3). */
  rawStep: number;
  isShortlet: boolean;
  isPaid: boolean;
  isCancelled: boolean;
  /**
   * May enter checkout -> signature -> payment. True when the server says payable, or when
   * the only thing missing is the tenancy agreement (CONTRACT_NOT_SIGNED), which that flow
   * itself collects.
   */
  isPayable: boolean;
  /** The server's explanation when payment is blocked for any other reason. */
  blockedMessage: string | null;
  /** The tenant recorded that the apartment did not match the listing. */
  inspectionFailed: boolean;
}

export function deriveBookingProgress(booking: any): BookingProgress {
  const rawStep = Number(booking?.timelineStep) || 1;
  const status = booking?.status;
  const isShortlet =
    booking?.isShortlet === true ||
    booking?.listingId?.propertyType === 'shortlet' ||
    !!booking?.selectedRate;
  const isPaid = status === 'completed';
  const isCancelled = status === 'cancelled' || status === 'rejected';
  const inspectionFailed = !isShortlet && rawStep >= 3 && booking?.isVerified === false;

  const eligibility: PaymentEligibility | undefined = booking?.paymentEligibility;
  let isPayable: boolean;
  let blockedMessage: string | null = null;
  if (eligibility && typeof eligibility.payable === 'boolean') {
    isPayable = eligibility.payable || eligibility.reason === 'CONTRACT_NOT_SIGNED';
    if (!isPayable && !eligibility.payable) blockedMessage = eligibility.message || null;
  } else {
    // Minimal fallback for responses without the field; the server still enforces the rules.
    isPayable = (status === 'pending' || status === 'confirmed') && (isShortlet || booking?.isVerified === true);
  }

  // Step 1 ("Booking Requested") is done the moment the booking exists, so an unpaid booking
  // is never earlier than step 2, which is where the renter schedules and then confirms the
  // viewing. Leaving it on step 1 hid the Schedule Inspection action entirely.
  const currentStep = isPaid ? 5 : isPayable ? 4 : Math.min(Math.max(rawStep, 2), 3);
  return { currentStep, rawStep, isShortlet, isPaid, isCancelled, isPayable, blockedMessage, inspectionFailed };
}

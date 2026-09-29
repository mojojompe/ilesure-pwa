/**
 * Client mirror of the backend's `src/config/fees.ts`.
 *
 * The server is always the authority on what is actually charged — prefer the
 * amounts returned by `POST /bookings/summary` wherever they are available.
 * These constants exist only for pre-quote UI (e.g. the booking modal, which
 * estimates the total before a booking record exists) and for fee labels.
 *
 * KEEP IN SYNC with the backend. The rate previously lived as a hardcoded
 * `* 0.05` in two components and a `"Platform Fee (5%)"` string in three more,
 * so a server-side rate change quoted users one number and charged another.
 */

/** Platform service fee as a percentage of the subtotal (rent + caution + agency). */
export const PLATFORM_FEE_PERCENT = 5;

/** Roommate matching fee as a percentage of the subtotal. */
export const ROOMMATE_MATCHING_FEE_PERCENT = 1;

/** Label for the platform fee line item, e.g. "Platform Fee (8%)". */
export const PLATFORM_FEE_LABEL = `Platform Fee (${PLATFORM_FEE_PERCENT}%)`;

/** Label for an arbitrary percent, e.g. the one the server quoted. */
export function platformFeeLabel(percent: number): string {
  return `Platform Fee (${percent}%)`;
}

/** The fee-bearing fields of a `POST /bookings/summary` quote. */
export interface FeeQuote {
  platformFeePercent?: number;
  /** rent + caution + agency, when the server sends it. */
  subtotal?: number;
  platformFee?: number;
  rentAmount?: number;
  cautionFee?: number;
  agencyFee?: number;
}

/**
 * The platform fee percent to DISPLAY for a server quote: the server's own
 * `platformFeePercent` when it sends one, otherwise derived from the quoted fee and
 * subtotal, otherwise the local constant (no quote yet / offline).
 */
export function resolvePlatformFeePercent(quote?: FeeQuote | null): number {
  if (quote) {
    const explicit = Number(quote.platformFeePercent);
    if (quote.platformFeePercent != null && Number.isFinite(explicit) && explicit >= 0) return explicit;
    const subtotal = Number(quote.subtotal) > 0 ? Number(quote.subtotal) : ((Number(quote.rentAmount) || 0) + (Number(quote.cautionFee) || 0) + (Number(quote.agencyFee) || 0));
    const fee = Number(quote.platformFee);
    if (subtotal > 0 && Number.isFinite(fee) && fee >= 0) return Math.round((fee / subtotal) * 1000) / 10;
  }
  return PLATFORM_FEE_PERCENT;
}

export function calculatePlatformFee(subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  return Math.round((subtotal * PLATFORM_FEE_PERCENT) / 100);
}

export function calculateRoommateMatchingFee(subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  return Math.round((subtotal * ROOMMATE_MATCHING_FEE_PERCENT) / 100);
}

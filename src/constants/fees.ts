/**
 * Client mirror of the backend's `src/config/fees.ts`.
 *
 * The server is always the authority on what is actually charged, prefer the
 * amounts returned by `POST /bookings/summary` wherever they are available.
 * These constants exist only for pre-quote UI (e.g. the booking modal, which
 * estimates the total before a booking record exists) and for fee labels.
 *
 * KEEP IN SYNC with the backend. The rate previously lived as a hardcoded
 * `* 0.05` in two components and a `"Platform Fee (5%)"` string in three more,
 * so a server-side rate change quoted users one number and charged another.
 */

/** Platform service fee as a percentage of the subtotal (rent + caution + agency). */
export const PLATFORM_FEE_PERCENT = 8;

/** Roommate matching fee as a percentage of the subtotal. */
export const ROOMMATE_MATCHING_FEE_PERCENT = 1;

/** Label for the platform fee line item, e.g. "Platform Fee (8%)". */
export const PLATFORM_FEE_LABEL = `Platform Fee (${PLATFORM_FEE_PERCENT}%)`;

export function calculatePlatformFee(subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  return Math.round((subtotal * PLATFORM_FEE_PERCENT) / 100);
}

export function calculateRoommateMatchingFee(subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  return Math.round((subtotal * ROOMMATE_MATCHING_FEE_PERCENT) / 100);
}

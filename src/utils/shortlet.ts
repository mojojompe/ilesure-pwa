/**
 * Client-side mirror of the backend's shortlet tier resolution (`src/utils/shortlet.ts`).
 *
 * A listing may carry either the flexible `shortletRates` array or the deprecated fixed
 * `shortletPricing { hourly, daily, weekly, monthly }` map. Anywhere that shows or offers
 * shortlet prices must read both, otherwise listings priced with the newer flexible tiers
 * render with no price at all.
 */

export type ShortletUnit = 'hour' | 'day' | 'week' | 'month';

export interface ShortletTier {
  id?: string;
  label: string;
  durationValue: number;
  durationUnit: ShortletUnit;
  price: number;
}

const UNIT_SHORT: Record<ShortletUnit, string> = {
  hour: 'hr',
  day: 'day',
  week: 'wk',
  month: 'mo',
};

const LEGACY_UNIT_LABEL: Record<ShortletUnit, string> = {
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

const LEGACY_KEY: Record<ShortletUnit, string> = {
  hour: 'hourly',
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
};

/**
 * Bookable shortlet tiers for a listing, newest shape first. Zero-priced entries are dropped,
 * they mean "this unit is not offered", not "this stay is free".
 */
export function getListingShortletTiers(listing: any): ShortletTier[] {
  if (Array.isArray(listing?.shortletRates) && listing.shortletRates.length > 0) {
    return listing.shortletRates
      .filter((r: any) => (Number(r?.price) || 0) > 0)
      .map((r: any) => ({
        id: r.id,
        label: r.label,
        durationValue: Number(r.durationValue) || 1,
        durationUnit: r.durationUnit as ShortletUnit,
        price: Number(r.price),
      }));
  }

  const pricing = listing?.shortletPricing || {};
  const tiers: ShortletTier[] = [];
  (['hour', 'day', 'week', 'month'] as ShortletUnit[]).forEach((unit) => {
    const price = Number(pricing[LEGACY_KEY[unit]]);
    if (price > 0) {
      tiers.push({ label: LEGACY_UNIT_LABEL[unit], durationValue: 1, durationUnit: unit, price });
    }
  });
  return tiers;
}

/** Short price line for a tier, e.g. "₦40,000/day" or "₦75,000/2 days". */
export function formatShortletTier(tier: ShortletTier): string {
  const unit = UNIT_SHORT[tier.durationUnit] || tier.durationUnit;
  const per = tier.durationValue > 1 ? `${tier.durationValue} ${unit}s` : unit;
  return `₦${tier.price.toLocaleString()}/${per}`;
}

/**
 * What a booking was actually charged, preferring the tier snapshotted at booking time
 * (`selectedRate`) over the legacy `shortletPricingUsed` map. The backend charges from
 * `selectedRate`, so reading only the legacy map showed nothing for newer bookings.
 */
export function getBookingShortletSummary(booking: any): { label: string; unitPrice: number; quantity: number; total: number } | null {
  const quantity = Number(booking?.rateQuantity) || Number(booking?.durationQuantity) || 1;

  const rate = booking?.selectedRate;
  if (rate && Number(rate.price) >= 0) {
    const unitPrice = Number(rate.price);
    return { label: rate.label, unitPrice, quantity, total: unitPrice * quantity };
  }

  const unit = booking?.durationUnit as ShortletUnit | undefined;
  if (!unit) return null;
  const legacy = Number(booking?.shortletPricingUsed?.[LEGACY_KEY[unit]]);
  if (!(legacy > 0)) return null;
  return { label: LEGACY_UNIT_LABEL[unit], unitPrice: legacy, quantity, total: legacy * quantity };
}

const UNIT_HOURS: Record<ShortletUnit, number> = { hour: 1, day: 24, week: 24 * 7, month: 24 * 30 };

/** Hours in `value` × `unit`, the same conversion the server uses for min/max stay. */
export function stayUnitsToHours(value: number, unit: ShortletUnit): number {
  return (Number(value) || 0) * (UNIT_HOURS[unit] ?? 0);
}

/** "2 nights", "1 week": a min/max stay as the guest reads it. */
export function formatStayLength(value: number, unit: ShortletUnit): string {
  const n = Number(value) || 0;
  const word = unit === 'day' ? 'night' : unit;
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * When a stay ends: the tier's length × how many were booked, from the check-in. Mirrors the
 * server's computeShortletEndDate, which decides the real check-out.
 */
export function computeStayEnd(start: Date, tier: Pick<ShortletTier, 'durationValue' | 'durationUnit'>, quantity: number): Date {
  const end = new Date(start);
  const units = (Number(tier.durationValue) || 1) * (Number(quantity) || 1);
  switch (tier.durationUnit) {
    case 'hour': end.setHours(end.getHours() + units); break;
    case 'day': end.setDate(end.getDate() + units); break;
    case 'week': end.setDate(end.getDate() + units * 7); break;
    case 'month': end.setMonth(end.getMonth() + units); break;
  }
  return end;
}

/** Today's date as YYYY-MM-DD in the device's own time zone (not UTC). */
export function localDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A shortlet booking's check-in and check-out, from the dates the server worked out. */
export function getBookingStayDates(booking: any): { checkIn: Date; checkOut: Date } | null {
  const start = booking?.startDate || booking?.moveInDate;
  if (!start || !booking?.endDate) return null;
  const checkIn = new Date(start);
  const checkOut = new Date(booking.endDate);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return null;
  return { checkIn, checkOut };
}

/** "Wed 26 Nov", with the time for hourly stays. */
export function formatStayDate(date: Date, withTime = false): string {
  return date.toLocaleString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

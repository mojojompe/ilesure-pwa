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

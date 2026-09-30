/**
 * Listing filter vocabulary for the renter app. The value sets, their types and their display
 * labels come from the API contract (contracts/generated.ts); this file only holds the PWA's
 * own filter groupings (which values a chip or toggle stands for, which options a picker shows).
 *
 * Store and send values, render labels.
 */
import {
  AMENITIES,
  AMENITY_LABELS,
  DISTANCE_BUCKETS,
  DISTANCE_LABELS,
  FURNISHING_LABELS,
  GENDER_LABELS,
  POWER_LABELS,
  PROPERTY_TYPE_LABELS,
  WATER_LABELS,
} from '../contracts/generated';
import type {
  DistanceBucket,
  Furnishing,
  GenderRestriction,
  PowerSource,
  PropertyType,
} from '../contracts/generated';

export type {
  DistanceBucket,
  Furnishing,
  GenderRestriction,
  PowerSource,
  PropertyType,
  WaterSource,
} from '../contracts/generated';

export interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Filter options as { value, label } pairs. The value goes on the wire, the
 * label goes on the pill — the filter modal previously stored labels and
 * compared them against listings holding machine values, so nothing matched.
 */
const option = <T extends string>(labels: Record<T, string>) => (value: T): Option<T> => ({
  value,
  label: labels[value],
});

/** Shared apartments are booked through the roommate flow, not filtered for directly. */
export const PROPERTY_TYPE_OPTIONS: Option<PropertyType>[] = (
  ['self_con', '1_bed', '2_bed', '3_bed', 'mini_flat', 'studio', 'penthouse', 'hostel_room', 'shortlet'] as const
).map(option(PROPERTY_TYPE_LABELS));

export const GENDER_OPTIONS: Option<GenderRestriction>[] = (['any', 'female_only', 'male_only'] as const).map(
  option(GENDER_LABELS)
);

export const DISTANCE_OPTIONS: Option<DistanceBucket>[] = DISTANCE_BUCKETS.map(option(DISTANCE_LABELS));

/** Furnishing values the "Furnished" filter toggle should accept. */
export const FURNISHED_VALUES: Furnishing[] = ['fully_furnished', 'semi_furnished'];

/** Power values the "Stable Power" filter toggle should accept. */
export const STABLE_POWER_VALUES: PowerSource[] = ['constant', 'solar_backed', 'hybrid'];

/**
 * Which stored values each Discover chip stands for. Listing the members
 * explicitly removes the old substring-matching overlap, where `hostel_room`
 * satisfied both the "Hostel" and the "Apartment" chip.
 */
export const CHIP_PROPERTY_TYPES: Record<string, PropertyType[]> = {
  apartment: ['self_con', '1_bed', '2_bed', '3_bed', 'mini_flat', 'studio', 'penthouse'],
  hostel: ['hostel_room'],
  shortlet: ['shortlet'],
};


/** Amenity picker options: the contract's canonical AMENITIES tokens with their labels. */
export const AMENITY_OPTIONS = AMENITIES.map(option(AMENITY_LABELS));

const LABELS: Record<string, string> = {
  ...PROPERTY_TYPE_LABELS,
  ...FURNISHING_LABELS,
  ...POWER_LABELS,
  ...WATER_LABELS,
  ...GENDER_LABELS,
  ...DISTANCE_LABELS,
};

/** Display label for any stored value, with a readable fallback for pre-migration data. */
export function labelFor(value?: string | null): string {
  if (!value) return '';
  return LABELS[value] || value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

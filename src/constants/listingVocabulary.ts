/**
 * Canonical listing vocabulary — mirrors
 * `IleSure_Backend/src/constants/listingVocabulary.ts`.
 *
 * Store and send values, render labels. Keep in sync with the backend file.
 */

export type PropertyType =
  | 'self_con'
  | '1_bed'
  | '2_bed'
  | '3_bed'
  | 'mini_flat'
  | 'studio'
  | 'penthouse'
  | 'hostel_room'
  | 'shared_apartment'
  | 'shortlet';

export type Furnishing = 'fully_furnished' | 'semi_furnished' | 'unfurnished';
export type PowerSource = 'constant' | 'gen_dependent' | 'solar_backed' | 'hybrid';
export type WaterSource = 'borehole' | 'public' | 'tank';
export type GenderRestriction = 'any' | 'male_only' | 'female_only' | 'mixed';
export type DistanceBucket = 'very_close' | 'close' | 'budget_stretch';

export interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Filter options as { value, label } pairs. The value goes on the wire, the
 * label goes on the pill — the filter modal previously stored labels and
 * compared them against listings holding machine values, so nothing matched.
 */
export const PROPERTY_TYPE_OPTIONS: Option<PropertyType>[] = [
  { value: 'self_con', label: 'Self-con' },
  { value: '1_bed', label: '1-Bedroom' },
  { value: '2_bed', label: '2-Bedroom' },
  { value: '3_bed', label: '3-Bedroom' },
  { value: 'mini_flat', label: 'Mini Flat' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'hostel_room', label: 'Hostel Room' },
  { value: 'shortlet', label: 'Shortlet' },
];

export const GENDER_OPTIONS: Option<GenderRestriction>[] = [
  { value: 'any', label: 'Any' },
  { value: 'female_only', label: 'Female Only' },
  { value: 'male_only', label: 'Male Only' },
];

export const DISTANCE_OPTIONS: Option<DistanceBucket>[] = [
  { value: 'very_close', label: 'Very Close (5 mins or less)' },
  { value: 'close', label: 'Close (5-15 mins)' },
  { value: 'budget_stretch', label: 'Budget Stretch (15+ mins)' },
];

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

const LABELS: Record<string, string> = {
  self_con: 'Self-con',
  '1_bed': '1-Bedroom',
  '2_bed': '2-Bedroom',
  '3_bed': '3-Bedroom',
  mini_flat: 'Mini Flat',
  studio: 'Studio',
  penthouse: 'Penthouse',
  hostel_room: 'Hostel Room',
  shared_apartment: 'Shared Apartment',
  shortlet: 'Shortlet',
  fully_furnished: 'Fully Furnished',
  semi_furnished: 'Semi-Furnished',
  unfurnished: 'Unfurnished',
  constant: 'Constant PHCN',
  gen_dependent: 'Gen Backup',
  solar_backed: 'Solar-Backed',
  hybrid: 'Hybrid',
  borehole: 'Borehole',
  public: 'Public Supply',
  tank: 'Water Tank',
  any: 'Any',
  male_only: 'Male Only',
  female_only: 'Female Only',
  mixed: 'Mixed',
  very_close: 'Very Close (5 mins or less)',
  close: 'Close (5-15 mins)',
  budget_stretch: 'Budget Stretch (15+ mins)',
};

/** Display label for any stored value, with a readable fallback for pre-migration data. */
export function labelFor(value?: string | null): string {
  if (!value) return '';
  return LABELS[value] || value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Cancel01Icon } from '@hugeicons/react';
import {
  PROPERTY_TYPE_OPTIONS,
  DISTANCE_OPTIONS,
  GENDER_OPTIONS,
  PropertyType,
  DistanceBucket,
  GenderRestriction,
} from '../../constants/listingVocabulary';
import { LocationAnchorPicker, LocationAnchor } from './LocationAnchorPicker';

/**
 * Every enumerated field holds a canonical value ('2_bed'), never the display
 * label — the label lives only on the pill. This modal originally stored labels
 * ('2-Bedroom') and compared them against listings holding machine values, so
 * the property-type filter never matched anything.
 */
export interface FilterState {
  priceMin: number;
  priceMax: number;
  propertyTypes: PropertyType[];
  /** The lister's own "distance from school" bucket. Student-facing only. */
  distance: DistanceBucket | null;
  genderRestriction: GenderRestriction | null;
  shareable: boolean;
  furnished: boolean;
  powerStable: boolean;
  /**
   * Where to search from — a neighbourhood, estate, campus or address. Replaces
   * the student-only "near my school" switch, which left renters who are not
   * students with no location filter at all.
   */
  anchor: LocationAnchor | null;
  /** Radius around `anchor`, in metres. Ignored when no anchor is set. */
  radiusMetres: number;
  /** Hide properties restricted to students. Offered to non-students only. */
  excludeStudentsOnly: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  /** Filters currently applied to the feed, so reopening shows them. */
  initialFilters?: FilterState | null;
  userRole?: string;
  university?: string;
}

export const PRICE_RANGES = [
  { label: '< ₦100k', min: 0, max: 100_000 },
  { label: '₦100k–300k', min: 100_000, max: 300_000 },
  { label: '₦300k–600k', min: 300_000, max: 600_000 },
  { label: '₦600k+', min: 600_000, max: 2_000_000 },
];

/**
 * How wide to search around the chosen anchor. Plain language on purpose: the
 * campus-framed labels meant nothing to a renter who is not a student.
 */
export const RADIUS_OPTIONS = [
  { value: 1500, label: 'Walking distance' },
  { value: 4000, label: 'Nearby' },
  { value: 15000, label: 'Wider area' },
];

export const PRICE_FLOOR = 0;
export const PRICE_CEILING = 2_000_000;
export const DEFAULT_RADIUS_METRES = 4000;

export const DEFAULT_FILTERS: FilterState = {
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEILING,
  propertyTypes: [],
  distance: null,
  genderRestriction: null,
  shareable: false,
  furnished: false,
  powerStable: false,
  anchor: null,
  radiusMetres: DEFAULT_RADIUS_METRES,
  excludeStudentsOnly: false,
};

const pill = (isActive: boolean, accent: 'primary' | 'accent' = 'primary') =>
  `px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
    isActive
      ? accent === 'accent'
        ? 'bg-accent text-white border-accent'
        : 'bg-primary text-white border-primary'
      : 'bg-surface text-textSecondary border-borderLight'
  }`;

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm font-semibold text-textSecondary">{label}</span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-accent' : 'bg-borderLight'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'transform translate-x-6 bg-primary' : ''}`}></div>
    </div>
  </label>
);

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  initialFilters,
  userRole,
  university,
}) => {
  const isStudent = userRole === 'student';
  const [filters, setFilters] = useState<FilterState>(initialFilters || DEFAULT_FILTERS);

  // Re-seed from what is actually applied each time it opens; otherwise it
  // reappears showing defaults while the feed is still filtered.
  useEffect(() => {
    if (visible) setFilters(initialFilters || DEFAULT_FILTERS);
  }, [visible, initialFilters]);

  const togglePropertyType = (type: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onClear();
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-background rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-borderLight rounded-full mx-auto my-3 sm:hidden" />

            <div className="flex justify-between items-center px-6 py-4 border-b border-borderLight shrink-0">
              <h2 className="text-xl font-bold text-textPrimary">Filter Listings</h2>
              <button onClick={handleReset} className="text-primary font-semibold text-sm active:scale-95 transition-transform">
                Reset
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Search Near — available to every renter, not just students. */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Search Near</h3>
                <LocationAnchorPicker
                  value={filters.anchor}
                  onChange={anchor => setFilters(prev => ({ ...prev, anchor }))}
                  suggestion={isStudent && university ? { label: university, landmark: university } : null}
                  defaultTypes={isStudent ? 'university,area,estate' : 'area,estate,market,landmark'}
                />

                {filters.anchor && (
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-textPrimary mb-3">How Far</h3>
                    <div className="flex flex-wrap gap-2">
                      {RADIUS_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={pill(filters.radiusMetres === option.value)}
                          onClick={() => setFilters(prev => ({ ...prev, radiusMetres: option.value }))}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map(range => (
                    <button
                      key={range.label}
                      className={pill(filters.priceMin === range.min && filters.priceMax === range.max)}
                      onClick={() => setFilters(prev => ({ ...prev, priceMin: range.min, priceMax: range.max }))}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Property Type</h3>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={pill(filters.propertyTypes.includes(option.value), 'accent')}
                      onClick={() => togglePropertyType(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={pill(filters.genderRestriction === option.value)}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        genderRestriction: prev.genderRestriction === option.value ? null : option.value,
                      }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 mb-6">
                <h3 className="text-base font-bold text-textPrimary">Features</h3>

                <Toggle
                  label="Shareable / Room Sharing"
                  checked={filters.shareable}
                  onChange={v => setFilters(prev => ({ ...prev, shareable: v }))}
                />
                <Toggle
                  label="Furnished"
                  checked={filters.furnished}
                  onChange={v => setFilters(prev => ({ ...prev, furnished: v }))}
                />
                <Toggle
                  label="Stable Power (Solar/Hybrid)"
                  checked={filters.powerStable}
                  onChange={v => setFilters(prev => ({ ...prev, powerStable: v }))}
                />
                {!isStudent && (
                  <Toggle
                    label="Hide student-only listings"
                    checked={filters.excludeStudentsOnly}
                    onChange={v => setFilters(prev => ({ ...prev, excludeStudentsOnly: v }))}
                  />
                )}
              </div>

              {/* The lister's own "distance from school" bucket — only meaningful
                  to a student, so it is the one thing here that stays gated. */}
              {isStudent && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-textPrimary mb-3">Distance from School</h3>
                  <div className="flex flex-wrap gap-2">
                    {DISTANCE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        className={`${pill(filters.distance === option.value)} w-full text-left`}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          distance: prev.distance === option.value ? null : option.value,
                        }))}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pb-safe border-t border-borderLight bg-background shrink-0 rounded-b-[24px]">
              <Button fullWidth onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

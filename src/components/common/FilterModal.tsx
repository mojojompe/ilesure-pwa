import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Cancel01Icon } from '@hugeicons/react';

export interface FilterState {
  priceMin: number;
  priceMax: number;
  propertyTypes: string[];
  distance: string | null;
  genderRestriction: string | null;
  shareable: boolean;
  furnished: boolean;
  powerStable: boolean;
  schoolLocationOnly: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  userRole?: string;
  university?: string;
}

const PROPERTY_TYPES = ['Self-con', '1-Bedroom', '2-Bedroom', 'Mini Flat', 'Hostel Room', 'Shortlet'];
const DISTANCES = ['Very Close (≤5 mins)', 'Close (5–15 mins)', 'Budget Stretch (15+ mins)'];
const GENDER_OPTIONS = ['Any', 'Female Only', 'Male Only'];

const PRICE_RANGES = [
  { label: '< ₦100k', min: 0, max: 100_000 },
  { label: '₦100k–300k', min: 100_000, max: 300_000 },
  { label: '₦300k–600k', min: 300_000, max: 600_000 },
  { label: '₦600k+', min: 600_000, max: 2_000_000 },
];

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 2_000_000,
  propertyTypes: [],
  distance: null,
  genderRestriction: null,
  shareable: false,
  furnished: false,
  powerStable: false,
  schoolLocationOnly: false,
};

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  userRole,
  university,
}) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const togglePropertyType = (type: string) => {
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
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map(range => {
                    const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
                    return (
                      <button
                        key={range.label}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                          isActive ? 'bg-primary text-white border-primary' : 'bg-surface text-textSecondary border-borderLight'
                        }`}
                        onClick={() => setFilters(prev => ({ ...prev, priceMin: range.min, priceMax: range.max }))}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Property Type</h3>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(type => {
                    const isActive = filters.propertyTypes.includes(type);
                    return (
                      <button
                        key={type}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                          isActive ? 'bg-accent text-white border-accent' : 'bg-surface text-textSecondary border-borderLight'
                        }`}
                        onClick={() => togglePropertyType(type)}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Distance from School */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Distance from School</h3>
                <div className="flex flex-wrap gap-2">
                  {DISTANCES.map(dist => {
                    const isActive = filters.distance === dist;
                    return (
                      <button
                        key={dist}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border w-full text-left ${
                          isActive ? 'bg-primary text-white border-primary' : 'bg-surface text-textSecondary border-borderLight'
                        }`}
                        onClick={() => setFilters(prev => ({ ...prev, distance: isActive ? null : dist }))}
                      >
                        {dist}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-textPrimary mb-3">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map(g => {
                    const isActive = filters.genderRestriction === g;
                    return (
                      <button
                        key={g}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                          isActive ? 'bg-primary text-white border-primary' : 'bg-surface text-textSecondary border-borderLight'
                        }`}
                        onClick={() => setFilters(prev => ({ ...prev, genderRestriction: isActive ? null : g }))}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 mb-6">
                <h3 className="text-base font-bold text-textPrimary">Features</h3>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-textSecondary">Shareable / Room Sharing</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={filters.shareable} onChange={e => setFilters(prev => ({ ...prev, shareable: e.target.checked }))} />
                    <div className={`block w-14 h-8 rounded-full ${filters.shareable ? 'bg-accent' : 'bg-borderLight'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${filters.shareable ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-textSecondary">Furnished</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={filters.furnished} onChange={e => setFilters(prev => ({ ...prev, furnished: e.target.checked }))} />
                    <div className={`block w-14 h-8 rounded-full ${filters.furnished ? 'bg-accent' : 'bg-borderLight'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${filters.furnished ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-textSecondary">Stable Power (Solar/Hybrid)</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={filters.powerStable} onChange={e => setFilters(prev => ({ ...prev, powerStable: e.target.checked }))} />
                    <div className={`block w-14 h-8 rounded-full ${filters.powerStable ? 'bg-accent' : 'bg-borderLight'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${filters.powerStable ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                  </div>
                </label>
              </div>

              {userRole === 'student' && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-textPrimary mb-3">Location</h3>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-textSecondary">Only near my school ({university || 'Lead City University'})</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={filters.schoolLocationOnly} onChange={e => setFilters(prev => ({ ...prev, schoolLocationOnly: e.target.checked }))} />
                      <div className={`block w-14 h-8 rounded-full ${filters.schoolLocationOnly ? 'bg-accent' : 'bg-borderLight'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${filters.schoolLocationOnly ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                    </div>
                  </label>
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

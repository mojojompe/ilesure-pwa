import React from 'react';
import { motion } from 'framer-motion';

export interface CategoryItem {
  id: string;
  label: string;
  palette: {
    bg: string;
    border: string;
    accent: string;
  };
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'shared',
    label: 'Shared',
    palette: {
      bg: '#FFFDF7',
      border: '#E1AD01',
      accent: '#E1AD01',
    },
  },
  {
    id: 'hostel',
    label: 'Hostel',
    palette: {
      bg: '#FAF1CC',
      border: '#3E1F0A',
      accent: '#3E1F0A',
    },
  },
  {
    id: 'apartment',
    label: 'Apartment',
    palette: {
      bg: '#FFFDF7',
      border: '#3E1F0A',
      accent: '#6B3A1F',
    },
  },
  {
    id: 'shortlet',
    label: 'Shortlet',
    palette: {
      bg: '#FAF1CC',
      border: '#E1AD01',
      accent: '#E1AD01',
    },
  },
  {
    id: 'self_con',
    label: 'Self-Con',
    palette: {
      bg: '#FFFDF7',
      border: '#6B3A1F',
      accent: '#E1AD01',
    },
  },
];

/**
 * Simple, clean Corporate Memphis style flat vector illustrations (no background)
 * rendered with the iléSure palette (cream, mustard #E1AD01, and warm brown #3E1F0A).
 */
function MemphisIllustration({ category }: { category: string }) {
  switch (category) {
    case 'shared':
      // Two friendly figures / chairs around a shared space
      return (
        <svg viewBox="0 0 80 60" className="w-14 h-11" fill="none">
          <circle cx="28" cy="20" r="8" fill="#E1AD01" />
          <path d="M16 48c0-8 6-14 14-14h4c8 0 14 6 14 14" fill="#3E1F0A" />
          <circle cx="54" cy="22" r="7" fill="#6B3A1F" />
          <path d="M44 48c0-7 5-12 12-12h2c7 0 12 5 12 12" fill="#E1AD01" />
          <rect x="34" y="36" width="14" height="12" rx="2" fill="#FAF1CC" stroke="#3E1F0A" strokeWidth="2" />
        </svg>
      );
    case 'hostel':
      // Minimal geometric bunk beds / dorm architecture
      return (
        <svg viewBox="0 0 80 60" className="w-14 h-11" fill="none">
          <rect x="22" y="14" width="38" height="10" rx="3" fill="#E1AD01" />
          <rect x="22" y="32" width="38" height="10" rx="3" fill="#3E1F0A" />
          <rect x="18" y="10" width="4" height="42" rx="2" fill="#3E1F0A" />
          <rect x="60" y="10" width="4" height="42" rx="2" fill="#3E1F0A" />
          <rect x="42" y="24" width="4" height="8" rx="1" fill="#FAF1CC" />
          <circle cx="28" cy="20" r="3" fill="#FAF1CC" />
        </svg>
      );
    case 'apartment':
      // Clean modern architectural building with windows
      return (
        <svg viewBox="0 0 80 60" className="w-14 h-11" fill="none">
          <rect x="24" y="12" width="34" height="40" rx="4" fill="#3E1F0A" />
          <rect x="30" y="18" width="8" height="8" rx="2" fill="#E1AD01" />
          <rect x="44" y="18" width="8" height="8" rx="2" fill="#FAF1CC" />
          <rect x="30" y="30" width="8" height="8" rx="2" fill="#FAF1CC" />
          <rect x="44" y="30" width="8" height="8" rx="2" fill="#E1AD01" />
          <rect x="36" y="42" width="10" height="10" rx="2" fill="#E1AD01" />
        </svg>
      );
    case 'shortlet':
      // Minimal vacation suitcase with key/sun motif
      return (
        <svg viewBox="0 0 80 60" className="w-14 h-11" fill="none">
          <rect x="22" y="22" width="36" height="28" rx="6" fill="#E1AD01" />
          <path d="M34 22v-6a3 3 0 013-3h6a3 3 0 013 3v6" stroke="#3E1F0A" strokeWidth="3" />
          <circle cx="40" cy="36" r="6" fill="#3E1F0A" />
          <circle cx="52" cy="18" r="5" fill="#FAF1CC" stroke="#E1AD01" strokeWidth="2" />
          <line x1="28" y1="22" x2="28" y2="50" stroke="#3E1F0A" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="52" y1="22" x2="52" y2="50" stroke="#3E1F0A" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'self_con':
    default:
      // Minimal cozy studio with armchair and lamp
      return (
        <svg viewBox="0 0 80 60" className="w-14 h-11" fill="none">
          <rect x="20" y="28" width="26" height="22" rx="5" fill="#3E1F0A" />
          <rect x="24" y="34" width="18" height="12" rx="3" fill="#E1AD01" />
          <line x1="56" y1="20" x2="56" y2="50" stroke="#3E1F0A" strokeWidth="3" />
          <path d="M50 20l6-8 6 8H50z" fill="#E1AD01" />
          <circle cx="56" cy="50" r="3" fill="#6B3A1F" />
        </svg>
      );
  }
}

export interface CategoryPillCardProps {
  category: CategoryItem;
  isActive?: boolean;
  onPress?: () => void;
  onClick?: () => void;
}

export function CategoryPillCard({ category, isActive = false, onPress, onClick }: CategoryPillCardProps) {
  const handleAction = onPress || onClick;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={handleAction}
      className="flex flex-col items-center gap-2 outline-none group shrink-0"
    >
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(62,31,10,0.08)] ${
          isActive
            ? 'border-2 border-[#E1AD01] ring-2 ring-[#E1AD01]/30 -translate-y-0.5'
            : 'border border-[#E7DCD4] hover:border-[#E1AD01]/60'
        }`}
        style={{ backgroundColor: category.palette.bg }}
      >
        <MemphisIllustration category={category.id} />
      </div>
      <span
        className={`text-xs tracking-tight transition-colors ${
          isActive ? 'font-black text-[#3E1F0A]' : 'font-bold text-[#6B4F3A] group-hover:text-[#3E1F0A]'
        }`}
      >
        {category.label}
      </span>
    </motion.button>
  );
}

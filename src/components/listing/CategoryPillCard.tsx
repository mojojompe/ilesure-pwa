import React from 'react';
import { motion } from 'framer-motion';

export interface CategoryItem {
  id: string;
  label: string;
  image: string;
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
    image: '/images/categories/category_shared.png',
    palette: {
      bg: '#FFFDF7',
      border: '#E1AD01',
      accent: '#E1AD01',
    },
  },
  {
    id: 'hostel',
    label: 'Hostel',
    image: '/images/categories/category_hostel.png',
    palette: {
      bg: '#FAF1CC',
      border: '#3E1F0A',
      accent: '#3E1F0A',
    },
  },
  {
    id: 'apartment',
    label: 'Apartment',
    image: '/images/categories/category_apartment.png',
    palette: {
      bg: '#FFFDF7',
      border: '#3E1F0A',
      accent: '#6B3A1F',
    },
  },
  {
    id: 'shortlet',
    label: 'Shortlet',
    image: '/images/categories/category_shortlet.png',
    palette: {
      bg: '#FAF1CC',
      border: '#E1AD01',
      accent: '#E1AD01',
    },
  },
  {
    id: 'self_con',
    label: 'Self-Con',
    image: '/images/categories/category_self_con.png',
    palette: {
      bg: '#FFFDF7',
      border: '#6B3A1F',
      accent: '#E1AD01',
    },
  },
];

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
        className={`w-20 h-20 rounded-2xl flex items-center justify-center p-2.5 transition-all duration-300 shadow-[0_4px_12px_rgba(62,31,10,0.06)] overflow-hidden ${
          isActive
            ? 'ring-2 ring-[#E1AD01]/40 -translate-y-0.5'
            : 'hover:scale-105 active:scale-95'
        }`}
        style={{
          backgroundColor: category.palette.bg,
          border: `1.5px solid ${category.palette.border}`,
        }}
      >
        <img
          src={category.image}
          alt={category.label}
          className="w-full h-full object-contain select-none pointer-events-none"
          loading="eager"
        />
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

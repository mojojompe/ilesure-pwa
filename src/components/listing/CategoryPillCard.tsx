import React from "react";
import { motion } from "framer-motion";
import { Wrench01Icon } from "@hugeicons/react";

export interface CategoryItem {
  id: string;
  label: string;
  image?: string;
  icon?: typeof Wrench01Icon;
  palette: {
    bg: string;
    border: string;
    accent: string;
  };
  isComingSoon?: boolean;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: "shared",
    label: "Shared",
    image: "/images/categories/category_shared.png",
    palette: {
      bg: "#FFFDF7",
      border: "#E1AD01",
      accent: "#E1AD01",
    },
  },
  {
    id: "hostel",
    label: "Hostel",
    image: "/images/categories/category_hostel.png",
    palette: {
      bg: "#FAF1CC",
      border: "#3E1F0A",
      accent: "#3E1F0A",
    },
  },
  {
    id: "apartment",
    label: "Apartment",
    image: "/images/categories/category_apartment.png",
    palette: {
      bg: "#FFFDF7",
      border: "#3E1F0A",
      accent: "#6B3A1F",
    },
  },
  {
    id: "shortlet",
    label: "Shortlet",
    image: "/images/categories/category_shortlet.png",
    palette: {
      bg: "#FAF1CC",
      border: "#E1AD01",
      accent: "#E1AD01",
    },
  },
  {
    id: "self_con",
    label: "Self-Con",
    image: "/images/categories/category_self_con.png",
    palette: {
      bg: "#FFFDF7",
      border: "#6B3A1F",
      accent: "#E1AD01",
    },
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench01Icon,
    palette: {
      bg: "#F5F1EB",
      border: "#D8C6B6",
      accent: "#6B4F3A",
    },
    isComingSoon: true,
  },
];

export interface CategoryPillCardProps {
  category: CategoryItem;
  isActive?: boolean;
  onPress?: () => void;
  onClick?: () => void;
}

export function CategoryPillCard({
  category,
  isActive = false,
  onPress,
  onClick,
}: CategoryPillCardProps) {
  const handleAction = onPress || onClick;
  const CategoryIcon = category.icon;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={handleAction}
      className="flex flex-col items-center gap-2 outline-none group shrink-0"
    >
      <div
        className={`w-[114px] h-[96px] rounded-[22px] flex items-center justify-center p-2 transition-all duration-300 relative overflow-hidden ${
          category.isComingSoon ? "grayscale opacity-85" : ""
        } ${
          isActive
            ? "ring-2 ring-[#E1AD01]/50 -translate-y-1 shadow-[0_12px_28px_-4px_rgba(62,31,10,0.18)]"
            : "shadow-[0_10px_24px_-4px_rgba(62,31,10,0.12),0_4px_10px_-2px_rgba(62,31,10,0.06)] hover:shadow-[0_14px_30px_-4px_rgba(62,31,10,0.16)] hover:-translate-y-0.5 active:scale-95"
        }`}
        style={{
          backgroundColor: category.palette.bg,
        }}
      >
        {CategoryIcon ? (
          <CategoryIcon
            size={58}
            aria-hidden="true"
            className="text-[#6B4F3A] transition-transform duration-300 group-hover:scale-105"
          />
        ) : category.image ? (
          <img
            src={category.image}
            alt={category.label}
            className="w-[84px] h-[84px] object-contain select-none pointer-events-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src = "/images/categories/category_apartment.png";
            }}
          />
        ) : null}

        {category.isComingSoon && (
          <div className="absolute inset-0 bg-[#3E1F0A]/20 flex items-center justify-center backdrop-blur-[0.5px]">
            <span className="bg-[#3E1F0A] text-[#FAF1CC] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
              Coming Soon
            </span>
          </div>
        )}
      </div>
      <span
        className={`text-xs tracking-tight transition-colors ${
          isActive
            ? "font-black text-[#3E1F0A]"
            : "font-bold text-[#6B4F3A] group-hover:text-[#3E1F0A]"
        }`}
      >
        {category.label}
      </span>
    </motion.button>
  );
}

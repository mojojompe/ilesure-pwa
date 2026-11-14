import React from 'react';
import { 
  FlashIcon, 
  DropletIcon, 
  Wifi01Icon, 
  SecurityIcon,
  Car01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';

export type AmenityType = 'power' | 'water' | 'wifi' | 'security' | 'parking';
export type AmenityStatus = 'good' | 'partial' | 'poor' | 'unavailable';

interface AmenityIconProps {
  type: AmenityType;
  status?: AmenityStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

const AMENITY_CONFIG = {
  power: {
    label: 'Power',
    icon: FlashIcon,
    color: {
      good: 'text-[#E1AD01]', // Mustard yellow
      partial: 'text-amber-400',
      poor: 'text-rose-400',
      unavailable: 'text-white/40',
    },
    bg: 'bg-transparent',
  },
  water: {
    label: 'Water',
    icon: DropletIcon,
    color: {
      good: 'text-[#38BDF8]', // Bright Sky Blue
      partial: 'text-amber-400',
      poor: 'text-rose-400',
      unavailable: 'text-white/40',
    },
    bg: 'bg-transparent',
  },
  wifi: {
    label: 'WiFi',
    icon: Wifi01Icon,
    color: {
      good: 'text-[#A78BFA]', // Vivid Violet (not brown)
      partial: 'text-amber-400',
      poor: 'text-rose-400',
      unavailable: 'text-white/40',
    },
    bg: 'bg-transparent',
  },
  security: {
    label: 'Security',
    icon: SecurityIcon,
    color: {
      good: 'text-[#4ADE80]', // Bright Emerald
      partial: 'text-amber-400',
      poor: 'text-rose-400',
      unavailable: 'text-white/40',
    },
    bg: 'bg-transparent',
  },
  parking: {
    label: 'Parking',
    icon: Car01Icon,
    color: {
      good: 'text-[#C084FC]', // Bright Purple
      partial: 'text-purple-300',
      poor: 'text-rose-400',
      unavailable: 'text-white/40',
    },
    bg: 'bg-transparent',
  },
};

export function AmenityIcon({ type, status = 'good', size = 'medium', showLabel = false, className }: AmenityIconProps) {
  const config = AMENITY_CONFIG[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <div className={clsx('flex items-center justify-center', config.color[status])}>
        <IconComponent size={sizeClasses[size]} className="currentColor" />
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
          {config.label}
        </span>
      )}
    </div>
  );
}

interface AmenityRowProps {
  power?: AmenityStatus;
  water?: AmenityStatus;
  wifi?: AmenityStatus;
  security?: AmenityStatus;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  className?: string;
}

export function AmenityRow({
  power = 'good',
  water = 'good',
  wifi = 'good',
  security = 'good',
  size = 'medium',
  showLabels = false,
  className
}: AmenityRowProps) {
  return (
    <div className={clsx('flex flex-row items-center gap-3', className)}>
      <AmenityIcon type="power" status={power} size={size} showLabel={showLabels} />
      <AmenityIcon type="water" status={water} size={size} showLabel={showLabels} />
      <AmenityIcon type="wifi" status={wifi} size={size} showLabel={showLabels} />
      <AmenityIcon type="security" status={security} size={size} showLabel={showLabels} />
    </div>
  );
}

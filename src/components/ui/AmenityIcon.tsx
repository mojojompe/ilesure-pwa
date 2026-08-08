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
      good: 'text-accent', // #E1AD01
      partial: 'text-orange-500',
      poor: 'text-red-500',
      unavailable: 'text-gray-400',
    },
    bg: 'bg-transparent',
  },
  water: {
    label: 'Water',
    icon: DropletIcon,
    color: {
      good: 'text-[#29B6F6]', // #29B6F6
      partial: 'text-orange-500',
      poor: 'text-red-500',
      unavailable: 'text-gray-400',
    },
    bg: 'bg-transparent',
  },
  wifi: {
    label: 'WiFi',
    icon: Wifi01Icon,
    color: {
      good: 'text-primary', // #3E1F0A
      partial: 'text-orange-500',
      poor: 'text-red-500',
      unavailable: 'text-gray-400',
    },
    bg: 'bg-transparent',
  },
  security: {
    label: 'Security',
    icon: SecurityIcon,
    color: {
      good: 'text-green-500', // #4CAF50
      partial: 'text-orange-500',
      poor: 'text-red-500',
      unavailable: 'text-gray-400',
    },
    bg: 'bg-transparent',
  },
  parking: {
    label: 'Parking',
    icon: Car01Icon,
    color: {
      good: 'text-purple-500', // #9C27B0
      partial: 'text-purple-300',
      poor: 'text-red-500',
      unavailable: 'text-gray-400',
    },
    bg: 'bg-transparent',
  },
};

export function AmenityIcon({ type, status = 'good', size = 'medium', showLabel = false, className }: AmenityIconProps) {
  const config = AMENITY_CONFIG[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    small: { circle: 'w-9 h-9', icon: 16 },
    medium: { circle: 'w-11 h-11', icon: 20 },
    large: { circle: 'w-13 h-13', icon: 24 },
  };

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <div className={clsx(
        'rounded-full flex items-center justify-center bg-transparent',
        sizeClasses[size].circle,
        config.color[status]
      )}>
        <IconComponent size={sizeClasses[size].icon} className="currentColor" />
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium text-textSecondary uppercase tracking-wider">
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
    <div className={clsx('flex flex-row items-center gap-2', className)}>
      <AmenityIcon type="power" status={power} size={size} showLabel={showLabels} />
      <AmenityIcon type="water" status={water} size={size} showLabel={showLabels} />
      <AmenityIcon type="wifi" status={wifi} size={size} showLabel={showLabels} />
      <AmenityIcon type="security" status={security} size={size} showLabel={showLabels} />
    </div>
  );
}

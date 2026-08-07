import React from 'react';
import { 
  FlashIcon, 
  DropletIcon, 
  Wifi01Icon, 
  Sofa01Icon, 
  SecurityIcon 
} from '@hugeicons/react';
import { clsx } from 'clsx';

export type AmenityType = 'power' | 'water' | 'wifi' | 'furnishing' | 'security';

interface AmenityIconProps {
  type: AmenityType;
  label: string;
  className?: string;
}

export function AmenityIcon({ type, label, className }: AmenityIconProps) {
  const getIcon = () => {
    switch (type) {
      case 'power': return <FlashIcon size={20} className="text-[#F59E0B]" />;
      case 'water': return <DropletIcon size={20} className="text-[#3B82F6]" />;
      case 'wifi': return <Wifi01Icon size={20} className="text-[#8B5CF6]" />;
      case 'furnishing': return <Sofa01Icon size={20} className="text-[#10B981]" />;
      case 'security': return <SecurityIcon size={20} className="text-[#EF4444]" />;
      default: return null;
    }
  };

  return (
    <div className={clsx('flex flex-col items-center gap-1.5', className)}>
      <div className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center">
        {getIcon()}
      </div>
      <span className="text-[10px] font-medium text-textSecondary uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

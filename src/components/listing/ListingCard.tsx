import React from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Location01Icon, Image01Icon } from '@hugeicons/react';
import { AmenityIcon } from '../ui/AmenityIcon';

export interface ListingCardProps {
  id: string;
  title: string;
  price: string;
  distance: string;
  image: string;
  furnishing: string;
  power: string;
  water: string;
  onPress?: () => void;
  onInterest?: () => void;
}

export function ListingCard({
  title,
  price,
  distance,
  image,
  furnishing,
  power,
  water,
  onPress,
}: ListingCardProps) {
  return (
    <Card 
      className="p-3 mb-4 overflow-hidden" 
      onClick={onPress}
      variant="elevated"
    >
      <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-surfaceLight mb-3">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-textSecondary">
            <Image01Icon size={32} className="mb-2 opacity-50" />
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center shadow-sm">
          <Location01Icon size={14} className="text-btn-primary mr-1" />
          <span className="text-xs font-bold text-textPrimary">{distance}</span>
        </div>
      </div>

      <div className="px-1">
        <h3 className="text-lg font-bold text-textPrimary leading-tight mb-1 truncate">
          {title}
        </h3>
        <p className="text-btn-primary font-black text-xl mb-3">
          {price}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Tag label={furnishing.replace('_', ' ')} variant="outline" className="capitalize" />
        </div>

        <div className="flex items-center justify-around border-t border-borderLight pt-3">
          <AmenityIcon type="power" label={power} />
          <div className="w-px h-8 bg-borderLight" />
          <AmenityIcon type="water" label={water} />
        </div>
      </div>
    </Card>
  );
}

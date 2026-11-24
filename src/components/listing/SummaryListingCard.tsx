import React from 'react';
import { motion } from 'framer-motion';
import { Location01Icon } from '@hugeicons/react';

export interface SummaryListingCardProps {
  listing: any;
  onPress?: () => void;
  onClick?: () => void;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
];

export function SummaryListingCard({ listing, onPress, onClick }: SummaryListingCardProps) {
  const handleAction = onPress || onClick;
  const isFullyBooked = listing.status === 'fully_booked' || listing.status === 'booked';

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : PLACEHOLDER_IMAGES[parseInt(listing._id || listing.id || '0', 10) % PLACEHOLDER_IMAGES.length] ||
        PLACEHOLDER_IMAGES[0];

  return (
    <motion.div
      whileTap={!isFullyBooked ? { scale: 0.97 } : {}}
      onClick={!isFullyBooked ? handleAction : undefined}
      className={`relative w-full h-52 rounded-2xl overflow-hidden shadow-clay-sm bg-white ${
        isFullyBooked ? 'opacity-60 grayscale cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      }`}
    >
      {/* Full Background Image */}
      <img
        src={imageUrl}
        alt={listing.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Booked Overlay */}
      {isFullyBooked && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-20">
          <div className="px-3 py-1 bg-black/80 rounded-md border border-white/20 shadow-sm -rotate-6">
            <span className="text-white text-xs font-black tracking-widest uppercase">
              Booked
            </span>
          </div>
        </div>
      )}

      {/* Gradient Overlay & 2-Line Bottom Text */}
      <div className="absolute inset-x-0 bottom-0 pt-8 pb-3 px-3 bg-gradient-to-t from-[#3E1F0A] via-[#3E1F0A]/70 to-transparent flex flex-col justify-end">
        {/* Line 1: Title (Shortened with Ellipsis) */}
        <h4 className="text-white text-sm font-bold truncate leading-tight">
          {listing.title}
        </h4>

        {/* Line 2: Location with Icon */}
        <div className="flex items-center gap-1 mt-1 text-white/80">
          <Location01Icon size={12} className="shrink-0 text-[#E1AD01]" />
          <span className="text-xs truncate text-white/85">
            {listing.areaCluster || listing.city || 'Nigeria'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

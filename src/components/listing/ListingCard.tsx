import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FavouriteIcon, 
  Location01Icon, 
  UserCircleIcon,
  Alert01Icon,
  FireIcon,
  GraduateMaleIcon
} from '@hugeicons/react';
import { Tag } from '../ui/Tag';
import { AmenityRow } from '../ui/AmenityIcon';
import { labelFor } from '../../constants/listingVocabulary';

export interface ListingCardProps {
  listing: any;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isInterested?: boolean;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
];

/**
 * Renders the metres reported by a proximity search as a short distance.
 * Only present when the feed was queried around a point or a landmark.
 */
function formatDistance(metres?: number): string | null {
  if (typeof metres !== 'number' || !Number.isFinite(metres)) return null;
  if (metres < 950) return `${Math.round(metres / 50) * 50}m away`;
  return `${(metres / 1000).toFixed(1)}km away`;
}

export function ListingCard({
  listing,
  onPress,
  onSave,
  isSaved = false,
  isInterested = false,
}: ListingCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.();
  };

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : PLACEHOLDER_IMAGES[parseInt(listing._id || listing.id || '0', 10) % PLACEHOLDER_IMAGES.length] ||
        PLACEHOLDER_IMAGES[0];

  const isShortlet = listing.propertyType?.toLowerCase() === 'shortlet';

  const formattedPrice = isShortlet
    ? (() => {
        const p = listing.shortletPricing;
        const parts = [];
        if (p?.hourly) parts.push(`₦${p.hourly.toLocaleString()}/hr`);
        if (p?.daily) parts.push(`₦${p.daily.toLocaleString()}/day`);
        if (p?.weekly) parts.push(`₦${p.weekly.toLocaleString()}/wk`);
        if (p?.monthly) parts.push(`₦${p.monthly.toLocaleString()}/mo`);
        return parts.join(' · ');
      })()
    : listing.rentAnnual ? `₦${listing.rentAnnual.toLocaleString()}` : '₦0';

  const powerStatus =
    listing.power === 'constant' ? 'good'
      : listing.power === 'solar_backed' || listing.power === 'hybrid' ? 'partial'
      : 'poor';
  const waterStatus = listing.water === 'borehole' ? 'good' : 'partial';
  const isFullyBooked = listing.status === 'fully_booked';

  const displayRules = listing.rules?.length
    ? listing.rules
    : [
        ...(listing.petsAllowed ? ['pets_allowed'] : []),
        ...(listing.smokingAllowed ? ['smoking_allowed'] : []),
        ...(listing.studentsOnly ? ['students_only'] : []),
      ];
  const hasRules = displayRules.length > 0;

  const agentName = listing.companyId?.name || listing.agentId?.fullName || listing.landlordId?.fullName || listing.agentName || listing.companyName;

  return (
    <motion.div
      whileTap={!isFullyBooked ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={!isFullyBooked ? onPress : undefined}
      className={`mx-4 mb-4 relative rounded-3xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white cursor-pointer ${
        isFullyBooked ? 'opacity-60' : ''
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative w-full h-[380px]">
        {/* Main Image */}
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover"
        />

        {/* Fully Booked Overlay */}
        {isFullyBooked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="px-4 py-2 bg-black/70 rounded-md -rotate-12">
              <span className="text-white text-lg font-extrabold tracking-widest uppercase">
                Fully Booked
              </span>
            </div>
          </div>
        )}

        {/* Tag Stack (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-2 z-10">
          <div className="flex flex-row flex-wrap gap-2">
            {listing.propertyType && (
              <Tag label={listing.propertyType} variant="mustard" className="shadow-md" />
            )}
            {listing.needsRoommate && (
              <Tag label="Needs Roommate" variant="brown" className="shadow-md" />
            )}
          </div>
          {listing.genderRestriction && listing.genderRestriction !== 'any' && (
            <Tag
              label={listing.genderRestriction === 'female_only' ? 'Female Only' : listing.genderRestriction === 'male_only' ? 'Male Only' : 'Mixed'}
              variant="outline"
              className="bg-white/80 backdrop-blur-md !border-white text-primary font-bold shadow-sm"
            />
          )}
        </div>

        {/* Floating Save Button (Top Right) */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90"
        >
          <FavouriteIcon 
            size={20} 
            className={saved ? "text-red-500" : "text-white"} 
            variant={saved ? "solid" : "stroke"} 
          />
        </button>

        {/* Bottom Body (Gradient + Blur Overlay) */}
        <div className="absolute bottom-0 left-0 right-0 pt-8 pb-4 px-4 bg-gradient-to-t from-[#3E1F0A] via-[#3E1F0A]/70 to-transparent">
          <div className="absolute inset-0 backdrop-blur-[4px] -z-10 [mask-image:linear-gradient(to_top,black_60%,transparent_100%)]" />

          {/* Title and Price */}
          {isShortlet ? (
            <div className="mb-2">
              <h3 className="text-white text-lg font-bold truncate mr-2">{listing.title}</h3>
              <p className="text-white text-base font-bold mt-1 leading-5">{formattedPrice}</p>
            </div>
          ) : (
            <div className="flex flex-row justify-between items-start mb-2">
              <h3 className="text-white text-lg font-bold truncate flex-1 mr-2">{listing.title}</h3>
              <div className="flex items-baseline">
                <span className="text-white text-xl font-extrabold">{formattedPrice}</span>
                <span className="text-white/80 text-sm font-medium">/yr</span>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex flex-row items-center gap-1.5 mb-1.5">
            <Location01Icon size={14} className="text-white/80" />
            <span className="text-white/85 text-sm truncate flex-1">
              {listing.areaCluster}
            </span>
            {formatDistance((listing as any).distanceMeters) ? (
              <span className="text-accent text-xs font-semibold">· {formatDistance((listing as any).distanceMeters)}</span>
            ) : listing.distanceBucket ? (
              <span className="text-accent text-xs font-semibold">· {labelFor(listing.distanceBucket)}</span>
            ) : null}
          </div>

          {/* Agent/Company */}
          {agentName && (
            <div className="flex flex-row items-center gap-1.5 mb-2">
              <UserCircleIcon size={14} className="text-white/70" />
              <span className="text-white/70 text-sm truncate flex-1">{agentName}</span>
            </div>
          )}

          {/* Rules */}
          {hasRules && (
            <div className="flex flex-row flex-wrap gap-2 mb-2 mt-2">
              {displayRules.includes('pets_allowed') && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15">
                  <Alert01Icon size={12} className="text-accent" />
                  <span className="text-white text-xs font-semibold">Pets</span>
                </div>
              )}
              {displayRules.includes('smoking_allowed') && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15">
                  <FireIcon size={12} className="text-accent" />
                  <span className="text-white text-xs font-semibold">Smoking</span>
                </div>
              )}
              {displayRules.includes('students_only') && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15">
                  <GraduateMaleIcon size={12} className="text-accent" />
                  <span className="text-white text-xs font-semibold">Students</span>
                </div>
              )}
            </div>
          )}

          {/* Amenities Row */}
          <div className="mt-2 opacity-90">
            <AmenityRow
              power={powerStatus}
              water={waterStatus}
              wifi={isInterested ? 'good' : 'partial'}
              security="good"
              size="small"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

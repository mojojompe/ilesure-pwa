import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Add01Icon, Remove01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface ShortletRate {
  id: string;
  label: string;
  durationValue: number;
  durationUnit: 'hour' | 'day' | 'week' | 'month';
  price: number;
}

interface BookAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { requiresRoommate: boolean; rateId?: string; rateQuantity?: number }) => void;
  listing: {
    title: string;
    rentAnnual: number;
    cautionFee?: number;
    agencyFee?: number;
    needsRoommate?: boolean;
    shareable?: boolean;
    propertyType?: string;
    shortletRates?: ShortletRate[];
    shortletPricing?: {
      hourly?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
}

const formatDuration = (rate: ShortletRate) =>
  `${rate.durationValue} ${rate.durationValue === 1 ? rate.durationUnit : `${rate.durationUnit}s`}`;

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  listing,
}) => {
  const [includeRoommate, setIncludeRoommate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rateQuantity, setRateQuantity] = useState(1);
  const [selectedRateId, setSelectedRateId] = useState<string>('');

  const isShortlet = listing?.propertyType?.toLowerCase() === 'shortlet';

  // Build the tier list from shortletRates, falling back to legacy shortletPricing.
  const shortletTiers = useMemo<ShortletRate[]>(() => {
    if (listing?.shortletRates && listing.shortletRates.length > 0) {
      return listing.shortletRates;
    }
    const pricing = listing?.shortletPricing || {};
    const legacy: ShortletRate[] = [];
    if (pricing.hourly) legacy.push({ id: 'legacy-hour', label: 'Hourly', durationValue: 1, durationUnit: 'hour', price: pricing.hourly });
    if (pricing.daily) legacy.push({ id: 'legacy-day', label: 'Daily', durationValue: 1, durationUnit: 'day', price: pricing.daily });
    if (pricing.weekly) legacy.push({ id: 'legacy-week', label: 'Weekly', durationValue: 1, durationUnit: 'week', price: pricing.weekly });
    if (pricing.monthly) legacy.push({ id: 'legacy-month', label: 'Monthly', durationValue: 1, durationUnit: 'month', price: pricing.monthly });
    return legacy;
  }, [listing?.shortletRates, listing?.shortletPricing]);

  // Ensure a valid tier is always selected once tiers are available.
  useEffect(() => {
    if (isShortlet && shortletTiers.length > 0 && !shortletTiers.some(t => t.id === selectedRateId)) {
      setSelectedRateId(shortletTiers[0].id);
    }
  }, [isShortlet, shortletTiers, selectedRateId]);

  const selectedTier = shortletTiers.find(t => t.id === selectedRateId) || null;

  const rentAmount = isShortlet
    ? (selectedTier ? selectedTier.price * rateQuantity : 0)
    : (listing?.rentAnnual || 0);
  const cautionFee = listing?.cautionFee || 0;
  const agencyFee = listing?.agencyFee || 0;
  
  const subTotal = rentAmount + cautionFee + agencyFee;
  const platformFee = subTotal > 0 ? Math.round(subTotal * 0.05) : 0;
  const roommateMatchingFee = subTotal > 0 ? Math.round(subTotal * 0.01) : 0;
  
  const totalWithoutRoommate = subTotal + platformFee;
  
  const isShareable = listing?.shareable === true || listing?.needsRoommate === true || listing?.propertyType === 'shared_apartment';
  
  const totalWithRoommate = (isShareable && includeRoommate)
    ? Math.round((subTotal + platformFee + roommateMatchingFee) / 2)
    : totalWithoutRoommate;

  const handleConfirm = () => {
    if (isShortlet) {
      onConfirm({ requiresRoommate: isShareable && includeRoommate, rateId: selectedTier?.id, rateQuantity });
    } else {
      onConfirm({ requiresRoommate: isShareable && includeRoommate });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-background rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Drag Handle (visual only) */}
            <div className="w-12 h-1.5 bg-borderLight rounded-full mx-auto my-3 sm:hidden" />
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-borderLight shrink-0">
              <h2 className="text-xl font-bold text-textPrimary">Book Appointment</h2>
              <button onClick={onClose} className="p-1 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
                <Cancel01Icon size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                <h3 className="text-lg font-bold text-textPrimary mb-1">{listing?.title}</h3>
                <p className="text-sm text-textSecondary">Ibadan, Nigeria</p>
              </div>

              {isShortlet && (
                <>
                  <h4 className="text-base font-semibold text-textPrimary mb-3">Booking Rate</h4>
                  <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                    {shortletTiers.length > 0 ? (
                      <>
                        <div className="flex flex-col gap-2">
                          {shortletTiers.map(tier => (
                            <button
                              key={tier.id}
                              onClick={() => setSelectedRateId(tier.id)}
                              className={`flex items-center justify-between py-3 px-4 rounded-lg border text-left transition-colors ${
                                selectedRateId === tier.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-borderLight bg-transparent hover:bg-surfaceLight'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-textPrimary">{tier.label}</span>
                                <span className="text-xs text-textSecondary">{formatDuration(tier)}</span>
                              </div>
                              <span className="text-sm font-bold text-primary">₦{tier.price.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm font-medium text-textPrimary">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRateQuantity(Math.max(1, rateQuantity - 1))}
                              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
                            >
                              <Remove01Icon size={20} className={rateQuantity === 1 ? 'text-textTertiary' : 'text-primary'} />
                            </button>
                            <span className="text-xl font-bold text-textPrimary min-w-[30px] text-center">
                              {rateQuantity}
                            </span>
                            <button
                              onClick={() => setRateQuantity(rateQuantity + 1)}
                              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
                            >
                              <Add01Icon size={18} />
                            </button>
                          </div>
                        </div>

                        {selectedTier && (
                          <p className="text-xs text-textSecondary mt-3 text-center font-medium">
                            ₦{selectedTier.price.toLocaleString()} × {rateQuantity} = ₦{rentAmount.toLocaleString()}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-textSecondary text-center">No pricing available for this shortlet.</p>
                    )}
                  </div>
                </>
              )}

              <h4 className="text-base font-semibold text-textPrimary mb-3">Payment Summary</h4>
              <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-textSecondary">{isShortlet ? 'Booking Cost' : 'Annual Rent'}</span>
                  <span className="text-sm font-semibold text-textPrimary">₦{rentAmount.toLocaleString()}</span>
                </div>
                {cautionFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Caution Fee</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{cautionFee.toLocaleString()}</span>
                  </div>
                )}
                {agencyFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Agency Fee</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{agencyFee.toLocaleString()}</span>
                  </div>
                )}
                {subTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Platform Fee (5%)</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{platformFee.toLocaleString()}</span>
                  </div>
                )}
                {isShareable && includeRoommate && subTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Matching Fee (1%)</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{roommateMatchingFee.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="h-px bg-borderLight my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-textPrimary">
                    Total to Pay {isShareable && includeRoommate ? '(Split 50%)' : ''}
                  </span>
                  <span className="text-lg font-black text-primary">
                    ₦{(isShareable && includeRoommate ? totalWithRoommate : totalWithoutRoommate).toLocaleString()}
                  </span>
                </div>
              </div>

              {isShareable && (
                <>
                  <h4 className="text-base font-semibold text-textPrimary mb-3">Additional Options</h4>
                  <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-textPrimary">Share with roommate</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={includeRoommate}
                          onChange={(e) => setIncludeRoommate(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-borderLight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    {includeRoommate && (
                      <p className="text-xs text-textSecondary mt-2 italic">
                        You'll be matched with a compatible roommate to split costs
                      </p>
                    )}
                  </div>
                </>
              )}

              <button 
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-center gap-3 mb-2 w-full text-left"
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${agreeTerms ? 'bg-primary border-primary' : 'bg-transparent border-borderLight'}`}>
                  {agreeTerms && <CheckmarkCircle02Icon size={14} className="text-white" variant="solid" />}
                </div>
                <span className="text-xs text-textSecondary flex-1">
                  I agree to the booking terms and cancellation policy
                </span>
              </button>
            </div>

            <AnimatePresence>
              {agreeTerms && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 pb-safe border-t border-borderLight shrink-0 bg-background rounded-b-[24px]"
                >
                  <Button
                    fullWidth
                    disabled={isShortlet && (shortletTiers.length === 0 || !selectedTier)}
                    onClick={handleConfirm}
                  >
                    {isShortlet && shortletTiers.length === 0 ? 'No pricing available' : 'Confirm Booking'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

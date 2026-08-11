import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Add01Icon, Remove01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface BookAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { requiresRoommate: boolean; durationQuantity?: number; durationUnit?: 'hour' | 'day' | 'week' | 'month' }) => void;
  listing: {
    title: string;
    rentAnnual: number;
    cautionFee?: number;
    agencyFee?: number;
    needsRoommate?: boolean;
    shareable?: boolean;
    propertyType?: string;
    shortletPricing?: {
      hourly?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
}

const DURATION_UNITS = [
  { value: 'hour', label: 'Hours' },
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
] as const;

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  listing,
}) => {
  const [includeRoommate, setIncludeRoommate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [durationQty, setDurationQty] = useState(1);
  const [durationUnit, setDurationUnit] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const isShortlet = listing?.propertyType?.toLowerCase() === 'shortlet';
  const pricing = listing?.shortletPricing || {};

  const rateMap: Record<string, number> = {
    hour: pricing.hourly || 0,
    day: pricing.daily || 0,
    week: pricing.weekly || 0,
    month: pricing.monthly || 0,
  };
  const unitRate = rateMap[durationUnit] || 0;

  const rentAmount = isShortlet ? unitRate * durationQty : (listing?.rentAnnual || 0);
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
      onConfirm({ requiresRoommate: isShareable && includeRoommate, durationQuantity: durationQty, durationUnit });
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
                  <h4 className="text-base font-semibold text-textPrimary mb-3">Booking Duration</h4>
                  <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                    <div className="flex flex-row items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setDurationQty(Math.max(1, durationQty - 1))}
                          className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
                        >
                          <Remove01Icon size={20} className={durationQty === 1 ? 'text-textTertiary' : 'text-primary'} />
                        </button>
                        <span className="text-xl font-bold text-textPrimary min-w-[30px] text-center">
                          {durationQty}
                        </span>
                        <button 
                          onClick={() => setDurationQty(durationQty + 1)}
                          className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
                        >
                          <Add01Icon size={18} />
                        </button>
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-1">
                        {DURATION_UNITS.map(u => (
                          <button
                            key={u.value}
                            onClick={() => setDurationUnit(u.value)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-colors ${
                              durationUnit === u.value 
                                ? 'bg-primary text-white' 
                                : 'bg-transparent text-textSecondary hover:bg-surfaceLight'
                            }`}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {unitRate > 0 && (
                      <p className="text-xs text-textSecondary mt-3 text-center font-medium">
                        ₦{unitRate.toLocaleString()} / {durationUnit}
                      </p>
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
                    disabled={isShortlet && unitRate === 0}
                    onClick={handleConfirm}
                  >
                    {isShortlet && unitRate === 0 ? 'No pricing available' : 'Confirm Booking'}
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

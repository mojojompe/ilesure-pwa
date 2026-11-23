import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cancel01Icon, Add01Icon, Remove01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { calculatePlatformFee, calculateRoommateMatchingFee, platformFeeLabel, resolvePlatformFeePercent } from '../../constants/fees';
import { bookingService, BookingSummaryResponse } from '../../api/bookingService';
import { computeStayEnd, formatStayDate, formatStayLength, localDateString, stayUnitsToHours, type ShortletUnit } from '../../utils/shortlet';

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
  onConfirm: (data: { requiresRoommate: boolean; rateId?: string; rateQuantity?: number; userDetails?: any; moveInDate?: string }) => void | Promise<void>;
  listing: {
    _id?: string;
    title: string;
    rentAnnual: number;
    cautionFee?: number;
    agencyFee?: number;
    serviceCharge?: number;
    inspectionFee?: number;
    needsRoommate?: boolean;
    shareable?: boolean;
    propertyType?: string;
    areaCluster?: string;
    city?: string;
    address?: string;
    shortletRates?: ShortletRate[];
    minStay?: number;
    minStayUnit?: ShortletUnit;
    maxStay?: number;
    maxStayUnit?: ShortletUnit;
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
  const { user } = useAuthStore();
  const [includeRoommate, setIncludeRoommate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rateQuantity, setRateQuantity] = useState(1);
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  // Dates in the device's own time zone: toISOString() is UTC, which is a day behind in the
  // first hour of a Lagos morning.
  const [moveInDate, setMoveInDate] = useState<string>(() => localDateString(1));

  // SECURITY-FIX (M-M4 parity with mobile): a double tap on "Confirm Booking" fired
  // onConfirm twice and created two booking requests. The ref closes the gap between
  // the first tap and React re-rendering the disabled button.
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const isShortlet = listing?.propertyType?.toLowerCase() === 'shortlet';

  // Build the tier list from shortletRates, falling back to legacy shortletPricing.
  const shortletTiers = useMemo<ShortletRate[]>(() => {
    if (listing?.shortletRates && listing.shortletRates.length > 0) {
      // A zero price means "not offered", not "free": the server refuses to charge it.
      return listing.shortletRates.filter((r) => Number(r.price) > 0);
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

  // The stay the guest is choosing: when it ends, and whether it fits the place's min/max stay
  // (checked by the server too; shown here so the guest finds out before booking).
  const stayHours = selectedTier ? stayUnitsToHours(selectedTier.durationValue * rateQuantity, selectedTier.durationUnit) : 0;
  const minStay = Number(listing?.minStay) > 0 && listing?.minStayUnit ? { value: Number(listing.minStay), unit: listing.minStayUnit } : null;
  const maxStay = Number(listing?.maxStay) > 0 && listing?.maxStayUnit ? { value: Number(listing.maxStay), unit: listing.maxStayUnit } : null;
  const belowMin = Boolean(selectedTier && minStay && stayHours < stayUnitsToHours(minStay.value, minStay.unit));
  const aboveMax = Boolean(selectedTier && maxStay && stayHours > stayUnitsToHours(maxStay.value, maxStay.unit));
  const MAX_QUANTITY = 365; // the server's cap
  const nextQuantityTooLong = Boolean(selectedTier && maxStay &&
    stayUnitsToHours(selectedTier.durationValue * (rateQuantity + 1), selectedTier.durationUnit) > stayUnitsToHours(maxStay.value, maxStay.unit));
  const canAddQuantity = rateQuantity < MAX_QUANTITY && !nextQuantityTooLong;
  const stayProblem = belowMin
    ? `This place has a minimum stay of ${formatStayLength(minStay!.value, minStay!.unit)}.`
    : aboveMax
      ? `This place has a maximum stay of ${formatStayLength(maxStay!.value, maxStay!.unit)}.`
      : null;
  const checkIn = moveInDate ? new Date(`${moveInDate}T00:00:00`) : null;
  const checkOut = checkIn && selectedTier ? computeStayEnd(checkIn, selectedTier, rateQuantity) : null;

  const rentAmount = isShortlet
    ? (selectedTier ? selectedTier.price * rateQuantity : 0)
    : (listing?.rentAnnual || 0);
  // Shortlets are charged on the tier price alone, the server excludes
  // caution/agency for them, so including here would over-quote the total.
  const cautionFee = isShortlet ? 0 : (listing?.cautionFee || 0);
  const agencyFee = isShortlet ? 0 : (listing?.agencyFee || 0);
  const serviceCharge = isShortlet ? 0 : (Number(listing?.serviceCharge) || 0);
  
  // A shortlet stay is never split with a roommate (the server refuses it).
  const isShareable = !isShortlet && (listing?.shareable === true || listing?.needsRoommate === true || listing?.propertyType === 'shared_apartment');
  const wantsRoommate = isShareable && includeRoommate;

  // The server is the authority on what is charged: quote the fees from
  // POST /bookings/summary (no DB write). The local constants below are only the
  // estimate shown while the quote loads, or if it fails (offline / signed out).
  const listingId = listing?._id;
  const quoteKey = [listingId, isShortlet ? selectedTier?.id : '', isShortlet ? rateQuantity : '', wantsRoommate].join('|');
  const [quote, setQuote] = useState<{ key: string; data: BookingSummaryResponse['data'] } | null>(null);
  useEffect(() => {
    if (!visible || !listingId || (isShortlet && !selectedTier)) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      bookingService
        .getBookingSummary({
          listingId,
          requiresRoommate: wantsRoommate,
          ...(isShortlet && selectedTier
            ? { rateId: selectedTier.id, rateQuantity, durationUnit: selectedTier.durationUnit }
            : {}),
        })
        .then((res) => {
          if (!cancelled && res?.success && res.data) setQuote({ key: quoteKey, data: res.data });
        })
        .catch(() => { /* keep the local estimate */ });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [visible, quoteKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const serverQuote = quote && quote.key === quoteKey ? quote.data : null;

  const localSubTotal = rentAmount + cautionFee + agencyFee + serviceCharge;
  const localPlatformFee = calculatePlatformFee(localSubTotal);
  const localMatchingFee = calculateRoommateMatchingFee(localSubTotal);
  const localTotal = wantsRoommate
    ? Math.round((localSubTotal + localPlatformFee + localMatchingFee) / 2)
    : localSubTotal + localPlatformFee;

  const shownRent = serverQuote ? serverQuote.rentAmount : rentAmount;
  const shownCaution = serverQuote ? serverQuote.cautionFee : cautionFee;
  const shownAgency = serverQuote ? serverQuote.agencyFee : agencyFee;
  const shownServiceCharge = serverQuote ? (serverQuote.serviceCharge ?? 0) : serviceCharge;
  const subTotal = shownRent + shownCaution + shownAgency + shownServiceCharge;
  // Paid on its own before the viewing, so it is listed but never added to the total.
  const localInspection = isShortlet ? 0 : (Number(listing?.inspectionFee) || 0);
  const shownInspection = serverQuote ? (serverQuote.inspectionFee?.total ?? 0) : localInspection;
  const platformFee = serverQuote ? serverQuote.platformFee : localPlatformFee;
  const roommateMatchingFee = serverQuote ? serverQuote.roommateMatchingFee : localMatchingFee;
  const totalToPay = serverQuote ? serverQuote.total : localTotal;
  const feeLabel = platformFeeLabel(resolvePlatformFeePercent(serverQuote));

  // Reset the guard whenever the modal is (re)opened.
  useEffect(() => {
    if (visible) { submittingRef.current = false; setSubmitting(false); }
  }, [visible]);

  const handleConfirm = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    const userDetails = {
      occupation: (user as any)?.occupation,
      employer: (user as any)?.employer,
      school: (user as any)?.university || (user as any)?.selectedSchool,
      location: (user as any)?.location
    };
    try {
      if (isShortlet) {
        await onConfirm({ requiresRoommate: wantsRoommate, rateId: selectedTier?.id, rateQuantity, userDetails, moveInDate });
      } else {
        await onConfirm({ requiresRoommate: wantsRoommate, userDetails, moveInDate });
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const dynamicLocation = [listing?.areaCluster, listing?.city].filter(Boolean).join(', ') || listing?.address || 'Nigeria';

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
              <button
                /* A11Y-FIX (QA-A11Y-002): icon-only button, announced as just "button". */
                aria-label="Close" onClick={onClose} className="p-1 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
                <Cancel01Icon size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                <h3 className="text-lg font-bold text-textPrimary mb-1">{listing?.title}</h3>
                <p className="text-sm text-textSecondary">{dynamicLocation}</p>
              </div>

              <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm">
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  {isShortlet ? 'Check-in Date' : 'Target Move-in Date'}
                </label>
                <input
                  type="date"
                  min={localDateString(0)}
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-background border border-borderLight rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                />
                {isShortlet && checkOut && (
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-borderLight">
                    <span className="text-sm text-textSecondary">Check-out</span>
                    <span className="text-sm font-semibold text-textPrimary">
                      {formatStayDate(checkOut, selectedTier?.durationUnit === 'hour')}
                    </span>
                  </div>
                )}
              </div>

              <h4 className="text-base font-semibold text-textPrimary mb-3">Your Details</h4>
              <div className="bg-surface p-4 rounded-xl mb-5 border border-borderLight shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-textSecondary">Name</span>
                  <span className="text-sm font-semibold text-textPrimary">{user?.fullName}</span>
                </div>
                {user?.role === 'student' && ((user as any)?.university || (user as any)?.selectedSchool) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">School</span>
                    <span className="text-sm font-semibold text-textPrimary">{(user as any)?.university || (user as any)?.selectedSchool}</span>
                  </div>
                )}
                {user?.role === 'individual' && (
                  <>
                    {(user as any)?.occupation && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-textSecondary">Occupation</span>
                        <span className="text-sm font-semibold text-textPrimary">{(user as any)?.occupation}</span>
                      </div>
                    )}
                    {(user as any)?.employer && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-textSecondary">Employer</span>
                        <span className="text-sm font-semibold text-textPrimary">{(user as any)?.employer}</span>
                      </div>
                    )}
                  </>
                )}
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
                              className={`flex items-center justify-between py-3 px-4 rounded-lg border text-left transition-colors ${selectedRateId === tier.id
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
                              aria-label="More"
                              disabled={!canAddQuantity}
                              onClick={() => canAddQuantity && setRateQuantity(rateQuantity + 1)}
                              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform disabled:opacity-40"
                            >
                              <Add01Icon size={18} />
                            </button>
                          </div>
                        </div>

                        {selectedTier && (
                          <p className="text-xs text-textSecondary mt-3 text-center font-medium">
                            ₦{selectedTier.price.toLocaleString()} × {rateQuantity} = ₦{shownRent.toLocaleString()}
                          </p>
                        )}
                        {(minStay || maxStay) && (
                          <p className="text-xs text-textTertiary mt-2 text-center">
                            {[minStay && `Minimum stay ${formatStayLength(minStay.value, minStay.unit)}`, maxStay && `Maximum stay ${formatStayLength(maxStay.value, maxStay.unit)}`].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {stayProblem && (
                          <p className="text-xs text-red-600 mt-2 text-center font-medium" role="alert">{stayProblem}</p>
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
                  <span className="text-sm font-semibold text-textPrimary">₦{shownRent.toLocaleString()}</span>
                </div>
                {shownCaution > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Caution Fee</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{shownCaution.toLocaleString()}</span>
                  </div>
                )}
                {shownAgency > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Agency Fee</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{shownAgency.toLocaleString()}</span>
                  </div>
                )}
                {shownServiceCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Service Charge</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{shownServiceCharge.toLocaleString()}</span>
                  </div>
                )}
                {subTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">{feeLabel}</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{platformFee.toLocaleString()}</span>
                  </div>
                )}
                {wantsRoommate && roommateMatchingFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-textSecondary">Matching Fee (1%)</span>
                    <span className="text-sm font-semibold text-textPrimary">₦{roommateMatchingFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-borderLight my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-textPrimary">
                    Total to Pay {wantsRoommate ? '(Split 50%)' : ''}
                  </span>
                  <span className="text-lg font-black text-primary">
                    ₦{totalToPay.toLocaleString()}
                  </span>
                </div>

                {shownInspection > 0 && (
                  <div className="flex justify-between items-start gap-3 pt-3 mt-1 border-t border-borderLight">
                    <span className="text-sm text-textSecondary">
                      Inspection Fee
                      <span className="block text-xs text-textTertiary">Paid separately before the inspection</span>
                    </span>
                    <span className="text-sm font-semibold text-textPrimary whitespace-nowrap">₦{shownInspection.toLocaleString()}</span>
                  </div>
                )}
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

              <div className="flex items-center gap-3 mb-2 w-full text-left">
                <button
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${agreeTerms ? 'bg-primary border-primary' : 'bg-transparent border-borderLight'}`}
                >
                  {agreeTerms && <CheckmarkCircle02Icon size={14} className="text-white" variant="solid" />}
                </button>
                <span className="text-xs text-textSecondary flex-1">
                  I agree to the <Link to="/terms" className="text-accent underline">booking terms and cancellation policy</Link>
                </span>
              </div>
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
                    disabled={submitting || (isShortlet && (shortletTiers.length === 0 || !selectedTier || Boolean(stayProblem)))}
                    loading={submitting}
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

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { 
  Building03Icon, 
  Location01Icon, 
  Share01Icon, 
  FavouriteIcon,
  CheckmarkBadge01Icon,
  Sofa01Icon,
  FlashIcon,
  DropletIcon,
  ArrowLeft01Icon,
  StarIcon,
  Camera01Icon,
  Alert02Icon,
  BubbleChatIcon,
  InformationCircleIcon,
  HelpCircleIcon
} from '@hugeicons/react';
import { motion } from 'framer-motion';
import { listingService, Listing } from '../../api/listingService';
import { bookingService } from '../../api/bookingService';
import { paymentService } from '../../api/paymentService';
import { chatService } from '../../api/chatService';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';
import { BookAppointmentModal } from '../../components/common/BookAppointmentModal';
import { PrePaymentModal } from '../../components/common/PrePaymentModal';
import { InspectionBookingModal } from '../../components/common/InspectionBookingModal';
import { AgentReportModal } from '../../components/common/AgentReportModal';
import { BookingTimelineModal } from '../../components/common/BookingTimelineModal';
import { customAlert } from '../../stores/alertStore';
import { labelFor } from '../../constants/listingVocabulary';

type TabId = 'overview' | 'amenities' | 'location' | 'details' | 'inquiries';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'details', label: 'Details' },
  { id: 'inquiries', label: 'Inquiries' },
];

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPrePaymentModal, setShowPrePaymentModal] = useState(false);
  const [showInspectionBooking, setShowInspectionBooking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const [listingData, savedData] = await Promise.all([
          listingService.getListingById(id),
          listingService.getSavedListings().catch(() => ({ data: { listings: [] } }))
        ]);
        
        setListing(listingData);

        const isListingSaved = savedData.data?.listings?.some((s: any) =>
          s._id === id || s.id === id
        );
        setIsSaved(!!isListingSaved);

        // Fetch Inquiries
        try {
          const inqRes = await listingService.getInquiries(id);
          setInquiries(inqRes.data?.inquiries || []);
        } catch(e) {}

        // Fetch bookings if user is logged in
        if (user) {
          const bookingsData = await bookingService.getMyBookings().catch(() => ({ data: { bookings: [] } }));
          const bookings = bookingsData?.data?.bookings || [];
          const match = bookings.find((b: any) => {
            const bid = b.listingId?._id ?? b.listingId;
            return bid === id || bid?.toString() === id;
          });
          setExistingBooking(match ?? null);
        }

      } catch (error) {
        console.error('Failed to fetch listing data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleSave = async () => {
    if (!id || !listing) return;
    try {
      if (isSaved) {
        await listingService.unsaveListing(id);
        setIsSaved(false);
      } else {
        await listingService.saveListing(id);
        setIsSaved(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChat = async () => {
    if (!listing) return;
    try {
      const participantId = 
        listing.agentId?._id || listing.agentId?.id || 
        listing.landlordId?._id || listing.landlordId?.id ||
        (listing.agent as any)?._id || (listing.agent as any)?.id ||
        listing.companyId?._id || listing.companyId?.id;
      
      if (participantId) {
        const res = await chatService.startChat(participantId, listing._id, 'Hi, I\'m interested in this property. Can we chat?');
        if (res.success && res.data) {
          navigate('/chats');
        }
      } else {
        customAlert('Agent information is not available.', 'Error', 'error');
      }
    } catch (err) {
      console.error(err);
      customAlert('Failed to start chat', 'Error', 'error');
    }
  };

  const handleBook = async (data: any) => {
    if (!listing) return;
    if (!user?.ninVerified) {
      navigate('/booking/kyc/temp');
      return;
    }
    
    try {
      const isShortlet = listing.propertyType?.toLowerCase() === 'shortlet';
      const rateQuantity = data.rateQuantity || 1;
      const selectedRate = listing.shortletRates?.find((r) => r.id === data.rateId);
      const duration = isShortlet
        ? (selectedRate ? `${rateQuantity} x ${selectedRate.label}` : `${rateQuantity} booking period${rateQuantity > 1 ? 's' : ''}`)
        : '1 year';
      const result = await bookingService.createBooking({
        listingId: listing._id,
        moveInDate: new Date().toISOString(),
        duration,
        message: 'Booking request from app',
        requiresRoommate: data.requiresRoommate,
        ...(isShortlet ? { rateId: data.rateId, rateQuantity } : {}),
      });
      setShowBookModal(false);
      setExistingBooking(result.data);
      await customAlert('Booking request created! Schedule your physical inspection.', 'Success', 'success');
      setShowInspectionBooking(true);
    } catch (err) {
      console.error(err);
      customAlert('Failed to create booking', 'Error', 'error');
    }
  };

  const handleScheduleInspection = async (data: any) => {
    if (!existingBooking?._id) return;
    try {
      const res = await bookingService.scheduleInspection(existingBooking._id, {
        inspectionDate: data.date,
        inspectionTime: data.time,
        inspectorName: data.name
      });
      if (res.success) {
        setExistingBooking(res.data);
        setShowInspectionBooking(false);
        customAlert('Inspection scheduled successfully.', 'Success', 'success');
      }
    } catch (err) {
      console.error(err);
      customAlert('Failed to schedule inspection', 'Error', 'error');
    }
  };

  const handlePayment = async () => {
    if (!existingBooking?._id) return;
    try {
      setPaymentLoading(true);
      const result = await bookingService.payForBooking(existingBooking._id);
      if (result.data?.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
      }
    } catch (err) {
      console.error(err);
      customAlert('Failed to initiate payment', 'Error', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getBookingCTA = () => {
    if (!existingBooking) {
      return { title: 'Book Appointment', action: () => setShowBookModal(true) };
    }
    switch (existingBooking.status) {
      case 'pending':
        return { title: 'Schedule Inspection', action: () => setShowInspectionBooking(true) };
      case 'confirmed':
        return { title: 'Make Payment', action: () => setShowPrePaymentModal(true) };
      case 'cancelled':
      case 'rejected':
        return { title: 'Book Again', action: () => setShowBookModal(true) };
      default:
        return { title: 'View Timeline', action: () => setShowTimelineModal(true) };
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentImageIndex(index);
  };

  if (loading || !listing) {
    return (
      <AppShell hideTabBar>
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
          <Skeleton height={300} className="w-full" />
          <div className="p-4 w-full">
            <Skeleton height={24} className="w-3/4 mb-4" />
            <Skeleton height={16} className="w-1/2" />
          </div>
        </div>
      </AppShell>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : ['https://via.placeholder.com/800x400'];
  const agentName = listing.companyId?.name || listing.agentId?.fullName || listing.landlordId?.fullName || listing.agentName || listing.companyName || (listing.agent as any)?.fullName || 'Property Manager';
  const agentAvatar = listing.companyId?.logo || listing.agentId?.avatar || listing.landlordId?.avatar || listing.agent?.avatar;
  const cta = getBookingCTA();

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative pb-[80px]">
        
        {/* Floating Header Actions */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform pointer-events-auto"
          >
            <ArrowLeft01Icon size={20} />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={handleSave}
              className={clsx(
                "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95",
                isSaved ? "bg-error text-white" : "bg-black/30 text-white"
              )}
            >
              <FavouriteIcon size={20} variant={isSaved ? "solid" : "stroke"} />
            </button>
          </div>
        </div>

        {/* Sticky Background Image Carousel */}
        <div className="sticky top-0 w-full h-[40vh] bg-surfaceLight shrink-0 z-0">
          <div 
            ref={scrollContainerRef}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            onScroll={handleScroll}
          >
            {images.map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt={`${listing.title} - ${idx}`}
                className="w-full h-full object-cover shrink-0 snap-start"
              />
            ))}
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
          {/* Gradient Overlay at bottom to blend into content */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Scrollable Content overlaying image */}
        <div className="relative z-10 bg-background -mt-6 rounded-t-[24px] shadow-[0_-4px_16px_rgba(0,0,0,0.1)] flex-1 min-h-[60vh] pb-[100px]">
          {/* Drag handle indicator */}
          <div className="w-10 h-1 bg-borderLight rounded-full mx-auto my-3" />

          <div className="px-5">
            {/* Title & Price Section */}
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-xl font-bold text-textPrimary text-center mb-1 leading-tight">
                {listing.title}
              </h1>
              <div className="flex items-center text-textSecondary text-xs mb-1">
                <Location01Icon size={14} className="mr-1 shrink-0" />
                <span className="truncate">{listing.areaCluster || listing.address}</span>
              </div>
              <p className="text-xs font-medium text-textTertiary mb-3">Listed by {agentName}</p>
              
              <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/20">
                <p className="text-xl font-black text-primary text-center">
                  ₦{(listing.price || listing.rentAnnual).toLocaleString()}
                  <span className="text-xs font-semibold text-primary/70">/yr</span>
                </p>
              </div>
            </div>

            {/* Tags Row */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {listing.propertyType && <Tag label={labelFor(listing.propertyType)} />}
              {listing.furnishing && <Tag label={labelFor(listing.furnishing)} />}
              {listing.genderRestriction && <Tag label={labelFor(listing.genderRestriction)} />}
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar gap-4 mb-6 border-b border-borderLight pb-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 shrink-0 text-sm font-semibold transition-colors relative ${
                    activeTab === tab.id ? 'text-primary' : 'text-textSecondary'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pb-8">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-sm font-bold text-textPrimary mb-2">Description</h3>
                  <p className="text-sm text-textSecondary leading-relaxed mb-4">
                    {listing.description || 'No description available.'}
                  </p>

                  {listing.additionalNotes && (
                    <div className="bg-surface p-4 rounded-xl border border-borderLight mb-5">
                      <h4 className="text-sm font-bold text-textPrimary mb-1">Additional Notes</h4>
                      <p className="text-sm text-textSecondary">{listing.additionalNotes}</p>
                    </div>
                  )}

                  {/* Agent Card */}
                  <div className="flex flex-row items-center p-4 bg-surface rounded-2xl border border-borderLight shadow-sm mb-5 cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="w-12 h-12 rounded-full bg-btn-primary/10 flex items-center justify-center shrink-0 mr-3 border border-borderLight">
                      {agentAvatar ? (
                        <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="font-bold text-primary">{agentName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-sm text-textPrimary">{agentName}</h4>
                        <CheckmarkBadge01Icon size={14} className="text-accent" variant="solid" />
                      </div>
                      <p className="text-xs text-textSecondary">Property Manager</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
                        className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center"
                      >
                        <Alert02Icon size={16} className="text-error" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleChat(); }}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <BubbleChatIcon size={16} className="text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Safety Banner */}
                  <div 
                    onClick={() => navigate('/safety-tips')}
                    className="flex items-center gap-3 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl mb-6 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <CheckmarkBadge01Icon size={24} className="text-[#16A34A] shrink-0" variant="solid" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#166534]">House Hunting Safety Tips</h4>
                      <p className="text-xs text-[#15803D]">Learn how to avoid scams and inspect safely</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-textPrimary mb-3">Quick Info</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-surface border border-borderLight rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Building03Icon size={20} className="text-primary mb-1" />
                      <span className="text-[10px] text-textSecondary mb-0.5">Type</span>
                      <span className="text-xs font-bold text-textPrimary truncate w-full">{labelFor(listing.propertyType) || 'N/A'}</span>
                    </div>
                    <div className="bg-surface border border-borderLight rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <InformationCircleIcon size={20} className="text-primary mb-1" />
                      <span className="text-[10px] text-textSecondary mb-0.5">Max People</span>
                      <span className="text-xs font-bold text-textPrimary truncate w-full">{listing.maxOccupants || '1'}</span>
                    </div>
                    <div className="bg-surface border border-borderLight rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Location01Icon size={20} className="text-primary mb-1" />
                      <span className="text-[10px] text-textSecondary mb-0.5">Distance</span>
                      <span className="text-xs font-bold text-textPrimary truncate w-full">{labelFor(listing.distanceBucket) || 'N/A'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'amenities' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-sm font-bold text-textPrimary mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(listing.amenities && listing.amenities.length > 0) ? listing.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-borderLight">
                        <CheckmarkBadge01Icon size={16} className="text-accent shrink-0" variant="solid" />
                        <span className="text-sm font-medium text-textPrimary capitalize truncate">{amenity}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-textSecondary">No amenities listed</p>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Fallback for other tabs */}
              {activeTab === 'location' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-sm font-bold text-textPrimary mb-4">Location Details</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Address</span>
                      <span className="text-sm font-semibold text-textPrimary text-right max-w-[60%]">{listing.address || 'Address not available'}</span>
                    </div>
                    {listing.city && (
                      <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                        <span className="text-sm text-textSecondary">City</span>
                        <span className="text-sm font-semibold text-textPrimary text-right max-w-[60%]">{listing.city}</span>
                      </div>
                    )}
                    {listing.landmark && (
                      <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                        <span className="text-sm text-textSecondary">Landmarks Around</span>
                        <span className="text-sm font-semibold text-textPrimary text-right max-w-[60%]">{listing.landmark}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative h-48 bg-softSurface rounded-2xl overflow-hidden flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
                      alt="Map"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                      <Location01Icon size={48} className="text-white mb-2" />
                      <Button
                        variant="primary"
                        onClick={() => {
                          const query = encodeURIComponent(`${listing.address || ''} ${listing.city || ''} ${listing.landmark || ''}`.trim());
                          if (query) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                          }
                        }}
                      >
                        View on Google Maps
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-sm font-bold text-textPrimary mb-4">Property Details</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Property Type</span>
                      <span className="text-sm font-semibold text-textPrimary text-right">{labelFor(listing.propertyType) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Furnishing</span>
                      <span className="text-sm font-semibold text-textPrimary text-right">{labelFor(listing.furnishing) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Power Supply</span>
                      <span className="text-sm font-semibold text-textPrimary text-right">{labelFor(listing.power) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Gender Preference</span>
                      <span className="text-sm font-semibold text-textPrimary text-right">{labelFor(listing.genderRestriction) || 'Any'}</span>
                    </div>
                    {listing.additionalNotes && (
                      <div className="flex flex-col items-start pb-3 border-b border-borderLight">
                        <span className="text-sm text-textSecondary mb-1">Additional Notes</span>
                        <span className="text-sm font-semibold text-textPrimary">{listing.additionalNotes}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-textPrimary mb-4">House Rules</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Pets Allowed</span>
                      <span className="text-sm font-semibold text-textPrimary">{listing.petsAllowed ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Smoking Allowed</span>
                      <span className="text-sm font-semibold text-textPrimary">{listing.smokingAllowed ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-borderLight">
                      <span className="text-sm text-textSecondary">Students Only</span>
                      <span className="text-sm font-semibold text-textPrimary">{listing.studentsOnly ? 'Yes' : 'No'}</span>
                    </div>
                    {listing.rules && listing.rules.filter((r: string) => !['pets_allowed', 'smoking_allowed', 'students_only'].includes(r)).length > 0 && (
                      <div className="flex flex-col items-start pb-3 border-b border-borderLight">
                        <span className="text-sm text-textSecondary mb-1">Other Rules</span>
                        {listing.rules.filter((r: string) => !['pets_allowed', 'smoking_allowed', 'students_only'].includes(r)).map((rule: string, i: number) => (
                          <span key={i} className="text-sm font-semibold text-textPrimary capitalize">• {rule.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'inquiries' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-sm font-bold text-textPrimary mb-4">Inquiries</h3>
                  
                  {inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inq: any, i: number) => (
                        <div key={inq._id || i} className="bg-surface p-4 rounded-xl border border-borderLight">
                          <p className="text-sm font-medium text-textPrimary mb-1">{inq.question}</p>
                          <p className="text-xs text-textSecondary">{inq.answer ? inq.answer : 'Waiting for response'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <BubbleChatIcon size={48} className="text-textTertiary" />
                      <p className="text-sm text-textSecondary">No inquiries yet</p>
                    </div>
                  )}
                  
                  <button
                    className="w-full bg-softSurface p-4 rounded-xl mt-6 flex items-center justify-center active:scale-[0.98] transition-transform"
                    onClick={async () => {
                      const question = window.prompt("What is your question for the agent?");
                      if (question && question.trim().length > 0) {
                        try {
                          await listingService.submitInquiry(listing._id, question);
                          await customAlert('Question submitted successfully', 'Success', 'success');
                          // Fetch again
                          const inqRes = await listingService.getInquiries(listing._id);
                          setInquiries(inqRes.data?.inquiries || []);
                        } catch (err) {
                          customAlert('Failed to submit question', 'Error', 'error');
                        }
                      }
                    }}
                  >
                    <span className="text-sm font-semibold text-primary">Ask a Question</span>
                  </button>
                </motion.div>
              )}

              <div className="mt-8 mb-[100px] p-4 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl">
                <p className="text-xs text-[#92400E] leading-relaxed">
                  ileSure does not own this property. Always verify and inspect before making any payments. Report any suspicious activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-borderLight z-30 pb-safe-bottom">
          <Button 
            fullWidth 
            onClick={cta.action}
            disabled={paymentLoading}
            loading={paymentLoading}
            className="bg-[#3E1F0A] text-[#FFF8E1] hover:bg-[#3E1F0A]/90"
          >
            {cta.title}
          </Button>
        </div>

      </div>

      {/* Modals */}
      <BookAppointmentModal 
        visible={showBookModal}
        onClose={() => setShowBookModal(false)}
        onConfirm={handleBook}
        listing={listing as any}
      />

      <PrePaymentModal
        visible={showPrePaymentModal}
        onClose={() => setShowPrePaymentModal(false)}
        onConfirm={handlePayment}
        amount={(existingBooking?.amount || listing.rentAnnual)}
        loading={paymentLoading}
      />

      <InspectionBookingModal
        visible={showInspectionBooking}
        onClose={() => setShowInspectionBooking(false)}
        onSubmit={handleScheduleInspection}
        initialName={user?.fullName || ''}
      />

      <AgentReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        agentName={agentName}
        targetId={listing._id}
      />

      <BookingTimelineModal 
        visible={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        booking={existingBooking}
        loading={paymentLoading}
        onScheduleInspection={() => setShowInspectionBooking(true)}
        onMakePayment={() => setShowPrePaymentModal(true)}
      />
    </AppShell>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { 
  CheckmarkBadge01Icon, 
  CallIcon,
  StarIcon,
  Alert02Icon,
  Home01Icon
} from '@hugeicons/react';
import { listingService, Listing } from '../../api/listingService';

export function AgentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mocking agent & reviews data since there are no specific endpoints in PWA yet
  const [agent, setAgent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        // Using getListings with agentId
        const response = await listingService.getListings({ agentId: id });
        setListings(response.listings || []);
        
        // Mock agent details
        setAgent({
          _id: id,
          fullName: 'Jane Doe',
          verified: true,
          role: 'Property Manager',
          averageRating: 4.8,
          totalReviews: 24,
          phone: '+2348000000000',
        });
        
        setReviews([
          { _id: '1', reviewerId: { fullName: 'John Smith' }, hasBooked: true, rating: 5, comment: 'Very professional and responsive. Helped me secure a great apartment!' },
          { _id: '2', reviewerId: { fullName: 'Sarah Connor' }, hasBooked: false, rating: 4, comment: 'Good agent, nice properties.' }
        ]);

      } catch (error) {
        console.error('Failed to fetch agent data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [id]);

  const handleCall = () => {
    if (agent?.phone) {
      window.open(`tel:${agent.phone}`);
    } else {
      alert('Phone number not provided');
    }
  };

  if (loading || !agent) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Loading..." onBack={() => navigate(-1)} />
        <div className="p-4 space-y-4">
          <Skeleton height={200} className="w-full" />
          <Skeleton height={24} className="w-3/4 mx-auto" />
          <Skeleton height={60} className="w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative pb-safe-bottom">
        
        {/* Header Image / Background */}
        <div className="absolute top-0 left-0 right-0 h-[280px] bg-primary z-0 flex items-center justify-center">
          {agent.avatar || agent.logo ? (
            <img src={agent.avatar || agent.logo} alt="Agent" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl font-black text-white">
              {(agent.fullName || agent.name || '?')[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Floating Back Button */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform pointer-events-auto"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="relative z-10 flex-1 h-full overflow-y-auto">
          {/* Spacer to push content down */}
          <div className="h-[240px]" />
          
          <div className="bg-background rounded-t-[32px] pt-8 pb-10 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
            
            {/* Verified Badge */}
            {agent.verified && (
              <div className="flex justify-center -mt-12 mb-4">
                <div className="bg-accent px-4 py-1.5 rounded-full flex items-center gap-1.5 border-4 border-background shadow-sm">
                  <CheckmarkBadge01Icon size={16} className="text-white" variant="solid" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Verified</span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center px-6">
              <h1 className="text-2xl font-black text-textPrimary mb-1 text-center">
                {agent.fullName || agent.name || 'Agent'}
              </h1>
              
              <div className="flex items-center gap-1 mb-2">
                <StarIcon size={16} className="text-[#F59E0B]" variant="solid" />
                <span className="text-sm font-bold text-textPrimary">
                  {agent.averageRating ? agent.averageRating.toFixed(1) : 'No rating'}
                </span>
                <span className="text-sm text-textSecondary ml-1">
                  ({agent.totalReviews || 0} reviews)
                </span>
              </div>
              
              <p className="text-sm text-textSecondary mb-6 text-center">
                {agent.role === 'company' ? 'Real Estate Company' : 'Property Manager'}
              </p>

              {/* Stats & Call */}
              <div className="flex w-full gap-4 mb-6">
                <div className="flex-1 bg-surface border border-borderLight rounded-xl py-3 px-4 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <span className="text-2xl font-black text-textPrimary mb-1">{listings.length}</span>
                  <span className="text-xs text-textSecondary">Active Listings</span>
                </div>
                
                <button 
                  onClick={handleCall}
                  className="flex-1 bg-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(107,79,58,0.25)] active:scale-95 transition-transform"
                >
                  <CallIcon size={20} className="text-white" variant="solid" />
                  <span className="text-sm font-bold text-white">Call Now</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex w-full gap-4 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-borderLight active:bg-surfaceLight transition-colors">
                  <StarIcon size={18} className="text-textPrimary" />
                  <span className="text-sm font-bold text-textPrimary">Add a rating</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-error/30 active:bg-error/10 transition-colors">
                  <Alert02Icon size={18} className="text-error" />
                  <span className="text-sm font-bold text-error">Report Agent</span>
                </button>
              </div>

              <div className="w-full h-px bg-borderLight mb-6" />

              {/* Listings */}
              <div className="w-full mb-8">
                <h3 className="text-lg font-bold text-textPrimary mb-4">Listings by {agent.fullName?.split(' ')[0] || 'Agent'}</h3>
                
                {listings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Home01Icon size={48} className="text-textTertiary" />
                    <p className="text-sm text-textSecondary">No active listings found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {listings.map(listing => (
                      <div 
                        key={listing._id}
                        className="bg-surface rounded-2xl overflow-hidden border border-borderLight active:scale-[0.98] transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        onClick={() => navigate(`/listing/${listing._id}`)}
                      >
                        <div className="w-full h-32 bg-surfaceLight relative">
                          <img 
                            src={listing.images[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                          {listing.propertyType === 'shortlet' && (
                            <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-[10px] font-bold text-white">
                              Shortlet
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-textPrimary text-xs truncate mb-1">{listing.title}</p>
                          <p className="text-primary font-black text-sm">
                            ₦{(listing.price || listing.rentAnnual).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-borderLight mb-6" />

              {/* Reviews */}
              <div className="w-full pb-8">
                <h3 className="text-lg font-bold text-textPrimary mb-4">Reviews</h3>
                
                {reviews.length === 0 ? (
                  <p className="text-sm text-textSecondary text-center py-6">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, i) => (
                      <div key={i} className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-textPrimary">{review.reviewerId?.fullName || 'User'}</span>
                            {review.hasBooked && (
                              <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                                <CheckmarkBadge01Icon size={12} className="text-primary" variant="solid" />
                                <span className="text-[10px] font-bold text-primary uppercase">Booked</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <StarIcon key={idx} size={14} className={idx < review.rating ? "text-[#F59E0B]" : "text-border"} variant={idx < review.rating ? "solid" : "stroke"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-textSecondary leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { ListingCard } from '../../components/listing/ListingCard';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { FavouriteIcon } from '@hugeicons/react';
import { listingService, Listing } from '../../api/listingService';

export function SavedListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await listingService.getSavedListings();
      if (response.success) {
        setListings(response.data?.listings || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved listings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (listingId: string) => {
    try {
      await listingService.unsaveListing(listingId);
      setListings(prev => prev.filter(item => (item._id || item.id) !== listingId));
    } catch (error) {
      console.error('Failed to unsave listing', error);
    }
  };

  return (
    <AppShell hideTabBar>
      <MobileHeader title="Saved Apartments" onBack={() => navigate(-1)} />
      
      <div className="px-4 py-6 flex flex-col h-full overflow-y-auto">
        <RefreshIndicator isRefreshing={refreshing} />
        
        {loading && !refreshing ? (
          <div className="space-y-4">
            <Skeleton height={320} className="w-full rounded-3xl" />
            <Skeleton height={320} className="w-full rounded-3xl" />
          </div>
        ) : listings.length > 0 ? (
          <div className="pb-6">
            {listings.map(listing => (
              <ListingCard 
                key={listing._id || listing.id}
                listing={listing}
                onPress={() => navigate(`/listing/${listing._id || listing.id}`)}
                isSaved={true}
                onSave={() => handleUnsave(listing._id || listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center -mt-10">
            <EmptyState 
              icon={<FavouriteIcon size={32} />}
              title="No saved listings"
              description="You haven't saved any apartments yet. Tap the heart icon on any listing to save it here for later."
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}

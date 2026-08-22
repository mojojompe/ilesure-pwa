import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { ListingCard } from '../../components/listing/ListingCard';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { Skeleton, ListingCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  Search01Icon, 
  FilterIcon, 
  Building03Icon,
  Chatting01Icon,
  UserCircleIcon
} from '@hugeicons/react';
import { listingService, Listing, ListingFilter } from '../../api/listingService';
import {
  CHIP_PROPERTY_TYPES,
  FURNISHED_VALUES,
  STABLE_POWER_VALUES,
  PropertyType,
} from '../../constants/listingVocabulary';
import { useAuthStore } from '../../stores/authStore';
import { chatService } from '../../api/chatService';
import { AdsCarousel } from '../../components/common/AdsCarousel';
import {
  FilterModal,
  FilterState,
  PRICE_FLOOR,
  PRICE_CEILING,
} from '../../components/common/FilterModal';

const CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'shared', label: 'Shared' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'shortlet', label: 'Shortlet' },
];

export function Discover() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Debounced mirror of searchQuery — the value the API is actually queried with.
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreServer, setHasMoreServer] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const ITEMS_PER_PAGE = 10;

  /**
   * Translates the chips and the filter modal into the API's query parameters.
   *
   * Search and filtering used to run over the array already in memory, so they
   * only ever saw the 10 listings on the current page, and the modal compared
   * display labels ('2-Bedroom') against stored values ('2_bed') — which matched
   * nothing. Both now run on the server against canonical values.
   */
  const { listingFilters, hasContradictoryTypes } = useMemo(() => {
    const filters: ListingFilter = {};
    if (searchTerm.trim()) filters.q = searchTerm.trim();

    const chipTypes = CHIP_PROPERTY_TYPES[activeChip];
    let propertyTypes: PropertyType[] = chipTypes ? [...chipTypes] : [];
    let contradictory = false;

    if (activeChip === 'shared') filters.shareable = true;

    if (activeFilters) {
      if (activeFilters.propertyTypes.length > 0) {
        // A chip and the modal are both type filters — intersect them so the
        // narrower wins rather than one silently replacing the other.
        const intersection = propertyTypes.length > 0
          ? propertyTypes.filter(t => activeFilters.propertyTypes.includes(t))
          : [...activeFilters.propertyTypes];
        // The server drops filter values it cannot resolve, so an impossible
        // combination has to be caught here or it would show everything.
        contradictory = intersection.length === 0;
        propertyTypes = intersection;
      }

      if (activeFilters.priceMin > PRICE_FLOOR) filters.priceMin = activeFilters.priceMin;
      if (activeFilters.priceMax < PRICE_CEILING) filters.priceMax = activeFilters.priceMax;
      if (activeFilters.distance) filters.distanceBucket = [activeFilters.distance];
      if (activeFilters.genderRestriction) filters.gender = [activeFilters.genderRestriction];
      if (activeFilters.shareable) filters.shareable = true;
      if (activeFilters.furnished) filters.furnishing = [...FURNISHED_VALUES];
      if (activeFilters.powerStable) filters.power = [...STABLE_POWER_VALUES];
      if (activeFilters.excludeStudentsOnly) filters.excludeStudentsOnly = true;

      // Proximity around whatever the renter anchored to. A seeded place goes by
      // name so the server applies its curated radius; a geocoded address goes
      // as a point.
      const anchor = activeFilters.anchor;
      if (anchor?.landmark) {
        filters.landmark = anchor.landmark;
        filters.maxDistance = activeFilters.radiusMetres;
      } else if (anchor?.coordinates) {
        filters.nearLng = anchor.coordinates[0];
        filters.nearLat = anchor.coordinates[1];
        filters.maxDistance = activeFilters.radiusMetres;
      }
    }

    if (propertyTypes.length > 0) filters.propertyType = propertyTypes;
    return { listingFilters: filters, hasContradictoryTypes: contradictory };
  }, [searchTerm, activeChip, activeFilters]);

  // Debounce keystrokes so typing a place name is one request, not one per letter.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInitialData = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1) setLoading(true);

      if (hasContradictoryTypes) {
        setListings([]);
        setHasMoreServer(false);
        return;
      }

      const promises: any[] = [
        listingService.getListings(listingFilters, page, ITEMS_PER_PAGE),
        listingService.getSavedListings().catch(() => ({ data: { listings: [] } })),
        chatService.getConversations().catch(() => ({ data: { chats: [] } }))
      ];

      const [listingsData, savedData, chatsData] = await Promise.all(promises);
      
      if (page === 1) {
        setListings(listingsData.listings);
      } else {
        setListings(prev => {
          const newIds = new Set(listingsData.listings.map((l: any) => l.id || l._id));
          const filteredPrev = prev.filter(l => !newIds.has(l.id || l._id));
          return [...filteredPrev, ...listingsData.listings];
        });
      }
      
      // Sync saved listings
      const savedIds = savedData.data?.listings?.map((l: any) => l._id || l.id) || [];
      setSavedListings(savedIds);

      // Sync unread chats
      const unreadChats = chatsData.data?.chats?.filter((c: any) => c.unreadCount > 0).length || 0;
      setUnreadCount(unreadChats);
      
      setHasMoreServer(listingsData.listings.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [listingFilters, hasContradictoryTypes]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchInitialData(nextPage);
  };

  // A new search, chip or filter is a new result set: back to page 1 and re-query.
  useEffect(() => {
    setCurrentPage(1);
    fetchInitialData(1);
  }, [fetchInitialData]);

  const toggleSave = (id: string) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // The server has already applied the search, chips and filters.
  const hasMore = hasMoreServer;


  // Framer Motion staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-full bg-background pt-safe-top pb-6 overflow-x-hidden">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={headerVariants}
          className="px-5 pt-4 pb-2"
        >
          <div className="flex flex-row justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-1">
                Good Day,
              </span>
              <h1 className="text-3xl font-black text-textPrimary tracking-tight">
                {user?.fullName?.split(' ')[0] || 'Student'}
              </h1>
            </div>

            <div className="flex flex-row items-center gap-3">
              <button 
                onClick={() => navigate('/chats')}
                className="w-11 h-11 rounded-full bg-surfaceLight flex items-center justify-center relative active:scale-95 transition-transform"
              >
                <Chatting01Icon size={24} className="text-textPrimary" />
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-error rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-[10px] text-white font-bold">{unreadCount}</span>
                  </div>
                )}
              </button>
              
              <button 
                onClick={() => navigate('/profile')}
                className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform border-2 border-primary overflow-hidden"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon size={32} className="text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex flex-row gap-3 mb-2">
            <div className="flex-1 h-[52px] bg-surfaceLight rounded-full flex flex-row items-center px-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-borderLight">
              <Search01Icon size={20} className="text-textTertiary mr-2" />
              <input 
                type="text" 
                placeholder="Search locations or landmarks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-base text-textPrimary placeholder:text-textMuted"
              />
            </div>
            
            <button onClick={() => setShowFilters(true)} className="w-[52px] h-[52px] flex items-center justify-center active:scale-95 transition-transform bg-transparent">
              <FilterIcon size={24} className="text-textPrimary" variant="stroke" />
            </button>
          </div>
        </motion.div>

        {/* Ads Carousel & Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <AdsCarousel 
            heroTitle="Find Your Perfect Space" 
            heroImage="/assets/backgrounds/hero_student.png" 
          />
        </motion.div>

        {/* Chips Row */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full overflow-x-auto no-scrollbar mb-6"
        >
          <div className="flex flex-row gap-2 px-5 min-w-max">
            {CHIPS.map(chip => {
              const isActive = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveChip(chip.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-accent text-white shadow-md' 
                      : 'bg-surfaceLight text-textSecondary hover:bg-surface'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1">
          <RefreshIndicator isRefreshing={refreshing} />
          
          {loading && !refreshing && currentPage === 1 ? (
            <div className="px-4 space-y-4">
              <ListingCardSkeleton />
              <ListingCardSkeleton />
            </div>
          ) : listings.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px]"
            >
              {listings.map((listing: any) => (
                <motion.div key={listing._id || listing.id} variants={itemVariants}>
                  <ListingCard 
                    listing={listing}
                    onPress={() => navigate(`/listing/${listing._id || listing.id}`)}
                    isSaved={savedListings.includes(listing._id || listing.id)}
                    onSave={() => toggleSave(listing._id || listing.id)}
                  />
                </motion.div>
              ))}

              {hasMore && (
                <div className="px-5 mt-4 mb-8">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-surfaceLight text-textSecondary font-bold active:bg-surface transition-colors border border-borderLight flex items-center justify-center disabled:opacity-50"
                  >
                    {loading && currentPage > 1 ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 px-5"
            >
              <EmptyState 
                icon={<Building03Icon size={48} className="text-textMuted" />}
                title="No properties found"
                description="Try adjusting your filters or searching a different area."
              />
            </motion.div>
          )}
        </div>
      </div>
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        initialFilters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters);
        }}
        onClear={() => {
          setActiveFilters(null);
        }}
        userRole={user?.role}
        university={(user as any)?.university}
      />
    </AppShell>
  );
}

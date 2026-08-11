import React, { useEffect, useState, useMemo } from 'react';
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
import { listingService, Listing } from '../../api/listingService';
import { useAuthStore } from '../../stores/authStore';
import { chatService } from '../../api/chatService';
import { AdsCarousel } from '../../components/common/AdsCarousel';
import { FilterModal, FilterState } from '../../components/common/FilterModal';

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
  const [activeChip, setActiveChip] = useState('all');
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreServer, setHasMoreServer] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const ITEMS_PER_PAGE = 10;
  
  const fetchInitialData = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1) setLoading(true);
      
      const promises: any[] = [
        listingService.getListings({}, page, ITEMS_PER_PAGE),
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
  };

  useEffect(() => {
    fetchInitialData(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchInitialData(nextPage);
  };

  useEffect(() => {
    // If they change search or filter, we might want to reset to page 1?
    // But since filtering is local right now, we don't re-fetch from server.
    // We just reset the local visible page.
    setCurrentPage(1);
  }, [searchQuery, activeChip]);

  const toggleSave = (id: string) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredListings = useMemo(() => {
    return listings.filter((l: any) => {
      const matchesSearch =
        !searchQuery ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.areaCluster?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChip =
        activeChip === 'all' ||
        (activeChip === 'shared' && l.needsRoommate) ||
        (activeChip === 'hostel' && l.propertyType?.toLowerCase().includes('hostel')) ||
        (activeChip === 'apartment' && !['hostel', 'shortlet'].includes(l.propertyType?.toLowerCase())) ||
        (activeChip === 'shortlet' && l.propertyType?.toLowerCase().includes('shortlet'));

      let matchesFilters = true;
      if (activeFilters) {
        const rent = l.rentAnnual || l.shortletPricing?.daily || 0;
        if (rent < activeFilters.priceMin || rent > activeFilters.priceMax) matchesFilters = false;
        
        if (activeFilters.propertyTypes.length > 0) {
          const typeMatch = activeFilters.propertyTypes.some(t => {
            const mapped = t.toLowerCase().replace('-', '').replace(' ', '_');
            return l.propertyType?.toLowerCase().includes(mapped);
          });
          if (!typeMatch) matchesFilters = false;
        }

        if (activeFilters.distance) {
          const d = activeFilters.distance.toLowerCase();
          if (d.includes('very close') && !l.distanceBucket?.toLowerCase().includes('very close')) matchesFilters = false;
          if (d.includes('close (5') && !l.distanceBucket?.toLowerCase().includes('close (5')) matchesFilters = false;
          if (d.includes('budget') && !l.distanceBucket?.toLowerCase().includes('budget')) matchesFilters = false;
        }
        
        if (activeFilters.genderRestriction && activeFilters.genderRestriction !== 'Any') {
          const target = activeFilters.genderRestriction === 'Female Only' ? 'female_only' : 'male_only';
          if (l.genderRestriction !== target) matchesFilters = false;
        }
        
        if (activeFilters.shareable && !l.shareable && !l.needsRoommate) matchesFilters = false;
        if (activeFilters.furnished && !['fully_furnished', 'furnished'].includes(l.furnishing)) matchesFilters = false;
        if (activeFilters.powerStable && !['constant', 'solar', 'hybrid', 'solar-backed'].includes(l.power)) matchesFilters = false;

        if (activeFilters.schoolLocationOnly) {
           const uniName = (user as any)?.university || 'Lead City University';
           const shortUniName = uniName.replace(' University', '');
           if (!l.areaCluster?.toLowerCase().includes(shortUniName.toLowerCase())) {
             matchesFilters = false;
           }
        }
      }

      return matchesSearch && matchesChip && matchesFilters;
    });
  }, [listings, searchQuery, activeChip, activeFilters, user]);

  const paginatedListings = filteredListings.slice(0, currentPage * ITEMS_PER_PAGE);
  // Show Load More if there are hidden local items OR the server has more items
  const hasMore = paginatedListings.length < filteredListings.length || hasMoreServer;

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
          ) : filteredListings.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="pb-[20px]"
            >
              {paginatedListings.map((listing: any) => (
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
                    onClick={paginatedListings.length < filteredListings.length ? () => setCurrentPage(p => p + 1) : handleLoadMore}
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

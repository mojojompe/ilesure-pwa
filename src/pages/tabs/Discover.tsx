import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { CategoryPillCard, CATEGORIES } from '../../components/listing/CategoryPillCard';
import { SummaryListingCard } from '../../components/listing/SummaryListingCard';
import { RefreshIndicator } from '../../components/ui/RefreshIndicator';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Search01Icon,
  FilterIcon,
  Chatting01Icon,
  UserCircleIcon,
  ArrowRight01Icon,
  Building01Icon,
  Home01Icon,
} from '@hugeicons/react';
import { listingService, Listing, ListingFilter } from '../../api/listingService';
import {
  FURNISHED_VALUES,
  STABLE_POWER_VALUES,
} from '../../constants/listingVocabulary';
import { useAuthStore } from '../../stores/authStore';
import { useListingStore } from '../../stores/listingStore';
import { chatService } from '../../api/chatService';
import { AdsCarousel, HomeHeroBanner } from '../../components/common/AdsCarousel';
import {
  FilterModal,
  FilterState,
  PRICE_FLOOR,
  PRICE_CEILING,
} from '../../components/common/FilterModal';

interface CategoryGroup {
  key: string;
  label: string;
  description: string;
  items: Listing[];
}

export function Discover() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const initialListings = useListingStore((state) => state.listings);
  const [listings, setListings] = useState<Listing[]>(initialListings || []);
  const [loading, setLoading] = useState(
    initialListings && initialListings.length > 0 ? false : true
  );
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  const { listingFilters } = useMemo(() => {
    const filters: ListingFilter = {};
    if (searchTerm.trim()) filters.q = searchTerm.trim();

    if (activeFilters) {
      if (activeFilters.propertyTypes.length > 0) {
        filters.propertyType = [...activeFilters.propertyTypes];
      }
      if (activeFilters.priceMin > PRICE_FLOOR) filters.priceMin = activeFilters.priceMin;
      if (activeFilters.priceMax < PRICE_CEILING) filters.priceMax = activeFilters.priceMax;
      if (activeFilters.distance) filters.distanceBucket = [activeFilters.distance];
      if (activeFilters.genderRestriction) filters.gender = [activeFilters.genderRestriction];
      if (activeFilters.shareable) filters.shareable = true;
      if (activeFilters.furnished) filters.furnishing = [...FURNISHED_VALUES];
      if (activeFilters.powerStable) filters.power = [...STABLE_POWER_VALUES];
      if (activeFilters.excludeStudentsOnly) filters.excludeStudentsOnly = true;

      const anchor = activeFilters.anchor;
      if (anchor?.areaCluster) {
        filters.areaCluster = anchor.areaCluster;
      } else if (anchor?.landmark) {
        filters.landmark = anchor.landmark;
        filters.maxDistance = activeFilters.radiusMetres;
      } else if (anchor?.coordinates) {
        filters.nearLng = anchor.coordinates[0];
        filters.nearLat = anchor.coordinates[1];
        filters.maxDistance = activeFilters.radiusMetres;
      }
    }

    return { listingFilters: filters };
  }, [searchTerm, activeFilters]);

  // Debounce search keystrokes
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInitialData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const promises: any[] = [
          listingService.getListings(listingFilters, 1, 60),
          chatService.getConversations().catch(() => ({ data: { chats: [] } })),
        ];

        const [listingsData, chatsData] = await Promise.all(promises);

        const fetched = listingsData.listings || [];
        setListings(fetched);
        useListingStore.getState().setListings(fetched);

        const unreadChats =
          chatsData.data?.chats?.filter((c: any) => c.unreadCount > 0).length || 0;
        setUnreadCount(unreadChats);
      } catch (error) {
        console.error('Failed to fetch home listings', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [listingFilters]
  );

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Group listings into the five specified categories
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const groups: Record<string, Listing[]> = {
      shortlet: [],
      self_con: [],
      hostel: [],
      apartment: [],
      shared: [],
    };

    listings.forEach((listing) => {
      const type = (listing.propertyType || '').toLowerCase();
      const aptType = (listing.apartmentType || '').toLowerCase();

      if (type === 'shortlet' || aptType === 'shortlet' || listing.shortletPricing) {
        groups.shortlet.push(listing);
      } else if (type === 'self_con' || aptType === 'self_con') {
        groups.self_con.push(listing);
      } else if (type.includes('hostel') || aptType.includes('hostel')) {
        groups.hostel.push(listing);
      } else if (
        (listing as any).shareable ||
        (listing as any).isShared ||
        listing.status === 'needs_roommate'
      ) {
        groups.shared.push(listing);
      } else {
        // Apartment default (1_bed, 2_bed, 3_bed, mini_flat, studio, penthouse, etc.)
        groups.apartment.push(listing);
      }
    });

    return [
      {
        key: 'shortlet',
        label: 'Shortlets & Stays',
        description: 'Flexible daily and weekly serviced apartments',
        items: groups.shortlet,
      },
      {
        key: 'self_con',
        label: 'Self-Contained',
        description: 'Private studios and self-contained units',
        items: groups.self_con,
      },
      {
        key: 'hostel',
        label: 'Student Hostels',
        description: 'Vetted student residences close to campus',
        items: groups.hostel,
      },
      {
        key: 'apartment',
        label: 'Standard Apartments',
        description: '1 to 3 bedroom apartments and flats',
        items: groups.apartment,
      },
      {
        key: 'shared',
        label: 'Shared Spaces',
        description: 'Co-living apartments with verified roommates',
        items: groups.shared,
      },
    ];
  }, [listings]);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-full bg-background pt-safe-top pb-10 overflow-x-clip">
        {/* Header Section - Untouched */}
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

          {/* Search Row - Untouched */}
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

            <button
              onClick={() => setShowFilters(true)}
              className="w-[52px] h-[52px] flex items-center justify-center active:scale-95 transition-transform bg-transparent"
              aria-label="Filter listings"
            >
              <FilterIcon size={24} className="text-textPrimary" variant="stroke" />
            </button>
          </div>
        </motion.div>

        {/* 1. Permanent Home Page Header Banner between Search and Category Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <HomeHeroBanner />
        </motion.div>

        {/* 2. Category Cards Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="w-full overflow-x-auto no-scrollbar py-2 mb-4"
        >
          <div className="flex flex-row gap-3 px-5 min-w-max">
            {CATEGORIES.map((cat) => (
              <CategoryPillCard
                key={cat.id}
                category={cat}
                onClick={() => navigate(`/category/${cat.id}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* 3. Summary Feed: Browse Listings / For You */}
        <div className="flex-1 px-5">
          <RefreshIndicator isRefreshing={refreshing} />

          {/* Section Header: Removed the Available pill as requested */}
          <div className="mb-5">
            <h2 className="text-xl font-black text-textPrimary tracking-tight">For You</h2>
            <p className="text-xs text-textSecondary font-medium">
              Browse verified properties by category
            </p>
          </div>

          {loading && !refreshing ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-36 bg-surfaceLight rounded-md animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-44 bg-surfaceLight rounded-2xl animate-pulse" />
                    <div className="h-44 bg-surfaceLight rounded-2xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {categoryGroups.map((group) => {
                const previewItems = group.items.slice(0, 2);
                const hasItems = previewItems.length > 0;

                return (
                  <React.Fragment key={group.key}>
                    <section className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-textPrimary">
                            {group.label}
                          </h3>
                          <span className="text-[11px] font-bold text-textTertiary bg-surfaceLight px-2 py-0.5 rounded-full border border-borderLight">
                            {group.items.length}
                          </span>
                        </div>

                        <button
                          onClick={() => navigate(`/category/${group.key}`)}
                          className="flex items-center gap-1 text-xs font-bold text-[#6B3A1F] active:opacity-75 group"
                        >
                          <span>See more</span>
                          <ArrowRight01Icon
                            size={15}
                            className="text-[#6B3A1F] group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      </div>

                      {/* 2-Column Grid or Empty State */}
                      {hasItems ? (
                        <div className="grid grid-cols-2 gap-3">
                          {previewItems.map((item) => (
                            <SummaryListingCard
                              key={item._id || item.id}
                              listing={item}
                              onClick={() =>
                                navigate(`/listing/${item._id || item.id}`, {
                                  state: { listing: item },
                                })
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        /* Empty state for category with 0 listings */
                        <div className="bg-[#FFFDF7] border border-borderLight rounded-2xl p-5 flex flex-col items-center text-center shadow-xs">
                          <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] flex items-center justify-center text-[#E1AD01] mb-2 border border-[#E1AD01]/20">
                            <Home01Icon size={24} />
                          </div>
                          <p className="text-xs font-bold text-textPrimary mb-0.5">
                            No {group.label.toLowerCase()} yet
                          </p>
                          <p className="text-[11px] text-textTertiary mb-3 max-w-[200px]">
                            Check back soon or explore what’s currently in this category.
                          </p>
                          <button
                            onClick={() => navigate(`/category/${group.key}`)}
                            className="px-3.5 py-1.5 rounded-full bg-[#6B3A1F] text-white text-[11px] font-bold active:scale-95 transition-transform shadow-xs"
                          >
                            View category
                          </button>
                        </div>
                      )}
                    </section>

                    {/* Ads Carousel placed permanently in-between "Shortlets and Stays" and "Self-Contained" */}
                    {group.key === 'shortlet' && (
                      <div className="-mx-5">
                        <AdsCarousel />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Sponsored by Waltik Labs Footer */}
              <div className="pt-6 pb-2 text-center border-t border-borderLight">
                <p className="text-xs font-semibold text-textTertiary tracking-wide">
                  Sponsored by <span className="text-textPrimary font-bold">Waltik Labs</span>
                </p>
              </div>
            </div>
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

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft01Icon, ArrowRight01Icon, FilterIcon } from '@hugeicons/react';
import { AppShell } from '../../components/layout/AppShell';
import { ListingCard } from '../../components/listing/ListingCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ListingCardSkeleton } from '../../components/ui/SkeletonLoader';
import { listingService, Listing, ListingFilter } from '../../api/listingService';
import { CHIP_PROPERTY_TYPES, PropertyType, labelFor } from '../../constants/listingVocabulary';
import { useAuthStore } from '../../stores/authStore';
import { FilterModal, FilterState } from '../../components/common/FilterModal';

const CATEGORY_TITLES: Record<string, string> = {
  shared: 'Shared Apartments',
  hostel: 'Student Hostels',
  apartment: 'Flats & Apartments',
  shortlet: 'Shortlet Spaces',
  self_con: 'Self-Con / Studios',
};

const ITEMS_PER_PAGE = 5;

export function CategoryListings() {
  const { categoryKey = 'apartment' } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  const displayTitle = CATEGORY_TITLES[categoryKey] || labelFor(categoryKey) || 'Category Listings';

  const fetchCategoryListings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const filters: ListingFilter = {};

      const chipTypes = CHIP_PROPERTY_TYPES[categoryKey];
      if (chipTypes && chipTypes.length > 0) {
        filters.propertyType = [...chipTypes] as PropertyType[];
      } else if (categoryKey === 'self_con') {
        filters.propertyType = ['self_con'];
      }

      if (categoryKey === 'shared') {
        filters.shareable = true;
      }

      if (activeFilters) {
        if (activeFilters.priceMin) filters.priceMin = activeFilters.priceMin;
        if (activeFilters.priceMax) filters.priceMax = activeFilters.priceMax;
        if (activeFilters.anchor?.areaCluster) filters.areaCluster = activeFilters.anchor.areaCluster;
      }

      const res = await listingService.getListings(filters, page, ITEMS_PER_PAGE);
      setListings(res.listings || []);
      setTotalCount(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      console.error('Failed to fetch category listings', err);
    } finally {
      setLoading(false);
    }
  }, [categoryKey, activeFilters]);

  useEffect(() => {
    setCurrentPage(1);
    fetchCategoryListings(1);
  }, [fetchCategoryListings]);

  const toggleSave = (id: string) => {
    setSavedListings(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-full bg-background pt-safe-top pb-8 overflow-x-clip">
        {/* Category Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-borderLight flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
              aria-label="Back to home"
            >
              <ArrowLeft01Icon size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-textPrimary leading-tight">
                {displayTitle}
              </h1>
              <p className="text-xs font-semibold text-textSecondary">
                {totalCount} {totalCount === 1 ? 'property' : 'properties'} available
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
            aria-label="Filter"
          >
            <FilterIcon size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-1 pt-4">
          {loading ? (
            <div className="px-4 space-y-4">
              <ListingCardSkeleton />
              <ListingCardSkeleton />
            </div>
          ) : listings.length > 0 ? (
            <div className="relative pb-4">
              {/* Scroll Stack of Listings */}
              <div className="relative">
                {listings.map((listing: any, index: number) => (
                  <motion.div
                    key={listing._id || listing.id}
                    className="sticky transition-all duration-300"
                    style={{
                      top: `${72 + index * 12}px`,
                      zIndex: index + 1,
                      marginBottom: index === listings.length - 1 ? '16px' : '20px',
                    }}
                  >
                    <ListingCard
                      listing={listing}
                      onPress={() => navigate(`/listing/${listing._id || listing.id}`, { state: { listing } })}
                      isSaved={savedListings.includes(listing._id || listing.id)}
                      onSave={() => toggleSave(listing._id || listing.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Minimalist Redesigned Pagination */}
              {totalPages > 1 && (
                <div className="px-5 mt-6 mb-2 flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      const prevPage = Math.max(1, currentPage - 1);
                      setCurrentPage(prevPage);
                      fetchCategoryListings(prevPage);
                      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1 || loading}
                    aria-label="Previous Page"
                    className="w-9 h-9 rounded-full bg-[#E1AD01] text-white flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowLeft01Icon size={16} />
                  </button>

                  <span className="text-xs font-bold text-textSecondary tracking-wider">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      const nextPage = Math.min(totalPages, currentPage + 1);
                      setCurrentPage(nextPage);
                      fetchCategoryListings(nextPage);
                      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages || loading}
                    aria-label="Next Page"
                    className="w-9 h-9 rounded-full bg-[#E1AD01] text-white flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowRight01Icon size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-16 px-6">
              <EmptyState
                illustration="listings"
                title={`No ${displayTitle} available`}
                description="There are currently no listings in this category. Check back soon or browse other categories."
              />
            </div>
          )}
        </div>
      </div>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        initialFilters={activeFilters}
        onApply={(f) => setActiveFilters(f)}
        onClear={() => setActiveFilters(null)}
        userRole={user?.role}
        university={(user as any)?.university}
      />
    </AppShell>
  );
}

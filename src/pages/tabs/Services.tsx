/**
 * iléSure Home Services Page  –  /services
 *
 * ─────────────────────────── COMING SOON ────────────────────────────
 *  This entire page is a production-ready scaffold for the Home Services
 *  feature planned for the native mobile app. Every interactive element
 *  triggers <ServiceComingSoonModal> until the feature goes live.
 *
 * ─────────────────── V2 IMPLEMENTATION BLUEPRINT ────────────────────
 *  When V2 ships, follow these steps:
 *
 *  1. REMOVE all `openComingSoon()` calls and the <ServiceComingSoonModal>.
 *
 *  2. REPLACE the empty-state grids with real <ServiceCard> components:
 *       interface ServiceCard {
 *         id: string;
 *         providerName: string;
 *         categoryId: string;
 *         basePrice: number;
 *         priceUnit: 'per_visit' | 'per_hour' | 'quote';
 *         rating: number;         // 0–5
 *         reviewCount: number;
 *         verified: boolean;
 *         portfolioThumbnail: string;
 *         locationArea: string;
 *       }
 *
 *  3. WIRE UP the provider profile route:
 *       <Route path="/services/provider/:id" element={<ServiceProviderProfile />} />
 *     The ServiceProviderProfile page renders:
 *       - Header: avatar, name, rating stars, reviewCount, verified badge
 *       - Portfolio: horizontal scroll of photos
 *       - About / services offered
 *       - Reviews list (reviewer name, star rating, comment, date)
 *       - Report button (POST /api/v1/services/providers/:id/report)
 *       - Sticky footer: [Chat] [Call] [Book Now]
 *         Book Now → POST /api/v1/services/bookings (escrow-backed)
 *
 *  4. CONNECT the search bar to GET /api/v1/services/search?q=&category=&area=
 *
 *  5. ADD pagination / infinite-scroll on each category feed via
 *     GET /api/v1/services/:categoryId/providers?page=&limit=10
 *
 *  6. PUSH: Book confirmation, status changes, and reviews use the existing
 *     listingNotificationService.notifyUser() pattern.
 * ─────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AppShell } from "../../components/layout/AppShell";
import { ServiceComingSoonModal } from "../../components/services/ServiceComingSoonModal";
import { SERVICE_CATEGORIES } from "../../data/serviceCategories";
import { Search01Icon, FilterIcon, Wrench01Icon } from "@hugeicons/react";

export default function Services() {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const openComingSoon = useCallback(() => setComingSoonOpen(true), []);
  const closeComingSoon = useCallback(() => setComingSoonOpen(false), []);

  return (
    <AppShell>
      <div className="flex flex-col min-h-full bg-background pt-safe-top pb-24 overflow-x-clip">
        {/* ── Page Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-5 pt-4 pb-3 flex items-center justify-between"
        >
          <div>
            <h1 className="text-[26px] font-black text-[#3E1F0A] leading-tight tracking-tight">
              Home Services
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#3E1F0A] text-[#FAF1CC] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Search Bar (tapping opens modal) ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.3 }}
          className="px-5 mb-4"
        >
          <button
            onClick={openComingSoon}
            className="w-full flex items-center gap-3 bg-white border border-[#E7DCD4] rounded-2xl px-4 py-3 shadow-sm text-left"
          >
            <Search01Icon size={20} className="text-[#A0806A] shrink-0" />
            <span className="text-sm text-[#A0806A] font-medium">
              Search artisans, plumbers, cleaners…
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComingSoon();
              }}
              className="ml-auto flex items-center gap-1 bg-[#F5F1EB] rounded-xl px-3 py-1.5"
            >
              <FilterIcon size={14} className="text-[#6B4F3A]" />
              <span className="text-xs font-bold text-[#6B4F3A]">Filter</span>
            </button>
          </button>
        </motion.div>

        {/* ── Services Hero Banner ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="px-5 mb-6"
        >
          <div
            onClick={openComingSoon}
            className="w-full h-[140px] rounded-[24px] bg-gradient-to-br from-[#3E1F0A] to-[#5C2D10] relative overflow-hidden flex flex-row items-center px-5 shadow-clay cursor-pointer active:scale-[0.98] transition-transform"
          >
            {/* Services icon on the LEFT */}
            <div className="w-[120px] h-[120px] shrink-0 flex items-center justify-center mr-4">
              <Wrench01Icon size={72} className="text-[#E8DCC4]" />
            </div>
            {/* Text on the RIGHT */}
            <div className="flex-1">
              <span className="bg-[#E1AD01] text-[#3E1F0A] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block">
                Coming Soon
              </span>
              <h2 className="text-[#E8DCC4] text-[18px] font-black tracking-tight leading-snug">
                Trusted Artisans &amp; Home Services
              </h2>
              <p className="text-[#C4A88A] text-[11px] mt-0.5">
                Vetted professionals at your doorstep
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Category Cards ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13, duration: 0.3 }}
          className="mb-6"
        >
          <div className="px-5 mb-3">
            <h2 className="text-base font-extrabold text-[#3E1F0A]">
              Service Categories
            </h2>
          </div>
          <div className="overflow-x-auto no-scrollbar py-2">
            <div className="flex flex-row gap-3 px-5 min-w-max">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={openComingSoon}
                  className="flex flex-col items-center gap-2 outline-none group shrink-0"
                >
                  <div className="w-[114px] h-[96px] rounded-[22px] flex items-center justify-center p-2 bg-[#F5F1EB] shadow-[0_10px_24px_-4px_rgba(62,31,10,0.12),0_4px_10px_-2px_rgba(62,31,10,0.06)] hover:shadow-[0_14px_30px_-4px_rgba(62,31,10,0.16)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 relative overflow-hidden grayscale opacity-80">
                    <cat.icon
                      size={54}
                      aria-hidden="true"
                      className="text-[#6B4F3A]"
                    />
                    <div className="absolute inset-0 bg-[#3E1F0A]/15 flex items-end justify-center pb-1.5">
                      <span className="bg-[#3E1F0A] text-[#FAF1CC] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#6B4F3A] group-hover:text-[#3E1F0A] tracking-tight transition-colors max-w-[114px] text-center truncate">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Service Feed: Category sections with empty states ── */}
        {/*
         * V2: Replace each empty-state block below with a 2-column ServiceCard
         * grid. ServiceCard shows: provider avatar, name, rating, price label,
         * location, and verified badge. Tapping navigates to /services/provider/:id
         *
         * Example data fetch:
         *   const { data } = useQuery(['services', cat.id], () =>
         *     fetch(`/api/v1/services/${cat.id}/providers?limit=4`).then(r => r.json())
         *   );
         */}
        <div className="px-5 space-y-8 pb-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <section key={cat.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <cat.icon
                    size={22}
                    aria-hidden="true"
                    className="text-[#6B4F3A] opacity-60"
                  />
                  <h3 className="text-base font-extrabold text-[#3E1F0A]">
                    {cat.label}
                  </h3>
                </div>
                <button
                  onClick={openComingSoon}
                  className="text-xs font-bold text-[#6B3A1F] active:opacity-75"
                >
                  See more →
                </button>
              </div>

              {/* Empty State  –  V2: Replace this with the real grid */}
              <button
                onClick={openComingSoon}
                className="w-full bg-[#FFFDF7] border border-[#E7DCD4] rounded-2xl p-5 flex flex-col items-center text-center shadow-xs active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] flex items-center justify-center mb-2 border border-[#E1AD01]/20">
                  <cat.icon size={24} className="text-[#E1AD01]" />
                </div>
                <p className="text-xs font-bold text-[#3E1F0A] mb-0.5">
                  {cat.label} · {cat.examplePriceLabel}
                </p>
                <p className="text-[11px] text-[#A0806A] mb-2 max-w-[220px]">
                  {cat.description}
                </p>
                <span className="bg-[#3E1F0A] text-[#FAF1CC] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </button>
            </section>
          ))}
        </div>
      </div>

      <ServiceComingSoonModal
        isOpen={comingSoonOpen}
        onClose={closeComingSoon}
      />
    </AppShell>
  );
}

import {
  Bug01Icon,
  CleaningBucketIcon,
  ElectricWireIcon,
  PaintBrush01Icon,
  PipelineIcon,
  RefrigeratorIcon,
  Sofa01Icon,
  Wrench01Icon,
} from '@hugeicons/react';

/**
 * iléSure Home Services – Service Category Definitions
 *
 * These categories will power the V2 Services tab, launched alongside the native
 * mobile app. All items here are "Coming Soon" scaffolds. When V2 ships:
 *
 *  1. Backend: Create /api/v1/services/* routes:
 *     - GET  /services/categories           → list all active categories
 *     - GET  /services/:categoryId/providers → paginated provider cards
 *     - GET  /services/providers/:id         → full ServiceProviderProfile
 *     - POST /services/bookings              → initiate booking with escrow
 *     - POST /services/bookings/:id/review   → submit review after completion
 *     - POST /services/providers/:id/report  → flag a provider
 *
 *  2. Data model (Mongoose):
 *     - ServiceProvider: { name, phone, email, services[], basePrice, priceUnit,
 *       portfolio[], rating, reviewCount, verified, available, locationArea }
 *     - ServiceBooking:  { userId, providerId, categoryId, scheduledAt, status,
 *       price, escrowRef, review?: { rating, comment } }
 *
 *  3. Frontend: Replace empty states in Services.tsx with real ServiceCard grids
 *     by hydrating from the API and removing isComingSoon guards.
 *
 *  4. Push: Notify users of booking confirmations and status changes via the
 *     existing listingNotificationService pattern.
 */

export interface ServiceCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Wrench01Icon;
  /** Example price label shown in empty state cards */
  examplePriceLabel: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'electrician',
    label: 'Electrician',
    description: 'Wiring, fuse boxes, socket installation & electrical faults',
    icon: ElectricWireIcon,
    examplePriceLabel: 'From ₦5,000',
  },
  {
    id: 'plumber',
    label: 'Plumber',
    description: 'Pipe repairs, drainage, water heaters & faucet installation',
    icon: PipelineIcon,
    examplePriceLabel: 'From ₦4,000',
  },
  {
    id: 'carpenter',
    label: 'Carpenter',
    description: 'Furniture assembly, door fitting, shelving & woodwork repairs',
    icon: Wrench01Icon,
    examplePriceLabel: 'From ₦6,000',
  },
  {
    id: 'painter',
    label: 'Painter',
    description: 'Interior & exterior painting, touch-ups & surface prep',
    icon: PaintBrush01Icon,
    examplePriceLabel: 'From ₦8,000',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    description: 'Deep cleaning, move-in/out cleaning & regular housekeeping',
    icon: CleaningBucketIcon,
    examplePriceLabel: 'From ₦5,000',
  },
  {
    id: 'fumigation',
    label: 'Fumigation',
    description: 'Pest control, bedbugs, cockroaches & rodent extermination',
    icon: Bug01Icon,
    examplePriceLabel: 'From ₦10,000',
  },
  {
    id: 'furnishing',
    label: 'Furnishing',
    description: 'Interior styling, furniture sourcing & full room setup',
    icon: Sofa01Icon,
    examplePriceLabel: 'From ₦20,000',
  },
  {
    id: 'appliances',
    label: 'AC & Appliances',
    description: 'Air conditioner servicing, fridge, washing machine repairs',
    icon: RefrigeratorIcon,
    examplePriceLabel: 'From ₦7,000',
  },
];

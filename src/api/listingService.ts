import { apiClient } from './client';
import type {
  PropertyType,
  DistanceBucket,
  Furnishing,
  PowerSource,
  WaterSource,
  GenderRestriction,
} from '../constants/listingVocabulary';

export interface ShortletRate {
  id: string;
  label: string;
  durationValue: number;
  durationUnit: 'hour' | 'day' | 'week' | 'month';
  price: number;
}

export interface Listing {
  _id: string;
  id: string;
  // Owner fields may arrive as an id string or a populated object depending on the endpoint.
  landlordId: any;
  agentId?: any;
  companyId?: any;
  agentName?: string;
  companyName?: string;
  title: string;
  description: string;
  rentAnnual: number;
  areaCluster: string;
  distanceBucket: string;
  distance?: string;
  furnishing: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  power: 'constant' | 'gen_dependent' | 'solar_backed' | 'hybrid';
  water: 'borehole' | 'public' | 'tank';
  maxOccupants: number;
  genderRestriction: 'any' | 'male_only' | 'female_only' | 'mixed';
  gender?: 'any' | 'male_only' | 'female_only' | 'mixed';
  status: 'pending_approval' | 'active' | 'needs_roommate' | 'fully_booked' | 'archived' | 'rejected';
  images: string[];
  address?: string;
  city?: string;
  landmark?: string;
  price?: number;
  apartmentType?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: any[];
  paymentFrequency?: string;
  customPaymentPlan?: {
    installments: number;
    interval: string;
    amountPerInstallment: number;
  };
  agent?: any;
  shortletPricing?: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  shortletRates?: ShortletRate[];
  rules?: string[];
  additionalNotes?: string;
  inspectionAvailability?: {
    availableDays?: string[];
    timeSlots?: string[];
    notes?: string;
  };
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  studentsOnly?: boolean;
  createdAt: string;
  /** Metres from the search point. Present only on a proximity search. */
  distanceMeters?: number;
  interestCount?: number;
  views?: number;
  saves?: number;
}

/**
 * Mirrors the query parameters `GET /listings` actually reads. The names used to
 * be this client's own invention (`distance`, `apartmentType`) and were silently
 * ignored by the server; they now match the API exactly. Enumerated fields take
 * arrays of canonical values (see constants/listingVocabulary) and are sent
 * comma-separated.
 */
export interface ListingFilter {
  /** Free-text search across title, description, address, city, area, landmark. */
  q?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType[];
  distanceBucket?: DistanceBucket[];
  furnishing?: Furnishing[];
  power?: PowerSource[];
  water?: WaterSource[];
  gender?: GenderRestriction[];
  areaCluster?: string;
  shareable?: boolean;
  needsRoommate?: boolean;
  /** Hide properties the lister restricted to students. */
  excludeStudentsOnly?: boolean;
  agentId?: string;
  /** Seeded landmark name or short name, e.g. 'UI'. Uses the landmark's own radius. */
  landmark?: string;
  /** Proximity search around an explicit point. Latitude / longitude in degrees. */
  nearLat?: number;
  nearLng?: number;
  /** Radius in metres. Clamped server-side to 100m-50km. */
  maxDistance?: number;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  rentAnnual: number;
  areaCluster: string;
  distanceBucket: string;
  furnishing: string;
  power: string;
  water: string;
  maxOccupants: number;
  genderRestriction: string;
  images: string[];
  inspectionAvailability?: {
    availableDays?: string[];
    timeSlots?: string[];
    notes?: string;
  };
}

export interface ListingResponse {
  success: boolean;
  data: {
    listings: Listing[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface InquiriesResponse {
  success: boolean;
  data: {
    inquiries: any[];
  };
}

export const listingService = {
  async getListings(
    filters?: ListingFilter,
    page = 1,
    limit = 20
  ): Promise<{listings: Listing[], total: number, page: number, limit: number}> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.q?.trim()) params.append('q', filters.q.trim());
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.propertyType?.length) params.append('propertyType', filters.propertyType.join(','));
      if (filters.distanceBucket?.length) params.append('distanceBucket', filters.distanceBucket.join(','));
      if (filters.furnishing?.length) params.append('furnishing', filters.furnishing.join(','));
      if (filters.power?.length) params.append('power', filters.power.join(','));
      if (filters.water?.length) params.append('water', filters.water.join(','));
      if (filters.gender?.length) params.append('gender', filters.gender.join(','));
      if (filters.areaCluster) params.append('areaCluster', filters.areaCluster);
      if (filters.shareable) params.append('shareable', 'true');
      if (filters.needsRoommate) params.append('needsRoommate', 'true');
      if (filters.excludeStudentsOnly) params.append('excludeStudentsOnly', 'true');
      if (filters.agentId) params.append('agentId', filters.agentId);
      if (filters.landmark) params.append('landmark', filters.landmark);
      if (filters.nearLat !== undefined && filters.nearLng !== undefined) {
        params.append('nearLat', filters.nearLat.toString());
        params.append('nearLng', filters.nearLng.toString());
      }
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
    }

    const response = await apiClient.get<any>(`/listings?${params.toString()}`);
    const result = response.data;
    return {
      listings: result.listings || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 20
    };
   },

  async getListingById(id: string): Promise<Listing> {
    const response = await apiClient.get<{ success: boolean; data: Listing }>(`/listings/${id}`);
    return response.data.data;
  },

  async createListing(data: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<{ success: boolean; data: Listing }>('/listings', data);
    return response.data.data;
  },

  async updateListing(id: string, data: Partial<CreateListingRequest>): Promise<Listing> {
    const response = await apiClient.put<{ success: boolean; data: Listing }>(`/listings/${id}`, data);
    return response.data.data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  async uploadImages(listingId: string, images: FormData): Promise<string[]> {
    const response = await apiClient.post<{ success: boolean; data: string[] }>(`/listings/${listingId}/images`, images, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return response.data.data;
  },

  async registerInterest(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/interest`);
  },

  async saveListing(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/save`);
  },

  async unsaveListing(listingId: string): Promise<void> {
    await apiClient.delete(`/listings/${listingId}/save`);
  },

  async getSavedListings(): Promise<any> {
    const response = await apiClient.get(`/users/me/saved`);
    return response.data;
  },

  async expressInterest(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/interest`);
  },

  async submitInquiry(listingId: string, question: string): Promise<void> {
    await apiClient.post(`/inquiries`, { listingId, question });
  },

  async reportListing(listingId: string, reason: string, description: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/report`, { reason, description });
  },

  async getInquiries(listingId: string): Promise<InquiriesResponse> {
    const response = await apiClient.get<InquiriesResponse>(`/inquiries?listingId=${listingId}`);
    return response.data;
  },

  async markOccupied(listingId: string): Promise<void> {
    await apiClient.put(`/agent/listings/${listingId}/mark-occupied`);
  },

  };


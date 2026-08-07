import { apiClient } from './client';

export interface Listing {
  _id: string;
  id: string;
  landlordId: string;
  title: string;
  description: string;
  rentAnnual: number;
  areaCluster: string;
  distanceBucket: string;
  distance?: string;
  furnishing: 'fully_furnished' | 'semi-furnished' | 'unfurnished' | 'furnished' | 'semifurnished';
  power: 'constant' | 'gen-dependent' | 'solar-backed' | 'phcn' | 'generator' | 'solar' | 'hybrid';
  water: 'borehole' | 'public' | 'tank';
  maxOccupants: number;
  genderRestriction: 'any' | 'male_only' | 'female_only' | 'mixed' | 'male' | 'female';
  gender?: 'any' | 'male_only' | 'female_only' | 'mixed' | 'male' | 'female';
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
  interestCount?: number;
  views?: number;
  saves?: number;
}

export interface ListingFilter {
  priceMin?: number;
  priceMax?: number;
  distance?: string[];
  apartmentType?: string[];
  roomSharing?: 'private' | 'shared' | 'any';
  furnishing?: 'fully_furnished' | 'semi-furnished' | 'unfurnished' | 'furnished' | 'semifurnished' | 'any';
  power?: 'constant' | 'gen-dependent' | 'solar-backed' | 'phcn' | 'generator' | 'solar' | 'hybrid';
  water?: 'borehole' | 'public' | 'tank';
  gender?: 'any' | 'male_only' | 'female_only' | 'mixed';
  agentId?: string;
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
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.distance?.length) params.append('distance', filters.distance.join(','));
      if (filters.apartmentType?.length) params.append('apartmentType', filters.apartmentType.join(','));
      if (filters.furnishing) params.append('furnishing', filters.furnishing);
      if (filters.power) params.append('power', filters.power);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.agentId) params.append('agentId', filters.agentId);
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


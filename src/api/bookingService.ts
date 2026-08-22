import { apiClient } from './client';
import type { ShortletRate } from './listingService';


// ── Types ──────────────────────────────────────────────────────────────────────

export interface RentPeriod {
  index: number;
  label: string;
  dueDate: string;
  amount: number;
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
  paidAt?: string;
}

export interface NextRentDue {
  index: number;
  label: string;
  dueDate: string;
  amount: number;
  status: 'due' | 'overdue' | 'upcoming';
  payable: boolean;
  daysUntilDue: number;
}

export interface Booking {
  id: string;
  listingId: {
    _id: string;
    title: string;
    images: string[];
    rentAnnual: number;
    areaCluster: string;
    propertyType?: string;
    paymentFrequency?: string;
    customPaymentPlan?: { installments: number; interval: string; amountPerInstallment: number };
    shortletPricing?: {
      hourly?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    minStay?: number;
    minStayUnit?: string;
    maxStay?: number;
    maxStayUnit?: string;
  };
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  moveInDate: string;
  duration: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  durationQuantity?: number;
  durationUnit?: string;
  shortletPricingUsed?: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  installmentsPaid?: number;
  totalInstallments?: number;
  nextDueDate?: string;
  rentPeriods?: RentPeriod[];
  nextRentDue?: NextRentDue | null;
  leaseStartDate?: string;
  leaseEndDate?: string;
  timelineStep?: number;
  inspectionDate?: string;
  inspectionTime?: string;
  inspectorName?: string;
  inspectionStatus?: 'pending' | 'scheduled' | 'completed' | 'missed';
  isVerified?: boolean;
}

export interface CreateBookingRequest {
  listingId: string;
  moveInDate: string;
  duration: string;
  message?: string;
  requiresRoommate?: boolean;
  durationQuantity?: number;
  durationUnit?: 'hour' | 'day' | 'week' | 'month';
  rateId?: string;
  rateQuantity?: number;
}

export interface BookingSummaryResponse {
  success: boolean;
  data: {
    listingId: string;
    propertyType: string;
    title: string;
    rentAmount: number;
    cautionFee: number;
    agencyFee: number;
    platformFee: number;
    roommateMatchingFee: number;
    total: number;
    paymentFrequency?: string;
    customPaymentPlan?: { installments: number; interval: string; amountPerInstallment: number };
    perPeriodCost?: number;
    isShortlet: boolean;
    isShareable: boolean;
    wantsRoommate: boolean;
    durationLabel?: string;
    selectedRate?: ShortletRate;
    rateQuantity?: number;
    shortletRates?: ShortletRate[];
  };
}

export interface BookingListResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface MyApartmentsResponse {
  success: boolean;
  data: {
    currentAndPrevious: Booking[];
    booked: Booking[];
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const bookingService = {
  /** Get the current user's bookings (student) */
  async getMyBookings(
    status?: string,
    page = 1,
    limit = 20
  ): Promise<BookingListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await apiClient.get<BookingListResponse>(`/bookings?${params}`);
    return response.data;
  },

  /** Get current user's apartments grouped by status */
  async getMyApartments(): Promise<MyApartmentsResponse> {
    const response = await apiClient.get<MyApartmentsResponse>('/bookings/my-apartments');
    return response.data;
  },

  /** Get a single booking by ID */
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get<{ success: boolean; data: Booking }>(`/bookings/${id}`);
    return response.data.data;
  },

  /** Get booking fee summary (no DB write) */
  async getBookingSummary(data: { listingId: string; durationQuantity?: number; durationUnit?: string; requiresRoommate?: boolean; rateId?: string; rateQuantity?: number }): Promise<BookingSummaryResponse> {
    const response = await apiClient.post<BookingSummaryResponse>('/bookings/summary', data);
    return response.data;
  },

  /** Create a booking request */
  async createBooking(data: CreateBookingRequest): Promise<{ success: boolean; data: Booking; message: string }> {
    const response = await apiClient.post<{ success: boolean; data: Booking; message: string }>('/bookings', data);
    return response.data;
  },

  /** Cancel a booking */
  async cancelBooking(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<{ success: boolean; message: string }>(`/bookings/${id}/cancel`);
    return response.data;
  },

  /** Initiate Paystack payment for a confirmed booking (5% of rentAnnual) */
  async payForBooking(id: string): Promise<{
    success: boolean;
    data: {
      authorizationUrl: string;
      accessCode: string;
      reference: string;
      amount: number;
    };
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        authorizationUrl: string;
        accessCode: string;
        reference: string;
        amount: number;
      };
      message: string;
    }>(`/bookings/${id}/pay`, {
      callbackUrl: window.location.origin + '/payment/callback'
    });
    return response.data;
  },

  /** Initiate Paystack payment for a yearly rent renewal period */
  async payForPeriod(bookingId: string, periodIndex: number): Promise<{
    success: boolean;
    data: {
      authorizationUrl: string;
      reference: string;
      amount: number;
      periodIndex: number;
    };
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        authorizationUrl: string;
        reference: string;
        amount: number;
        periodIndex: number;
      };
      message: string;
    }>(`/bookings/${bookingId}/pay-period`, {
      periodIndex,
      callbackUrl: window.location.origin + '/payment/callback'
    });
    return response.data;
  },

  // ── Timeline & Inspection ──────────────────────────────────────────────────

  /** Schedule an inspection for a booking */
  async scheduleInspection(id: string, data: { inspectionDate: string; inspectionTime: string; inspectorName: string }): Promise<{ success: boolean; data: Booking }> {
    const response = await apiClient.post<{ success: boolean; data: Booking }>(`/bookings/${id}/inspection`, data);
    return response.data;
  },

  /** Verify an inspection for a booking */
  async verifyInspection(id: string, isVerified: boolean): Promise<{ success: boolean; data: Booking }> {
    const response = await apiClient.post<{ success: boolean; data: Booking }>(`/bookings/${id}/verify-inspection`, { isVerified });
    return response.data;
  },

  // ── Landlord / Agent ─────────────────────────────────────────────────────────

  /** Get bookings for the agent's listings */
  async getAgentBookings(
    status?: string,
    page = 1,
    limit = 20
  ): Promise<BookingListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await apiClient.get<BookingListResponse>(`/agent/bookings?${params}`);
    return response.data;
  },

  /** Agent: update a booking status (confirm / reject / complete) */
  async updateBookingStatus(
    listingId: string,
    bookingId: string,
    status: 'confirmed' | 'rejected' | 'completed'
  ): Promise<{ success: boolean; data: Booking; message: string }> {
    const response = await apiClient.patch<{ success: boolean; data: Booking; message: string }>(
      `/listings/${listingId}/bookings/${bookingId}/status`,
      { status }
    );
    return response.data;
  },
};

export default bookingService;

import { apiClient } from './client';


// ── Types ──────────────────────────────────────────────────────────────────────

export interface SharedBookingParticipant {
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  } | string;
  amountDue: number;
  amountPaid: number;
  status: 'pending' | 'paid';
  paystackReference?: string;
  paidAt?: string;
}

export interface SharedBooking {
  _id: string;
  listingId: {
    _id: string;
    title: string;
    images: string[];
    rentAnnual: number;
    areaCluster: string;
    address?: string;
    propertyType: string;
    maxOccupants: number;
    costPerSlot?: number;
  };
  roommateRequestId: {
    _id: string;
    status: string;
    connectedAt?: string;
  };
  totalRequired: number;
  totalPaid: number;
  status: 'pending_payment' | 'partially_paid' | 'fully_paid' | 'confirmed' | 'expired' | 'refunded';
  participants: SharedBookingParticipant[];
  paymentDeadline: string;
  confirmedAt?: string;
  createdAt: string;
}

export interface SharedBookingListResponse {
  success: boolean;
  data: {
    bookings: SharedBooking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const sharedBookingService = {
  /** Create a shared booking from a mutual match */
  async createSharedBooking(
    roommateRequestId: string
  ): Promise<{ success: boolean; data: SharedBooking; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: SharedBooking;
      message: string;
    }>('/shared-bookings', { roommateRequestId });
    return response.data;
  },

  /** Get a single shared booking by ID */
  async getSharedBooking(id: string): Promise<{ success: boolean; data: SharedBooking }> {
    const response = await apiClient.get<{ success: boolean; data: SharedBooking }>(
      `/shared-bookings/${id}`
    );
    return response.data;
  },

  /** Get current user's shared bookings */
  async getMySharedBookings(
    status?: string,
    page = 1,
    limit = 20
  ): Promise<SharedBookingListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await apiClient.get<SharedBookingListResponse>(
      `/shared-bookings/my?${params}`
    );
    return response.data;
  },

  /** Initiate Paystack payment for your share */
  async payForSharedBooking(
    id: string
  ): Promise<{
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
    }>(`/shared-bookings/${id}/pay`, {
      callbackUrl: window.location.origin + '/payment/callback',
    });
    return response.data;
  },

  /** Cancel a shared booking */
  async cancelSharedBooking(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/shared-bookings/${id}/cancel`
    );
    return response.data;
  },
};

export default sharedBookingService;

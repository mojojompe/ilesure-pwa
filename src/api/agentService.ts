import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AgentDashboardOverview {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  monthlyRevenue: number;
}

export interface AgentListingPreview {
  _id: string;
  id: string;
  title: string;
  status: string;
  rentAnnual: number;
  images: string[];
  areaCluster: string;
  interestCount: number;
  createdAt: string;
}

export interface AgentDashboardResponse {
  success: boolean;
  data: {
    overview: AgentDashboardOverview;
    recentListings: AgentListingPreview[];
    recentBookings: any[];
  };
}

export interface AgentListingsResponse {
  success: boolean;
  data: {
    listings: AgentListingPreview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export interface AgentAnalytics {
  totalViews: number;
  totalSaves: number;
  totalInquiries: number;
  totalBookings: number;
  conversionRate: number;
  viewsTrend: any[];
  topListings: any[];
}

// ── Service ────────────────────────────────────────────────────────────────────

export interface AgentSubaccountInfo {
  subaccountCode: string | null;
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankName?: string | null;
}

export const agentService = {
  /** Get agent/landlord dashboard overview */
  async getDashboard(): Promise<AgentDashboardResponse> {
    const response = await apiClient.get<AgentDashboardResponse>('/agent/dashboard');
    return response.data;
  },

  /** Get all listings for the agent/landlord (paginated, filterable) */
  async getMyListings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<AgentListingsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const response = await apiClient.get<AgentListingsResponse>(`/agent/listings?${query}`);
    return response.data;
  },

  /** Get analytics for the agent's listings */
  async getAnalytics(): Promise<{ success: boolean; data: AgentAnalytics }> {
    const response = await apiClient.get<{ success: boolean; data: AgentAnalytics }>('/agent/analytics');
    return response.data;
  },

  /** Get inquiries for the agent (all or for a specific listing) */
  async getInquiries(listingId?: string): Promise<any> {
    const url = listingId ? `/agent/inquiries?listingId=${listingId}` : '/agent/inquiries';
    const response = await apiClient.get<any>(url);
    return response.data;
  },

  /** Reply to a specific inquiry */
  async replyToInquiry(inquiryId: string, reply: string): Promise<any> {
    const response = await apiClient.post<any>(`/agent/inquiries/${inquiryId}/reply`, { reply });
    return response.data;
  },

  /** Update listing status */
  async updateListingStatus(listingId: string, status: string): Promise<any> {
    const response = await apiClient.patch<any>(`/agent/listings/${listingId}/status`, { status });
    return response.data;
  },

  /** Update inquiry status (mark as read/unread) */
  async updateInquiryStatus(inquiryId: string, status: 'read' | 'unread'): Promise<any> {
    const response = await apiClient.patch<any>(`/agent/inquiries/${inquiryId}/status`, { status });
    return response.data;
  },

  /** Get agent's subaccount info */
  async getSubaccount(): Promise<{ success: boolean; data?: AgentSubaccountInfo; error?: { message: string } }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AgentSubaccountInfo }>('/agent/subaccount');
      return response.data;
    } catch { return { success: false, error: { message: 'Failed to fetch subaccount' } }; }
  },

  /** Setup or update agent's subaccount */
  async setupSubaccount(params: { businessName: string; bankCode: string; accountNumber: string; accountName: string }): Promise<{ success: boolean; data?: AgentSubaccountInfo }> {
    const response = await apiClient.post<{ success: boolean; data: AgentSubaccountInfo }>('/agent/subaccount', params);
    return response.data;
  },
};

export default agentService;

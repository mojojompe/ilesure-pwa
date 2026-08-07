import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CompanyOverview {
  totalListings: number;
  activeListings: number;
  totalAgents: number;
  activeBookings: number;
  monthlyRevenue: number;
}

export interface CompanyPlan {
  name: string;
  billingCycle: string;
  slotUsage: { used: number; total: number; percentage: number };
}

export interface CompanyDashboardResponse {
  success: boolean;
  data: {
    overview: CompanyOverview;
    plan: CompanyPlan;
  };
}

export interface CompanyAgent {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  verificationStatus: string;
  status: string;
  createdAt: string;
}

export interface CompanyAgentsResponse {
  success: boolean;
  data: {
    agents: CompanyAgent[];
    pagination: { currentPage: number; totalPages: number; totalItems: number };
  };
}

export interface CompanyAnalytics {
  totalViews: number;
  totalSaves: number;
  totalInquiries: number;
  totalBookings: number;
  conversionRate: number;
}

// ── Service ────────────────────────────────────────────────────────────────────

export interface CompanySubaccountInfo {
  subaccountCode: string | null;
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankName?: string | null;
}

export const companyService = {
  /** Get company dashboard (overview + plan) */
  async getDashboard(): Promise<CompanyDashboardResponse> {
    const response = await apiClient.get<CompanyDashboardResponse>('/company/dashboard');
    return response.data;
  },

  /** Get all listings for the company */
  async getListings(page = 1, limit = 20): Promise<any> {
    const response = await apiClient.get<any>(`/company/listings?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Get the company's agents (team) */
  async getAgents(page = 1, limit = 20): Promise<CompanyAgentsResponse> {
    const response = await apiClient.get<CompanyAgentsResponse>(`/company/agents?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Get company analytics */
  async getAnalytics(): Promise<{ success: boolean; data: CompanyAnalytics }> {
    const response = await apiClient.get<{ success: boolean; data: CompanyAnalytics }>('/company/analytics');
    return response.data;
  },

  /** Get company bookings */
  async getBookings(page = 1, limit = 20): Promise<any> {
    const response = await apiClient.get<any>(`/company/bookings?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Get company profile */
  async getProfile(): Promise<any> {
    const response = await apiClient.get<any>('/company/profile');
    return response.data;
  },

  /** Update company profile */
  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.put<any>('/company/profile', data);
    return response.data;
  },

  /** Invite a new agent */
  async inviteAgent(email: string, fullName: string, phone?: string): Promise<any> {
    const response = await apiClient.post<any>('/company/agents/invite', { email, fullName, phone });
    return response.data;
  },

  /** Remove an agent */
  async removeAgent(agentId: string): Promise<any> {
    const response = await apiClient.delete<any>(`/company/agents/${agentId}`);
    return response.data;
  },

  /** Update an agent */
  async updateAgent(agentId: string, data: any): Promise<any> {
    const response = await apiClient.put<any>(`/company/agents/${agentId}`, data);
    return response.data;
  },

  /** Get company inquiries */
  async getInquiries(page = 1, limit = 20): Promise<any> {
    const response = await apiClient.get<any>(`/company/inquiries?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Reply to an inquiry */
  async replyToInquiry(inquiryId: string, reply: string): Promise<any> {
    const response = await apiClient.post<any>(`/company/inquiries/${inquiryId}/reply`, { reply });
    return response.data;
  },

  /** Get company's subaccount info */
  async getSubaccount(): Promise<{ success: boolean; data?: CompanySubaccountInfo; error?: { message: string } }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CompanySubaccountInfo }>('/company/subaccount');
      return response.data;
    } catch { return { success: false, error: { message: 'Failed to fetch subaccount' } }; }
  },

  /** Setup or update company's subaccount */
  async setupSubaccount(params: { businessName: string; bankCode: string; accountNumber: string; accountName: string }): Promise<{ success: boolean; data?: CompanySubaccountInfo }> {
    const response = await apiClient.post<{ success: boolean; data: CompanySubaccountInfo }>('/company/subaccount', params);
    return response.data;
  },
};

export default companyService;

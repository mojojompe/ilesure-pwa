import { apiClient } from './client';

export interface WaitlistEntry {
  id: string;
  userId: string;
  budgetMin: number;
  budgetMax: number;
  preferredCorridor: string;
  moveInDate: string;
  roommateNeeded: boolean;
  distancePreference: string;
  contactPreference: 'call' | 'whatsapp' | 'email';
  createdAt: string;
}

export interface CreateWaitlistRequest {
  budgetMin: number;
  budgetMax: number;
  preferredCorridor: string;
  moveInDate: string;
  roommateNeeded: boolean;
  distancePreference: string;
  contactPreference: 'call' | 'whatsapp' | 'email';
}

export interface WaitlistResponse {
  entries: WaitlistEntry[];
  total: number;
}

export const waitlistService = {
  async joinWaitlist(data: CreateWaitlistRequest): Promise<WaitlistEntry> {
    const response = await apiClient.post<{ success: boolean; data: WaitlistEntry; message: string }>('/waitlist', data);
    return response.data.data;
  },

  async getMyWaitlist(): Promise<WaitlistEntry[]> {
    const response = await apiClient.get<{ success: boolean; data: WaitlistEntry[] }>('/waitlist/me');
    return response.data.data;
  },

  async updateWaitlist(id: string, data: Partial<CreateWaitlistRequest>): Promise<WaitlistEntry> {
    const response = await apiClient.put<{ success: boolean; data: WaitlistEntry; message: string }>(`/waitlist/${id}`, data);
    return response.data.data;
  },

  async deleteWaitlist(id: string): Promise<void> {
    await apiClient.delete(`/waitlist/${id}`);
  },

  async getAllWaitlist(): Promise<WaitlistEntry[]> {
    const response = await apiClient.get<{ success: boolean; data: WaitlistEntry[] }>('/waitlist/me');
    return response.data.data;
  },

  async getDemandInsights(): Promise<{
    highestDemandPriceBands: { min: number; max: number; count: number }[];
    mostRequestedCorridors: { corridor: string; count: number }[];
    underservedDistanceBuckets: string[];
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        highestDemandPriceBands: { min: number; max: number; count: number }[];
        mostRequestedCorridors: { corridor: string; count: number }[];
        underservedDistanceBuckets: string[];
      };
    }>('/waitlist/demand-insights');
    return response.data.data;
  },
};

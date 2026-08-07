import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  fullName?: string;
  gender?: 'male' | 'female';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  gender?: 'male' | 'female';
  avatar?: string;
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'more_info';
  createdAt: string;
}

export interface SavedListingsResponse {
  success: boolean;
  data: {
    listings: any[];
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const userService = {
  /** Get the current user's full profile */
  async getMyProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>('/users/me');
    return response.data;
  },

  /** Update profile (fullName, gender) */
  async updateMyProfile(
    data: UpdateProfileRequest
  ): Promise<{ success: boolean; data: UserProfile; message: string }> {
    const response = await apiClient.put<{ success: boolean; data: UserProfile; message: string }>(
      '/users/me',
      data
    );
    return response.data;
  },

  /**
   * Upload a new avatar image.
   * Pass a FormData object with the image file under the key "avatar".
   */
  async uploadAvatar(formData: FormData): Promise<{ success: boolean; data: { avatar: string }; message: string }> {
    const response = await apiClient.post<{ success: boolean; data: { avatar: string }; message: string }>(
      '/users/me/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /** Get the current user's saved listings */
  async getSavedListings(): Promise<SavedListingsResponse> {
    const response = await apiClient.get<SavedListingsResponse>('/users/me/saved');
    return response.data;
  },

  /** Get a specific user by ID (public profile) */
  async getUserById(userId: string): Promise<{ success: boolean; data: Partial<UserProfile> }> {
    const response = await apiClient.get<{ success: boolean; data: Partial<UserProfile> }>(`/users/${userId}`);
    return response.data;
  },

  /** Get reviews for an agent */
  async getAgentReviews(agentId: string, page = 1, limit = 10): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/agents/${agentId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Submit a review for an agent */
  async submitAgentReview(agentId: string, rating: number, comment: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/agents/${agentId}/reviews`, { rating, comment });
    return response.data;
  },

  /** Report an agent */
  async reportAgent(agentId: string, type: string, description: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/agents/${agentId}/report`, { type, description });
    return response.data;
  },
};

export default userService;

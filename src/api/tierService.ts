import { apiClient } from './client';


// ── Types ──────────────────────────────────────────────────────────────────────

export interface Tier {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  billingCycle: string;
  features: {
    maxListings: number;
    analytics: string;
    support: string;
    visibility?: string;
  };
  popular?: boolean;
}

export interface TiersResponse {
  success: boolean;
  data: { tiers: Tier[] };
}

export interface MyTierResponse {
  success: boolean;
  data: {
    tierId: string;
    name: string;
    expiresAt: string | null;
    listingsUsed: number;
    listingsLimit: number;
  };
}

export interface SelectTierResponse {
  success: boolean;
  data: {
    authorizationUrl: string;
    reference: string;
  };
  message: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const tierService = {
  /** Get all available subscription tiers */
  async getTiers(): Promise<TiersResponse> {
    const response = await apiClient.get<TiersResponse>('/tiers');
    return response.data;
  },

  /** Get the current user's active tier */
  async getMyTier(): Promise<MyTierResponse> {
    const response = await apiClient.get<MyTierResponse>('/tiers/me');
    return response.data;
  },

  /**
   * Initiate tier selection (returns Paystack checkout URL).
   * The mobile app should open this URL via WebBrowser or Linking.
   */
  async selectTier(tierId: string, billingCycle = 'monthly'): Promise<SelectTierResponse> {
    const response = await apiClient.post<SelectTierResponse>('/tiers/select', {
      tierId,
      billingCycle,
    });
    return response.data;
  },
};

export default tierService;

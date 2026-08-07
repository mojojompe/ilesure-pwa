import { apiClient } from './client';

export interface RoommateProfile {
  _id: string;
  userId: string;
  listingId?: any;
  gender?: 'male' | 'female';
  lookingFor: 'room' | 'apartment' | 'house' | 'any';
  preferredAreaClusters: string[];
  budgetMin: number;
  budgetMax: number;
  preferredGender: 'any' | 'male' | 'female';
  maxOccupants: number;
  noiseTolerance: 'quiet' | 'moderate' | 'loud';
  cleanliness: 'relaxed' | 'moderate' | 'strict';
  sleepSchedule: 'early' | 'moderate' | 'night-owl';
  studySchedule: 'home' | 'mixed' | 'library';
  socialActivity: 'introvert' | 'balanced' | 'extrovert';
  guestComfort: 'no-guests' | 'occasional' | 'frequent';
  cookingFrequency: 'never' | 'weekly' | 'daily';
  smokingAlcohol: 'not-ok' | 'neutral' | 'ok';
  powerUsage: 'minimal' | 'moderate' | 'heavy';
  openness: number;
  religionImportance: number;
  preferredCleanliness?: string;
  preferredNoiseTolerance?: string;
  preferredSleepSchedule?: string;
  preferredSmokingAlcohol?: string;
  preferredGuestComfort?: string;
  preferredSocialActivity?: string;
  age?: number;
  bio?: string;
  courseOfStudy?: string;
  institution?: string;
}

export interface DimensionScore {
  label: string;
  yourValue: string;
  theirValue: string;
  match: boolean;
}

export interface MatchResult {
  userId: string;
  overallScore: number;
  confidence: number;
  categoryScores: { lifestyle: number; numeric: number; preference: number };
  strengths: string[];
  concerns: string[];
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
  user: { fullName: string; avatar?: string };
  listing?: {
    id: string;
    title: string;
    images: string[];
    rentAnnual: number;
    areaCluster: string;
    address?: string;
    city?: string;
    propertyType?: string;
  };
  profile: {
    bio?: string;
    courseOfStudy?: string;
    institution?: string;
    lookingFor?: string;
    preferredAreaClusters?: string[];
    budgetMin?: number;
    budgetMax?: number;
  };
  isInterested: boolean;
  contactReleasedAt?: string;
  dimensionScores?: DimensionScore[];
  requestStatus?: string;
  requestId?: string;
  isConnected?: boolean;
}

export interface MatchResponse {
  success: boolean;
  data: {
    matches: MatchResult[];
    total: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface MutualMatch {
  requestId: string;
  user: { _id: string; fullName: string; avatar?: string };
  connectedAt: string;
  status: string;
}

export const roommateService = {
  async createProfile(data: Partial<RoommateProfile>): Promise<any> {
    const response = await apiClient.post('/roommate/profile', data);
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data: RoommateProfile | null }> {
    const response = await apiClient.get<{ success: boolean; data: RoommateProfile | null }>('/roommate/profile');
    return response.data;
  },

  async getProfileByUserId(userId: string): Promise<{ success: boolean; data: RoommateProfile | null }> {
    const response = await apiClient.get<{ success: boolean; data: RoommateProfile | null }>(`/roommate/profile/${userId}`);
    return response.data;
  },

  async updateProfile(data: Partial<RoommateProfile>): Promise<any> {
    const response = await apiClient.put('/roommate/profile', data);
    return response.data;
  },

  async getMatches(page = 1, limit = 20): Promise<MatchResponse> {
    const response = await apiClient.get<MatchResponse>(`/roommate/matches?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getMatchById(matchId: string): Promise<{ success: boolean; data: MatchResult }> {
    const response = await apiClient.get<{ success: boolean; data: MatchResult }>(`/roommate/matches/${matchId}`);
    return response.data;
  },

  async getMutualMatches(): Promise<{ success: boolean; data: MutualMatch[] }> {
    const response = await apiClient.get<{ success: boolean; data: MutualMatch[] }>('/roommate/matches/mutual');
    return response.data;
  },

  async expressInterest(matchId: string): Promise<{ success: boolean; data: { connected: boolean; message: string } }> {
    const response = await apiClient.post<{ success: boolean; data: { connected: boolean; message: string } }>(`/roommate/matches/${matchId}/interest`);
    return response.data;
  },

  async passOnMatch(matchId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/roommate/pass/${matchId}`);
    return response.data;
  },

  async getRequests(): Promise<any> {
    const response = await apiClient.get('/roommate/requests');
    return response.data;
  },

  async updateRequest(requestId: string, action: 'accept' | 'decline'): Promise<any> {
    const response = await apiClient.patch(`/roommate/requests/${requestId}`, { action });
    return response.data;
  },
};

export default roommateService;

import { apiClient } from './client';

export interface ChatSafetyScanResult {
  isSuspicious: boolean;
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
  flags: string[];
  reasons: string[];
  safetyAdvice?: string;
  detectedEntities?: {
    accountNumbers?: string[];
    phoneNumbers?: string[];
    fintechs?: string[];
  };
}

export interface PredatoryClauseFinding {
  title: string;
  clauseSnippet: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  legalContext: string;
}

export interface TenancyAnalysisResult {
  fairnessScore: number;
  fairnessGrade: 'student_friendly' | 'balanced' | 'caution_advised' | 'predatory';
  predatoryFindings: PredatoryClauseFinding[];
  summary: {
    rentAndPayments: string;
    cautionDepositAndRefund: string;
    maintenanceAndRepairs: string;
    noticeAndTermination: string;
    houseRulesAndRestrictions: string;
  };
  studentRightsHighlights: string[];
}

export interface CampusSearchResult {
  rawQuery: string;
  parsedFilters: {
    propertyType?: string;
    distanceBucket?: string;
    power?: string;
    water?: string;
    furnishing?: string;
    gender?: string;
    priceMin?: number;
    priceMax?: number;
    areaCluster?: string;
    q?: string;
  };
  campusDetected?: string;
  explanation: string;
  suggestedFollowUps: string[];
  execution?: {
    totalMatches: number;
    listings: any[];
  };
}

export interface RoommateCompatibilityResult {
  baseScore: number;
  recommendation: string;
  compatibilityNarrative: string;
  lifestyleSynergies: string[];
  potentialFrictions: string[];
  livingTogetherForecast: {
    studyRhythm: string;
    socialAndGuests: string;
    powerAndBills: string;
  };
  icebreakers: string[];
}

export interface CostOfLivingEstimate {
  listingId: string;
  title: string;
  areaCluster: string;
  annualRent: number;
  monthlyBaseRent: number;
  monthlyBreakdown: {
    rent: number;
    estimatedPowerAndFuel: number;
    estimatedCampusTransit: number;
    waterAndWasteService: number;
  };
  totalEstimatedMonthlyCost: number;
  totalEstimatedAnnualLivingCost: number;
  costSavingTips: string[];
}

export interface RentValuationResult {
  estimatedFairRentAnnual: number;
  fairRentRange: {
    min: number;
    max: number;
  };
  valuationVerdict?: 'undervalued' | 'fair' | 'premium' | 'overpriced';
  priceDifferencePercentage?: number;
  marketInsights: string[];
}

export const aiService = {
  /**
   * Real-time scan of a chat message for fraud, phishing, or off-platform payment attempts.
   */
  scanMessageSafety: async (text: string): Promise<ChatSafetyScanResult> => {
    const res = await apiClient.post<ChatSafetyScanResult>('/ai/safety/scan-message', { text });
    return res.data;
  },

  /**
   * Plain-English student summary and predatory clause detection for tenancy agreements.
   */
  analyzeContract: async (params: { contractText?: string; listingId?: string }): Promise<TenancyAnalysisResult> => {
    const res = await apiClient.post<TenancyAnalysisResult>('/ai/contracts/analyze', params);
    return res.data;
  },

  /**
   * Campus conversational search concierge.
   */
  searchCampusConcierge: async (query: string, execute = true, limit = 10): Promise<CampusSearchResult> => {
    const res = await apiClient.post<CampusSearchResult>('/ai/search/concierge', { query, execute, limit });
    return res.data;
  },

  /**
   * Roommate compatibility narrative, synergy breakdown, and icebreakers.
   */
  getRoommateCompatibility: async (targetUserId: string): Promise<RoommateCompatibilityResult> => {
    const res = await apiClient.get<RoommateCompatibilityResult>(`/ai/roommates/compatibility/${targetUserId}`);
    return res.data;
  },

  /**
   * Total student cost of living breakdown for a listing (Rent + Generator + Transit).
   */
  getListingCostOfLiving: async (listingId: string): Promise<CostOfLivingEstimate> => {
    const res = await apiClient.get<CostOfLivingEstimate>(`/ai/listings/${listingId}/cost-of-living`);
    return res.data;
  },

  /**
   * Fair market rent estimator for landlords/agents.
   */
  estimateFairRent: async (params: {
    propertyType: string;
    areaCluster?: string;
    distanceBucket?: string;
    power?: string;
    water?: string;
    furnishing?: string;
    actualRentAnnual?: number;
  }): Promise<RentValuationResult> => {
    const res = await apiClient.post<RentValuationResult>('/ai/listings/estimate-rent', params);
    return res.data;
  },
};

export default aiService;

import { apiClient } from './client';

export interface InitializeKYCResponse {
  success: boolean;
  data: {
    referenceId: string;
    widgetId: string;
    widgetUrl: string;
    html: string;
  };
}

export interface VerifyKYCResponse {
  success: boolean;
  data?: {
    ninVerified?: boolean;
    bvnVerified?: boolean;
    verificationStatus: string;
    nameMatch: boolean;
    ninVerifiedAt?: string;
    bvnVerifiedAt?: string;
    ninPhoto?: string;
    bvnPhoto?: string;
  };
  error?: {
    code: string;
    message: string;
  };
  message: string;
}

export interface KYCStatusResponse {
  success: boolean;
  data: {
    ninVerified: boolean;
    bvnVerified: boolean;
    verificationStatus: string;
    role: string;
    ninVerifiedAt?: string;
    bvnVerifiedAt?: string;
    ninPhoto?: string;
    bvnPhoto?: string;
  };
}

export interface KYCSyncResponse {
  success: boolean;
  data: {
    results: Record<string, { checked: boolean; synced?: boolean; status?: string; reason?: string }>;
    ninVerified: boolean;
    bvnVerified: boolean;
  };
}

export const kycService = {
  async initialize(type: 'nin' | 'bvn'): Promise<InitializeKYCResponse> {
    const response = await apiClient.post<InitializeKYCResponse>('/kyc/initialize', { type });
    return response.data;
  },

  async verify(referenceId: string, type: 'nin' | 'bvn'): Promise<VerifyKYCResponse> {
    const response = await apiClient.post<VerifyKYCResponse>('/kyc/verify', { referenceId, type });
    return response.data;
  },

  async getKYCStatus(): Promise<KYCStatusResponse> {
    const response = await apiClient.get<KYCStatusResponse>('/kyc/status');
    return response.data;
  },

  async sync(type?: 'nin' | 'bvn', referenceId?: string): Promise<KYCSyncResponse> {
    const body: any = {};
    if (type) body.type = type;
    if (referenceId) body.referenceId = referenceId;
    const response = await apiClient.post<KYCSyncResponse>('/kyc/sync', body);
    return response.data;
  },
};

export default kycService;

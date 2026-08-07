
import api from './client';

export type ContractType = 'PLATFORM_LISTING_AGREEMENT' | 'TENANCY_AGREEMENT';

// API Response interfaces
export interface PlatformDocumentResponse {
  success: boolean;
  data: {
    title: string;
    body: string;
  };
}

export interface SignPlatformAgreementResponse {
  success: boolean;
  data: {
    signedDocumentUrl: string;
    signatureImageUrl: string;
  };
  message: string;
}

export interface SignTenancyAgreementResponse {
  success: boolean;
  data: {
    signedDocumentUrl: string;
    fullyExecuted: boolean;
  };
  message: string;
}

export interface SignPlatformAgreementRequest {
  contractType: ContractType;
  signatureBase64: string;
}

export interface SignTenancyAgreementRequest {
  bookingId: string;
  signatureBase64: string;
  party: 'tenant' | 'landlord' | 'agent';
}

export interface GenerateTenancyAgreementRequest {
  bookingId: string;
}

export const contractService = {
  /**
   * Sign a platform agreement (Document 1 or 2)
   */
  async signPlatformAgreement(data: SignPlatformAgreementRequest): Promise<SignPlatformAgreementResponse> {
    const response = await api.post('/contracts/platform/sign', data);
    return response.data as SignPlatformAgreementResponse;
  },

  /**
   * Generate a tenancy agreement for a booking
   */
  async generateTenancyAgreement(data: GenerateTenancyAgreementRequest): Promise<any> {
    const response = await api.post('/contracts/tenancy/generate', data);
    return response.data;
  },

  /**
   * Sign a tenancy agreement
   */
  async signTenancyAgreement(data: SignTenancyAgreementRequest): Promise<SignTenancyAgreementResponse> {
    const response = await api.post('/contracts/tenancy/sign', data);
    return response.data as SignTenancyAgreementResponse;
  },

  /**
   * Get tenancy agreement status
   */
  async getTenancyAgreementStatus(bookingId: string): Promise<any> {
    const response = await api.get(`/contracts/${bookingId}/status`);
    return response.data;
  },

  /**
   * Get platform listing agreement text for display
   */
  async getPlatformDocument(contractType: ContractType = 'PLATFORM_LISTING_AGREEMENT'): Promise<PlatformDocumentResponse> {
    const response = await api.get(`/contracts/platform/document?contractType=${contractType}`);
    return response.data as PlatformDocumentResponse;
  },

  /**
   * Check user's contract signing status
   */
  async checkContractStatus(): Promise<any> {
    const response = await api.get('/contracts/status');
    return response.data;
  },

  /**
   * Get user's signed contract URL
   */
  async getUserContract(): Promise<{
    signedContractUrl: string;
    signedAt?: string;
    version?: string;
  }> {
    const response = await api.get('/contracts/user/contract');
    return response.data as any;
  },

  /**
   * Download signed contract (returns PDF directly)
   */
  async downloadContract(contractUrl?: string): Promise<void> {
    try {
      let url = contractUrl;
      
      if (!url) {
        const contractData = await this.getUserContract();
        url = contractData.signedContractUrl;
      }
      
      if (!url) {
        throw new Error('No signed contract found');
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = 'IleSure_Contract.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download error:', error);
      throw error;
    }
  },
};

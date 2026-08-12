import { apiClient } from './client';

export interface InitializePaymentRequest {
  // SECURITY-FIX (P-M1): `amount` removed from the client request. The charge amount is
  // derived and enforced by the backend from the tier/listing/booking — never trusted
  // from the client. The backend must reject any client-supplied amount.
  email: string;
  tier?: string;
  listingId?: string;
  bookingId?: string;
  paymentMethod?: 'card' | 'bank_transfer' | 'ussd';
}

export interface PaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  transactionId?: string;
  status: 'success' | 'failed' | 'pending';
  paymentId?: string;
  amount?: number;
  newTier?: string;
  reference?: string;
  paidAt?: string;
  type?: string;
  bookingId?: string;
  listingId?: string;
}

export interface PaymentSummary {
  payment: {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    reference?: string;
    paidAt?: string;
    createdAt: string;
  };
  listing: {
    id: string;
    title: string;
    description: string;
    images: string[];
    address?: string;
    city?: string;
    rentAnnual: number;
    propertyType: string;
    furnishing: string;
    power: string;
    water: string;
    maxOccupants: number;
    genderRestriction: string;
    cautionFee?: number;
    agencyFee?: number;
  } | null;
  agent: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
  } | null;
  company: {
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  reference?: string;
  paidAt?: string;
  listingTitle?: string;
  bookingId?: string;
  createdAt: string;
}

export interface BankInfo {
  name: string;
  code: string;
  slug: string;
  longcode: string;
}

export const paymentService = {
  async listBanks(): Promise<BankInfo[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BankInfo[] }>('/payments/banks');
      return response.data.data;
    } catch { return []; }
  },

  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> {
    const response = await apiClient.post<{ success: boolean; data: { accountNumber: string; accountName: string } }>(
      '/payments/resolve-account',
      { accountNumber, bankCode }
    );
    return response.data.data;
  },

  async initializePayment(request: InitializePaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<{ success: boolean; data: PaymentResponse }>('/payments/initialize', request);
    return response.data.data;
  },

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    const response = await apiClient.get<{ success: boolean; data: VerifyPaymentResponse }>(`/payments/verify?reference=${reference}`);
    return response.data.data;
  },

  async getHistory(page = 1, limit = 20, type?: string): Promise<{ transactions: Transaction[]; pagination: any }> {
    const response = await apiClient.get<{ success: boolean; data: { transactions: Transaction[]; pagination: any } }>(
      `/payments/history?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`
    );
    return response.data.data;
  },

  async getPaymentSummary(id: string): Promise<PaymentSummary> {
    const response = await apiClient.get<{ success: boolean; data: PaymentSummary }>(`/payments/${id}/summary`);
    return response.data.data;
  },
};

export default paymentService;

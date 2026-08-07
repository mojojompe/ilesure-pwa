import { apiClient } from './client';

export type UserRole = 'student' | 'landlord' | 'agent' | 'company' | 'company_admin' | 'sub_agent';

export interface LoginRequest {
  email: string;
  password: string;
  pushToken?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  selectedSchool?: string;
  companyName?: string;
  cacNumber?: string;
  pushToken?: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    status: 'active' | 'suspended' | 'pending';
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'more_info';
    companyId?: string;
    gender?: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
  onboardingRequired: boolean;
  nextStep?: string | null;
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  verified: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    status: 'active' | 'suspended' | 'pending';
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'more_info';
    companyId?: string;
    gender?: string;
    avatar?: string;
  };
}

export interface ResendOTPResponse {
  success: boolean;
  message?: string;
  expiresIn?: number;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  gender?: string;
  avatar?: string;
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'more_info';
  createdAt: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('[AuthService] POST /auth/login', data);
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    console.log('[AuthService] Response:', response.status, response.data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('[AuthService] POST /auth/register', { ...data, password: '***' });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      console.log('[AuthService] Register response status:', response.status);
      console.log('[AuthService] Register response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  async verifyOTP(otp: string, email: string): Promise<VerifyOTPResponse & { accessToken?: string; refreshToken?: string; user?: any }> {
    const response = await apiClient.post<VerifyOTPResponse & { accessToken?: string; refreshToken?: string; user?: any }>('/auth/verify-otp', { otp, email });
    return response.data;
  },

  async resendOTP(email: string): Promise<ResendOTPResponse> {
    const response = await apiClient.post<ResendOTPResponse>('/auth/resend-otp', { email });
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>('/users/me');
    return response.data;
  },

};

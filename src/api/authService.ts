import { apiClient } from './client';

export type UserRole = 'student' | 'individual' | 'landlord' | 'agent' | 'company' | 'company_admin' | 'sub_agent';

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
    // SECURITY-FIX: never log the login body (email/password) or the response
    // (accessToken/refreshToken). Plaintext credentials/tokens must not reach the
    // console or any telemetry that captures console output.
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // REMOVED: googleLogin(). It posted to POST /auth/google-login, which does not exist.
  // The backend implements Google sign-in as a REDIRECT flow — GET /auth/google/login,
  // returning via GET /auth/google/callback — so a POST of an id_token was never going
  // to work. Nothing called this; the only reference was a comment on the Login screen
  // describing an implementation that does not match the server. Removed so the next
  // person builds against the endpoint that is actually there.

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // SECURITY-FIX: do not log registration PII or the token-bearing response.
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
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

  /**
   * Verifies the password-reset code. Distinct from verifyOTP(), which the
   * backend scopes to email-verification codes only and which issues a session.
   */
  async verifyResetOTP(otp: string, email: string): Promise<{ success: boolean; verified?: boolean; message?: string }> {
    const response = await apiClient.post<{ success: boolean; verified?: boolean; message?: string }>('/auth/verify-reset-otp', { otp, email });
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

  /**
   * Redeem the single-use code from a Google redirect for a session.
   * The redirect no longer carries tokens — see authController.exchangeGoogleCode.
   */
  async exchangeGoogleCode(code: string): Promise<{
    success: boolean;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
    error?: { code?: string; message?: string };
  }> {
    try {
      const response = await apiClient.post<any>('/auth/google/exchange', { code });
      return response.data;
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.error || { message: 'Sign-in failed' } };
    }
  },

  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; data: UserProfile }> {
    // QA-AGT-004 (PWA variant): the backend routes PUT for this resource; PATCH returned 404,
    // so profile edits were never saved.
    const response = await apiClient.put<{ success: boolean; data: UserProfile }>('/users/me', data);
    return response.data;
  },
};

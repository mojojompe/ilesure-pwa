import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'individual' | 'landlord' | 'agent' | 'company' | 'company_admin' | 'sub_agent';
  status: 'active' | 'suspended' | 'pending';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'more_info';
  companyId?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  isVerified?: boolean;
  ninVerified?: boolean;
  bvnVerified?: boolean;
  selectedSchool?: string;
  hasCompletedCompatibilityForm?: boolean;
  hasSignedListingAgreement?: boolean;
  listingAgreementSignedAt?: string | null;
  hasAcceptedDisclaimer?: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  selectedSchool: string | null;
  acceptedDisclaimers: Record<string, boolean>;

  setUser: (user: User | null) => void;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  setSelectedSchool: (school: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasSeenOnboarding: false,
      selectedSchool: null,
      acceptedDisclaimers: {},

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken, isAuthenticated: !!token });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),

      setSelectedSchool: (selectedSchool) => set({ selectedSchool }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'ilesure_pwa_auth',
      storage: createJSONStorage(() => localStorage),
      // SECURITY-FIX: do NOT persist the refresh token into the localStorage blob. The
      // refresh token is now an httpOnly cookie (source of truth); persisting it in JS-
      // readable storage made it XSS-stealable and gave durable, renewable takeover that
      // survived logout. `refreshToken` still exists in in-memory state for the session
      // but is excluded from persistence here.
      // FLAG: the access token (`token`) is still persisted short-term so sessions
      // survive reload. It should be migrated to in-memory-only (or an httpOnly cookie)
      // in a follow-up; access tokens are short-lived which limits the exposure window.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
        selectedSchool: state.selectedSchool,
        acceptedDisclaimers: state.acceptedDisclaimers,
      }),
    }
  )
);

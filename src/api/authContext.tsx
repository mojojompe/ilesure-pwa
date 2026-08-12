import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { customAlert } from '../stores/alertStore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    // SECURITY-FIX (P-H3): the previous exact-match allowlist missed real logged-out
    // routes (/onboarding, /auth/choice, /auth/role, /auth/school,
    // /auth/forgot-password, /auth/otp) and listed non-existent ones
    // (/verify-otp, /reset-password), bouncing legitimate onboarding/registration/OTP/
    // forgot-password users to /login. Use prefix matching aligned with App.tsx routes.
    const path = location.pathname;
    const isPublicRoute =
      path === '/' ||
      path === '/login' ||
      path === '/register' ||
      path === '/onboarding' ||
      path.startsWith('/auth');

    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && isPublicRoute && user) {
        // DECISION (P-M2): the role read here comes from client-controlled storage and
        // is used ONLY to pick which UI shell to render (and to keep non-renter roles
        // out of the PWA). It is NOT an authorization boundary — the backend enforces
        // role/permission on every route and endpoint. A tampered local role can change
        // the UI but cannot grant access to protected data.
        // Only allow student and individual to access PWA routes
        if (user.role === 'student' || user.role === 'individual') {
          navigate('/discover', { replace: true });
        } else {
          // If a company/agent logged in on the PWA somehow, boot them out
          logout();
          customAlert('Agents and Companies must use the Web Portal.', 'Access Denied', 'error');
        }
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

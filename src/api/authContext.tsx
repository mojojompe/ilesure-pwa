import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

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
    const isPublicRoute = ['/login', '/register', '/auth', '/', '/verify-otp', '/reset-password'].includes(location.pathname);
    
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && isPublicRoute && user) {
        // Only allow student and individual to access PWA routes
        if (user.role === 'student' || user.role === 'individual') {
          navigate('/discover', { replace: true });
        } else {
          // If a company/agent logged in on the PWA somehow, boot them out
          logout();
          alert('Agents and Companies must use the Web Portal.');
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

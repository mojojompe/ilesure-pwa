import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { customAlert } from '../../stores/alertStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: ('student' | 'individual' | 'company' | 'agent')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, clearAuth } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    // Return a generic App shell skeleton while auth state is resolving
    return (
      <div className="flex h-screen w-full flex-col bg-background p-5 pt-12 space-y-4">
        <div className="w-3/4 h-10 bg-surfaceLight rounded-xl animate-pulse" />
        <div className="w-full h-32 bg-surfaceLight rounded-2xl animate-pulse" />
        <div className="w-full h-32 bg-surfaceLight rounded-2xl animate-pulse" />
        <div className="w-full h-32 bg-surfaceLight rounded-2xl animate-pulse" />
      </div>
    );
  }

  // 1. Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/choice" state={{ from: location }} replace />;
  }

  // 2. Check Role-Based Access Control (RBAC)
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Force log out unauthorized roles if they somehow access the PWA
    clearAuth();
    customAlert('Agents and Companies must use the Web Portal.', 'Access Denied', 'error');
    return <Navigate to="/auth/choice" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

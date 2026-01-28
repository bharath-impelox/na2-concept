import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ACCESS_TOKEN } from '../common/constants/client-storage-keys';
import { isSessionExpired } from '../common/api/base.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check authentication on route change
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    if (!token || isSessionExpired()) {
      // Session expired or no token, redirect to login
      window.location.href = '/auth/login';
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

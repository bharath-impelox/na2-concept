import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../common/constants/client-storage-keys';
import { useLoginMutation } from '../common/api/auth.api';
import { setSessionExpiry } from '../common/api/base.api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string, otp?: string, verifyOtp?: boolean) => Promise<{ token: string; refreshToken: string; user: any; defaultWorkspace: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user is already logged in (from sessionStorage)
    return !!sessionStorage.getItem(ACCESS_TOKEN);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginMutation] = useLoginMutation();

  const login = async (email: string, password: string, otp?: string, verifyOtp?: boolean) => {
    setIsLoading(true);
    try {
      const response = await loginMutation({
        email,
        password,
        ...(otp && { otp }),
        ...(verifyOtp && { verifyOtp }),
      });
      
      // Set session expiry
      setSessionExpiry();
      
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ACCESS_TOKEN);
    sessionStorage.removeItem(REFRESH_TOKEN);
    sessionStorage.removeItem('SESSION_EXPIRY_TIME');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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

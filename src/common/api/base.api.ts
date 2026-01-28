import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/client-storage-keys';

// Server URL - update this to your actual API endpoint
export const SERVER_URL = import.meta.env.VITE_API_URL || "https://na2-ai-employee-api-dev.impelox.com";

// Function to handle session timeout
export const handleSessionTimeout = () => {
  sessionStorage.clear();
  window.location.href = '/auth/login';
};

// Function to check if session has expired
const SESSION_EXPIRY_KEY = 'SESSION_EXPIRY_TIME';
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const isSessionExpired = (): boolean => {
  const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN);
  
  if (!expiryTime && !accessToken) {
    return false;
  }
  
  if (!expiryTime && accessToken) {
    return true;
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime!, 10);
  
  return now >= expiry;
};

// Function to set session expiry time
export const setSessionExpiry = () => {
  const expiryTime = Date.now() + SESSION_DURATION;
  sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
};

// Function to refresh the token
export const refreshTokenFn = async (serverUrl: string): Promise<string | null> => {
  try {
    if (isSessionExpired()) {
      handleSessionTimeout();
      throw new Error('Session expired');
    }

    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN);
    
    if (!refreshToken) {
      console.error('No refresh token found');
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${serverUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    if (data.token) {
      sessionStorage.setItem(ACCESS_TOKEN, data.token);
      if (data.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN, data.refreshToken);
      }
      setSessionExpiry();
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    handleSessionTimeout();
    return null;
  }
};

// Start token refresh scheduler
let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const startTokenRefresh = (serverUrl: string) => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Refresh token every 10 minutes
  refreshInterval = setInterval(async () => {
    if (!isSessionExpired()) {
      await refreshTokenFn(serverUrl);
    }
  }, 10 * 60 * 1000);
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

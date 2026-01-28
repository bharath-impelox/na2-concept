import { useState, useEffect } from 'react';
import { SERVER_URL } from './base.api';
import { ACCESS_TOKEN } from '../constants/client-storage-keys';
import { handleError } from '../utils/http-error';

export interface UserDetail {
  message: string;
  data: {
    _id: string;
    email: string;
    name: string;
  };
}

// Get user query hook
export const useGetUserQuery = () => {
  const [user, setUser] = useState<UserDetail['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem(ACCESS_TOKEN);
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${SERVER_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw {
            status: response.status,
            data: errorData,
          };
        }

        const result: UserDetail = await response.json();
        setUser(result.data);
        setError(null);
      } catch (err) {
        handleError(err);
        setError(err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { 
    data: user ? { data: user } : undefined, 
    isLoading, 
    error 
  };
};

import { LoginResponse } from '../types/auth';
import { SERVER_URL } from './base.api';
import { handleError } from '../utils/http-error';

interface AuthBody {
  email: string;
  password: string;
  otp?: string;
  verifyOtp?: boolean;
}

// Login mutation using fetch
export const useLoginMutation = () => {
  const login = async (body: Partial<AuthBody>): Promise<{ data: LoginResponse }> => {
    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          data: errorData,
        };
      }

      const data: LoginResponse = await response.json();
      
      return { data };
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return [
    login,
    { isLoading: false } // You can add loading state management here
  ] as const;
};

// Resend OTP mutation
export const useResendOtpViaEmailMutation = () => {
  const resendOtp = async (body: Partial<AuthBody>): Promise<{ data: { message: string } }> => {
    try {
      const response = await fetch(`${SERVER_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          data: errorData,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return [
    resendOtp,
    { isLoading: false }
  ] as const;
};

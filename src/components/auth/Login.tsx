import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginFormValues, loginZodSchema } from '../../common/schema';
import { useResendOtpViaEmailMutation } from '../../common/api/auth.api';
import { handleError } from '../../common/utils/http-error';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../common/constants/client-storage-keys';
import { startTokenRefresh, SERVER_URL } from '../../common/api/base.api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [resendOtpMutation] = useResendOtpViaEmailMutation();
  const [error, setError] = useState<string>('');
  const [verifiedOtp, setVerifiedOtp] = useState(true);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(''));
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginZodSchema),
  });

  const onSubmit = async (data: LoginFormValues & { otp?: string; verifyOtp?: boolean }) => {
    try {
      setError('');
      const loginData = {
        ...data,
        ...(!verifiedOtp && { otp: otp.join('').trim(), verifyOtp: true }),
      };
      
      const response = await login(data.email, data.password, loginData.otp, loginData.verifyOtp);
      
      // Store tokens in sessionStorage (matching reference implementation)
      sessionStorage.setItem(ACCESS_TOKEN, response.token);
      sessionStorage.setItem(REFRESH_TOKEN, response.refreshToken);
      
      // Start token refresh scheduler
      console.log('Login successful, starting token refresh scheduler');
      startTokenRefresh(SERVER_URL);
      
      if (response?.user?.isNewUser) {
        navigate(`/workspace/${response.defaultWorkspace}`);
      } else {
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      if (err?.data?.isVerified === false) {
        setVerifiedOtp(false);
      } else {
        handleError(err);
        setError(err?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  const requestNewOtpViaEmail = async () => {
    try {
      setIsResendOtpLoading(true);
      const response = await resendOtpMutation({ email: getValues('email') });
      console.log('OTP resent:', response.data.message);
      // Reset OTP input
      setOtp(Array(4).fill(''));
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setIsResendOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#1b44fe] focus:border-transparent`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#1b44fe] focus:border-transparent`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {!verifiedOtp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please enter the OTP sent to your email
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b44fe] focus:border-transparent"
                  />
                ))}
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={requestNewOtpViaEmail}
                  disabled={isResendOtpLoading}
                  className="text-sm text-[#1b44fe] hover:text-[#1538d4] font-medium disabled:opacity-50"
                >
                  {isResendOtpLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isResendOtpLoading}
            className="w-full py-3 px-4 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'radial-gradient(ellipse 88% 75% at 50% 50%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <button
              type="button"
              className="text-[#1b44fe] hover:text-[#1538d4] font-medium"
            >
              Forgot your password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

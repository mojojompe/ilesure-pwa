import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, Alert01Icon, GoogleIcon } from '@hugeicons/react';
import { GoogleAuthButton, GOOGLE_SIGN_IN_ENABLED } from '../../components/ui/GoogleAuthButton';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useAlertStore } from '../../stores/alertStore';
import { API_BASE_URL } from '../../api/config';
import { authService } from '../../api/authService';
import { customAlert } from '../../stores/alertStore';
import { ERROR_CODE, getApiError } from '../../api/client';

export function Login() {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // The API client lands a suspended account here with ?reason=suspended.
  const [errors, setErrors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (new URLSearchParams(window.location.search).get('reason') === 'suspended') {
      initial.general = 'This account has been suspended. Contact support.';
    }
    return initial;
  });
  const [isReady, setIsReady] = useState(false);

  const handleGoogleCode = async (code: string) => {
      setLoading(true);
      try {
        const response = await authService.directGoogleSignIn(code);
        if (response.success && response.user) {
          if (response.user.role !== 'student' && response.user.role !== 'individual') {
            useAlertStore.getState().showAlert({
              title: 'Access Denied',
              message: 'This app is for Students/Renters. Please log in on the ileSure Web App.',
              type: 'error',
              confirmText: 'Go to Web App',
              cancelText: 'Cancel',
              confirmHref: 'https://app.ilesure.com'
            });
            setLoading(false);
            return;
          }

          const userWithMeta = { ...response.user, createdAt: new Date().toISOString() } as any;
          setUser(userWithMeta);
          if (response.accessToken && response.refreshToken) {
            setTokens(response.accessToken, response.refreshToken);
          }
          navigate('/');
        } else {
          if (response.error?.code === ERROR_CODE.ACCOUNT_DELETED || response.error?.message?.toLowerCase().includes('deleted')) {
            // Google gives us no email to prefill (the exchange failed before we
            // learned who signed in), so send them to the reactivate screen and let
            // them type it in there.
            navigate('/auth/reactivate');
            return;
          } else {
            setErrors({ general: response.error?.message || 'Google Sign-In failed.' });
          }
        }
      } catch (err) {
        setErrors({ general: 'Google Sign-In failed.' });
      } finally {
        setLoading(false);
      }
  };

  const handleGoogleError = (errorResponse: unknown) => {
      console.error('Google Sign-In Error:', errorResponse);
      setErrors({ general: 'Google Sign-In was cancelled or failed.' });
  };

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        if (response.user.role !== 'student' && response.user.role !== 'individual') {
          useAlertStore.getState().showAlert({
            title: 'Access Denied',
            message: 'This app is for Students/Renters. Please log in on the ileSure Web App.',
            type: 'error',
            confirmText: 'Go to Web App',
            cancelText: 'Cancel',
            confirmHref: 'https://app.ilesure.com'
          });
          setLoading(false);
          return;
        }

        const userWithMeta = { ...response.user, createdAt: new Date().toISOString() } as any;
        setUser(userWithMeta);
        setTokens(response.accessToken, response.refreshToken);
        navigate('/');
      } else {
        setErrors({ general: 'Invalid email or password. Try again.' });
      }
    } catch (error: any) {
      const apiError = getApiError(error, 'Invalid email or password. Try again.');
      if (apiError.code === ERROR_CODE.ACCOUNT_DELETED) {
        navigate('/auth/reactivate', { state: { email } });
        return;
      }
      setErrors({ general: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col font-sans overflow-hidden">
      {/* TOP HEADER SECTION (Brown) */}
      <div className="h-[40vh] relative flex flex-col px-6 pt-safe overflow-hidden">
        <AnimatePresence>
          {isReady && (
            <motion.img
              src="/images/login_illustration_1788617118204.png"
              className="absolute -right-[60px] top-[10%] w-[260px] h-[260px] object-cover z-0"
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                delay: 0.15
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isReady && (
            <motion.div
              className="flex-1 flex flex-col z-10 pt-2"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-auto"
              >
                <ArrowLeft01Icon size={24} className="text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM SHEET SECTION (White) */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="flex-1 bg-white rounded-t-[36px] -mt-[30px] shadow-[0_-10px_20px_rgba(0,0,0,0.15)] z-20 flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{
              type: 'spring',
              delay: 0.15
            }}
          >
<div className="text-center mb-1">
                <h2 className="text-3xl font-extrabold pt-10 text-text-primary tracking-[-0.5px]">Welcome Back 👋
                </h2>
                <p className="text-base text-text-secondary mt-2 mb-6">
                  Login to your Account...
                </p>
              </div>
            <form onSubmit={handleLogin} className="flex-1 overflow-y-auto px-6 pt-8 pb-12 flex flex-col">
              {errors.general && (
                <div className="flex flex-row items-center gap-2 bg-[#FFEBEE] rounded-lg p-4 mb-6 border border-[#FFCDD2]">
                  <Alert01Icon size={16} className="text-status-error" />
                  <span className="text-sm text-status-error flex-1">{errors.general}</span>
                </div>
              )}

              <>
                  <div className="flex flex-col gap-3">
                    <Input
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      name="email"
                      autoComplete="username"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      error={errors.email}
                    />
                    <Input
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      error={errors.password}
                    />

                    <div className="flex justify-end mt-1 mb-6">
                      <div
                        onClick={() => navigate('/auth/forgot-password')}
                        className="cursor-pointer active:opacity-70"
                      >
                        <span className="text-sm font-bold text-primary">Forgot password?</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mb-4"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {GOOGLE_SIGN_IN_ENABLED && (
                    <GoogleAuthButton
                      label="Sign in with Google"
                      className="w-full !border-border-light text-text-primary !py-4 rounded-[50px] flex items-center justify-center gap-2"
                      onCode={handleGoogleCode}
                      onError={handleGoogleError}
                    />
                  )}

                  <div className="flex justify-center mt-8 pb-4">
                    <div
                      onClick={() => navigate('/auth/role')}
                      className="cursor-pointer active:opacity-70"
                    >
                      <span className="text-base font-medium text-text-secondary">
                        Don't have an account?{' '}
                        <span className="font-extrabold text-primary">Create One</span>
                      </span>
                    </div>
                  </div>
                </>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

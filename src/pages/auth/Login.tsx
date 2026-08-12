import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, Alert01Icon, GoogleIcon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';
import { customAlert } from '../../stores/alertStore';

export function Login() {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);

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
        const userWithMeta = { ...response.user, createdAt: new Date().toISOString() } as any;
        setUser(userWithMeta);
        setTokens(response.accessToken, response.refreshToken);
        navigate('/');
      } else {
        setErrors({ general: 'Invalid email or password. Try again.' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Invalid email or password. Try again.' });
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
              src="/images/bg_login_transparent.png"
              className="absolute -right-5 -top-2.5 w-[240px] h-[240px] object-contain z-0"
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

              <div className="pr-[90px] mb-[34px]">
                <h1 className="text-[32px] font-black text-white tracking-[-1px] mb-1">
                  Welcome back !
                </h1>
                <p className="text-base text-white/85 leading-[22px] font-medium">
                  Sign in to find your sure home anywhere
                </p>
              </div>
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
            <form onSubmit={handleLogin} className="flex-1 overflow-y-auto px-6 pt-8 pb-12 flex flex-col">
              {errors.general && (
                <div className="flex flex-row items-center gap-2 bg-[#FFEBEE] rounded-lg p-4 mb-6 border border-[#FFCDD2]">
                  <Alert01Icon size={16} className="text-status-error" />
                  <span className="text-sm text-status-error flex-1">{errors.general}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Input
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  error={errors.email}
                />
                <Input
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  type="password"
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

              {/* SECURITY-FIX TODO (P-L1): this button is inert (onClick is a no-op).
                  Wire it to Google OAuth via @react-oauth/google (e.g. useGoogleLogin)
                  and pass the returned id_token to authService.googleLogin(). The backend
                  must verify the id_token's aud/iss/signature/expiry before trusting it. */}
              <Button
                type="button"
                variant="outline"
                className="w-full !border-border-light text-text-primary !py-4 rounded-[50px] flex items-center justify-center gap-2"
                onClick={() => {
                  customAlert('Google Sign-In is not yet implemented.', 'Info', 'info');
                }}
              >
                {/* Simplified Google Icon for PWA */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </Button>

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
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

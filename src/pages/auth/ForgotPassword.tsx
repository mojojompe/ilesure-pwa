import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, Mail01Icon, MailOpen01Icon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/authService';

export function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col font-sans overflow-hidden">
      {/* TOP HEADER SECTION (Brown) */}
      <div className="h-[40vh] relative flex flex-col px-6 pt-safe overflow-hidden">
        <AnimatePresence>
          {isReady && (
            <motion.img
              src="/images/bg_forgot_password_transparent.png"
              className="absolute -right-5 -top-2.5 w-[240px] h-[240px] object-contain z-0"
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
              onError={(e: any) => e.target.style.display = 'none'} // Fallback if image doesn't exist
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
                  Forgot Password
                </h1>
                <p className="text-base text-white/85 leading-[22px] font-medium">
                  Let's get you back into your account.
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
            transition={{ type: 'spring', delay: 0.15 }}
          >
            <div className="flex-1 overflow-y-auto px-6 pt-8 pb-12 flex flex-col">
              {emailSent ? (
                <div className="flex-1 flex flex-col pt-4">
                  <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center self-center mb-6">
                    <MailOpen01Icon size={40} className="text-status-success" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-text-primary text-center mb-2">Check Your Email</h2>
                  <p className="text-base text-text-secondary text-center mb-8 leading-6">
                    We've sent password reset instructions to<br />
                    <span className="font-bold text-text-primary">{email}</span>
                  </p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-4">
                  <div className="mb-4">
                    <Input
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      type="email"
                      error={error}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/authService';
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '../../utils/validation';

type Step = 'request' | 'otp' | 'newPassword' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const handleRequest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length < 4) { setError('Enter the code sent to your email'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.verifyResetOTP(otp, email);
      setStep('newPassword');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isStrongPassword(newPassword)) {
      setError(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col font-sans overflow-hidden">
      {/* TOP HEADER SECTION */}
      <div className="h-[40vh] relative flex flex-col px-6 pt-safe overflow-hidden">
        <AnimatePresence>
          {isReady && (
            <motion.img
              src="/images/bg_forgot_password_transparent.png"
              className="absolute -right-5 -top-2.5 w-[240px] h-[240px] object-contain z-0"
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
              onError={(e: any) => e.target.style.display = 'none'}
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
              {step !== 'success' && (
                <button
                  onClick={() => step === 'request' ? navigate(-1) : setStep('request')}
                  className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-auto"
                >
                  <ArrowLeft01Icon size={24} className="text-white" />
                </button>
              )}
              {step === 'success' && <div className="mb-auto"></div>}

              <div className="pr-[90px] mb-[34px]">
                <h1 className="text-[32px] font-black text-white tracking-[-1px] mb-1">
                  {step === 'request' && 'Forgot Password'}
                  {step === 'otp' && 'Verify Code'}
                  {step === 'newPassword' && 'New Password'}
                  {step === 'success' && 'Password Reset!'}
                </h1>
                <p className="text-base text-white/85 leading-[22px] font-medium">
                  {step === 'request' && "Let's get you back into your account."}
                  {step === 'otp' && "We've sent a secure PIN to your email."}
                  {step === 'newPassword' && "Choose a strong password you'll remember."}
                  {step === 'success' && "You can now log in with your new password."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM SHEET SECTION */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="flex-1 bg-white rounded-t-[36px] -mt-[30px] shadow-[0_-10px_20px_rgba(0,0,0,0.15)] z-20 flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', delay: 0.15 }}
          >
            <div className="flex-1 flex flex-col pt-8 pb-12 px-6 overflow-y-auto">
              {step === 'request' && (
                <form onSubmit={handleRequest} className="flex-1 flex flex-col pt-4">
                  <div className="mb-4">
                    <Input
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      error={error}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col pt-4">
                  <div className="mb-4">
                    <Input
                      label="Reset Code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      type="text"
                      error={error}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>
              )}

              {step === 'newPassword' && (
                <form onSubmit={handleReset} className="flex-1 flex flex-col pt-4">
                  <div className="mb-4">
                    <Input
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8+ chars, upper, lower & number"
                      type="password"
                      error={error}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      type="password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              )}

              {step === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center pt-8">
                  <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6">
                    <CheckmarkCircle02Icon size={48} className="text-[#4CAF50]" />
                  </div>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

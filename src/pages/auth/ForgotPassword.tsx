import React, { useState, useEffect, useRef } from 'react';
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
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit code sent to your email'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.verifyResetOTP(code, email);
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
      await authService.resetPassword(email, otp.join(''), newPassword);
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
              src="/images/forgot_password_1788617216520.jpg"
              className="absolute -right-[60px] top-[5%] w-[260px] h-[260px] object-cover rounded-l-[100px] shadow-xl z-0"
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
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
                      name="email"
                      autoComplete="username"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
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
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-textSecondary mb-2">Reset Code</label>
                    <div className="flex flex-row justify-between gap-2 w-full">
                      {otp.map((digit, i) => (
                        <div
                          key={i}
                          onClick={() => inputRefs.current[i]?.focus()}
                          className={`w-[45px] h-[55px] rounded-xl flex items-center justify-center border-[1.5px] transition-all cursor-text
                            ${digit ? 'bg-[#FFF8E1] border-accent' : 'bg-surfaceLight border-borderLight'}
                            ${i === otp.findIndex(d => !d) ? 'border-accent bg-[#FFFDF5] shadow-sm' : ''}
                          `}
                        >
                          <input
                            ref={el => inputRefs.current[i] = el}
                            className="w-full h-full bg-transparent text-center text-xl font-black text-textPrimary focus:outline-none"
                            value={digit}
                            onChange={e => handleDigitChange(e.target.value, i)}
                            onKeyDown={e => handleKeyDown(e, i)}
                            inputMode="numeric"
                            maxLength={1}
                            autoComplete={i === 0 ? 'one-time-code' : 'off'}
                            name={`otp-${i}`}
                          />
                        </div>
                      ))}
                    </div>
                    {error && <p className="text-error text-sm mt-2">{error}</p>}
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
                      name="new-password"
                      autoComplete="new-password"
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
                      name="confirm-password"
                      autoComplete="new-password"
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

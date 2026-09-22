import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores/authStore';

type Step = 'request' | 'otp';

const OTP_LENGTH = 6;

/**
 * The backend now refuses login for a deleted account with
 * 403 { error: { code: 'ACCOUNT_DELETED' }, nextStep: 'reactivate' }. Login.tsx (and
 * its Google handler) send people here to send themselves a reactivation code and
 * regain the account, mirroring the request -> otp shape of ForgotPassword.tsx.
 */
export function ReactivateAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens } = useAuthStore();

  const prefilledEmail = (location.state as { email?: string } | null)?.email
    || new URLSearchParams(location.search).get('email')
    || '';

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
      // Anti-enumeration: this always resolves success regardless of whether the
      // email belongs to a deleted account, so there is nothing to branch on here.
      await authService.requestReactivation(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send reactivation code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsResending(true);
    try {
      await authService.requestReactivation(email);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleConfirm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { setError('Enter the 6-digit code sent to your email'); return; }
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.confirmReactivation(email, code);
      if (response.success && response.user) {
        // Same shape as Login.tsx's handleLogin: stamp createdAt for the parts of the
        // UI that read it, then set user/tokens and drop into the app.
        const userWithMeta = { ...response.user, createdAt: new Date().toISOString() } as any;
        setUser(userWithMeta);
        setTokens(response.accessToken, response.refreshToken);
        navigate('/');
      } else {
        setError('Reactivation failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired code');
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
            <motion.div
              className="flex-1 flex flex-col z-10 pt-2"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => step === 'request' ? navigate('/login') : setStep('request')}
                className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-auto"
              >
                <ArrowLeft01Icon size={24} className="text-white" />
              </button>

              <div className="pr-[90px] mb-[34px]">
                <h1 className="text-[32px] font-black text-white tracking-[-1px] mb-1">
                  {step === 'request' ? 'Reactivate Account' : 'Verify Code'}
                </h1>
                <p className="text-base text-white/85 leading-[22px] font-medium">
                  {step === 'request'
                    ? "Deleted your account by mistake? We'll email you a code to get it back."
                    : "We've sent a 6-digit code to your email. It expires in 10 minutes."}
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
                    {isLoading ? 'Sending...' : 'Send Code'}
                  </Button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleConfirm} className="flex-1 flex flex-col pt-4">
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-textSecondary mb-2">Reactivation Code</label>
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
                            onPaste={handlePaste}
                            onFocus={e => e.target.select()}
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

                  <div className="mb-4 text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-primary font-bold underline active:opacity-70 disabled:opacity-50"
                    >
                      {isResending ? 'Sending…' : 'Resend code'}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Reactivate Account'}
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

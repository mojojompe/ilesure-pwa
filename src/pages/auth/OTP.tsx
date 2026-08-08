import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores/authStore';
import { customAlert } from '../../stores/alertStore';

const OTP_LENGTH = 6;

export function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens } = useAuthStore();
  
  const email = location.state?.email || 'your email';
  const role = location.state?.role || 'student';
  const fullName = location.state?.fullName || 'User';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [canResend]);

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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;

    setLoading(true);
    try {
      const response = await authService.verifyOTP(code, email);
      
      if (response.accessToken && response.refreshToken) {
        setTokens(response.accessToken, response.refreshToken);
        navigate('/');
      } else {
        customAlert(response.message || 'Verification failed', 'Error', 'error');
      }
    } catch (error: any) {
      customAlert(error.message || 'An error occurred', 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimer(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    
    try {
      await authService.resendOTP(email);
      customAlert('OTP has been resent to your email.', 'Success', 'success');
    } catch (error: any) {
      customAlert(error.message || 'Failed to resend OTP', 'Error', 'error');
    }
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-[#3E1F0A] relative pb-safe">
        {/* Header Background */}
        <div className="absolute top-0 right-0 w-[240px] h-[240px] opacity-20 pointer-events-none">
          <img src="/assets/backgrounds/bg_otp_transparent.png" alt="Pattern" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>

        <div className="flex-none px-6 pt-12 pb-8 z-10">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <h1 className="text-[32px] font-black text-white tracking-tight mb-2">Verify Code</h1>
          <p className="text-white/80 text-base leading-relaxed font-medium max-w-[280px]">
            We've sent a secure PIN to <span className="font-bold text-white">{email}</span>.
          </p>
        </div>

        <div className="flex-1 bg-white rounded-t-[36px] px-6 pt-10 pb-8 flex flex-col items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
          <div className="flex flex-row justify-center gap-2 sm:gap-3 mb-8 w-full max-w-sm">
            {otp.map((digit, i) => (
              <div
                key={i}
                onClick={() => inputRefs.current[i]?.focus()}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center border-[1.5px] transition-all cursor-text
                  ${digit ? 'bg-[#FFF8E1] border-accent' : 'bg-surfaceLight border-borderLight'}
                  ${i === otp.findIndex(d => !d) ? 'border-accent bg-[#FFFDF5] shadow-sm' : ''}
                `}
              >
                <input
                  ref={el => inputRefs.current[i] = el}
                  className="w-full h-full bg-transparent text-center text-2xl font-black text-textPrimary focus:outline-none"
                  value={digit}
                  onChange={e => handleDigitChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  inputMode="numeric"
                  maxLength={1}
                />
              </div>
            ))}
          </div>

          <div className="mb-10 text-center">
            {canResend ? (
              <button onClick={handleResend} className="text-primary font-bold underline active:opacity-70">
                Resend code
              </button>
            ) : (
              <p className="text-textSecondary">
                Resend in <span className="font-bold text-accent">{timer}s</span>
              </p>
            )}
          </div>

          <div className="w-full max-w-sm mt-auto sm:mt-8">
            <Button
              className="w-full shadow-lg"
              size="lg"
              onClick={handleVerify}
              disabled={!isComplete || loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            
            <div className="mt-6 flex justify-center">
              <button onClick={() => navigate(-1)} className="text-sm font-medium text-textTertiary underline active:opacity-70">
                Change email address
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores/authStore';
import { customAlert } from '../../stores/alertStore';

/** Email of an account that registered but has not yet verified its OTP. */
export const PENDING_EMAIL_KEY = 'ilesure_pwa_pending_email';

const OTP_LENGTH = 6;

export function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens, user } = useAuthStore();

  // QA-AGT-003 / QA-CO-002 (PWA variant): the email used to come only from router state, so a
  // refresh or PWA restore on this screen sent the literal text "your email" to the API.
  // Fall back to the pending-signup marker written by Register, then the signed-in user.
  const email: string =
    location.state?.email ||
    sessionStorage.getItem(PENDING_EMAIL_KEY) ||
    user?.email ||
    '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
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

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    if (!email) {
      customAlert('We could not find the email you signed up with. Please register or log in again.', 'Error', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(code, email);

      if (response.accessToken) {
        // Store the verified user as well as the tokens — without it the app had a session
        // but no user object, and the route guard could not pick a shell.
        if (response.user) setUser(response.user);
        setTokens(response.accessToken, response.refreshToken || null);
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
        navigate('/');
      } else {
        customAlert(response.message || 'Verification failed', 'Error', 'error');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An error occurred';
      customAlert(msg, 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      customAlert('We could not find the email you signed up with. Please register or log in again.', 'Error', 'error');
      return;
    }
    // QA-CO-003: only restart the countdown once the backend confirms a new code was sent.
    setResending(true);
    try {
      const res: any = await authService.resendOTP(email);
      if (res?.alreadyVerified) {
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
        customAlert('This email is already verified. You can log in.', 'Info', 'info');
        return;
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimer(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
      customAlert('A new code has been sent to your email.', 'Success', 'success');
    } catch (error: any) {
      customAlert(error.response?.data?.error?.message || error.message || 'Failed to resend OTP', 'Error', 'error');
    } finally {
      setResending(false);
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
            {email ? (<>We've sent a secure PIN to <span className="font-bold text-white">{email}</span>.</>) : (
              <>We couldn't find your email. <button onClick={() => navigate('/auth/choice')} className="underline font-bold text-white">Sign up or log in again</button>.</>
            )}
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
                  onPaste={handlePaste}
                  onFocus={e => e.target.select()}
                  inputMode="numeric"
                  maxLength={1}
                  // Only the first box advertises one-time-code; iOS fills the
                  // whole code from it. Marking every box makes the AutoFill
                  // suggestion re-present itself on each one.
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  name={`otp-${i}`}
                  aria-label={`Digit ${i + 1} of the verification code`}
                />
              </div>
            ))}
          </div>

          <div className="mb-10 text-center">
            {canResend ? (
              <button onClick={handleResend} disabled={resending || !email} className="text-primary font-bold underline active:opacity-70 disabled:opacity-50">
                {resending ? 'Sending…' : 'Resend code'}
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
              disabled={!isComplete || loading || !email}
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

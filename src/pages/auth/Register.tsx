import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';

const TOTAL_STEPS = 3;

function PasswordStrengthMeter({ password }: { password: string }) {
  const reqs = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: '1 lowercase letter', met: /[a-z]/.test(password) },
    { label: '1 number', met: /[0-9]/.test(password) },
    { label: '1 special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = reqs.filter((r) => r.met).length;

  let color = '#F0E8E2'; // borderLight
  let text = 'Weak';
  if (score <= 2) { color = '#E53935'; text = 'Weak'; }
  else if (score <= 4) { color = '#E1AD01'; text = 'Good'; }
  else if (score === 5) { color = '#4CAF50'; text = 'Strong'; }

  return (
    <div className="mt-[-8px] mb-4 px-1">
      <div className="h-1.5 bg-border-light rounded-full overflow-hidden mb-1.5 flex">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: score === 0 ? 'transparent' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mb-2">
        <span 
          className="text-xs font-bold tracking-[0.5px]" 
          style={{ color: score === 0 ? '#6B4F3A' : color }}
        >
          {score === 0 ? 'Password strength' : text}
        </span>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {reqs.map((r, i) => (
          <div key={i} className="flex flex-row items-center gap-1 w-[48%]">
            {r.met ? (
              <CheckmarkCircle02Icon size={14} className="text-[#4CAF50]" />
            ) : (
              <CircleIcon size={14} className="text-text-tertiary" />
            )}
            <span className={`text-[11px] font-medium ${r.met ? 'text-text-primary' : 'text-text-tertiary'}`}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIndicator({ currentStep, total }: { currentStep: number; total: number }) {
  return (
    <div className="flex flex-row gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <motion.div
            key={i}
            className={`h-2 rounded-full ${isDone ? 'bg-primary' : isActive ? 'bg-accent' : 'bg-border'}`}
            animate={{ width: isActive ? 24 : 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        );
      })}
    </div>
  );
}

const getRoleColors = (role: string) => {
  switch (role) {
    case 'individual': return { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', label: 'NON-STUDENT' };
    case 'agent': return { bg: '#FFF7ED', border: '#F97316', text: '#C2410C', label: 'AGENT' };
    case 'company': return { bg: '#ECFDF5', border: '#10B981', text: '#047857', label: 'COMPANY' };
    case 'student':
    default: return { bg: '#FFF8E1', border: '#F59E0B', text: '#B45309', label: 'STUDENT' };
  }
};

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || 'student';
  const { setUser, setTokens } = useAuthStore();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  
  // Bank Data (Simplified for UI matching)
  const [acctNumber, setAcctNumber] = useState('');
  const [acctName, setAcctName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const goToStep = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = initialRole === 'company' ? 'Representative name is required' : 'Full name is required';
    if (initialRole === 'company' && !companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!email.includes('@')) newErrors.email = 'Enter a valid email';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      newErrors.password = 'Password must meet all requirements';
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 0) {
      if (validateStep1()) goToStep(1);
    } else if (step === 1) {
      if (!phone.trim()) {
        setErrors({ phone: 'Phone number is required' });
        return;
      }
      goToStep(2);
    } else if (step === 2) {
      setIsLoading(true);
      try {
        await authService.register({
          fullName, email, phone, password, 
          role: initialRole as any,
          selectedSchool: initialRole === 'student' ? school : undefined,
          companyName: initialRole === 'company' ? companyName : undefined,
        });
        navigate('/auth/otp', { state: { email, role: initialRole, fullName } }); 
      } catch (error: any) {
        setErrors({ general: error.response?.data?.error?.message || 'Please try again later' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      position: 'absolute' as 'absolute'
    })
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
              <button
                onClick={() => step > 0 ? goToStep(step - 1) : navigate(-1)}
                className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center mb-auto"
              >
                <ArrowLeft01Icon size={24} className="text-white" />
              </button>

              <div className="pr-[90px] mb-[34px]">
                <h1 className="text-[32px] font-black text-white tracking-[-1px] mb-1">
                  Create Account
                </h1>
                <p className="text-base text-white/85 leading-[22px] font-medium">
                  Join IleSure to find your sure home.
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
            <div className="flex-1 flex flex-col pt-8 pb-12 px-6 overflow-y-auto">
              
              <div className="text-center mb-1">
                <h2 className="text-2xl font-extrabold text-text-primary tracking-[-0.5px]">
                  {step === 0 ? 'Account Details' : step === 1 ? 'Your Details' : 'Bank Account'}
                </h2>
                <p className="text-base text-text-secondary mt-1 mb-6">
                  {step === 0 ? 'Secure your ideal living space.' : step === 1 ? 'Tell us a bit more about you.' : 'Link your bank for automatic rent payouts.'}
                </p>
              </div>

              <StepIndicator currentStep={step} total={TOTAL_STEPS} />

              <div className="relative flex-1 flex flex-col">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full flex flex-col gap-3 pb-8"
                  >
                    {step === 0 && (
                      <>
                        <Input
                          label={initialRole === 'company' ? "Company Representative Name" : "Full Name"}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={initialRole === 'company' ? "Enter representative name" : "Enter your name"}
                          error={errors.fullName}
                        />
                        {initialRole === 'company' && (
                          <Input
                            label="Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter your company name"
                            error={errors.companyName}
                          />
                        )}
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
                          placeholder="Create a password (min 6, 1 uppercase)"
                          type="password"
                          error={errors.password}
                        />
                        <PasswordStrengthMeter password={password} />
                        <Input
                          label="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          type="password"
                          error={errors.confirmPassword}
                        />
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <Input
                          label="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          type="tel"
                          error={errors.phone}
                        />
                        {initialRole === 'student' && (
                          <div className="mt-4">
                            <Input
                              label="School / University (optional)"
                              value={school}
                              onChange={(e) => setSchool(e.target.value)}
                              placeholder="e.g. University of Ilorin"
                            />
                          </div>
                        )}
                        
                        <div className="mt-8">
                          <span className="text-xs font-bold text-text-secondary tracking-[0.8px] mb-2 block uppercase">
                            SIGNED UP AS:
                          </span>
                          <div 
                            className="border-[1.5px] rounded-lg py-3 px-4 w-[200px] flex items-center justify-center"
                            style={{ 
                              backgroundColor: getRoleColors(initialRole).bg, 
                              borderColor: getRoleColors(initialRole).border 
                            }}
                          >
                            <span 
                              className="text-base font-extrabold tracking-[1px]"
                              style={{ color: getRoleColors(initialRole).text }}
                            >
                              {getRoleColors(initialRole).label}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {(initialRole === 'agent' || initialRole === 'company') ? (
                          <>
                            <span className="text-xs font-bold tracking-[0.8px] text-text-secondary mb-2 uppercase block">
                              BANK ACCOUNT (RECOMMENDED)
                            </span>
                            <p className="text-sm text-text-secondary mb-4">
                              Link your bank to receive rent payments automatically with instant split settlements.
                            </p>
                            
                            {/* Simplified UI for PWA - just inputs for now, actual implementation would need react-select */}
                            <Input label="Bank Name" placeholder="e.g. Access Bank" />
                            <Input label="Account Number" placeholder="Enter 10 digit number" maxLength={10} />
                            
                            <Button variant="outline" className="w-full mt-2" onClick={() => {}}>
                              Verify Account
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold tracking-[0.8px] text-text-secondary mb-2 uppercase block">
                              BANK ACCOUNT
                            </span>
                            <p className="text-sm text-text-secondary mb-4">
                              Bank account setup is not required for student accounts.
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-4">
                <Button
                  onClick={handleNext}
                  className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : step === TOTAL_STEPS - 1 ? 'Create Account' : 'Next'}
                </Button>

                {step === 0 && (
                  <button onClick={() => navigate('/login')} className="flex justify-center mt-2">
                    <span className="text-base font-medium text-text-secondary">
                      Already have an account?{' '}
                      <span className="font-extrabold text-primary">Log in</span>
                    </span>
                  </button>
                )}
                {step === 2 && (
                  <button onClick={handleNext} className="flex justify-center mt-2">
                    <span className="text-base font-medium text-text-tertiary underline">
                      Skip — I'll do this later
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

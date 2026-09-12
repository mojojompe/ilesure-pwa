import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores/authStore';
import { Alert02Icon, Mail01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';

export function DeleteAccount() {
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();
  
  const [step, setStep] = useState<'warning' | 'otp' | 'success'>('warning');
  const [otp, setOtp] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestDeletion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.requestAccountDeletion();
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request account deletion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE exactly to confirm.');
      return;
    }
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.confirmAccountDeletion(otp, confirmText);
      setStep('success');
      setTimeout(() => {
        clearAuth();
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP or confirmation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Delete Account" onBack={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto px-4 pb-12 pt-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm font-medium border border-error/20 flex items-start gap-3">
              <Alert02Icon size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 'warning' && (
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-clay-sm">
                <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                  <Alert02Icon size={24} variant="solid" />
                </div>
                <h2 className="text-xl font-bold text-textPrimary mb-3">
                  Are you sure you want to delete your account?
                </h2>
                <div className="space-y-3 text-sm text-textSecondary leading-relaxed">
                  <p>
                    Deleting your account will restrict your access to all iléSure services immediately.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You will lose access to your profile, saved listings, and chats.</li>
                    <li>Active bookings and signed contracts are retained for legal compliance but you will not be able to access them.</li>
                    <li>Your chat messages will remain visible to other users.</li>
                  </ul>
                  <p className="font-semibold text-textPrimary mt-4">
                    Note: You can reactivate your account at any time in the future by signing in with your email again.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRequestDeletion}
                disabled={isLoading}
                className="w-full bg-error hover:bg-error/90 text-white font-bold text-base py-3.5 rounded-pill transition-colors flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-clay-sm text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail01Icon size={24} variant="solid" />
                </div>
                <h2 className="text-xl font-bold text-textPrimary mb-2">
                  Verify Deletion
                </h2>
                <p className="text-sm text-textSecondary mb-6">
                  We've sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to verify this request.
                </p>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5 ml-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-lg tracking-widest text-center font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5 ml-1">
                      Type DELETE to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-error focus:ring-1 focus:ring-error"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmDeletion}
                disabled={isLoading || confirmText !== 'DELETE' || otp.length < 6}
                className="w-full bg-error hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-pill transition-colors flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Permanently Delete Account'
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-surface rounded-2xl p-6 border border-border shadow-clay-sm text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                <CheckmarkCircle02Icon size={32} variant="solid" />
              </div>
              <h2 className="text-xl font-bold text-textPrimary mb-2">
                Account Deleted
              </h2>
              <p className="text-sm text-textSecondary">
                Your account has been successfully deleted. You will be logged out momentarily.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

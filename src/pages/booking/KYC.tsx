import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { useAuthStore } from '../../stores/authStore';
import { customAlert } from '../../stores/alertStore';
import { 
  UserCircleIcon, 
  CheckmarkBadge01Icon, 
  CreditCardIcon, 
  RefreshIcon,
  CheckmarkCircle02Icon,
  Certificate01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
// import { kycService } from '../../api/kycService'; // Uncomment when backend is ready

const KYC_REQUIRED_ROLES = ['agent', 'company', 'landlord', 'sub_agent'];

export function KYC() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const isKYCRequired = KYC_REQUIRED_ROLES.includes(user?.role || '');

  const [loadingStatus, setLoadingStatus] = useState(false); // Set true when API connected
  const [ninVerified, setNinVerified] = useState(user?.ninVerified || false);
  const [bvnVerified, setBvnVerified] = useState(user?.bvnVerified || false);
  const [ninVerifiedAt, setNinVerifiedAt] = useState<string | null>(null);
  const [bvnVerifiedAt, setBvnVerifiedAt] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<'nin' | 'bvn' | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showRefInput, setShowRefInput] = useState(false);
  const [manualRefId, setManualRefId] = useState('');

  const fetchStatus = async () => {
    // Mocking the API call
    setLoadingStatus(true);
    setTimeout(() => {
      setLoadingStatus(false);
    }, 1000);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const openWidget = (type: 'nin' | 'bvn') => {
    setVerifying(type);
    // Mock verification delay
    setTimeout(() => {
      if (type === 'nin') {
        setNinVerified(true);
        setNinVerifiedAt(new Date().toISOString());
        setUser({ ...user, ninVerified: true } as any);
      } else {
        setBvnVerified(true);
        setBvnVerifiedAt(new Date().toISOString());
        setUser({ ...user, bvnVerified: true } as any);
      }
      setVerifying(null);
    }, 2000);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setShowRefInput(false);
      setManualRefId('');
      customAlert('Sync complete!', 'Success', 'success');
    }, 1000);
  };

  const roleLabel = isKYCRequired ? 'Agent / Company' : 'Student / Individual';
  const requirements = isKYCRequired
    ? 'Verify your NIN and BVN to book listings'
    : 'Verify your NIN to book listings';
  
  const allVerified = ninVerified && (!isKYCRequired || bvnVerified);

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title="Identity Verification" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-[100px]">
          
          {/* Info Card */}
          <div className="bg-surface rounded-2xl p-6 border border-border flex flex-col items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
            <div className="mb-3">
              {allVerified ? (
                <CheckmarkBadge01Icon size={36} className="text-[#388E3C]" />
              ) : (
                <CheckmarkBadge01Icon size={36} className="text-primary" />
              )}
            </div>
            <p className="text-[15px] text-textSecondary leading-relaxed mb-3">{requirements}</p>
            <div className="bg-primary/10 px-4 py-1.5 rounded-md mb-3">
              <span className="text-sm font-semibold text-primary">{roleLabel}</span>
            </div>
            
            <div className={clsx(
              "px-5 py-1.5 rounded-md",
              allVerified ? "bg-[#E8F5E9]" : verifying ? "bg-[#FFF3E0]" : "bg-surfaceLight"
            )}>
              <span className={clsx(
                "text-sm font-bold",
                allVerified ? "text-[#388E3C]" : verifying ? "text-[#E65100]" : "text-textSecondary"
              )}>
                {loadingStatus ? 'Checking...' : allVerified ? 'Verified' : verifying ? 'Pending' : 'Not Started'}
              </span>
            </div>
          </div>

          {loadingStatus ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* NIN Section */}
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center mb-4">
                  <UserCircleIcon size={24} className="text-primary mr-2" />
                  <h3 className="text-base font-semibold text-textPrimary flex-1">NIN Verification</h3>
                  {ninVerified && <CheckmarkCircle02Icon size={24} className="text-[#388E3C]" variant="solid" />}
                </div>

                {!ninVerified ? (
                  <button
                    onClick={() => openWidget('nin')}
                    disabled={verifying === 'nin'}
                    className={clsx(
                      "w-full flex items-center justify-center py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(107,79,58,0.25)]",
                      verifying === 'nin' ? "bg-primary/60" : "bg-primary active:scale-[0.98]"
                    )}
                  >
                    {verifying === 'nin' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white font-bold">Pending...</span>
                      </div>
                    ) : (
                      <span className="text-white font-bold">Verify NIN with Dojah</span>
                    )}
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center bg-[#E8F5E9] p-4 rounded-xl mb-1 border border-[#C8E6C9]">
                      <CheckmarkCircle02Icon size={20} className="text-[#388E3C] mr-2" variant="solid" />
                      <span className="text-[#388E3C] font-semibold">NIN Verified</span>
                    </div>
                    {ninVerifiedAt && (
                      <p className="text-xs text-textSecondary mt-2 ml-1">
                        Verified {new Date(ninVerifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* BVN Section */}
              {isKYCRequired && (
                <div className="bg-surface rounded-2xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center mb-4">
                    <CreditCardIcon size={24} className="text-primary mr-2" />
                    <h3 className="text-base font-semibold text-textPrimary flex-1">BVN Verification</h3>
                    {bvnVerified && <CheckmarkCircle02Icon size={24} className="text-[#388E3C]" variant="solid" />}
                  </div>

                  {!bvnVerified ? (
                    <button
                      onClick={() => openWidget('bvn')}
                      disabled={verifying === 'bvn'}
                      className={clsx(
                        "w-full flex items-center justify-center py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(107,79,58,0.25)]",
                        verifying === 'bvn' ? "bg-primary/60" : "bg-primary active:scale-[0.98]"
                      )}
                    >
                      {verifying === 'bvn' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-white font-bold">Pending...</span>
                        </div>
                      ) : (
                        <span className="text-white font-bold">Verify BVN with Dojah</span>
                      )}
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center bg-[#E8F5E9] p-4 rounded-xl mb-1 border border-[#C8E6C9]">
                        <CheckmarkCircle02Icon size={20} className="text-[#388E3C] mr-2" variant="solid" />
                        <span className="text-[#388E3C] font-semibold">BVN Verified</span>
                      </div>
                      {bvnVerifiedAt && (
                        <p className="text-xs text-textSecondary mt-2 ml-1">
                          Verified {new Date(bvnVerifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sync Button */}
              <div className="flex flex-col items-center mt-2">
                <button 
                  onClick={() => {
                    if (manualRefId.trim()) handleSync();
                    else handleSync();
                  }}
                  disabled={syncing}
                  className="flex items-center py-2 px-4 rounded-lg active:bg-surfaceLight transition-colors"
                >
                  {syncing ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshIcon size={18} className="text-primary mr-2" />
                      <span className="text-sm font-semibold text-primary">Sync with Dojah</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowRefInput(!showRefInput)}
                  className="mt-2"
                >
                  <span className="text-xs text-textTertiary underline decoration-textTertiary/50">
                    {showRefInput ? 'Cancel' : 'Have a reference ID? Tap to enter'}
                  </span>
                </button>

                {showRefInput && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center w-full mt-4 gap-2 px-2"
                  >
                    <input
                      type="text"
                      placeholder="Paste reference ID (e.g. IS-...)"
                      value={manualRefId}
                      onChange={(e) => setManualRefId(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                    />
                    <button 
                      onClick={handleSync}
                      className="bg-primary text-white font-bold text-sm px-4 py-2 rounded-lg"
                    >
                      Go
                    </button>
                  </motion.div>
                )}
              </div>

              {/* All Done */}
              {allVerified && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-6 mt-4 flex flex-col items-center shadow-sm text-center"
                >
                  <CheckmarkBadge01Icon size={48} className="text-[#388E3C] mb-3" />
                  <h4 className="text-lg font-bold text-[#388E3C] mb-1">All verifications complete!</h4>
                  <p className="text-sm text-[#2E7D32]">You can now proceed to book listings.</p>
                </motion.div>
              )}
            </>
          )}
          
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { kycService } from '../../api/kycService';

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
  // QA-PWAJ2-009: kept so a renter whose popup was blocked still has a way through.
  const [blockedWidgetUrl, setBlockedWidgetUrl] = useState<string | null>(null);
  const [showRefInput, setShowRefInput] = useState(false);
  const [manualRefId, setManualRefId] = useState('');
  // QA-API-280: true while the server holds a verification reference this user has not
  // completed the round-trip on. Drives the automatic sync when they come back to the tab.
  const awaitingSync = useRef(false);
  const autoSyncing = useRef(false);

  // SECURITY-FIX (P-C1): verification state is derived ONLY from the backend
  // (kycService.getKYCStatus). The previous implementation faked verification with a
  // setTimeout and self-wrote `ninVerified/bvnVerified: true` into the persisted auth
  // store, letting any user reach "verified" with zero identity data. All client-side
  // self-verification has been removed.
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await kycService.getKYCStatus();
      if (res?.success && res.data) {
        // QA-API-280: the server now says whether a started verification is still waiting to
        // be synced, so returning to this screen later (new session, different device) still
        // knows to pick it up rather than depending on a flag set earlier in this tab.
        awaitingSync.current = !!res.data.awaitingSync;
        setNinVerified(!!res.data.ninVerified);
        setBvnVerified(!!res.data.bvnVerified);
        setNinVerifiedAt(res.data.ninVerifiedAt || null);
        setBvnVerifiedAt(res.data.bvnVerifiedAt || null);
        // Keep the (UI-only) persisted store in sync with SERVER truth, never a timer.
        if (user) {
          const vStatus = (res.data.ninVerified && (!isKYCRequired || res.data.bvnVerified)) ? 'verified' : 'pending';
          setUser({
            ...user,
            ninVerified: !!res.data.ninVerified,
            bvnVerified: !!res.data.bvnVerified,
            verificationStatus: vStatus
          } as any);
        }
      }
    } catch {
      customAlert('Could not load verification status. Please try again.', 'Error', 'error');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const openWidget = async (type: 'nin' | 'bvn') => {
    setVerifying(type);
    try {
      // Ask the backend to create a Dojah verification session for this user.
      const res = await kycService.initialize(type);
      const widgetUrl = res?.data?.widgetUrl;
      // SECURITY-FIX TODO: fully embed the Dojah web widget (res.data.widgetUrl /
      // res.data.html / res.data.widgetId) via the Dojah SDK and, on the widget's
      // completion event, call kycService.verify(res.data.referenceId, type). The Dojah
      // SDK is not yet bundled in the PWA, so we open the hosted widget and rely on the
      // backend to record the result. Verified flags are NEVER set on the client.
      // BUGFIX (QA-PWAJ2-009): the widget is opened with window.open, and the modal below
      // then told the renter verification had "started" whether or not anything opened. A
      // popup is blocked by default in plenty of mobile browsers and in an installed PWA, so
      // the renter saw a confident message over a window that never appeared — and KYC is
      // the gate that stands between them and every booking.
      //
      // window.open returns null when the popup is blocked. Say so, and give them the link.
      const opened = widgetUrl ? window.open(widgetUrl, '_blank', 'noopener,noreferrer') : null;
      // From here the verification happens somewhere this app cannot observe. Arm the
      // return-to-tab sync so finishing in the widget is enough (QA-API-280).
      if (widgetUrl) awaitingSync.current = true;

      if (!widgetUrl) {
        customAlert(
          'Verification is not available right now. Please try again shortly.',
          'Unavailable',
          'error'
        );
      } else if (!opened) {
        setBlockedWidgetUrl(widgetUrl);
        customAlert(
          'Your browser blocked the verification window. Use the "Open verification" link below, ' +
            'then tap "Sync with Dojah" when you are done.',
          'Popup blocked',
          'error'
        );
      } else {
        customAlert(
          'Complete the verification in the Dojah window, then tap "Sync with Dojah" to refresh your status.',
          'Verification started',
          'info'
        );
      }
      // Refresh from the server (in case verification already completed server-side).
      await fetchStatus();
    } catch {
      customAlert('Could not start verification. Please try again.', 'Error', 'error');
    } finally {
      setVerifying(null);
    }
  };

  /**
   * `silent` is the automatic pass that runs when the user comes back from the Dojah tab
   * (QA-API-280). It reports success the same way a tapped sync does, but says nothing when
   * there is simply nothing to sync yet — an unprompted "Not verified" popup on every tab
   * switch would be noise, and the screen already shows the real state.
   */
  const handleSync = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    setSyncing(true);
    try {
      const ref = manualRefId.trim() || undefined;
      // Pull the latest Dojah results server-side, then read authoritative status.
      const res: any = await kycService.sync(undefined, ref);
      await fetchStatus();
      setShowRefInput(false);
      setManualRefId('');

      // BUGFIX (QA-PWAJ2-010): this showed a green tick and "Sync complete! / Success"
      // whenever the REQUEST did not throw. The endpoint answers 200 with
      // { success: true, results: { nin: { checked: false, reason: "Dojah API error: 404" } } }
      // when nothing was verified — which is the normal case for a renter who has not
      // finished the widget. So the screen told them verification had succeeded while the
      // server had verified nothing, and the gate then refused their booking with no
      // explanation they could connect to this.
      //
      // Report what the server actually said.
      const results = res?.data?.results ?? {};
      const checks = Object.entries(results) as Array<[string, any]>;
      const verified = checks.filter(([, r]) => r?.checked && r?.verified !== false);
      const notChecked = checks.filter(([, r]) => !r?.checked);

      if (verified.length > 0) {
        // Nothing left outstanding on the types that just came back verified.
        awaitingSync.current = false;
        customAlert(
          `Verified: ${verified.map(([k]) => k.toUpperCase()).join(', ')}.`,
          'Sync complete',
          'success'
        );
        return;
      }

      if (silent) return;

      // BUGFIX (QA-API-281): this used to splice the server's `reason` straight into the
      // sentence, and for the commonest case — modal opened, closed before finishing — that
      // reason was the literal "Dojah API error: 404". The renter was shown a provider status
      // code, run together with the next sentence for want of a separator. The server no
      // longer sends codes, and the two sentences are now joined properly rather than by
      // hoping the reason ends in punctuation.
      const reason = notChecked.find(([, r]) => r?.reason)?.[1]?.reason;
      const followUp = 'Finish the verification in the Dojah window, then sync again.';
      customAlert(
        reason ? `${reason} ${followUp}` : `Nothing to sync yet. ${followUp}`,
        'Not verified',
        'info'
      );
    } catch {
      if (!silent) customAlert('Sync failed. Please try again.', 'Error', 'error');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * BUGFIX (QA-API-280): the widget opens in a separate tab and reports back to Dojah, not to
   * us. Until now the only thing that pulled the result across was a secondary "Sync with
   * Dojah" button — so a renter who verified successfully and simply switched back to the app
   * stayed unverified, and every booking was refused with nothing on screen explaining why.
   *
   * Returning to the tab is the signal that they are done, so that is what triggers the sync.
   */
  const syncOnReturn = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    if (!awaitingSync.current || autoSyncing.current) return;
    if (ninVerified && (!isKYCRequired || bvnVerified)) return;

    autoSyncing.current = true;
    try {
      await handleSync({ silent: true });
    } finally {
      autoSyncing.current = false;
    }
    // handleSync is recreated each render; the guards above are what keep this from
    // re-entering, so the callback deliberately depends only on the verified flags.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ninVerified, bvnVerified, isKYCRequired]);

  useEffect(() => {
    window.addEventListener('focus', syncOnReturn);
    document.addEventListener('visibilitychange', syncOnReturn);
    return () => {
      window.removeEventListener('focus', syncOnReturn);
      document.removeEventListener('visibilitychange', syncOnReturn);
    };
  }, [syncOnReturn]);

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

                {/* BUGFIX (QA-PWAJ2-009): if the browser blocked the verification popup, the
                    renter previously had no route forward at all — the modal claimed
                    verification had started and nothing had opened. A plain link works where
                    window.open does not, because it is a direct user gesture on an anchor. */}
                {blockedWidgetUrl && (
                  <a
                    href={blockedWidgetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setBlockedWidgetUrl(null)}
                    className="flex items-center py-2 px-4 rounded-lg bg-primary text-white text-sm font-semibold"
                  >
                    Open verification
                  </a>
                )}
                
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
                      onClick={() => handleSync()}
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

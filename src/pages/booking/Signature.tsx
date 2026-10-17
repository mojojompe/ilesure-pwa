import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { ArrowDown01Icon } from '@hugeicons/react';
import SignatureCanvas from 'react-signature-canvas';
import { customAlert } from '../../stores/alertStore';
import { clsx } from 'clsx';
import { contractService } from '../../api/contractService';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

type SignatureMode = 'drawn' | 'typed';

export function Signature() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [agreementSource, setAgreementSource] = useState<'platform_template' | 'landlord_upload'>('platform_template');
  const [loadError, setLoadError] = useState<string>('');
  const contractTitle = 'TENANCY AGREEMENT';
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [hasOpenedDocument, setHasOpenedDocument] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // Typing the account name is an alternative for anyone who would rather not draw.
  const [mode, setMode] = useState<SignatureMode>('drawn');
  const [typedName, setTypedName] = useState('');
  const accountName = useAuthStore((s) => s.user?.fullName) || '';

  // Loads the actual agreement for this booking. Tenancy terms differ per
  // property - a landlord or agent may have attached their own document to the
  // listing - so the tenant must review the real PDF, never boilerplate text.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const initContract = async () => {
      setLoading(true);
      setLoadError('');
      try {
        // Generating is idempotent: it returns the existing record if there is one.
        await contractService.generateTenancyAgreement({ bookingId: id });
        const status = await contractService.getTenancyAgreementStatus(id);
        if (cancelled) return;

        const url = status?.data?.documentUrl;
        if (!url) {
          setLoadError('We could not load your tenancy agreement. Please try again.');
        } else {
          setDocumentUrl(url);
          setAgreementSource(status?.data?.agreementSource || 'platform_template');
        }
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(
          getApiErrorMessage(err, 'We could not load your tenancy agreement. Please try again.')
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initContract();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Opening the PDF in a new tab is the reliable path on mobile browsers, where
  // inline PDF rendering in an iframe is inconsistent.
  const handleOpenDocument = () => {
    if (!documentUrl) return;
    setHasOpenedDocument(true);
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClear = () => {
    if (mode === 'typed') setTypedName('');
    else sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (!documentUrl) {
      customAlert('Your tenancy agreement has not loaded yet.', 'Warning', 'warning');
      return;
    }
    if (mode === 'drawn' && sigCanvas.current?.isEmpty()) {
      customAlert('Please sign the document first', 'Warning', 'warning');
      return;
    }
    if (mode === 'typed' && typedName.trim().length < 2) {
      customAlert('Please type your full name to sign', 'Warning', 'warning');
      return;
    }
    if (!id) return;

    // SECURITY-FIX (P-M4): the signature is now actually sent to the backend and we only
    // advance to payment on a successful server response. Previously handleSign never
    // read the canvas or called the contract service, a setTimeout simply navigated on,
    // so no legal artifact was ever recorded. The backend must bind this signature to the
    // authenticated tenant + bookingId and store the executed agreement.
    setSigning(true);
    try {
      const res = await contractService.signTenancyAgreement(
        mode === 'typed'
          ? { bookingId: id, party: 'tenant', signatureType: 'typed', typedName: typedName.trim() }
          : { bookingId: id, party: 'tenant', signatureType: 'drawn', signatureBase64: sigCanvas.current!.toDataURL() }
      );
      if (res?.success) {
        navigate(`/booking/payment/${id}`);
      } else {
        customAlert(
          res?.message || 'Could not record your signature. Please try again.',
          'Error',
          'error'
        );
        setSigning(false);
      }
    } catch (err: any) {
      customAlert(
        getApiErrorMessage(err, 'Could not record your signature. Please try again.'),
        'Error',
        'error'
      );
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full bg-background items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-textSecondary font-medium">Loading agreement...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title={contractTitle} onBack={() => navigate(-1)} />

        {/* Source banner - tells the tenant whose terms these are */}
        <div className="px-4 py-3 bg-surfaceLight border-b border-border">
          <p className="text-[13px] text-textSecondary">
            {agreementSource === 'landlord_upload'
              ? 'This agreement was provided by the landlord/agent for this specific property.'
              : 'This is the standard ileSure tenancy agreement for this property.'}
          </p>
        </div>

        {/* Document Area */}
        <div
          ref={scrollRef}
          className={clsx(
            'flex-1 overflow-y-auto relative bg-background',
            !scrollEnabled && 'overflow-hidden'
          )}
        >
          {loadError ? (
            <div className="p-6 text-center">
              <p className="text-[15px] text-textPrimary font-semibold mb-2">
                Agreement unavailable
              </p>
              <p className="text-[14px] text-textSecondary">{loadError}</p>
            </div>
          ) : (
            <>
              {/* Inline preview. Mobile browsers vary in PDF support, so the
                  open-in-new-tab action below is the dependable fallback. */}
              <object
                data={documentUrl}
                type="application/pdf"
                className="w-full h-full min-h-[420px]"
                aria-label="Tenancy agreement document"
              >
                <div className="p-6 text-center">
                  <p className="text-[15px] text-textPrimary font-semibold mb-2">
                    Preview not supported on this device
                  </p>
                  <p className="text-[14px] text-textSecondary">
                    Tap the button below to open your tenancy agreement.
                  </p>
                </div>
              </object>

              <div className="p-4">
                <button
                  type="button"
                  onClick={handleOpenDocument}
                  className="w-full py-3 rounded-xl border border-primary text-primary text-[15px] font-bold active:bg-surfaceLight"
                >
                  Open full agreement
                </button>
              </div>

              {!hasOpenedDocument && (
                <div className="px-4 pb-4 flex flex-col items-center text-center">
                  <ArrowDown01Icon size={24} className="text-textSecondary" />
                  <p className="text-[13px] text-textSecondary mt-1">
                    Please read the full agreement before signing.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Signature Section */}
        <div className="bg-surface border-t border-border p-4 z-30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-textPrimary">Your Signature</h3>
            <div className="flex rounded-lg border border-border overflow-hidden" role="tablist" aria-label="Signature method">
              {(['drawn', 'typed'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    'px-3 py-1.5 text-[13px] font-semibold',
                    mode === m ? 'bg-primary text-white' : 'bg-background text-textSecondary'
                  )}
                >
                  {m === 'drawn' ? 'Draw' : 'Type name'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'drawn' ? (
            <div
              className="h-[180px] bg-background rounded-xl mb-4 overflow-hidden border border-[#E2E8F0]"
              onMouseEnter={() => setScrollEnabled(false)}
              onMouseLeave={() => setScrollEnabled(true)}
              onTouchStart={() => setScrollEnabled(false)}
              onTouchEnd={() => setScrollEnabled(true)}
            >
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#000000"
                canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
              />
            </div>
          ) : (
            <div className="mb-4">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={accountName || 'Your full name'}
                autoComplete="name"
                maxLength={120}
                aria-label="Type your full name to sign"
                className="w-full h-12 px-4 bg-background rounded-xl border border-[#E2E8F0] text-[15px] text-textPrimary"
              />
              <div className="h-[72px] mt-3 flex items-center justify-center rounded-xl bg-background border border-dashed border-border">
                <span className="font-serif italic text-[26px] text-textPrimary truncate px-4">
                  {typedName.trim() || ' '}
                </span>
              </div>
              <p className="text-[12px] text-textSecondary mt-2">
                Type your full name exactly as it appears on your account{accountName ? ` (${accountName})` : ''}.
                Typing your name signs the agreement just as drawing would.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="flex-1 py-4 bg-background border border-border rounded-xl text-textPrimary text-[15px] font-bold active:bg-surfaceLight"
            >
              Clear
            </button>
            <button
              onClick={handleSign}
              disabled={signing || !documentUrl}
              className={clsx(
                "flex-[2] py-4 rounded-xl flex items-center justify-center transition-opacity",
                signing || !documentUrl ? "bg-primary/50" : "bg-primary active:scale-[0.98]"
              )}
            >
              {signing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-white text-[15px] font-bold">Sign & Continue</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

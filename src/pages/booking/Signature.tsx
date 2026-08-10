import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { ArrowDown01Icon } from '@hugeicons/react';
import SignatureCanvas from 'react-signature-canvas';
import { customAlert } from '../../stores/alertStore';
import { clsx } from 'clsx';
// import { contractService } from '../../api/contractService'; // Uncomment when available
// import { bookingService } from '../../api/bookingService'; // Uncomment when available

export function Signature() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [contractText, setContractText] = useState<string>('');
  const [contractTitle, setContractTitle] = useState<string>('TENANCY AGREEMENT');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    // Mock fetching contract
    const initContract = async () => {
      setLoading(true);
      setTimeout(() => {
        setContractText(
          'Your tenancy agreement has been generated and is ready for review.\n\n' +
          'Please review the full agreement document carefully before signing. ' +
          'By signing below, you acknowledge that you have read and agree to all terms and conditions ' +
          'of this tenancy agreement, including the rent amount, caution fee, lease duration, ' +
          'and all covenants contained herein.\n\n' +
          'Once you sign, the landlord/agent will be notified to counter-sign. ' +
          'The fully executed agreement will be emailed to all parties.' +
          '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n' // Make it scrollable
        );
        setLoading(false);
      }, 1000);
    };
    initContract();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return;
    const progress = scrollTop / scrollableHeight;
    setScrollProgress(progress);
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      customAlert('Please sign the document first', 'Warning', 'warning');
      return;
    }
    
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      // Navigate to Payment
      navigate(`/booking/payment/${id}`);
    }, 1500);
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
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-border">
          <div 
            className="h-full bg-primary transition-all duration-100" 
            style={{ width: `${Math.min(scrollProgress * 100, 100)}%` }} 
          />
        </div>

        {/* Scrollable Document Area */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className={clsx(
            "flex-1 p-4 overflow-y-auto relative",
            !scrollEnabled && "overflow-hidden"
          )}
        >
          <p className="text-[15px] leading-[24px] text-textPrimary whitespace-pre-wrap pb-32">
            {contractText}
          </p>

          {/* Scroll Overlay */}
          {scrollProgress < 0.85 && (
            <div className="fixed bottom-[320px] left-0 right-0 max-w-md mx-auto bg-black/70 p-4 flex flex-col items-center pointer-events-none z-20 backdrop-blur-sm">
              <ArrowDown01Icon size={32} className="text-white" />
              <p className="text-white text-[15px] font-bold mt-2">
                Scroll to read the full agreement
              </p>
              <p className="text-white/80 text-sm mt-1">
                {Math.round(scrollProgress * 100)}% read
              </p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="bg-surface border-t border-border p-4 z-30">
          <h3 className="text-[15px] font-bold text-textPrimary mb-2">Your Signature</h3>
          
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

          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="flex-1 py-4 bg-background border border-border rounded-xl text-textPrimary text-[15px] font-bold active:bg-surfaceLight"
            >
              Clear
            </button>
            <button
              onClick={handleSign}
              disabled={signing}
              className={clsx(
                "flex-[2] py-4 rounded-xl flex items-center justify-center transition-opacity",
                signing ? "bg-primary/50" : "bg-primary active:scale-[0.98]"
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

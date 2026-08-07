import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Share01Icon, AddSquareIcon, Cancel01Icon } from '@hugeicons/react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    // Has seen prompt?
    const hasSeenPrompt = localStorage.getItem('ilesure_pwa_prompted');

    if (!isStandalone && !hasSeenPrompt) {
      // For iOS, just show it after a short delay since there's no native prompt event
      if (isIOSDevice) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Android/Chrome native prompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ilesure_pwa_prompted', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.setItem('ilesure_pwa_prompted', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <Modal isOpen={showPrompt} onClose={handleDismiss} hideCloseButton>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-btn-primary rounded-2xl flex items-center justify-center mb-4 shadow-clay-sm">
          <img src="/pwa-192x192.png" alt="iléSure" className="w-12 h-12 rounded-xl" />
        </div>
        
        <h3 className="text-xl font-bold text-textPrimary mb-2">Install iléSure App</h3>
        <p className="text-textSecondary text-sm mb-6">
          Add iléSure to your home screen for a faster, app-like experience and offline access.
        </p>

        {isIOS ? (
          <div className="bg-surfaceLight rounded-2xl p-4 w-full text-left mb-6">
            <p className="text-sm text-textPrimary font-semibold mb-2">To install on iOS:</p>
            <ol className="text-sm text-textSecondary space-y-3">
              <li className="flex items-center gap-2">
                1. Tap the <Share01Icon size={18} className="text-btn-primary" /> Share button below
              </li>
              <li className="flex items-center gap-2">
                2. Scroll down and tap <AddSquareIcon size={18} className="text-btn-primary" /> "Add to Home Screen"
              </li>
            </ol>
          </div>
        ) : (
          <div className="w-full flex gap-3 mb-2">
            <Button variant="secondary" fullWidth onClick={handleDismiss}>
              Not Now
            </Button>
            <Button variant="primary" fullWidth onClick={handleInstall}>
              Install App
            </Button>
          </div>
        )}
        
        {isIOS && (
          <Button variant="ghost" fullWidth onClick={handleDismiss}>
            I'll do it later
          </Button>
        )}
      </div>
    </Modal>
  );
}

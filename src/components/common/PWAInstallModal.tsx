import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Download04Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';

export function PWAInstallModal() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if shown this session
    const hasSeen = sessionStorage.getItem('pwa_install_prompt_seen');
    if (hasSeen) return;

    // Initial check (delay by 2s on first load)
    const initialTimer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem('pwa_install_prompt_seen', 'true');
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(initialTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-background w-full max-w-sm rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col items-center text-center"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
              <Cancel01Icon size={20} />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Download04Icon size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-textPrimary mb-2">Install ileSure App</h3>
            <p className="text-sm text-textSecondary mb-6">
              Install our app on your device for a faster, better experience and easy access to your properties.
            </p>
            
            {isIOS && !deferredPrompt ? (
              <div className="bg-surfaceLight p-4 rounded-xl border border-borderLight text-xs text-textSecondary text-left w-full mb-4">
                <p className="font-bold text-textPrimary mb-1">To install on iOS:</p>
                <p>1. Tap the Share button at the bottom of Safari.</p>
                <p>2. Scroll down and tap "Add to Home Screen".</p>
              </div>
            ) : null}

            <div className="w-full flex gap-3">
              <Button fullWidth variant="outline" onClick={handleClose}>Not Now</Button>
              {(!isIOS || deferredPrompt) && (
                <Button fullWidth onClick={handleInstall}>Install App</Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

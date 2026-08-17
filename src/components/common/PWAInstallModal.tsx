import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Download04Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';
import { customAlert } from '../../stores/alertStore';

export function PWAInstallModal() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      return;
    }

    // Check if shown this session
    const hasSeen = sessionStorage.getItem('pwa_install_prompt_seen');
    if (hasSeen) return;

    let initialTimer: NodeJS.Timeout;

    // 1. Intercept beforeinstallprompt
    const promptHandler = (e: any) => {
      // Prevent default browser prompt
      e.preventDefault();
      // Save event so it can be triggered later
      setDeferredPrompt(e);

      // 2. Only show the custom modal after the browser has verified it's installable
      // Optional enhancement: wait 3 seconds so it doesn't interrupt initial load
      if (!isIOS) {
        initialTimer = setTimeout(() => {
          setShow(true);
          sessionStorage.setItem('pwa_install_prompt_seen', 'true');
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    // 4. Additional Polish: Listen for appinstalled
    const installedHandler = () => {
      setDeferredPrompt(null);
      setShow(false);
      customAlert('App successfully installed!', 'Success', 'success');
    };
    
    window.addEventListener('appinstalled', installedHandler);

    // Fallback for iOS (since beforeinstallprompt is not supported on iOS Safari)
    if (isIOS) {
      initialTimer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('pwa_install_prompt_seen', 'true');
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('appinstalled', installedHandler);
      if (initialTimer) clearTimeout(initialTimer);
    };
  }, [isIOS]);

  const handleInstall = async () => {
    // 3. What Happens When the Install Button is Clicked
    setShow(false); // Hide the modal

    if (deferredPrompt) {
      // Trigger the native prompt
      deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // They accepted, clear the prompt
        setDeferredPrompt(null);
      } else {
        // They dismissed it
        console.log('User dismissed the install prompt');
      }
    }
  };

  const handleClose = () => {
    setShow(false);
  };

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
            
            <h3 className="text-xl font-bold text-textPrimary mb-2">Install App</h3>
            <p className="text-sm text-textSecondary mb-6">
              Install for offline access, better performance, and a native app experience.
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
                <Button fullWidth onClick={handleInstall}>Install</Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Download01Icon, Cancel01Icon } from '@hugeicons/react';
import { clsx } from 'clsx';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Let's wait a bit before showing it so it's not too aggressive
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-[90px] mx-4 p-4 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-borderLight z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full bg-surfaceLight text-textSecondary hover:bg-borderLight transition-colors"
      >
        <Cancel01Icon size={16} />
      </button>
      
      <div className="flex items-start gap-4 pr-6">
        <div className="w-12 h-12 rounded-2xl bg-btn-primary/10 flex items-center justify-center shrink-0">
          <Download01Icon size={24} className="text-btn-primary" />
        </div>
        <div>
          <h3 className="font-bold text-textPrimary text-sm mb-1">Install iléSure App</h3>
          <p className="text-xs text-textSecondary mb-3">
            Get the full native experience on your device. Faster access and offline support.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstallClick} className="flex-1 shadow-sm">
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss} className="flex-1">
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

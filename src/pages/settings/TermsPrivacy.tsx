import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { GlobalIcon, CheckmarkBadge01Icon } from '@hugeicons/react';

export function TermsPrivacy() {
  const navigate = useNavigate();

  const openTerms = () => {
    window.open('https://ilesure.com/terms-of-service', '_blank');
  };

  const openPrivacy = () => {
    window.open('https://ilesure.com/privacy-policy', '_blank');
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Terms & Privacy" onBack={() => navigate(-1)} />
        
        <div className="flex-1 px-5 pt-8 flex flex-col items-center justify-center -mt-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckmarkBadge01Icon size={40} className="text-primary" />
          </div>
          
          <h2 className="text-xl font-bold text-textPrimary mb-3">Legal Documents</h2>
          <p className="text-sm text-textSecondary text-center mb-10 px-4 leading-relaxed">
            Please review our latest Terms of Service and Privacy Policy to understand how we protect your data and the rules for using our platform.
          </p>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={openTerms}
              className="w-full flex items-center justify-center gap-2 py-4 shadow-sm"
            >
              <GlobalIcon size={20} />
              <span>Terms of Service</span>
            </Button>

            <Button
              variant="outline"
              onClick={openPrivacy}
              className="w-full flex items-center justify-center gap-2 py-4 shadow-sm"
            >
              <GlobalIcon size={20} />
              <span>Privacy Policy</span>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

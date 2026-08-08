import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';

export function LifestyleSurvey() {
  const navigate = useNavigate();

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Lifestyle Survey" onBack={() => navigate(-1)} />
        
        <div className="flex-1 px-5 pt-8 flex flex-col items-center justify-center -mt-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-3xl">📋</span>
          </div>
          
          <h2 className="text-xl font-bold text-textPrimary mb-3 text-center">Complete Your Profile</h2>
          <p className="text-sm text-textSecondary text-center mb-10 px-4 leading-relaxed">
            Answer a few quick questions about your lifestyle, habits, and preferences to help us find your perfect roommate match!
          </p>

          <Button
            className="w-full max-w-[280px] shadow-sm"
            onClick={() => {
              // Placeholder for actual survey logic
              alert('Survey component would launch here.');
              navigate(-1);
            }}
          >
            Start Survey
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

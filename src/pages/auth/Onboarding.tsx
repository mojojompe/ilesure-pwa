import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export function Onboarding() {
  const navigate = useNavigate();
  const setHasSeenOnboarding = useAuthStore(state => state.setHasSeenOnboarding);

  const handleContinue = () => {
    setHasSeenOnboarding(true);
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-white p-6 justify-between max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Replace with actual illustration if available */}
        <div className="w-64 h-64 bg-surfaceLight rounded-full flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-btn-primary">iléSure</span>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-textPrimary mb-4">
          Find your perfect home <br /> and roommate
        </h1>
        <p className="text-center text-textSecondary px-4 leading-relaxed">
          The smart way for students and individuals to secure verified apartments and compatible roommates.
        </p>
      </div>

      <div className="pb-safe pt-4">
        <Button variant="primary" fullWidth size="lg" onClick={handleContinue}>
          Get Started
        </Button>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function Splash() {
  const navigate = useNavigate();
  const { token, hasSeenOnboarding } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        navigate('/discover', { replace: true });
      } else if (!hasSeenOnboarding) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, token, hasSeenOnboarding]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-btn-primary h-screen relative w-full max-w-md mx-auto overflow-hidden">
      <div className="animate-pulse">
        <h1 className="text-4xl font-black text-white tracking-tight">iléSure</h1>
        <div className="w-16 h-1.5 bg-white/50 rounded-full mt-2 mx-auto" />
      </div>
    </div>
  );
}

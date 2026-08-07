import React from 'react';
import { ArrowLeft01Icon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ title, onBack, rightAction }: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-borderLight shadow-sm">
      <button 
        onClick={handleBack}
        className="p-2 -ml-2 rounded-full hover:bg-surfaceLight transition-colors text-textPrimary"
      >
        <ArrowLeft01Icon size={24} />
      </button>
      
      {title && (
        <h1 className="text-lg font-bold text-textPrimary flex-1 text-center truncate px-2">
          {title}
        </h1>
      )}
      
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </div>
  );
}

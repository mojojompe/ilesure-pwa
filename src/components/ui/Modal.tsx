import React, { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { Cancel01Icon } from '@hugeicons/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  hideCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, hideCloseButton }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content - Bottom Sheet on Mobile, Centered on Desktop */}
      <div className={clsx(
        'relative w-full max-w-md bg-white shadow-clay rounded-t-3xl sm:rounded-3xl flex flex-col',
        'animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200'
      )}>
        {/* Mobile drag handle */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-borderLight rounded-full" />
        </div>

        <div className="flex items-center justify-between p-5 pb-2">
          {title ? (
            <h2 className="text-xl font-bold text-textPrimary">{title}</h2>
          ) : (
            <div />
          )}
          {!hideCloseButton && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surfaceLight transition-colors text-textSecondary"
            >
              <Cancel01Icon size={24} />
            </button>
          )}
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

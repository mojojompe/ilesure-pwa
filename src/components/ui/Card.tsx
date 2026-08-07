import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
  onClick?: () => void;
}

export function Card({ children, className, variant = 'default', onClick }: CardProps) {
  const variants = {
    default: 'bg-white shadow-clay-sm border border-borderLight',
    elevated: 'bg-white shadow-clay border border-borderLight',
    flat: 'bg-surfaceLight',
  };

  return (
    <div 
      className={clsx(
        'rounded-3xl p-4',
        variants[variant],
        onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : '',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

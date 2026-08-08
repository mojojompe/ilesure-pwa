import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TagProps {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'mustard' | 'brown' | 'outline' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  className?: string;
  size?: 'small' | 'medium';
}

export function Tag({ label, icon, variant = 'mustard', size = 'small', className }: TagProps) {
  const variants = {
    default: 'bg-surfaceLight text-textSecondary',
    primary: 'bg-primary/10 text-primary',
    mustard: 'bg-accent text-white',
    brown: 'bg-primary text-white',
    outline: 'border border-primary text-primary bg-transparent',
    success: 'bg-[#E8F5E9] text-[#2E7D32]',
    error: 'bg-[#FFEBEE] text-[#C62828]',
    warning: 'bg-[#FFF8E1] text-[#F57F17]',
    info: 'bg-[#E3F2FD] text-[#1565C0]',
    neutral: 'bg-surfaceLight text-textSecondary',
  };

  const sizes = {
    small: 'px-2 py-0.5 text-[10px]',
    medium: 'px-3 py-1 text-xs',
  };

  return (
    <div className={clsx(
      'inline-flex items-center rounded-full font-bold uppercase tracking-wider whitespace-nowrap',
      variants[variant],
      sizes[size],
      className
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </div>
  );
}

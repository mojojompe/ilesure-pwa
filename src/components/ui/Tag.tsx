import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TagProps {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'mustard' | 'outline';
  className?: string;
}

export function Tag({ label, icon, variant = 'default', className }: TagProps) {
  const variants = {
    default: 'bg-surfaceLight text-textSecondary',
    primary: 'bg-btn-primary/10 text-btn-primary',
    mustard: 'bg-btn-mustard/10 text-btn-mustard',
    outline: 'border border-borderLight text-textSecondary',
  };

  return (
    <div className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </div>
  );
}

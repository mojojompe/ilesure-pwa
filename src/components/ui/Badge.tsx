import React from 'react';
import { clsx } from 'clsx';

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  status: BadgeStatus;
  label: string;
  className?: string;
}

export function Badge({ status, label, className }: BadgeProps) {
  const styles = {
    success: 'bg-[#E6F4EA] text-[#137333]',
    warning: 'bg-[#FEF7E0] text-[#B06000]',
    error: 'bg-[#FCE8E6] text-[#C5221F]',
    info: 'bg-[#E8F0FE] text-[#1967D2]',
    default: 'bg-surfaceLight text-textSecondary',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
      styles[status],
      className
    )}>
      {label}
    </span>
  );
}

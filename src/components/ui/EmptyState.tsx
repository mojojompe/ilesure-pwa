import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8 text-center', className)}>
      {icon && (
        <div className="w-20 h-20 rounded-full bg-surfaceLight flex items-center justify-center text-textSecondary mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-textPrimary mb-2">{title}</h3>
      {description && (
        <p className="text-textSecondary text-sm max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

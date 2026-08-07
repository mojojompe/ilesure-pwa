import React from 'react';
import { clsx } from 'clsx';
import { Loading01Icon } from '@hugeicons/react';

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  className?: string;
}

export function RefreshIndicator({ isRefreshing, className }: RefreshIndicatorProps) {
  if (!isRefreshing) return null;

  return (
    <div className={clsx('w-full flex justify-center py-4', className)}>
      <div className="bg-white rounded-full p-2 shadow-clay-sm animate-spin">
        <Loading01Icon size={24} className="text-btn-primary" />
      </div>
    </div>
  );
}

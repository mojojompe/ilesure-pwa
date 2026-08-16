import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rounded', width, height }: SkeletonProps) {
  const variants = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  return (
    <div
      className={clsx(
        'animate-pulse bg-borderLight',
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height,
        minHeight: variant === 'text' ? '1em' : undefined,
      }}
    />
  );
}

// A common skeleton layout for a listing card
export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-3 shadow-sm border border-borderLight flex flex-col gap-3">
      <Skeleton height={180} className="w-full rounded-2xl" />
      <div className="px-1">
        <Skeleton variant="text" width="40%" height={20} className="mb-2" />
        <Skeleton variant="text" width="80%" height={24} className="mb-3" />
        <Skeleton variant="text" width="60%" height={16} />
      </div>
    </div>
  );
}

export const ChatItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row items-center p-4 border-b border-borderLight/50">
      <Skeleton variant="circular" width={48} height={48} className="mr-3 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-2">
          <Skeleton variant="text" width="50%" height={16} />
          <Skeleton variant="text" width="20%" height={12} />
        </div>
        <Skeleton variant="text" width="75%" height={14} />
      </div>
    </div>
  );
};

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row items-start p-4 border-b border-borderLight/50">
      <Skeleton variant="circular" width={40} height={40} className="mr-3 shrink-0" />
      <div className="flex-1 min-w-0 pt-1">
        <Skeleton variant="text" width="60%" height={16} className="mb-2" />
        <Skeleton variant="text" width="100%" height={14} className="mb-1" />
        <Skeleton variant="text" width="80%" height={14} className="mb-2" />
        <Skeleton variant="text" width="20%" height={12} />
      </div>
    </div>
  );
};

export const ApartmentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-borderLight shadow-sm mb-4">
      <div className="flex flex-row h-[100px]">
        <Skeleton variant="rectangular" width={100} height="100%" className="shrink-0" />
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <Skeleton variant="text" width="100%" height={16} className="mb-1.5" />
            <Skeleton variant="text" width="50%" height={14} />
          </div>
          <div className="flex justify-between items-end mt-2">
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="rounded" width={64} height={24} className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

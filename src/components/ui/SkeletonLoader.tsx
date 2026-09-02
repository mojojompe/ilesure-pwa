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

export function ListingCardSkeleton() {
  return (
    <div className="bg-surface rounded-[24px] overflow-hidden mb-5 border border-borderLight shadow-sm relative">
      <div className="relative w-full h-[380px]">
        <Skeleton variant="rectangular" width="100%" height="100%" />
        
        <div className="absolute bottom-0 left-0 right-0 pt-8 pb-4 px-4 bg-gradient-to-t from-[#3E1F0A] via-[#3E1F0A]/70 to-transparent z-10">
          <div className="flex flex-row justify-between items-start mb-2">
            <Skeleton variant="text" width="60%" height={24} className="bg-white/30" />
            <Skeleton variant="text" width="20%" height={24} className="bg-white/30" />
          </div>
          
          <div className="flex flex-row items-center gap-2 mb-1.5 mt-2">
            <Skeleton variant="circular" width={14} height={14} className="bg-white/30" />
            <Skeleton variant="text" width="40%" height={16} className="bg-white/30" />
          </div>
          
          <div className="flex flex-row items-center gap-2 mb-2 mt-2">
            <Skeleton variant="circular" width={14} height={14} className="bg-white/30" />
            <Skeleton variant="text" width="30%" height={16} className="bg-white/30" />
          </div>
          
          <div className="mt-4 flex gap-2">
             <Skeleton variant="rounded" width={40} height={40} className="bg-white/30 rounded-full" />
             <Skeleton variant="rounded" width={40} height={40} className="bg-white/30 rounded-full" />
             <Skeleton variant="rounded" width={40} height={40} className="bg-white/30 rounded-full" />
             <Skeleton variant="rounded" width={40} height={40} className="bg-white/30 rounded-full" />
          </div>
        </div>
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

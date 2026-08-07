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

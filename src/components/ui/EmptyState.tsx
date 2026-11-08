import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { EmptyIllustration, type EmptyIllustrationName } from './EmptyIllustration';

interface EmptyStateProps {
  /** Preferred: one of the shared iléSure empty-state illustrations. */
  illustration?: EmptyIllustrationName;
  /** Fallback for a one-off icon where no illustration fits. */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Smaller artwork and spacing, for sections inside a page. */
  compact?: boolean;
  className?: string;
}

export function EmptyState({ illustration, icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', compact ? 'py-6 px-4' : 'p-8', className)}>
      {illustration ? (
        <EmptyIllustration name={illustration} className={clsx('h-auto', compact ? 'w-32 mb-3' : 'w-48 mb-5')} />
      ) : icon ? (
        <div className="w-20 h-20 rounded-full bg-surfaceLight flex items-center justify-center text-textSecondary mb-4">
          {icon}
        </div>
      ) : null}
      <h3 className={clsx('font-bold text-textPrimary', compact ? 'text-base mb-1' : 'text-xl mb-2')}>{title}</h3>
      {description && (
        <p className={clsx('text-textSecondary max-w-sm leading-relaxed', compact ? 'text-xs' : 'text-sm', action ? 'mb-6' : '')}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

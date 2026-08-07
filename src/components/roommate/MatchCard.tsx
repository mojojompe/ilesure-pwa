import React from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { UserCircleIcon, CheckmarkBadge01Icon, Cancel01Icon } from '@hugeicons/react';

export interface MatchCardProps {
  id: string;
  name: string;
  score: number;
  topMatches: string[];
  conflicts?: string[];
  onPress?: () => void;
}

export function MatchCard({
  name,
  score,
  topMatches,
  conflicts = [],
  onPress,
}: MatchCardProps) {
  // Score styling logic
  const getScoreColor = () => {
    if (score >= 80) return 'text-status-success bg-status-success/10';
    if (score >= 60) return 'text-btn-mustard bg-btn-mustard/10';
    return 'text-status-error bg-status-error/10';
  };

  return (
    <Card 
      className="mb-4" 
      onClick={onPress}
      variant="elevated"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surfaceLight flex items-center justify-center text-textSecondary">
            <UserCircleIcon size={32} />
          </div>
          <div>
            <h3 className="font-bold text-textPrimary">{name}</h3>
            <p className="text-xs text-textSecondary">Roommate Match</p>
          </div>
        </div>
        <div className={clsx('px-3 py-1 rounded-full flex flex-col items-center', getScoreColor())}>
          <span className="text-lg font-black leading-none">{score}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Match</span>
        </div>
      </div>

      <div className="bg-surfaceLight rounded-2xl p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <CheckmarkBadge01Icon size={16} className="text-status-success mt-0.5 shrink-0" />
          <p className="text-sm text-textPrimary leading-snug">
            <span className="font-semibold">Matches on:</span> {topMatches.join(', ')}
          </p>
        </div>

        {conflicts.length > 0 && (
          <div className="flex items-start gap-2">
            <Cancel01Icon size={16} className="text-status-error mt-0.5 shrink-0" />
            <p className="text-sm text-textPrimary leading-snug">
              <span className="font-semibold">Differs on:</span> {conflicts.join(', ')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

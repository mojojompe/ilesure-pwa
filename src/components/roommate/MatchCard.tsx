import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cancel01Icon, 
  FavouriteIcon,
  Home01Icon,
  Search01Icon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  Tick02Icon
} from '@hugeicons/react';
import { MatchResult } from '../../api/roommateService';

export interface MatchCardProps {
  item: MatchResult;
  onPress?: () => void;
  onPass?: () => void;
  onInterest?: () => void;
}

const SCORE_COLORS = {
  excellent: '#2E7D32', // text-status-success
  good: '#1565C0',     // text-blue-700
  fair: '#E29C45',     // text-orange-400
  poor: '#C62828',     // text-status-error
};

export function MatchCard({
  item,
  onPress,
  onPass,
  onInterest,
}: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return SCORE_COLORS.excellent;
    if (score >= 65) return SCORE_COLORS.good;
    if (score >= 50) return SCORE_COLORS.fair;
    return SCORE_COLORS.poor;
  };

  const scoreColor = getScoreColor(item.overallScore);

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'border-[#2E7D32] text-[#2E7D32]';
    if (score >= 65) return 'border-[#1565C0] text-[#1565C0]';
    if (score >= 50) return 'border-[#E29C45] text-[#E29C45]';
    return 'border-[#C62828] text-[#C62828]';
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="bg-surface rounded-[24px] p-4 mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-borderLight cursor-pointer relative overflow-hidden"
    >
      {/* Header: Avatar + Score */}
      <div className="flex flex-row justify-between items-center mb-3">
        <div className="flex flex-row items-center flex-1">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-sm">
            {item.user?.avatar ? (
              <img src={item.user.avatar} alt={item.user.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-base font-bold">
                {item.user?.fullName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <h3 className="text-base font-bold text-textPrimary truncate">{item.user?.fullName}</h3>
            {item.profile?.courseOfStudy && (
              <p className="text-xs text-textSecondary truncate mt-0.5">{item.profile.courseOfStudy}</p>
            )}
          </div>
        </div>

        <div 
          className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center bg-surfaceLight shrink-0 ml-2 ${getScoreColorClass(item.overallScore)}`}
        >
          <span className="text-base font-extrabold">{item.overallScore}%</span>
        </div>
      </div>

      {/* Listing / Looking for Preview */}
      {item.listing ? (
        <div className="flex flex-row items-center gap-2 bg-surfaceLight rounded-xl px-3 py-2 mb-3">
          <Home01Icon size={16} className="text-primary shrink-0" />
          <p className="text-xs text-textSecondary truncate flex-1">
            Wants to share: {item.listing.title} — ₦{item.listing.rentAnnual?.toLocaleString()}/yr
          </p>
        </div>
      ) : item.profile?.lookingFor && item.profile.lookingFor !== 'any' ? (
        <div className="flex flex-row items-center gap-2 bg-surfaceLight rounded-xl px-3 py-2 mb-3">
          <Search01Icon size={16} className="text-textTertiary shrink-0" />
          <p className="text-xs text-textSecondary truncate flex-1">
            Looking for a {item.profile.lookingFor} {item.profile.budgetMax ? `(₦${item.profile.budgetMin?.toLocaleString()} - ₦${item.profile.budgetMax?.toLocaleString()})` : ''}
          </p>
        </div>
      ) : null}

      {/* Strengths & Concerns Pills */}
      <div className="flex flex-row flex-wrap gap-2 mb-4">
        {item.strengths?.slice(0, 2).map((s, i) => (
          <div key={`s-${i}`} className="flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9]">
            <CheckmarkBadge01Icon size={14} className="text-[#2E7D32]" />
            <span className="text-[11px] font-semibold text-[#2E7D32]">{s}</span>
          </div>
        ))}
        {item.concerns?.slice(0, 2).map((c, i) => (
          <div key={`c-${i}`} className="flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFEBEE]">
            <Alert02Icon size={14} className="text-[#C62828]" />
            <span className="text-[11px] font-semibold text-[#C62828]">{c}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-row gap-4 mt-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onPass?.(); }}
          className="flex-1 h-12 flex items-center justify-center rounded-[16px] bg-surfaceLight border border-borderLight active:scale-95 transition-transform"
        >
          <Cancel01Icon size={22} className="text-textSecondary" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); if (!item.isInterested) onInterest?.(); }}
          className={`flex-[2] h-12 flex flex-row items-center justify-center gap-2 rounded-[16px] active:scale-95 transition-all ${
            item.isInterested ? 'bg-accent' : 'bg-primary'
          }`}
        >
          {item.isInterested ? (
            <Tick02Icon size={20} className="text-white" />
          ) : (
            <FavouriteIcon size={20} className="text-white" />
          )}
          <span className="text-white text-sm font-bold">
            {item.isInterested ? 'Sent' : 'Interest'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

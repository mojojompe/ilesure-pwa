import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { 
  Home01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Alert02Icon
} from '@hugeicons/react';
import { roommateService, MatchResult } from '../../api/roommateService';
import { sharedBookingService } from '../../api/sharedBookingService';
<<<<<<< HEAD
=======
import { chatService } from '../../api/chatService';
>>>>>>> f3ac5e797eee2f6ae6e7c35644c97f5bab03d6b3
import { customAlert } from '../../stores/alertStore';

export function MatchProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await roommateService.getMatchById(id);
<<<<<<< HEAD
        if (response.success && response.data) {
          setMatch(response.data);
          setInterested(response.data.isInterested || response.data.isConnected || false);
        }
=======
        setMatch(response.data);
        setInterested(response.data.isInterested || response.data.isConnected || false);
>>>>>>> f3ac5e797eee2f6ae6e7c35644c97f5bab03d6b3
      } catch (error) {
        console.error('Failed to fetch match details', error);
        customAlert('Failed to load match details', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleInterest = async () => {
    if (!match || interested) return;
    try {
      const result = await roommateService.expressInterest(match.userId);
      if (result.data?.connected) {
<<<<<<< HEAD
        customAlert('It\'s a Match! Contact details shared', 'Success', 'success');
=======
        customAlert("It's a Match! Contact details shared", 'Success', 'success');
>>>>>>> f3ac5e797eee2f6ae6e7c35644c97f5bab03d6b3
      } else {
        customAlert('Interest Sent! Waiting for response', 'Success', 'success');
      }
      setInterested(true);
    } catch (error: any) {
<<<<<<< HEAD
      console.error(error);
      customAlert(error?.response?.data?.error?.message || 'Failed to express interest', 'Error', 'error');
=======
      customAlert(error.response?.data?.error?.message || 'Failed to send interest', 'Error', 'error');
>>>>>>> f3ac5e797eee2f6ae6e7c35644c97f5bab03d6b3
    }
  };

  const handleBookTogether = async () => {
    if (!match || !match.requestId) return;
    try {
      setCreatingBooking(true);
<<<<<<< HEAD
      const result = await sharedBookingService.createSharedBooking(match.requestId);
      if (result.data?._id) {
        customAlert('Booking Created. You have 5 days to complete payment.', 'Success', 'success');
        navigate(`/shared-booking/${result.data._id}`);
      }
    } catch (error: any) {
      console.error(error);
      customAlert(error?.response?.data?.error?.message || 'Failed to create booking', 'Error', 'error');
=======
      const result = await sharedBookingService.createSharedBooking(match.requestId, match.listing?.id);
      if (result.data?._id) {
        customAlert('Booking created. You have 5 days to complete payment.', 'Success', 'success');
        navigate(`/shared-booking/${result.data._id}`);
      }
    } catch (error: any) {
      customAlert(error.response?.data?.error?.message || 'Failed to create booking', 'Error', 'error');
>>>>>>> f3ac5e797eee2f6ae6e7c35644c97f5bab03d6b3
    } finally {
      setCreatingBooking(false);
    }
  };

  if (loading || !match) {
    return (
      <AppShell hideTabBar>
        <MobileHeader title="Loading..." onBack={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center text-primary">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const isAnonymous = !match.isConnected && !interested;
  const recColor = match.overallScore >= 80 ? '#2E7D32' : match.overallScore >= 65 ? '#1565C0' : match.overallScore >= 50 ? '#E29C45' : '#C62828';

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative pb-[90px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 z-10 bg-background">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-surface shadow-sm border border-borderLight flex items-center justify-center text-textPrimary active:scale-95 transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-lg font-black text-textPrimary">Match Details</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
          
          {/* Overall Score */}
          <div className="flex flex-col items-center py-6">
            <span className="text-6xl font-black" style={{ color: recColor }}>{match.overallScore}%</span>
            <span className="text-sm font-black tracking-widest text-textTertiary uppercase -mt-1">{match.recommendation} MATCH</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{match.user.fullName?.charAt(0) || '?'}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-textPrimary">
                {isAnonymous ? 'Anonymous Match' : match.user.fullName}
              </h2>
              {match.profile?.courseOfStudy && (
                <p className="text-sm text-textSecondary mt-0.5">{match.profile.courseOfStudy}</p>
              )}
              {match.profile?.institution && (
                <p className="text-sm text-textSecondary mt-0.5">{match.profile.institution}</p>
              )}
              {isAnonymous && (
                <p className="text-xs text-textTertiary italic mt-1">Mutual interest required to reveal identity</p>
              )}
            </div>
          </div>

          {/* Listing Info */}
          {match.listing && (
            <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">SHARING</h3>
              <div className="flex items-center gap-4">
                <Home01Icon size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-textPrimary">{match.listing.title}</p>
                  <p className="text-sm text-textSecondary mt-0.5">
                    {match.listing.areaCluster} — ₦{match.listing.rentAnnual?.toLocaleString()}/yr
                  </p>
                </div>
              </div>
            </div>
          )}

          {!match.listing && match.profile?.lookingFor && (
            <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">LOOKING FOR</h3>
              <p className="text-sm text-textSecondary">
                A {match.profile.lookingFor}{match.profile.budgetMax ? ` (₦${match.profile.budgetMin?.toLocaleString()} - ₦${match.profile.budgetMax?.toLocaleString()})` : ''}
              </p>
            </div>
          )}

          {/* Category Scores */}
          <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
            <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">COMPATIBILITY BREAKDOWN</h3>
            {[
              { label: 'Lifestyle', score: match.categoryScores?.lifestyle || 0 },
              { label: 'Preferences', score: match.categoryScores?.preference || 0 },
              { label: 'Practical', score: match.categoryScores?.numeric || 0 },
            ].map((cat, i) => (
              <div key={i} className="flex items-center gap-2 mb-3 last:mb-0">
                <span className="w-[90px] text-sm font-semibold text-textPrimary">{cat.label}</span>
                <div className="flex-1 h-2 bg-softSurface rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${cat.score}%`, 
                      backgroundColor: cat.score >= 70 ? '#2E7D32' : cat.score >= 50 ? '#E29C45' : '#C62828' 
                    }} 
                  />
                </div>
                <span className="w-9 text-right text-sm font-bold text-textPrimary">{cat.score}%</span>
              </div>
            ))}
          </div>

          {/* Dimension Comparison */}
          {match.dimensionScores && match.dimensionScores.length > 0 && (
            <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">LIFESTYLE COMPARISON</h3>
              {match.dimensionScores.map((dim, i) => (
                <div key={i} className="flex items-center gap-1 mb-2 last:mb-0">
                  <div className="flex-1 flex justify-center items-center bg-softSurface py-2 rounded">
                    <span className="text-sm font-semibold text-textPrimary capitalize">{dim.yourValue || '—'}</span>
                  </div>
                  <div className="w-[70px] flex flex-col items-center gap-[2px]">
                    {dim.match ? (
                      <CheckmarkCircle02Icon size={16} className="text-[#2E7D32]" variant="solid" />
                    ) : (
                      <CancelCircleIcon size={16} className="text-[#C62828]" variant="solid" />
                    )}
                    <span className={`text-[9px] font-black tracking-wider ${dim.match ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                      {dim.match ? 'MATCH' : 'DIFF'}
                    </span>
                    <span className="text-[9px] text-textTertiary text-center leading-tight">{dim.label}</span>
                  </div>
                  <div className="flex-1 flex justify-center items-center bg-softSurface py-2 rounded">
                    <span className="text-sm font-semibold text-textPrimary capitalize">{dim.theirValue || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {match.strengths?.length > 0 && (
            <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">WHAT WORKS</h3>
              {match.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                  <CheckmarkCircle02Icon size={18} className="text-[#2E7D32] mt-0.5" variant="solid" />
                  <span className="text-sm text-textSecondary flex-1 leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Concerns */}
          {match.concerns?.length > 0 && (
            <div className="bg-surface p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-borderLight">
              <h3 className="text-xs font-bold text-textTertiary tracking-wide mb-3">AREAS TO DISCUSS</h3>
              {match.concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                  <Alert02Icon size={18} className="text-[#C62828] mt-0.5" variant="solid" />
                  <span className="text-sm text-textSecondary flex-1 leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-borderLight z-30 flex gap-4">
          {match.isConnected && match.listing ? (
            <Button
              className="flex-1 shadow-[0_4px_12px_rgba(107,79,58,0.25)]"
              onClick={handleBookTogether}
              disabled={creatingBooking}
            >
              {creatingBooking ? 'Creating Booking...' : 'Book Together'}
            </Button>
          ) : (
            <Button
              className="flex-1 shadow-[0_4px_12px_rgba(107,79,58,0.25)]"
              variant={interested ? 'secondary' : 'primary'}
              onClick={handleInterest}
              disabled={interested}
            >
              {interested ? 'Interest Sent ✓' : 'Express Interest'}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

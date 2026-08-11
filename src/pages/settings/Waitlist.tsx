import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { CheckmarkBadge01Icon } from '@hugeicons/react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { waitlistService } from '../../api/waitlistService';
import { customAlert } from '../../stores/alertStore';

const CORRIDORS = ['Toll Gate', 'Oba Otudeko', 'Bodija', 'Agodi', 'Sango'];
const CONTACT_PREFS = ['WhatsApp', 'Email', 'Call'];
const DISTANCES = ['Very Close', 'Close', 'Budget Stretch'];

export function Waitlist() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
  const [moveInDate, setMoveInDate] = useState('');
  const [needsRoommate, setNeedsRoommate] = useState(false);
  const [distancePref, setDistancePref] = useState('Close');
  const [contactPref, setContactPref] = useState('WhatsApp');

  const toggleCorridor = (c: string) => {
    setSelectedCorridors(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await waitlistService.joinWaitlist({
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        preferredCorridor: selectedCorridors.join(', '),
        moveInDate,
        roommateNeeded: needsRoommate,
        distancePreference: distancePref,
        contactPreference: contactPref.toLowerCase() as any,
      });
      setSubmitted(true);
    } catch (error) {
      customAlert('Failed to join waitlist. Please try again.', 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full bg-background relative items-center justify-center px-6 text-center">
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="relative">
              {/* Clipboard Mockup */}
              <div className="w-[120px] h-[140px] bg-surface rounded-2xl border border-border shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-4 items-center mt-3">
                <div className="h-2 bg-surfaceLight rounded-full w-[90%]" />
                <div className="h-2 bg-surfaceLight rounded-full w-[90%]" />
                <div className="h-2 bg-surfaceLight rounded-full w-[60%]" />
              </div>
              {/* Clip */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-primary rounded-t-md" />
              {/* Badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                <CheckmarkBadge01Icon size={24} className="text-white" variant="solid" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-[22px] font-extrabold text-textPrimary mb-2">You're on the Waitlist!</h2>
          <p className="text-[15px] text-textSecondary leading-relaxed mb-8">
            We'll notify you via {contactPref} when a listing matching your criteria becomes available.
          </p>

          <div className="w-full bg-surface rounded-[20px] border border-border shadow-sm p-5 flex flex-col items-center gap-1 mb-8">
            <span className="text-sm font-semibold text-textSecondary">Estimated Position</span>
            <span className="text-[32px] font-black text-primary">#12</span>
            <span className="text-sm text-textTertiary">in {selectedCorridors[0] || 'Toll Gate'} corridor</span>
          </div>

          <button 
            onClick={() => navigate('/discover')}
            className="w-full py-4 bg-primary text-white rounded-[14px] font-bold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
          >
            Back to Discover
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Join Waitlist" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[15px] text-textSecondary leading-relaxed mb-6">
            Get priority access to new listings that match your preferences. We'll notify you as soon as a suitable property becomes available.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-12">
            
            {/* Budget Range */}
            <div>
              <label className="block text-[15px] font-bold text-textPrimary mb-3">Budget Range (₦)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  placeholder="Min (e.g. 200000)"
                  value={budgetMin}
                  onChange={e => setBudgetMin(e.target.value)}
                  className="flex-1 bg-surface border border-borderLight rounded-[14px] px-4 py-3.5 text-[15px] text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
                <span className="text-[15px] font-semibold text-textTertiary">to</span>
                <input 
                  type="number"
                  placeholder="Max (e.g. 500000)"
                  value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  className="flex-1 bg-surface border border-borderLight rounded-[14px] px-4 py-3.5 text-[15px] text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Corridors */}
            <div>
              <label className="block text-[15px] font-bold text-textPrimary mb-3">Preferred Corridor(s)</label>
              <div className="flex flex-wrap gap-2">
                {CORRIDORS.map(c => {
                  const active = selectedCorridors.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCorridor(c)}
                      className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                        active 
                          ? "bg-primary border-primary text-white" 
                          : "bg-surface border-border text-textSecondary"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-[15px] font-bold text-textPrimary mb-3">Distance Preference</label>
              <div className="flex flex-wrap gap-2">
                {DISTANCES.map(d => {
                  const active = distancePref === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistancePref(d)}
                      className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                        active 
                          ? "bg-primary border-primary text-white" 
                          : "bg-surface border-border text-textSecondary"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Move-in date */}
            <div>
              <label className="block text-[15px] font-bold text-textPrimary mb-3">Preferred Move-In Date</label>
              <input 
                type="date"
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                className="w-full bg-surface border border-borderLight rounded-[14px] px-4 py-3.5 text-[15px] text-textPrimary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Need a roommate? */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="block text-[15px] font-bold text-textPrimary">Need a Roommate?</span>
                <span className="block text-xs text-textSecondary mt-0.5">We'll prioritize shared apartments</span>
              </div>
              <button 
                type="button"
                className={clsx(
                  "w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300",
                  needsRoommate ? "bg-primary" : "bg-border"
                )}
                onClick={() => setNeedsRoommate(!needsRoommate)}
              >
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                  needsRoommate ? "translate-x-6" : ""
                )} />
              </button>
            </div>

            {/* Contact Preference */}
            <div>
              <label className="block text-[15px] font-bold text-textPrimary mb-3">Contact Preference</label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_PREFS.map(c => {
                  const active = contactPref === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setContactPref(c)}
                      className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                        active 
                          ? "bg-primary border-primary text-white" 
                          : "bg-surface border-border text-textSecondary"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !budgetMin || !budgetMax || selectedCorridors.length === 0 || !moveInDate}
              className="w-full py-4 mt-2 bg-primary text-white rounded-[14px] font-bold text-[15px] shadow-sm disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Join Waitlist'
              )}
            </button>

          </form>
        </div>
      </div>
    </AppShell>
  );
}

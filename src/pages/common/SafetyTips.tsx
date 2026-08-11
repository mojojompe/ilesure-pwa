import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { CheckmarkBadge01Icon } from '@hugeicons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { customAlert } from '../../stores/alertStore';

export function SafetyTips() {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsReportModalOpen(false);
    setReportText('');
    customAlert('Your report has been submitted successfully. Our team will review it shortly.', 'Report Submitted', 'success');
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Safety Tips" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
              <CheckmarkBadge01Icon size={32} className="text-[#2E7D32]" variant="solid" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary leading-tight">House Hunting<br/>Safely</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">1. Never Pay Before Inspection</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Legitimate landlords and agents will not ask for inspection fees or full rent before you have seen the property physically.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">2. Verify Documents</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Always ask to see proof of ownership or the agent's mandate from the landlord before signing any agreements.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">3. Meet in Daylight</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Schedule inspections during daylight hours and preferably go with a friend or family member.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">4. Pay to Company Accounts</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Where possible, make payments through our platform or direct to corporate accounts, never to an agent's personal account.
              </p>
            </div>
          </div>

          <div className="mt-10 p-5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl">
            <h3 className="text-[15px] font-bold text-[#991B1B] mb-2">Spotted a scammer?</h3>
            <p className="text-sm text-[#B91C1C] leading-relaxed mb-4">
              If an agent asks for inspection fees before viewing, pressures you for cash, or refuses to show the property, report them immediately.
            </p>
            <button 
              className="w-full bg-[#DC2626] text-white font-bold py-3 rounded-xl active:opacity-80"
              onClick={() => setIsReportModalOpen(true)}
            >
              Report Suspicious Activity
            </button>
          </div>
        </div>

        {/* Report Modal */}
        <AnimatePresence>
          {isReportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
              <motion.div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsReportModalOpen(false)}
              />
              
              <motion.div 
                className="bg-surface w-full sm:w-[400px] rounded-[24px] overflow-hidden shadow-xl z-10 flex flex-col pb-safe"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-textPrimary mb-2">Report Activity</h3>
                  <p className="text-sm text-textSecondary mb-6">
                    Please provide details about the suspicious activity. Your report will be kept confidential.
                  </p>
                  
                  <textarea
                    className="w-full bg-surfaceLight border border-borderLight rounded-xl p-4 text-sm text-textPrimary min-h-[120px] outline-none focus:border-primary transition-colors"
                    placeholder="Describe what happened..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="flex-1 py-3 rounded-xl font-bold text-textSecondary bg-surfaceLight active:bg-surface transition-colors"
                      onClick={() => setIsReportModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-1 py-3 rounded-xl font-bold text-white bg-error active:opacity-80 transition-opacity disabled:opacity-50"
                      onClick={handleReportSubmit}
                      disabled={isSubmitting || !reportText.trim()}
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

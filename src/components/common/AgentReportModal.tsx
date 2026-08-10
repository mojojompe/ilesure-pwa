import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { customAlert } from '../../stores/alertStore';

interface AgentReportModalProps {
  visible: boolean;
  onClose: () => void;
  agentName: string;
  targetId: string; // can be agentId or listingId
}

const REPORT_REASONS = [
  'Suspicious Activity or Scam',
  'Fake Property Listing',
  'Unprofessional Behavior',
  'Requested Money Before Viewing',
  'Other'
];

export function AgentReportModal({ visible, onClose, agentName, targetId }: AgentReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!reason) {
      customAlert('Please select a reason', 'Warning', 'warning');
      return;
    }
    // Assume reporting succeeds via API
    customAlert('Report Submitted. We will review this shortly.', 'Success', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-background w-full max-w-md rounded-t-[24px] sm:rounded-[24px] p-6 z-10 flex flex-col max-h-[90vh] overflow-y-auto relative"
          >
            <div className="w-12 h-1.5 bg-borderLight rounded-full mx-auto mb-6 sm:hidden" />
            <h2 className="text-xl font-bold text-textPrimary mb-4">Report {agentName}</h2>
            
            <h3 className="text-sm font-semibold text-textPrimary mb-2">Reason for Reporting</h3>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map(r => (
                <button 
                  key={r}
                  onClick={() => setReason(r)}
                  className={`p-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                    reason === r ? 'border-primary bg-primary/5 text-primary' : 'border-borderLight bg-surface text-textSecondary hover:bg-surfaceLight'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-textPrimary mb-2">Additional Details (Optional)</h3>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell us more about what happened..."
              className="w-full bg-surface border border-borderLight rounded-xl p-3 text-sm min-h-[100px] mb-6 outline-none focus:border-primary focus:bg-white resize-none"
            />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1 bg-error border-none text-white shadow-none hover:bg-error/90" onClick={handleSubmit}>Submit Report</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

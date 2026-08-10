import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { CheckmarkBadge01Icon, Time02Icon, InformationCircleIcon, Cancel01Icon } from '@hugeicons/react';

interface BookingTimelineModalProps {
  visible: boolean;
  onClose: () => void;
  booking: any;
  loading?: boolean;
  onScheduleInspection?: () => void;
  onMakePayment?: () => void;
}

export function BookingTimelineModal({ visible, onClose, booking, loading, onScheduleInspection, onMakePayment }: BookingTimelineModalProps) {
  if (!visible) return null;

  const currentStep = booking?.timelineStep || 1;
  const isCancelled = booking?.status === 'cancelled' || booking?.status === 'rejected';

  const steps = [
    {
      id: 1,
      title: 'Booking Request Submitted',
      desc: 'Your request is pending landlord/agent approval.',
      icon: Time02Icon
    },
    {
      id: 2,
      title: 'Request Approved',
      desc: 'Landlord has approved your request.',
      icon: CheckmarkBadge01Icon
    },
    {
      id: 3,
      title: 'Physical Inspection',
      desc: 'Schedule and complete a physical inspection.',
      icon: InformationCircleIcon
    },
    {
      id: 4,
      title: 'Make Payment',
      desc: 'Pay your rent and fees securely via IleSure.',
      icon: CheckmarkBadge01Icon
    },
    {
      id: 5,
      title: 'Move In',
      desc: 'Get your keys and move into your new home!',
      icon: CheckmarkBadge01Icon
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-background w-full max-w-md rounded-[24px] shadow-2xl relative z-10 flex flex-col"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-borderLight shrink-0">
            <h2 className="text-xl font-bold text-textPrimary">Booking Timeline</h2>
            <button onClick={onClose} className="p-1 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
              <Cancel01Icon size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isCancelled ? (
              <div className="flex flex-col items-center justify-center p-6 bg-[#FEF2F2] rounded-xl border border-[#FEE2E2]">
                <Cancel01Icon size={48} className="text-[#DC2626] mb-3" />
                <h3 className="text-lg font-bold text-[#991B1B] mb-2">Booking Cancelled</h3>
                <p className="text-sm text-[#B91C1C] text-center">
                  This booking request was cancelled or rejected.
                </p>
              </div>
            ) : (
              <div className="relative pl-4">
                <div className="absolute left-7 top-4 bottom-8 w-0.5 bg-borderLight" />
                
                {steps.map((step, index) => {
                  const isCompleted = step.id < currentStep;
                  const isActive = step.id === currentStep;
                  const Icon = step.icon;
                  
                  let iconBg = 'bg-surfaceLight border-borderLight text-textTertiary';
                  if (isCompleted) iconBg = 'bg-primary text-white border-primary';
                  if (isActive) iconBg = 'bg-accent/20 border-accent text-accent animate-pulse';

                  return (
                    <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center relative z-10 mr-4 shrink-0 bg-background ${
                        isCompleted ? 'border-primary' : isActive ? 'border-accent' : 'border-borderLight'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${iconBg}`}>
                          {isCompleted ? <CheckmarkBadge01Icon size={12} variant="solid" /> : <Icon size={12} variant={isActive ? "solid" : "stroke"} />}
                        </div>
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <h4 className={`text-sm font-bold mb-1 ${isActive ? 'text-primary' : isCompleted ? 'text-textPrimary' : 'text-textSecondary'}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-textSecondary">{step.desc}</p>
                        
                        {/* Render action buttons based on active step */}
                        {isActive && step.id === 3 && onScheduleInspection && booking?.inspectionStatus !== 'scheduled' && (
                          <div className="mt-3">
                            <Button 
                              size="small" 
                              onClick={() => { onClose(); onScheduleInspection(); }}
                              className="text-xs py-2 px-4 shadow-sm"
                            >
                              Schedule Inspection
                            </Button>
                          </div>
                        )}
                        {isActive && step.id === 3 && booking?.inspectionStatus === 'scheduled' && (
                          <div className="mt-3 p-3 bg-surfaceLight rounded-xl border border-borderLight text-xs text-textSecondary font-medium">
                            Inspection scheduled for {booking?.inspectionDate} at {booking?.inspectionTime}. Waiting for verification.
                          </div>
                        )}
                        {isActive && step.id === 4 && onMakePayment && (
                          <div className="mt-3">
                            <Button 
                              size="small" 
                              onClick={() => { onClose(); onMakePayment(); }}
                              className="text-xs py-2 px-4 shadow-sm"
                            >
                              Make Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-borderLight shrink-0 bg-background rounded-b-[24px]">
            <Button fullWidth onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

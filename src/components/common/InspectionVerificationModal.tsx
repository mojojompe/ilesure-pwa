import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, CheckmarkCircle02Icon, AlertCircleIcon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface InspectionVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (isVerified: boolean) => void;
  loading?: boolean;
}

/**
 * After the viewing, the tenant confirms here whether the apartment matched the listing.
 * That answer is the gate before payment, so the choice is deliberate — nothing is
 * preselected, and the confirm button stays disabled until one is picked.
 */
export const InspectionVerificationModal: React.FC<InspectionVerificationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Reopening the sheet should not inherit the previous answer.
  useEffect(() => {
    if (visible) setIsVerified(null);
  }, [visible]);

  const handleSubmit = () => {
    if (isVerified !== null) onSubmit(isVerified);
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-background rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-borderLight rounded-full mx-auto my-3 sm:hidden" />

            <div className="flex justify-between items-center px-6 py-4 border-b border-borderLight shrink-0">
              <h2 className="text-xl font-bold text-textPrimary">Confirm Inspection</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform"
                aria-label="Close"
              >
                <Cancel01Icon size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-textSecondary mb-5">
                Now that you have seen the apartment, does it match the listing? You need to confirm
                this before you can pay.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsVerified(true)}
                  aria-pressed={isVerified === true}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-colors ${
                    isVerified === true
                      ? 'border-primary bg-surface'
                      : 'border-border bg-background hover:bg-surfaceLight'
                  }`}
                >
                  <CheckmarkCircle02Icon
                    size={22}
                    className={isVerified === true ? 'text-primary shrink-0' : 'text-textSecondary shrink-0'}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-textPrimary">
                      Yes, it matches the listing
                    </span>
                    <span className="block text-xs text-textSecondary mt-0.5">
                      You can go on to payment.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerified(false)}
                  aria-pressed={isVerified === false}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-colors ${
                    isVerified === false
                      ? 'border-error bg-surface'
                      : 'border-border bg-background hover:bg-surfaceLight'
                  }`}
                >
                  <AlertCircleIcon
                    size={22}
                    className={isVerified === false ? 'text-error shrink-0' : 'text-textSecondary shrink-0'}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-textPrimary">
                      No, it does not match
                    </span>
                    <span className="block text-xs text-textSecondary mt-0.5">
                      We will flag this booking instead of taking payment.
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-borderLight shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={isVerified === null || loading}
                loading={loading}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

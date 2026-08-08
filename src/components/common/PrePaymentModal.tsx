import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCardIcon, LockKeyIcon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface PrePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export const PrePaymentModal: React.FC<PrePaymentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  amount,
  title = "Confirm Payment",
  subtitle = "You are about to make a payment for your booking.",
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={loading ? undefined : onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-background rounded-3xl p-8 flex flex-col items-center shadow-2xl z-10"
          >
            <div className="w-16 h-16 rounded-full bg-[#E3F2FD] flex items-center justify-center mb-5 shadow-sm">
              <CreditCardIcon size={32} className="text-primary" />
            </div>

            <h2 className="text-2xl font-extrabold text-textPrimary mb-1 text-center">{title}</h2>
            <p className="text-sm text-textSecondary text-center mb-8">{subtitle}</p>

            <div className="w-full p-5 rounded-2xl bg-surface border border-borderLight flex flex-col items-center justify-center mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-sm text-textSecondary mb-1 font-medium">Total Amount</span>
              <span className="text-3xl font-black text-primary">₦{amount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <LockKeyIcon size={14} className="text-textSecondary" />
              <span className="text-xs font-medium text-textTertiary">
                Payments are securely processed via Paystack.
              </span>
            </div>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={onConfirm}
                disabled={loading}
                loading={loading}
              >
                Pay Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

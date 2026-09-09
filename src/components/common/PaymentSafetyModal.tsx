import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/react';

export interface PaymentSafetyModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount?: number;
  loading?: boolean;
}

export const PaymentSafetyModal: React.FC<PaymentSafetyModalProps> = ({
  visible,
  onClose,
  onConfirm,
  amount,
  loading = false,
}) => {
  const [agreed, setAgreed] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setAgreed(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!agreed || loading) return;
    onConfirm();
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left"
          >
            {/* Header with Title and Close X */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-textPrimary tracking-tight">
                Stay safe &amp; build your reputation
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-1 rounded-full text-textTertiary hover:text-textPrimary hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <Cancel01Icon size={22} />
              </button>
            </div>

            {/* Optional Amount Pill */}
            {typeof amount === 'number' && amount > 0 && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-borderLight mb-5">
                <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Payment Due
                </span>
                <span className="text-lg font-black text-primary">
                  ₦{amount.toLocaleString()}
                </span>
              </div>
            )}

            {/* Bullet Points */}
            <ul className="space-y-3.5 mb-6 text-sm sm:text-[15px] text-textSecondary leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-textPrimary text-base font-bold select-none">•</span>
                <span>
                  Only accept and make payment through <strong className="font-bold text-textPrimary">IleSure</strong>, ensuring Payment Protection.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-textPrimary text-base font-bold select-none">•</span>
                <span>
                  Receiving or making payment outside of IleSure violates your{' '}
                  <a
                    href="https://ilesure.com/terms-of-service"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#16A34A] underline font-semibold hover:text-[#15803D]"
                  >
                    user agreement
                  </a>{' '}
                  and could result in suspension or legal action.
                </span>
              </li>
            </ul>

            {/* Checkbox Acknowledgment */}
            <label className="flex items-center gap-3 select-none cursor-pointer mb-8 group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  agreed
                    ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-sm'
                    : 'border-border bg-background group-hover:border-textSecondary'
                }`}
              >
                {agreed && <CheckmarkCircle02Icon size={14} variant="solid" />}
              </div>
              <span className="text-sm font-medium text-textPrimary">
                I understand IleSure's policies.
              </span>
            </label>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-textSecondary hover:text-textPrimary hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!agreed || loading}
                className={`px-7 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-sm ${
                  agreed && !loading
                    ? 'bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98]'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-70'
                }`}
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSafetyModal;

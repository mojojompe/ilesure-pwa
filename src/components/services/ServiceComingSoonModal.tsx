import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Wrench01Icon } from '@hugeicons/react';

interface ServiceComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Brand-styled "Coming Soon" modal for the Home Services feature.
 *
 * Displayed whenever a user taps any interactive element on the Services page or
 * the Services category card. When V2 launches, remove this modal and wire up the
 * real service flows (search, provider profiles, booking).
 */
export function ServiceComingSoonModal({ isOpen, onClose }: ServiceComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center bg-white rounded-t-[32px] px-6 pt-5 pb-10 shadow-2xl max-w-md mx-auto"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-[#E7DCD4] mb-6" />

            {/* Icon badge */}
            <div className="w-20 h-20 rounded-[24px] bg-[#FFF8E7] border-2 border-[#E1AD01]/30 flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(225,173,1,0.15)]">
              <Wrench01Icon size={36} className="text-[#E1AD01]" />
            </div>

            {/* Coming Soon pill */}
            <span className="bg-[#3E1F0A] text-[#FAF1CC] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Coming Soon
            </span>

            {/* Title */}
            <h2 className="text-[22px] font-black text-[#3E1F0A] text-center leading-snug mb-3">
              Home Services
            </h2>

            {/* Body */}
            <p className="text-[14px] text-[#6B4F3A] text-center leading-relaxed mb-6 max-w-[280px]">
              We're bringing vetted artisans — Electricians, Plumbers, Carpenters, Cleaners, Painters and more — directly to your doorstep. Stay tuned!
            </p>

            {/* CTA */}
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-[#3E1F0A] text-[#FAF1CC] font-black text-base tracking-tight active:scale-95 transition-transform shadow-[0_4px_16px_rgba(62,31,10,0.25)]"
            >
              Got it
            </button>

            {/* Dismiss icon */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F5F1EB] flex items-center justify-center active:scale-90 transition-transform"
            >
              <Cancel01Icon size={18} className="text-[#6B4F3A]" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

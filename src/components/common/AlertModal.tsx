import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useAlertStore } from '../../stores/alertStore';
import { InformationCircleIcon, CheckmarkBadge01Icon, Alert02Icon, Cancel01Icon } from '@hugeicons/react';

export function AlertModal() {
  const { isOpen, options, hideAlert } = useAlertStore();

  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    options.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    options.onCancel?.();
    hideAlert();
  };

  const getIcon = () => {
    switch (options.type) {
      case 'success': return <CheckmarkBadge01Icon size={32} className="text-status-success" variant="solid" />;
      case 'error': return <Cancel01Icon size={32} className="text-status-error" variant="solid" />;
      case 'warning': return <Alert02Icon size={32} className="text-status-warning" variant="solid" />;
      default: return <InformationCircleIcon size={32} className="text-primary" variant="solid" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleCancel}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surfaceLight flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-textPrimary mb-2">{options.title}</h3>
          <p className="text-sm text-textSecondary mb-6 leading-relaxed">
            {options.message}
          </p>
          <div className="flex w-full gap-3">
            {options.cancelText && (
              <Button variant="outline" className="flex-1 py-3" onClick={handleCancel}>
                {options.cancelText}
              </Button>
            )}
            <Button className="flex-1 py-3" onClick={handleConfirm}>
              {options.confirmText || 'OK'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

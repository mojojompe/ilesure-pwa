import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface InquiryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  agentName?: string;
}

export function InquiryModal({ visible, onClose, onSubmit, agentName = 'Agent' }: InquiryModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await onSubmit(message);
    setLoading(false);
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-background w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-textPrimary">Ask a Question</h3>
              <button onClick={onClose} className="p-2 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
                <Cancel01Icon size={20} />
              </button>
            </div>
            
            <p className="text-sm text-textSecondary mb-4">
              Send a message to {agentName} regarding this property. They will reply to you in the Chats tab.
            </p>

            <textarea
              className="w-full h-32 p-4 bg-surface rounded-2xl border border-borderLight outline-none focus:border-primary text-textPrimary placeholder:text-textTertiary resize-none mb-6"
              placeholder="e.g. Is this apartment still available?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button 
              fullWidth 
              onClick={handleSubmit} 
              loading={loading}
              disabled={!message.trim()}
            >
              Send Message
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

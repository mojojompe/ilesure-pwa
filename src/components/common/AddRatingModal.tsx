import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, StarIcon } from '@hugeicons/react';
import { Button } from '../ui/Button';

interface AddRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  agentName: string;
}

export function AddRatingModal({ visible, onClose, onSubmit, agentName }: AddRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await onSubmit(rating, comment);
    setLoading(false);
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center"
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-background w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-textPrimary">Rate {agentName}</h3>
              <button onClick={onClose} className="p-2 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
                <Cancel01Icon size={20} />
              </button>
            </div>
            
            <p className="text-sm text-textSecondary mb-4 text-center">
              How was your experience with this agent?
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="active:scale-95 transition-transform"
                >
                  <StarIcon 
                    size={36} 
                    className={star <= rating ? "text-[#F59E0B]" : "text-borderLight"} 
                    variant={star <= rating ? "solid" : "stroke"} 
                  />
                </button>
              ))}
            </div>

            <textarea
              className="w-full h-32 p-4 bg-surface rounded-2xl border border-borderLight outline-none focus:border-primary text-textPrimary placeholder:text-textTertiary resize-none mb-6"
              placeholder="Leave a comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button 
              fullWidth 
              onClick={handleSubmit} 
              loading={loading}
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

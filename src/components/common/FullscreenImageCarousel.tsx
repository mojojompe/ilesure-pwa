import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react';

interface FullscreenImageCarouselProps {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

export function FullscreenImageCarousel({ images, initialIndex = 0, visible, onClose }: FullscreenImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible, initialIndex]);

  if (!visible || !images?.length) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          
          <button 
            onClick={onClose} 
            className="absolute top-safe-top right-4 p-2 bg-black/50 rounded-full z-10 text-white active:scale-95"
          >
            <Cancel01Icon size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="max-w-full max-h-full object-contain pointer-events-none"
              alt={`Image ${currentIndex + 1}`}
            />
            
            {currentIndex > 0 && (
              <button 
                onClick={handlePrev}
                className="absolute left-4 p-3 bg-black/50 text-white rounded-full active:scale-95"
              >
                <ArrowLeft01Icon size={24} />
              </button>
            )}
            
            {currentIndex < images.length - 1 && (
              <button 
                onClick={handleNext}
                className="absolute right-4 p-3 bg-black/50 text-white rounded-full active:scale-95"
              >
                <ArrowRight01Icon size={24} />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-safe-bottom left-0 right-0 flex justify-center p-4">
            <div className="bg-black/50 px-3 py-1.5 rounded-full text-white text-sm font-semibold tracking-widest">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

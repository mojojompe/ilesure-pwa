import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND_NAME = "iléSure";
const CHARS = BRAND_NAME.split('');

interface Props {
  onFinished: () => void;
}

export const BrandSplash: React.FC<Props> = ({ onFinished }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinished, 600); // Wait for exit animation
    }, 3500);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FFF5E1]"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.4 }}
        >
          {/* Content Center */}
          <div className="flex flex-col items-center justify-center flex-1">
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center mb-4"
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 5,
                duration: 0.6,
              }}
            >
              <img
                src="/images/NoBG-Logo.png"
                alt="Logo"
                className="w-[140px] h-[80px] object-contain"
              />
            </motion.div>

            {/* Brand Name */}
            <div className="flex flex-row items-center justify-center mt-2">
              {CHARS.map((char, i) => {
                const isMustard = i < 3;
                return (
                  <motion.span
                    key={i}
                    className="text-[56px] font-black tracking-[1.5px]"
                    style={{
                      color: isMustard ? '#E1AD01' : '#3E1F0A',
                      textShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    }}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 120,
                      damping: 4,
                      delay: 0.4 + i * 0.08,
                    }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>

            {/* Tagline */}
            <motion.p
              className="text-base font-bold text-primary tracking-[1.2px] mt-5 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 5,
                delay: 1.2,
              }}
            >
              Your Sure Home Anywhere
            </motion.p>
          </div>

          {/* Sponsor */}
          <motion.div
            className="absolute bottom-[50px] flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 6,
              delay: 1.5,
            }}
          >
            <span className="text-[9px] font-semibold text-text-tertiary tracking-[2px] text-center uppercase">
              By
            </span>
            <span className="text-[11px] font-extrabold text-primary tracking-[2.5px] text-center mt-[2px] uppercase">
              Waltik Labs
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

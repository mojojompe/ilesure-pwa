import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react';
import { useAuthStore } from '../../stores/authStore';
import { BrandSplash } from '../../components/splash/BrandSplash';

const SLIDES = [
  {
    id: 1,
    title: 'Expand Your Reach',
    subtitle: 'Connect directly with thousands of verified students and professionals looking for properties in your area.',
    image: '/images/renters_reach.png'
  },
  {
    id: 2,
    title: 'Trust & Verification',
    subtitle: 'Build your reputation. Get verified on iléSure to earn the trust of premium renters.',
    image: '/images/renters_trust.png'
  },
  {
    id: 3,
    title: 'Manage with Ease',
    subtitle: 'Track listings, manage inquiries, chat with clients, and analyze your performance from a single dashboard.',
    image: '/images/renters_manage.png'
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setHasSeenOnboarding } = useAuthStore();
  
  const [showBrand, setShowBrand] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [direction, setDirection] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect
  useEffect(() => {
    let titleTimeout: NodeJS.Timeout;
    let subtitleTimeout: NodeJS.Timeout;

    setDisplayedTitle('');
    setDisplayedSubtitle('');

    const titleText = SLIDES[currentSlide].title;
    const subtitleText = SLIDES[currentSlide].subtitle;

    let i = 0;
    const typeTitle = () => {
      if (i <= titleText.length) {
        setDisplayedTitle(titleText.slice(0, i));
        i++;
        titleTimeout = setTimeout(typeTitle, 35);
      } else {
        let j = 0;
        const typeSubtitle = () => {
          if (j <= subtitleText.length) {
            setDisplayedSubtitle(subtitleText.slice(0, j));
            j++;
            subtitleTimeout = setTimeout(typeSubtitle, 15);
          }
        };
        typeSubtitle();
      }
    };
    typeTitle();

    return () => {
      clearTimeout(titleTimeout);
      clearTimeout(subtitleTimeout);
    };
  }, [currentSlide]);

  const handleBrandFinished = () => {
    setShowBrand(false);
    
    // Auth flow routing
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    
    if (false) { // was hasEverLoggedIn
      navigate('/login', { replace: true });
      return;
    }

    startTimer(0);
  };

  const startTimer = (slideIndex: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (slideIndex >= SLIDES.length - 1) return;
    timerRef.current = setTimeout(() => {
      handleNext(slideIndex);
    }, 5000);
  };

  const handleNext = (currentIndex = currentSlide) => {
    if (currentIndex < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide(currentIndex + 1);
      startTimer(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      navigate('/auth/role', { replace: true });
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
      startTimer(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHasSeenOnboarding(true);
    navigate('/auth/role', { replace: true });
  };

  const setSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    startTimer(index);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* ── Phase B: Onboarding carousel ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <img 
              src={SLIDES[currentSlide].image} 
              alt={SLIDES[currentSlide].title}
              className="w-full h-full object-cover" 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fixed Top Navigation ── */}
      <motion.div 
        className="absolute top-[56px] left-6 right-6 flex flex-row justify-between items-center z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="w-[80px] h-[44px] flex items-center">
          <AnimatePresence>
            {currentSlide > 0 ? (
              <motion.button
                key="backBtn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handlePrev}
                className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
              >
                <ArrowLeft01Icon size={24} className="text-white" />
              </motion.button>
            ) : (
              <motion.img
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src="/images/NoBG-Logo.png"
                className="w-[80px] h-[44px] object-contain"
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isLastSlide && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="px-4 py-2"
            >
              <span className="text-base font-semibold text-white drop-shadow-md">Skip</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Fixed Bottom Sheet ── */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-[120px] w-full bg-gradient-to-b from-transparent to-[#f4f4f4]" />
        
        <div className="bg-[#f4f4f4] pt-4 pb-[48px] px-6">
          <div className="mb-8 min-h-[120px]">
            <h1 className="text-[42px] font-extrabold text-primary-dark mb-2 tracking-[-1.5px] leading-tight">
              {displayedTitle}
            </h1>
            <p className="text-lg text-text-secondary leading-[26px]">
              {displayedSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-center gap-2">
              {SLIDES.map((_, i) => {
                const isActive = i === currentSlide;
                return (
                  <button key={i} onClick={() => setSlide(i)} className="p-1">
                    <motion.div 
                      className={`h-2 rounded-full ${isActive ? 'bg-accent' : 'bg-burnt-brown/20'}`}
                      animate={{ width: isActive ? 24 : 8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleNext(currentSlide)}
              className="bg-primary-dark rounded-[50px] py-4 flex items-center justify-center active:scale-95 transition-transform"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLastSlide ? 'last' : 'not-last'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center"
                >
                  <span className="text-white text-base font-bold tracking-[0.4px]">
                    {isLastSlide ? 'Get Started' : 'Next'}
                  </span>
                  {isLastSlide && <ArrowRight01Icon size={20} className="text-white ml-2" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Phase A: Brand overlay ── */}
      {showBrand && <BrandSplash onFinished={handleBrandFinished} />}
    </div>
  );
}

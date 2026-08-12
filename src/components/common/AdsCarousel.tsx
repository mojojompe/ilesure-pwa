import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Megaphone01Icon } from '@hugeicons/react';
import { adService, Ad } from '../../api/adService';

interface AdsCarouselProps {
  heroTitle: string;
  heroImage: string;
}

export const AdsCarousel: React.FC<AdsCarouselProps> = ({ heroTitle, heroImage }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await adService.getActiveAds();
        if (response.success && response.data) {
          setAds(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ads', error);
      }
    };
    fetchAds();
  }, []);

  const carouselItems: any[] = [
    { type: 'hero', id: 'hero', title: heroTitle, image: heroImage },
    ...ads.map(ad => ({ type: 'ad', id: ad._id, ...ad })),
  ];

  while (carouselItems.length < 4) {
    carouselItems.push({ type: 'placeholder', id: `placeholder-${carouselItems.length}` });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % carouselItems.length;
        if (containerRef.current) {
          const child = containerRef.current.children[next] as HTMLElement;
          if (child) {
            containerRef.current.scrollTo({
              left: child.offsetLeft,
              behavior: 'smooth'
            });
          }
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const childWidth = (containerRef.current.children[0] as HTMLElement)?.offsetWidth || 1;
      const newIndex = Math.round(scrollLeft / childWidth);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="w-full mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full overflow-x-auto snap-x snap-mandatory flex flex-row gap-4 px-5 pb-2 no-scrollbar"
        ref={containerRef}
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {carouselItems.map((item: any) => {
          if (item.type === 'hero') {
            return (
              <div key={item.id} className="snap-center shrink-0 w-[85vw] max-w-[320px] h-[160px] rounded-[24px] bg-gradient-to-br from-[#3E1F0A] to-[#2a1406] relative overflow-hidden flex flex-col justify-end p-5 shadow-md">
                <div className="absolute top-0 right-[-20px] w-48 h-48 pointer-events-none flex items-end justify-end">
                  <img src={item.image} alt="" className="w-[120%] h-[120%] object-contain mb-[-10px] mr-4" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
                <h2 className="text-[#E8DCC4] text-[22px] font-black tracking-tight leading-[28px] w-[70%] z-10">{item.title}</h2>
              </div>
            );
          }

          if (item.type === 'placeholder') {
            return (
              <div key={item.id} className="snap-center shrink-0 w-[85vw] max-w-[320px] h-[160px] rounded-[24px] bg-surfaceLight border-2 border-dashed border-borderLight flex flex-col items-center justify-center">
                <Megaphone01Icon size={32} className="text-textTertiary mb-2" />
                <span className="text-textTertiary font-semibold text-base">Advertisement Space</span>
              </div>
            );
          }

          return (
            <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="snap-center shrink-0 w-[85vw] max-w-[320px] h-[160px] rounded-[24px] overflow-hidden shadow-md block">
              <img src={item.imageUrl} alt="Ad" className="w-full h-full object-cover" />
            </a>
          );
        })}
      </motion.div>
      
      {/* Dot Indicators */}
      <div className="flex flex-row justify-center items-center gap-1.5 mt-2">
        {carouselItems.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-3.5 bg-[#3E1F0A]' : 'w-1.5 bg-[#3E1F0A]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

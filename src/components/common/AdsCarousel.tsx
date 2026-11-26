import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Megaphone01Icon } from "@hugeicons/react";
import { adService, Ad } from "../../api/adService";

/**
 * Permanent Header Banner on the Home Page, placed between the Search Bar and Category Cards.
 */
export function HomeHeroBanner({
  title = "Find Your Perfect Space",
  image = "/images/ads_carousel_1788617238802.jpg",
}: {
  title?: string;
  image?: string;
}) {
  return (
    <div className="w-full px-5 mb-4">
      <div className="w-full h-[155px] rounded-[24px] bg-gradient-to-br from-[#3E1F0A] to-[#2a1406] relative overflow-hidden flex flex-row items-center p-5 shadow-clay">
        <h2 className="text-[#E8DCC4] text-[22px] font-black tracking-tight leading-[28px] w-[55%] z-10">
          {title}
        </h2>
        <div className="absolute right-[-10px] top-[10%] w-[140px] h-[140px] flex items-center justify-center">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover rounded-l-full shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Ads Carousel - Placed between "Shortlets and Stays" and "Self-Contained".
 */
export const AdsCarousel: React.FC = () => {
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
        console.error("Failed to fetch ads", error);
      }
    };
    fetchAds();
  }, []);

  const WHATSAPP_AD_URL =
    "https://wa.me/2348169384301?text=Hello%20il%C3%A9Sure%2C%20I%20want%20to%20place%20an%20Advert%20of%20my%20Trade%2Fbusiness";

  // Keep exactly one contact placeholder after active ads, including when there are no ads.
  const carouselItems: any[] = [
    ...ads.map((ad) => ({ type: "ad", id: ad._id, ...ad })),
    { type: "placeholder", id: "placeholder-ad-slot" },
  ];

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % carouselItems.length;
        if (containerRef.current) {
          const child = containerRef.current.children[next] as HTMLElement;
          if (child) {
            containerRef.current.scrollTo({
              left: child.offsetLeft,
              behavior: "smooth",
            });
          }
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const childWidth =
        (containerRef.current.children[0] as HTMLElement)?.offsetWidth || 1;
      const newIndex = Math.round(scrollLeft / childWidth);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="w-full my-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full overflow-x-auto snap-x snap-mandatory flex flex-row gap-4 px-5 pb-2 no-scrollbar"
        ref={containerRef}
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {carouselItems.map((item: any) => {
          if (item.type === "placeholder") {
            return (
              <a
                key={item.id}
                href={WHATSAPP_AD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-center shrink-0 w-[85vw] max-w-[320px] h-[150px] rounded-[24px] bg-[#FAF8F5] border-2 border-dashed border-[#E7DCD4] flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-[0.98] transition-transform group"
              >
                <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#E1AD01] mb-2 group-hover:scale-110 transition-transform">
                  <Megaphone01Icon size={22} />
                </div>
                <span className="text-textSecondary font-bold text-sm">
                  Place Your Advert Here
                </span>
                <span className="text-[11px] text-textTertiary mt-0.5">
                  Tap to chat with iléSure on WhatsApp
                </span>
              </a>
            );
          }

          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="snap-center shrink-0 w-[85vw] max-w-[320px] h-[150px] rounded-[24px] overflow-hidden shadow-clay-sm block relative group active:scale-[0.98] transition-transform"
            >
              <img
                src={item.imageUrl}
                alt="Ad"
                className="w-full h-full object-cover"
              />
            </a>
          );
        })}
      </motion.div>

      {/* Dot Indicators */}
      {carouselItems.length > 1 && (
        <div className="flex flex-row justify-center items-center gap-1.5 mt-2">
          {carouselItems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-3.5 bg-[#3E1F0A]"
                  : "w-1.5 bg-[#3E1F0A]/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

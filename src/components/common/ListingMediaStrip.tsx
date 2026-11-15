import { useState } from 'react';
import { Home01Icon } from '@hugeicons/react';
import { isVideoUrl } from '../../utils/listingMedia';
import { ListingVideoThumb } from './ListingVideo';
import { FullscreenImageCarousel } from './FullscreenImageCarousel';

/**
 * A listing's photos and videos as a swipeable strip; tap one to open it full screen
 * (videos play there). Used where a booking shows its listing, which used to show only the
 * first photo, and nothing at all when that first item was a video.
 */
export function ListingMediaStrip({ images, title, heightClass = 'h-48' }: { images?: string[]; title?: string; heightClass?: string }) {
  const media = (images || []).filter((u) => typeof u === 'string' && u.trim());
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (!media.length) {
    return (
      <div className={`w-full ${heightClass} bg-surfaceLight flex items-center justify-center`}>
        <Home01Icon size={32} className="text-textTertiary" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} bg-surfaceLight`}>
      <div
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
        }}
      >
        {media.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            aria-label={`Open ${isVideoUrl(src) ? 'video' : 'photo'} ${i + 1} of ${media.length}`}
            className="w-full h-full shrink-0 snap-start active:opacity-90"
            onClick={() => { setIndex(i); setOpen(true); }}
          >
            {isVideoUrl(src) ? (
              <ListingVideoThumb src={src} />
            ) : (
              <img src={src} alt={`${title || 'Property'} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            )}
          </button>
        ))}
      </div>
      {media.length > 1 && (
        <>
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold">
            {index + 1}/{media.length}
          </span>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {media.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
      <FullscreenImageCarousel images={media} initialIndex={index} visible={open} onClose={() => setOpen(false)} />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { videoPosterUrl } from '../../utils/listingMedia';

function PlayBadge({ size = 64 }: { size?: number }) {
  // An SVG, not the ▶ character: iOS draws that as a blue emoji button.
  return (
    <span
      className="flex items-center justify-center rounded-full bg-black/55 backdrop-blur-sm ring-2 ring-white/80 shadow-lg"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} fill="white" style={{ marginLeft: size * 0.06 }}>
        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
      </svg>
    </span>
  );
}

function Spinner() {
  return (
    <span className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <span className="w-14 h-14 rounded-full border-4 border-white/25 border-t-white animate-spin" />
      <span className="text-white text-sm font-semibold drop-shadow whitespace-nowrap">Loading video…</span>
    </span>
  );
}

/**
 * The gallery tile for a listing video: a still frame from Cloudinary with a play badge, so the
 * slide shows the property instead of a black box. Falls back to the browser's own first frame
 * when no preview image is available.
 */
export function ListingVideoThumb({ src }: { src: string }) {
  const poster = videoPosterUrl(src);
  const [posterFailed, setPosterFailed] = useState(false);
  return (
    <div className="relative w-full h-full bg-black">
      {poster && !posterFailed ? (
        <img src={poster} alt="" className="w-full h-full object-cover" onError={() => setPosterFailed(true)} />
      ) : (
        // `#t=0.1` makes iOS Safari paint a frame instead of leaving the element black.
        <video src={`${src}#t=0.1`} muted playsInline preload="metadata" className="w-full h-full object-cover" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/10">
        <PlayBadge />
      </span>
      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-semibold">Video</span>
      <span className="sr-only">Play video</span>
    </div>
  );
}

/**
 * Full-screen listing video. Shows the preview frame until playback starts and a large centred
 * loader whenever the video is fetching (starting up, or buffering mid-play), instead of the
 * small spinner the native controls tuck next to the progress bar.
 */
export function ListingVideoPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const poster = videoPosterUrl(src) ?? undefined;
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    setBuffering(true);
    setFailed(false);
    const on = () => setBuffering(true);
    const off = () => setBuffering(false);
    const fail = () => {
      setBuffering(false);
      setFailed(true);
    };
    // Paused before any data (iOS blocks autoplay until the renter taps play): nothing is
    // loading, so drop the loader and let the poster and play button show.
    const paused = () => {
      if (v.readyState < 3 && v.networkState !== 2) setBuffering(false);
    };
    v.addEventListener('waiting', on);
    v.addEventListener('seeking', on);
    const started = () => {
      if (v.readyState < 3) on();
    };
    v.addEventListener('play', started);
    v.addEventListener('playing', off);
    v.addEventListener('canplay', off);
    v.addEventListener('seeked', off);
    v.addEventListener('pause', paused);
    v.addEventListener('error', fail);
    // If autoplay is refused, `play` never fires; stop showing the loader once the browser
    // settles.
    const settle = window.setTimeout(() => {
      if (v.paused && v.readyState < 3) setBuffering(false);
    }, 2500);
    return () => {
      window.clearTimeout(settle);
      v.removeEventListener('waiting', on);
      v.removeEventListener('seeking', on);
      v.removeEventListener('play', started);
      v.removeEventListener('playing', off);
      v.removeEventListener('canplay', off);
      v.removeEventListener('seeked', off);
      v.removeEventListener('pause', paused);
      v.removeEventListener('error', fail);
    };
  }, [src]);

  return (
    <div className="relative flex items-center justify-center max-w-full max-h-full">
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="auto"
        className={className}
      />
      {buffering && !failed && (
        // pointer-events-none: the native controls underneath stay usable.
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <Spinner />
        </span>
      )}
      {failed && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
          <span className="rounded-xl bg-black/70 px-4 py-3 text-white text-sm">This video couldn't be played. Check your connection and try again.</span>
        </span>
      )}
    </div>
  );
}

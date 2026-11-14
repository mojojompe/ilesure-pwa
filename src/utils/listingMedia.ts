/** Listing videos share the `images` array with photos; Cloudinary keeps the file extension. */
const VIDEO_URL = /\.(mp4|mov|webm|m4v|3gp)(\?.*)?$/i;

export function isVideoUrl(url: string | undefined | null): boolean {
  return VIDEO_URL.test(url || '');
}

/** A Cloudinary video delivery URL: .../<cloud>/video/upload/[transformations/][v123/]path.ext */
const CLOUDINARY_VIDEO = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)\.(mp4|mov|webm|m4v|3gp)(\?.*)?$/i;

/**
 * A still preview image for a listing video, or null when the video is not on Cloudinary.
 * Cloudinary renders a frame on request: `so_1` takes the frame one second in (past the usual
 * black first frame), and asking for `.jpg` returns it as an image, sized for a phone screen.
 */
export function videoPosterUrl(url: string | undefined | null): string | null {
  const m = (url || '').match(CLOUDINARY_VIDEO);
  if (!m) return null;
  return `${m[1]}so_1,w_1080,c_limit,q_auto/${m[2]}.jpg`;
}

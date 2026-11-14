import { describe, it, expect } from 'vitest';
import { isVideoUrl, videoPosterUrl } from './listingMedia';

describe('videoPosterUrl', () => {
  it('turns a Cloudinary video URL into a still frame one second in', () => {
    expect(videoPosterUrl('https://res.cloudinary.com/ilesure/video/upload/v1731500000/listings/walk.mp4')).toBe(
      'https://res.cloudinary.com/ilesure/video/upload/so_1,w_1080,c_limit,q_auto/v1731500000/listings/walk.jpg'
    );
  });

  it('works for .mov uploads too', () => {
    expect(videoPosterUrl('https://res.cloudinary.com/x/video/upload/listings/tour.MOV')).toBe(
      'https://res.cloudinary.com/x/video/upload/so_1,w_1080,c_limit,q_auto/listings/tour.jpg'
    );
  });

  it('gives null for videos hosted elsewhere and for photos', () => {
    expect(videoPosterUrl('https://example.com/walk.mp4')).toBeNull();
    expect(videoPosterUrl('https://res.cloudinary.com/x/image/upload/listings/a.jpg')).toBeNull();
    expect(videoPosterUrl(undefined)).toBeNull();
  });
});

describe('isVideoUrl', () => {
  it('recognises video extensions', () => {
    expect(isVideoUrl('https://res.cloudinary.com/x/video/upload/a.mp4')).toBe(true);
    expect(isVideoUrl('https://res.cloudinary.com/x/image/upload/a.jpg')).toBe(false);
  });
});

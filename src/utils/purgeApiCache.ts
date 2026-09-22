// SECURITY-FIX: the workbox NetworkFirst cache named below (see vite.config.ts
// runtimeCaching) holds responses for every GET to /api/v1/*, including /users/me,
// /payments and /bookings. Nothing purged it on logout, so on a shared device the
// service worker could serve the next signed-in user a cached response from the
// previous user's session. Call this from every logout path (authStore.clearAuth
// AND client.ts clearTokens, which is the 401/403 path that bypasses clearAuth).
export const API_CACHE_NAME = 'api-cache';

export function purgeApiCache(): void {
  if ('caches' in window) {
    caches.delete(API_CACHE_NAME).catch(() => {});
  }
}

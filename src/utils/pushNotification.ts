import { apiClient } from '../api/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers Web Push subscription with the backend so the PWA behaves
 * like a native mobile app with instant push notifications when installed.
 */
export async function registerPushNotifications(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    // Check or request notification permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return false;
    }

    // Fetch the VAPID public key configured on the server
    const keyRes = await apiClient.get<{ success: boolean; data?: { publicKey?: string } }>(
      '/notifications/push-key'
    );
    const publicKey = keyRes.data?.data?.publicKey || (keyRes.data as any)?.publicKey;
    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey.buffer as ArrayBuffer,
      });
    }

    if (!subscription) return false;

    // Send the push subscription to the server
    await apiClient.post('/notifications/subscribe-push', {
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
    });

    return true;
  } catch (error) {
    console.error('[PushNotification] Registration error:', error);
    return false;
  }
}

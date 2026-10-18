import { apiClient } from './client';

export const pushNotificationService = {
  // Convert base64 url-safe VAPID key to a Uint8Array
  urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /**
   * Request notification permission from the browser/OS
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser.');
      return 'denied';
    }
    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Retrieve the server's public VAPID key
   */
  async getVapidPublicKey(): Promise<string> {
    try {
      const res = await apiClient.get<{ success: boolean; data: { publicKey: string } }>('/notifications/vapid-public-key');
      if (res.data?.data?.publicKey) {
        return res.data.data.publicKey;
      }
    } catch (err) {
      console.warn('[Push] Could not fetch VAPID key from backend, using fallback:', err);
    }
    return import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCnW17-pLmhx35RPgU2KoXap1x0ZiPsqzRObks0wG6HTNRVNn7c4eTg-I5dlEkpLUXHHdKDr-sLopd0z0HWgnoY';
  },

  /**
   * Subscribe user to web push and register the endpoint with the backend
   */
  async subscribeUserToPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
      }

      // Add a 4s timeout race so registration.ready never hangs indefinitely
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const registration = await Promise.race([readyPromise, timeoutPromise]);

      if (!registration) {
        console.warn('Service worker not ready within timeout.');
        return false;
      }

      const vapidKey = await this.getVapidPublicKey();
      const applicationServerKey = this.urlBase64ToUint8Array(vapidKey);

      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        try {
          // Sync existing subscription with backend
          await apiClient.post('/notifications/subscribe', subscription);
          return true;
        } catch {
          // Subscription might be stale or from another VAPID key; unsubscribe to renew
          try {
            await subscription.unsubscribe();
            subscription = null;
          } catch {
            // ignore
          }
        }
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // Send the subscription to the backend
      await apiClient.post('/notifications/subscribe', subscription);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  },

  /**
   * Unsubscribe user from web push and notify backend
   */
  async unsubscribeUserFromPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        // Tell backend to remove subscription
        await apiClient.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  },
};

export default pushNotificationService;

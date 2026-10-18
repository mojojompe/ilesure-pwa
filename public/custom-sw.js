self.addEventListener('push', function (event) {
  if (event.data) {
    let payload = {};
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'iléSure Notification', body: event.data.text() };
    }

    const title = payload.title || 'iléSure';
    const body = payload.body || 'You have a new update from iléSure.';
    const data = payload.data || payload;

    const options = {
      body: body,
      icon: '/pwa-192x192.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      tag: payload.tag || payload.type || (data && data.type) || 'ilesure-notification',
      renotify: true,
      data: {
        ...data,
        type: payload.type || (data && data.type) || 'system',
        url: payload.url || (data && data.url),
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  let targetPath = '/notifications';

  if (data.url && typeof data.url === 'string') {
    targetPath = data.url;
  } else if (data.type) {
    const type = String(data.type);
    if (type.startsWith('booking_') || type === 'booking') {
      const bId = data.bookingId || data.data?.bookingId;
      targetPath = bId ? `/booking/${bId}` : '/bookings';
    } else if (type.startsWith('listing_') || type === 'listing') {
      const lId = data.listingId || data.data?.listingId;
      targetPath = lId ? `/listing/${lId}` : '/explore';
    } else if (type.startsWith('match_') || type === 'match') {
      targetPath = '/matches';
    } else if (type === 'message' || type === 'match_message' || type === 'chat') {
      const cId = data.chatId || data.data?.chatId;
      targetPath = cId ? `/chat/${cId}` : '/messages';
    } else if (type.startsWith('account_') || type.startsWith('kyc_') || type === 'verification') {
      targetPath = '/settings/verification';
    } else if (type === 'rent_reminder') {
      targetPath = '/bookings';
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && 'focus' in client) {
          if (client.url.includes(targetPath)) {
            return client.focus();
          }
          // Navigate existing client
          if ('navigate' in client) {
            return client.navigate(targetPath).then((focusedClient) => {
              return focusedClient ? focusedClient.focus() : client.focus();
            });
          }
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'New Notification', body: event.data.text() };
    }

    const title = data.title || 'iléSure';
    const options = {
      body: data.body || 'You have a new notification.',
      icon: '/pwa-192x192.png',
      badge: '/masked-icon.svg',
      data: data
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/notifications';

  if (data.type) {
    if (data.type.startsWith('booking_')) {
      url = data.data?.bookingId ? `/booking/${data.data.bookingId}` : '/bookings';
    } else if (data.type.startsWith('listing_')) {
      url = data.data?.listingId ? `/listing/${data.data.listingId}` : '/explore';
    } else if (data.type.startsWith('match_')) {
      url = '/matches';
    } else if (data.type === 'message' || data.type === 'match_message') {
      url = data.data?.chatId ? `/chat/${data.data.chatId}` : '/messages';
    } else if (data.type.startsWith('account_') || data.type.startsWith('kyc_')) {
      url = '/settings/verification';
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

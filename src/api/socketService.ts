import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from './config';
import apiClient from './client';

/**
 * The one app-wide socket. App.tsx owns its lifetime (connect on sign-in, disconnect on
 * sign-out); screens only add/remove their own listeners and join/leave chat rooms.
 *
 * The Socket instance is kept across reconnects so listeners attached to it (call
 * signalling in useCallEngine) survive them.
 */
let socket: Socket | null = null;
let authRetryInFlight = false;

const SOCKET_URL = SOCKET_BASE_URL;

export const KYC_EVENTS = {
  STATUS_CHANGED: 'kyc_status_changed',
} as const;

type Listener = (...args: any[]) => void;

/**
 * Listeners registered through `subscribe`, kept here so a screen that subscribes before
 * the socket exists (child effects run before App's connect effect) is still attached
 * once it is created.
 */
const registry = new Map<string, Set<Listener>>();

/** True when a JWT's `exp` has passed (or is about to). Unparseable tokens count as not expired. */
function isTokenExpired(token: string, skewMs = 5000): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now() + skewMs;
  } catch {
    return false;
  }
}

/**
 * A handshake refused by the server's auth middleware is not retried by socket.io
 * (`socket.active` goes false). If the stored access token has expired, refresh it once
 * through the API client's single-flight refresh; the refresh listener below reconnects.
 */
async function recoverFromAuthRefusal(): Promise<void> {
  if (!socket || socket.active || authRetryInFlight) return;
  const token = apiClient.getAccessToken();
  if (!token || !isTokenExpired(token)) return;
  authRetryInFlight = true;
  try {
    await apiClient.refreshSession();
  } finally {
    authRetryInFlight = false;
  }
}

// After any refresh, a socket that is down reconnects; the auth callback supplies the new token.
apiClient.onAccessTokenRefreshed(() => {
  if (socket && !socket.connected) socket.connect();
});

/**
 * Idempotent. The access token is read at every (re)connect attempt, so the optional
 * `token` argument is accepted only for backward compatibility and ignored.
 */
export const connectSocket = (_token?: string): Socket | null => {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  if (!apiClient.getAccessToken()) return null;

  socket = io(SOCKET_URL, {
    // A function, not a fixed object: socket.io calls it on every (re)connect, so a
    // reconnect after the access token rotated presents the current token.
    auth: (cb) => cb({ token: apiClient.getAccessToken() }),
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socket.on('connect_error', () => { void recoverFromAuthRefusal(); });
  registry.forEach((listeners, event) => {
    listeners.forEach((listener) => socket!.on(event, listener));
  });
  return socket;
};

/** Sign-out only. Screens must never call this: calls, presence and KYC share the socket. */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

/** Adds a listener (now, or when the socket is created). Returns a function removing exactly it. */
export const subscribe = (event: string, listener: Listener): (() => void) => {
  if (!registry.has(event)) registry.set(event, new Set());
  registry.get(event)!.add(listener);
  socket?.on(event, listener);
  return () => {
    registry.get(event)?.delete(listener);
    socket?.off(event, listener);
  };
};

export const socketService = {
  connect: async () => {
    connectSocket();
  },
  disconnect: () => {
    disconnectSocket();
  },
  joinChat: (chatId: string) => {
    if (socket?.connected) socket.emit('join_chat', chatId);
  },
  leaveChat: (chatId: string) => {
    if (socket?.connected) socket.emit('leave_chat', chatId);
  },
  /** Emits `typing`; the server relays it to the room as `user_typing`. */
  sendTyping: (chatId: string, isTyping: boolean) => {
    if (socket?.connected) socket.emit('typing', { chatId, isTyping });
  },
  /** Fires on the first connect and every reconnect. Returns an unsubscribe function. */
  onConnect: (callback: () => void) => subscribe('connect', callback),
  /** Server `messages_read`: { chatId, readerId, readAt, messageId? }. */
  onMessagesRead: (
    callback: (data: { chatId: string; readerId?: string; readAt?: string; messageId?: string }) => void
  ) => subscribe('messages_read', callback),
  onNewMessage: (callback: (message: any) => void) => subscribe('new_message', callback),
  offNewMessage: (callback?: (message: any) => void) => off('new_message', callback),
  onOnlineStatus: (callback: (data: { userId: string; isOnline: boolean }) => void) =>
    subscribe('online_status', callback),
  offOnlineStatus: (callback?: (data: { userId: string; isOnline: boolean }) => void) =>
    off('online_status', callback),
  onUserTyping: (callback: (data: { chatId: string; userId?: string; isTyping: boolean }) => void) =>
    subscribe('user_typing', callback),
  offUserTyping: (callback?: (data: { chatId: string; isTyping: boolean }) => void) =>
    off('user_typing', callback),
  onNewNotification: (callback: (data: any) => void) => subscribe('new_notification', callback),
  offNewNotification: (callback?: (data: any) => void) => off('new_notification', callback),
};

/**
 * Removes one listener, or (legacy, no callback) every listener this module registered
 * for the event. Prefer the function returned by the on* helpers.
 */
function off(event: string, callback?: Listener): void {
  if (callback) {
    registry.get(event)?.delete(callback);
    socket?.off(event, callback);
    return;
  }
  registry.get(event)?.forEach((listener) => socket?.off(event, listener));
  registry.delete(event);
}

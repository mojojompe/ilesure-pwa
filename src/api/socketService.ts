import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from './config';

let socket: Socket | null = null;

const SOCKET_URL = SOCKET_BASE_URL;

export const KYC_EVENTS = {
  STATUS_CHANGED: 'kyc_status_changed',
} as const;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const socketService = {
  connect: async () => {
    try {
      const authData = localStorage.getItem('ilesure_pwa_auth');
      let token = null;
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.state?.token || parsed.accessToken || null;
      }
      if (token) connectSocket(token);
    } catch {
      // SECURITY-FIX: removed console log that could surface auth/session context.
    }
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
  onNewMessage: (callback: (message: any) => void) => {
    if (socket) socket.on('new_message', callback);
  },
  offNewMessage: () => {
    if (socket) socket.off('new_message');
  },
  onOnlineStatus: (callback: (data: { userId: string; isOnline: boolean }) => void) => {
    if (socket) socket.on('online_status', callback);
  },
  offOnlineStatus: () => {
    if (socket) socket.off('online_status');
  },
  onUserTyping: (callback: (data: { chatId: string; isTyping: boolean }) => void) => {
    if (socket) socket.on('user_typing', callback);
  },
  offUserTyping: () => {
    if (socket) socket.off('user_typing');
  },
  onNewNotification: (callback: (data: any) => void) => {
    if (socket) socket.on('new_notification', callback);
  },
  offNewNotification: () => {
    if (socket) socket.off('new_notification');
  }
};

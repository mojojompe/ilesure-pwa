import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AppNotification {
  _id: string;
  userId: string;
  type: 'match' | 'listing' | 'waitlist' | 'interest' | 'booking' | 'verification' | 'message' | 'system';
  title: string;
  body: string;
  read: boolean;
  readAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: AppNotification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
    unreadCount: number;
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const notificationService = {
  /** Get notifications for the current user */
  async getNotifications(
    unreadOnly = false,
    page = 1,
    limit = 20
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      unreadOnly: String(unreadOnly),
    });
    const response = await apiClient.get<NotificationsResponse>(`/notifications?${params}`);
    return response.data;
  },

  /** Get just the unread count (for badge displays) */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ success: boolean; count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  /** Mark a single notification as read */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /** Mark all notifications as read */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return response.data;
  },

  /** Delete a single notification */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  /** Delete all notifications */
  async deleteAllNotifications(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/notifications');
    return response.data;
  },

  /** Register an Expo push token */
  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await apiClient.post('/notifications/push-token', { token, platform });
  },

  /** Get notification settings for the current user */
  async getSettings(): Promise<{ success: boolean; data: Record<string, boolean> }> {
    const response = await apiClient.get<{ success: boolean; data: Record<string, boolean> }>('/notifications/settings');
    return response.data;
  },

  /** Update notification settings for the current user */
  async updateSettings(settings: Record<string, boolean>): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>('/notifications/settings', settings);
    return response.data;
  },
};

export default notificationService;

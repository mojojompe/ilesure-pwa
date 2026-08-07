import { create } from 'zustand';

export type BannerType = 'success' | 'error' | 'warning' | 'info';

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  removeBanner: (id: string) => void;
  clearBanners: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  banners: [],

  addBanner: (banner) => {
    const id = Date.now().toString();
    set((state) => ({
      banners: [...state.banners, { ...banner, id }],
    }));

    const duration = banner.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        }));
      }, duration);
    }
  },

  removeBanner: (id) => {
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== id),
    }));
  },

  clearBanners: () => {
    set({ banners: [] });
  },
}));

export const showSuccess = (title: string, message?: string) => {
  useNotificationStore.getState().addBanner({ type: 'success', title, message });
};

export const showError = (title: string, message?: string) => {
  useNotificationStore.getState().addBanner({ type: 'error', title, message, duration: 5000 });
};

export const showWarning = (title: string, message?: string) => {
  useNotificationStore.getState().addBanner({ type: 'warning', title, message });
};

export const showInfo = (title: string, message?: string) => {
  useNotificationStore.getState().addBanner({ type: 'info', title, message });
};

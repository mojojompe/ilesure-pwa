import { create } from 'zustand';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  options: null,
  showAlert: (options) => set({ isOpen: true, options }),
  hideAlert: () => set({ isOpen: false }),
}));

export const customAlert = (message: string, title = 'Alert', type: AlertOptions['type'] = 'info') => {
  return new Promise<void>((resolve) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type,
      confirmText: 'OK',
      onConfirm: resolve,
    });
  });
};

export const customConfirm = (message: string, title = 'Confirm', type: AlertOptions['type'] = 'warning') => {
  return new Promise<boolean>((resolve) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

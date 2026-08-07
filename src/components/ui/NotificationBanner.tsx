import React from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { clsx } from 'clsx';
import { 
  CheckmarkCircle01Icon, 
  AlertCircleIcon, 
  InformationCircleIcon, 
  Cancel01Icon 
} from '@hugeicons/react';

export function NotificationBanner() {
  const { banners, removeBanner } = useNotificationStore();

  if (banners.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center px-4 gap-2 pointer-events-none">
      {banners.map((banner) => {
        const getIcon = () => {
          switch (banner.type) {
            case 'success': return <CheckmarkCircle01Icon size={20} className="text-white" />;
            case 'error': return <AlertCircleIcon size={20} className="text-white" />;
            case 'warning': return <AlertCircleIcon size={20} className="text-white" />;
            case 'info': return <InformationCircleIcon size={20} className="text-white" />;
          }
        };

        const getBgColor = () => {
          switch (banner.type) {
            case 'success': return 'bg-status-success';
            case 'error': return 'bg-status-error';
            case 'warning': return 'bg-[#F59E0B]';
            case 'info': return 'bg-[#3B82F6]';
          }
        };

        return (
          <div 
            key={banner.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-3 rounded-2xl shadow-clay w-full max-w-sm animate-in slide-in-from-top-4 fade-in duration-300',
              getBgColor()
            )}
          >
            <div className="shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm">{banner.title}</h4>
              {banner.message && (
                <p className="text-white/90 text-xs mt-0.5">{banner.message}</p>
              )}
            </div>
            <button 
              onClick={() => removeBanner(banner.id)}
              className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <Cancel01Icon size={16} className="text-white" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

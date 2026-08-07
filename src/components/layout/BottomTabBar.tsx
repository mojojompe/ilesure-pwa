import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Home01Icon, 
  UserMultipleIcon, 
  Building03Icon, 
  BubbleChatIcon, 
  Notification01Icon,
  UserCircleIcon
} from '@hugeicons/react';

export function BottomTabBar() {
  const location = useLocation();
  
  const tabs = [
    { path: '/discover', icon: Home01Icon, label: 'Home' },
    { path: '/roommates', icon: UserMultipleIcon, label: 'Match' },
    { path: '/my-apartments', icon: Building03Icon, label: 'Manage' },
    { path: '/chats', icon: BubbleChatIcon, label: 'Chats' },
    { path: '/notifications', icon: Notification01Icon, label: 'Notifs' },
    { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-white border-t border-borderLight flex items-center justify-between px-2 sm:px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        
        return (
          <Link 
            key={tab.path} 
            to={tab.path}
            className="flex-1 flex flex-col items-center justify-center gap-1 min-w-[50px] py-2"
          >
            <div className={clsx(
              'relative p-2 rounded-2xl transition-all duration-300',
              isActive ? 'bg-btn-primary/10 text-btn-primary' : 'text-textSecondary hover:bg-surfaceLight'
            )}>
              <Icon 
                size={24} 
                variant={isActive ? 'solid' : 'stroke'} 
                className={clsx('transition-transform duration-300', isActive && 'scale-110')}
              />
            </div>
            <span className={clsx(
              'text-[10px] font-medium transition-colors duration-300',
              isActive ? 'text-btn-primary' : 'text-textSecondary'
            )}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

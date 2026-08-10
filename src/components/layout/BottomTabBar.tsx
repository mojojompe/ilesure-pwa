import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Home01Icon, 
  UserMultipleIcon, 
  Building03Icon, 
  BubbleChatIcon, 
  Notification01Icon,
  UserCircleIcon,
  Menu01Icon
} from '@hugeicons/react';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../stores/authStore';

export function BottomTabBar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const allTabs = [
    { path: '/discover', icon: Home01Icon, label: 'Home' },
    { path: '/roommates', icon: UserMultipleIcon, label: 'Match', restrictedTo: 'student' },
    { path: '/my-apartments', icon: Building03Icon, label: 'Manage' },
    { path: '/chats', icon: BubbleChatIcon, label: 'Chats' },
    { path: '/notifications', icon: Notification01Icon, label: 'Notifications' },
    { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  // Filter out restricted tabs (like Match for non-students)
  const allowedTabs = allTabs.filter(tab => !tab.restrictedTo || tab.restrictedTo === user?.role);

  // Take the first 3 tabs for the bottom bar
  const mainTabs = allowedTabs.slice(0, 3);
  const moreTabs = allowedTabs.slice(3);

  const isMoreActive = moreTabs.some(tab => location.pathname.startsWith(tab.path));
  const isMoreButtonActive = isMoreActive || isMoreOpen;

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-white border-t border-borderLight flex items-center justify-between px-2 sm:px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {mainTabs.map((tab) => {
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

        {/* More Tab */}
        {moreTabs.length > 0 && (
          <button 
            onClick={() => setIsMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 min-w-[50px] py-2"
          >
            <div className={clsx(
              'relative p-2 rounded-2xl transition-all duration-300',
              isMoreButtonActive ? 'bg-btn-primary/10 text-btn-primary' : 'text-textSecondary hover:bg-surfaceLight'
            )}>
              <Menu01Icon 
                size={24} 
                variant={isMoreButtonActive ? 'solid' : 'stroke'}
                className={clsx('transition-transform duration-300', isMoreButtonActive && 'scale-110')}
              />
            </div>
            <span className={clsx(
              'text-[10px] font-medium transition-colors duration-300',
              isMoreButtonActive ? 'text-btn-primary' : 'text-textSecondary'
            )}>
              More
            </span>
          </button>
        )}
      </div>

      <Modal isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="More">
        <div className="flex flex-col gap-2">
          {moreTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={() => setIsMoreOpen(false)}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "hover:bg-surfaceLight text-textPrimary"
                )}
              >
                <Icon size={24} variant={isActive ? 'solid' : 'stroke'} />
                <span className="text-base font-semibold">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

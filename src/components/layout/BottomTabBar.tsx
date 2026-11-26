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
  SidebarBottomIcon,
  Wrench01Icon,
} from '@hugeicons/react';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../stores/authStore';

export function BottomTabBar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const isStudent = user?.role === 'student';

  /**
   * Tab layout:
   *   Students:     Home | Match | Services | More(Manage, Chats, Notifs, Profile)
   *   Individuals:  Home | Services | Chats  | More(Manage, Notifs, Profile)
   *
   * "Manage" (/my-apartments) has moved to the More modal for all users.
   * Services is now the 3rd tab in bar for students (after Home + Match),
   * and 2nd tab for individuals (after Home, before Chats).
   */
  const allTabs = [
    { path: '/discover',      icon: Home01Icon,       label: 'Home' },
    { path: '/roommates',     icon: UserMultipleIcon, label: 'Match',    restrictedTo: 'student' },
    { path: '/services',      icon: Wrench01Icon,     label: 'Services' },
    { path: '/chats',         icon: BubbleChatIcon,   label: 'Chats' },
    // ── More modal tabs ──────────────────────────────────────────────────────
    { path: '/my-apartments', icon: Building03Icon,   label: 'Manage' },
    { path: '/notifications', icon: Notification01Icon, label: 'Notifications' },
    { path: '/profile',       icon: UserCircleIcon,   label: 'Profile' },
  ];

  // Filter restricted tabs
  const allowedTabs = allTabs.filter(tab => !tab.restrictedTo || tab.restrictedTo === user?.role);

  // Students get 3 main tabs (Home, Match, Services), others get 3 (Home, Services, Chats)
  const mainTabCount = isStudent ? 3 : 3;
  const mainTabs = allowedTabs.slice(0, mainTabCount);
  const moreTabs = allowedTabs.slice(mainTabCount);

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
                isActive ? 'text-btn-primary' : 'text-textSecondary hover:bg-surfaceLight'
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
              isMoreButtonActive ? 'text-btn-primary' : 'text-textSecondary hover:bg-surfaceLight'
            )}>
              <SidebarBottomIcon 
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

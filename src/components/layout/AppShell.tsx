import React, { ReactNode } from 'react';
import { BottomTabBar } from './BottomTabBar';
import { clsx } from 'clsx';
import { useLocation } from 'react-router-dom';
import { InstallPrompt } from '../ui/InstallPrompt';

interface AppShellProps {
  children: ReactNode;
  hideTabBar?: boolean;
}

export function AppShell({ children, hideTabBar = false }: AppShellProps) {
  const location = useLocation();
  const isMobileDetailScreen = [
    '/listing/', '/agent/', '/booking/', '/payment/', '/chat/'
  ].some(path => location.pathname.includes(path));

  // On detail screens on mobile, we typically hide the tab bar unless overridden
  const shouldHideTabBar = hideTabBar || isMobileDetailScreen;

  return (
    <div className="flex flex-col w-full h-screen bg-background relative overflow-hidden max-w-md mx-auto shadow-2xl">
      <main className={clsx(
        'flex-1 overflow-y-auto overflow-x-hidden',
        !shouldHideTabBar ? 'pb-[88px]' : '' // padding bottom to account for tab bar
      )}>
        {children}
      </main>
      
      {!shouldHideTabBar && <BottomTabBar />}
      
      <InstallPrompt />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Trophy, User, Sparkles } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { name: 'Asosiy', path: '/dashboard', icon: Home },
    { name: 'Bosqichlar', path: '/courses', icon: Compass },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Sparkles, isCenter: true },
    { name: 'Reyting', path: '/leaderboard', icon: Trophy },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  if (!mounted) {
    return <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sm:hidden z-50"></div>;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 sm:hidden shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] transition-colors duration-300" suppressHydrationWarning>
      {navItems.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        
        if (item.isCenter) {
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className="flex flex-col items-center relative z-10 w-16"
            >
              <div className="absolute -top-8 flex flex-col items-center">
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-[5px] border-white dark:border-gray-900 shadow-xl transition-all duration-200 active:scale-90 ${
                    active ? 'bg-gradient-to-tr from-[#1b3d16] to-[#0d210b] dark:from-[#2D5A27] dark:to-[#487343]' : 'bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27]'
                  }`}
                >
                  <div
                    className="transition-transform duration-300"
                    style={{ transform: active ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-900'}`} />
                  </div>
                </div>
                <span className={`text-[10px] font-bold mt-1 ${active ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        }

        return (
          <Link 
            key={item.path}
            href={item.path} 
            className="flex flex-col items-center p-2 relative w-16"
          >
            {active && (
              <div 
                className="absolute inset-0 bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 rounded-xl transition-all duration-300"
              />
            )}
            <div
              className="relative z-10 flex flex-col items-center transition-transform duration-200 active:scale-85"
              style={{ transform: active ? 'translateY(-4px)' : 'translateY(0)' }}
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${
                  active ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-400 dark:text-gray-500'
                }`} 
              />
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  )
}

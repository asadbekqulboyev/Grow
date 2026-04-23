'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, ShoppingBag, User, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { name: 'Asosiy', path: '/dashboard', icon: Home },
    { name: 'Kurslar', path: '/courses', icon: Compass },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Sparkles, isCenter: true },
    { name: 'Do\'kon', path: '/shop', icon: ShoppingBag },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 sm:hidden shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] transition-colors duration-300">
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
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-[5px] border-white dark:border-gray-900 shadow-xl ${
                    active ? 'bg-gradient-to-tr from-[#1b3d16] to-[#0d210b] dark:from-[#2D5A27] dark:to-[#487343]' : 'bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27]'
                  }`}
                >
                  <motion.div
                    animate={{ rotate: active ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-900'}`} />
                  </motion.div>
                </motion.div>
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
              <motion.div 
                layoutId="bottom-nav-indicator"
                className="absolute inset-0 bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.85 }}
              animate={active ? { y: -4 } : { y: 0 }}
              className="relative z-10 flex flex-col items-center"
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
            </motion.div>
          </Link>
        );
      })}
    </div>
  )
}

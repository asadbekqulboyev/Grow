'use client';

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { usePathname } from 'next/navigation'
import { Home, Compass, ShoppingBag, User, Sparkles } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <aside className="hidden sm:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 z-10 transition-colors duration-300">
      <div className="flex items-center mb-10">
        <Logo size={40} />
        <span className="text-2xl font-bold tracking-tight text-[#2D5A27] dark:text-[#A8E6CF] mt-1 -ml-1">Grow.UZ</span>
      </div>

      <nav className="space-y-2 flex-1">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive('/dashboard') 
              ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </Link>
        <Link 
          href="/courses" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive('/courses') 
              ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
          }`}
        >
          <Compass className="w-5 h-5" />
          Kurslar
        </Link>
        <Link 
          href="/ai-mentor" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive('/ai-mentor') 
              ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isActive('/ai-mentor') ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={isActive('/ai-mentor') ? '' : 'bg-gradient-to-r from-[#2D5A27] to-[#487343] dark:from-[#A8E6CF] dark:to-[#81c07a] bg-clip-text text-transparent font-bold'}>AI Mentor</span>
        </Link>
        <Link 
          href="/shop" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive('/shop') 
              ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          Do&apos;kon
        </Link>
        <Link 
          href="/profile" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive('/profile') 
              ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          Profil
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="p-4 bg-[#2D5A27] rounded-2xl text-white">
          <p className="text-xs opacity-80 mb-1 uppercase font-bold tracking-wider">AI Mentor</p>
          <p className="text-sm mb-3">Savollaringiz bormi?</p>
          <Link href="/ai-mentor" className="block text-center w-full py-2 bg-[#A8E6CF] text-[#2D5A27] font-bold rounded-lg text-sm hover:brightness-105 transition-all shadow-md">
            Suhbat
          </Link>
        </div>
      </div>
    </aside>
  )
}

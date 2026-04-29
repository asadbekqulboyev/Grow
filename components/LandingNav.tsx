'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { User } from 'lucide-react';

interface UserData {
  email: string;
  avatar_url?: string;
  full_name?: string;
}

// Auth holatini context orqali ulashish (duplikat auth tekshiruvni oldini olish)
let cachedUser: UserData | null | undefined = undefined;
let authPromise: Promise<UserData | null> | null = null;

function getSharedAuthCheck(): Promise<UserData | null> {
  if (authPromise) return authPromise;
  
  authPromise = (async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      cachedUser = {
        email: authUser.email || '',
        avatar_url: authUser.user_metadata?.avatar_url,
        full_name: authUser.user_metadata?.full_name,
      };
    } else {
      cachedUser = null;
    }
    return cachedUser;
  })();
  
  return authPromise;
}

export function LandingNav() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSharedAuthCheck().then((result) => {
      setUser(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <span className="text-xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] hidden sm:inline">Grow.UZ</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link href="#courses" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">Kurslar</Link>
          <Link href="#features" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">Imkoniyatlar</Link>
          <Link href="#ai-mentor" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">AI Mentor</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user ? (
            /* Logged in — show profile & dashboard */
            <>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full font-bold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 hover:bg-[#A8E6CF]/30 transition-colors text-sm"
              >
                Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-2 group">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Profil'}
                    className="w-10 h-10 rounded-full border-2 border-[#A8E6CF] group-hover:border-[#2D5A27] transition-colors object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2D5A27] flex items-center justify-center group-hover:bg-[#1f421a] transition-colors">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </Link>
            </>
          ) : (
            /* Not logged in — show login buttons */
            <>
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-full font-bold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 hover:bg-[#A8E6CF]/30 transition-colors"
              >
                Kirish
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-6 py-2.5 rounded-full font-bold text-white bg-[#2D5A27] hover:bg-[#1f421a] shadow-lg shadow-[#2D5A27]/20 transition-all hover:-translate-y-0.5"
              >
                Boshlash
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function HeroCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Keshdan foydalanish — yangi so'rov yubormasdan
    getSharedAuthCheck().then((result) => {
      setIsLoggedIn(!!result);
    });
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        href={isLoggedIn ? '/dashboard' : '/login'}
        className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#2D5A27] hover:bg-[#1f421a] shadow-xl shadow-[#2D5A27]/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
      >
        {isLoggedIn ? 'Davom etish →' : 'Hoziroq boshlash →'}
      </Link>
      <Link
        href="#courses"
        className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-lg flex items-center justify-center"
      >
        Kurslarni ko&apos;rish
      </Link>
    </div>
  );
}

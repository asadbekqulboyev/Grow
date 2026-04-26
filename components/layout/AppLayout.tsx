'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrLanding = pathname === '/' || pathname === '/login';

  return (
    <>
      {!isAuthOrLanding && <Sidebar />}
      <main className={`flex-1 min-w-0 h-[100dvh] overflow-y-auto relative ${isAuthOrLanding ? '' : 'sm:ml-64 pb-24 sm:pb-0'}`}>
        {children}
      </main>
      {!isAuthOrLanding && <BottomNav />}
    </>
  );
}

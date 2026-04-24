'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const redirectUri = `${window.location.origin}/api/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true
        }
      });
      
      if (error) throw error;
      
      // Navigate to the OAuth provider URL in a popup window
      if (data?.url) {
        const popup = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!popup) {
          alert("Iltimos, qalqib chiquvchi oynalarga ruxsat bering (Popup blocker'ni o'chiring).");
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Allow only valid origins
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_CODE_RECEIVED' && event.data.url) {
        setIsLoading(true);
        try {
          const url = new URL(event.data.url);
          const code = url.searchParams.get('code');
          if (code) {
            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            router.push('/dashboard');
            router.refresh();
          }
        } catch (error) {
          console.error('Session exchange error:', error);
          alert('Tizimga kirishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
          setIsLoading(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        // Fallback for previous implementation just in case
        router.push('/dashboard');
        router.refresh();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-[#F3F4F6] pb-24">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col pt-10">
        
        <Link href="/" className="inline-flex flex-col items-center justify-center mb-8 self-center">
            <div className="w-16 h-16 flex items-center justify-center relative">
              <Image src="/images/logo.png" alt="Grow.UZ Logo" fill className="object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-xl mt-2">Grow.UZ</span>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz!</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-[80%] mx-auto">Platformadan to&apos;liq foydalanish uchun tizimga kiring.</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-bold text-gray-700 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Ulanmoqda..." : "Google orqali kirish"}
          </button>
          
          <button 
            disabled 
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#229ED9]/10 border-2 border-[#229ED9]/20 rounded-xl font-bold text-[#229ED9] transition-all opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.32-.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram orqali kirish (Tez kunda)
          </button>
        </div>
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Globe, Bell, Lock, LogOut, Award, CheckCircle, ChevronRight, Moon, Sun, Monitor, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';

export default function ProfilePage() {
  const [language, setLanguage] = useState('uz');
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = createClient();
      
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      
      if (updateError) throw updateError;
      
      // Update local state
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: data.publicUrl
        }
      });

    } catch (error: any) {
      alert(`Rasm joylashda xatolik: ${error.message}. Supabase'da "avatars" deb nomlangan Public bucket borligiga ishonch hosil qiling.`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return <div className="flex-1 flex justify-center items-center min-h-screen bg-[#F3F4F6] dark:bg-[#111827]">Yuklanmoqda...</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h2 className="text-xl font-bold">Mening Profilim</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-800 px-4 py-2 rounded-full transition-colors duration-300">
            <span className="text-[10px] bg-yellow-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm">💰</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 hidden sm:inline-block">1,210 Tangalar</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 sm:hidden">1,210</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 max-w-7xl mx-auto w-full">
        
        {/* Left Column: User Info & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center transition-colors duration-300">
             <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] border-4 border-white dark:border-gray-900 shadow-md relative mb-5 transition-colors group">
                <div className="w-full h-full overflow-hidden rounded-full">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold uppercase">{user?.email?.[0] || 'U'}</div>
                  )}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">O'zgartirish</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                    </>
                  )}
                </label>
             </div>
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{user?.user_metadata?.full_name || 'Foydalanuvchi'}</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{user?.email}</p>
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF] rounded-full text-xs font-bold uppercase tracking-wider">
               <Award className="w-4 h-4" /> Daraxt Level 3
             </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h4 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#2D5A27]" /> 
              Statistika
            </h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tugallangan kurslar</span>
                 <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">4</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Olingan sertifikatlar</span>
                 <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">2</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Umumiy reyting</span>
                 <span className="font-bold text-[#2D5A27] dark:text-[#A8E6CF]">Top 15%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Certificates */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Settings Area */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] px-8 py-10 shadow-sm border border-gray-100 dark:border-gray-800 border-t-8 border-t-[#2D5A27] transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#2D5A27]" />
              Sozlamalar
            </h3>

            <div className="space-y-10">
              {/* Theme Settings */}
              {mounted && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Tashqi ko'rinish
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 text-sm font-bold transition-all ${theme === 'light' ? 'border-[#2D5A27] bg-[#A8E6CF]/10 text-[#2D5A27]' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800'}`}
                    >
                      <Sun className="w-4 h-4" /> Kunduzgi
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 text-sm font-bold transition-all ${theme === 'dark' ? 'border-[#2D5A27] bg-[#A8E6CF]/10 text-[#2D5A27]' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800'}`}
                    >
                      <Moon className="w-4 h-4" /> Tungi
                    </button>
                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 text-sm font-bold transition-all ${theme === 'system' ? 'border-[#2D5A27] bg-[#A8E6CF]/10 text-[#2D5A27]' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800'}`}
                    >
                      <Monitor className="w-4 h-4" /> Tizim
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Xabarnomalar
                </h4>
                <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Dars eslatmalari</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Yangi vazifalar haqida email olish.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center ${notifications ? 'bg-[#2D5A27]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>

              {/* Security */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Xavfsizlik
                </h4>
                <div className="space-y-3">
                  <button className="w-full flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Parolni o'zgartirish</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors" />
                  </button>
                  <button className="w-full flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Ikki bosqichli autentifikatsiya (2FA)</span>
                    <span className="text-xs font-bold text-gray-400 uppercase group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors">O'chirilgan</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* User Certificates List  */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mening Sertifikatlarim</h3>
              <div className="text-sm font-semibold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 px-3 py-1 rounded-full">2 ta</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Certificate Item 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 p-5 relative flex flex-col hover:border-[#2D5A27]/50 dark:hover:border-[#2D5A27]/50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                    <div className="w-8 h-8 bg-[#2D5A27] rounded-md text-white flex items-center justify-center font-bold font-serif text-xs">G</div>
                    <div className="text-xs text-gray-400 font-mono tracking-wider font-semibold">GRW-99281</div>
                </div>
                <div className="mb-6 mt-2">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Ommaviy Nutq Sirlari</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">15 Aprel, 2026</p>
                </div>
                <div className="mt-auto flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-1 text-center">Ko'rish</button>
                  <DownloadCertificateBtn 
                    className="px-4 py-2 bg-[#2D5A27] text-white font-bold text-xs rounded-xl hover:bg-[#1e3c1a] shadow-sm transition-colors flex-1 text-center whitespace-nowrap"
                    certData={{
                      id: "GRW-99281",
                      studentName: "Davron Akhmedov",
                      courseName: "Ommaviy Nutq Sirlari",
                      date: "15 Aprel, 2026",
                    }}
                  >
                    PDF yuklash
                  </DownloadCertificateBtn>
                </div>
              </div>

              {/* Certificate Item 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 p-5 relative flex flex-col hover:border-[#2D5A27]/50 dark:hover:border-[#2D5A27]/50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                    <div className="w-8 h-8 bg-[#2D5A27] rounded-md text-white flex items-center justify-center font-bold font-serif text-xs">G</div>
                    <div className="text-xs text-gray-400 font-mono tracking-wider font-semibold">GRW-55032</div>
                </div>
                <div className="mb-6 mt-2">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Vaqtni Boshqarish</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">22 Mart, 2026</p>
                </div>
                <div className="mt-auto flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-1 text-center">Ko'rish</button>
                  <DownloadCertificateBtn 
                    className="px-4 py-2 bg-[#2D5A27] text-white font-bold text-xs rounded-xl hover:bg-[#1e3c1a] shadow-sm transition-colors flex-1 text-center whitespace-nowrap"
                    certData={{
                      id: "GRW-55032",
                      studentName: "Davron Akhmedov",
                      courseName: "Vaqtni Boshqarish",
                      date: "22 Mart, 2026",
                    }}
                  >
                    PDF yuklash
                  </DownloadCertificateBtn>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="mt-4 mb-8">
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-5 rounded-2xl border-2 border-red-100 dark:border-red-900/30 bg-white dark:bg-gray-900 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Tizimdan chiqish
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

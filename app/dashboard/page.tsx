import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Xush kelibsiz, {data.user.user_metadata?.full_name?.split(' ')[0] || 'Foydalanuvchi'}!</h2>
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-800 px-4 py-2 rounded-full transition-colors duration-300">
            <span className="text-[10px] bg-yellow-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm">💰</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 hidden sm:inline-block transition-colors">1,210 Tangalar</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 sm:hidden transition-colors">1,210</span>
          </div>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-100 dark:border-gray-700">
             {data.user.user_metadata?.avatar_url ? (
               <div className="w-8 h-8 relative rounded-full overflow-hidden border border-gray-200">
                 <Image src={data.user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
               </div>
             ) : (
               <UserCircle className="w-8 h-8 text-gray-400" />
             )}
          </Link>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
        
        {/* Left Column: Growth Tree */}
        <div className="md:col-span-12 lg:col-span-7">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 h-[480px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative transition-colors duration-300">
            <div className="absolute top-6 left-8 w-full">
              <h3 className="text-lg font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">Sizning daraxtingiz</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Level 3: O'sib borayotgan nihol</p>
            </div>
            
            {/* Visual Tree Representation */}
            <div className="flex-1 w-full flex items-end justify-center pb-10">
              <div className="relative">
                {/* Trunk */}
                <div className="w-6 h-48 bg-[#4d3a2c] mx-auto rounded-t-lg"></div>
                {/* Leaves Layers */}
                <div className="absolute -top-10 -left-16 w-40 h-40 bg-[#2D5A27] rounded-full opacity-90 blur-[2px]"></div>
                <div className="absolute -top-20 -left-6 w-32 h-32 bg-[#A8E6CF] rounded-full opacity-80 blur-[1px]"></div>
                <div className="absolute -top-16 -right-12 w-36 h-36 bg-[#3a7233] rounded-full opacity-90"></div>
                <div className="absolute top-4 -right-8 w-24 h-24 bg-[#A8E6CF] rounded-full opacity-60"></div>
                {/* Glowing fruits (represent coins) */}
                <div className="absolute top-0 left-4 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"></div>
                <div className="absolute -top-12 -right-2 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"></div>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden transition-colors">
              <div className="bg-[#2D5A27] dark:bg-[#A8E6CF] h-full w-2/3 transition-colors"></div>
            </div>
            <p className="text-xs text-center mt-3 text-gray-400 dark:text-gray-500 transition-colors">Keyingi bosqichgacha 350 tanga</p>
          </div>
        </div>

        {/* Right Column: Stats & Certificates */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Faol kunlar</p>
               <p className="text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">12 Kun</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Kurslar</p>
               <p className="text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">4 yakunlandi</p>
             </div>
          </div>
          
          {/* Recent Certificate Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[328px] transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white transition-colors">Oxirgi Sertifikat</h3>
              <button className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] underline transition-colors">Barchasi</button>
            </div>
            <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 relative flex flex-col transition-colors duration-300">
              <div className="flex justify-between">
                  <div className="w-8 h-8 bg-[#2D5A27] dark:bg-[#1e3c1a] rounded-sm text-white flex items-center justify-center font-bold font-serif transition-colors">G</div>
                  <div className="text-[8px] text-right text-gray-400 dark:text-gray-400">ID: GRW-99281</div>
              </div>
              <div className="mt-4 text-center">
                  <h4 className="text-[14px] font-serif italic text-gray-800 dark:text-gray-200 transition-colors">Mualliflik Sertifikati</h4>
                  <div className="h-[1px] w-12 bg-[#A8E6CF] dark:bg-[#2D5A27] mx-auto my-2 transition-colors"></div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 transition-colors">taqdirlandi</p>
                  <p className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] mt-1 transition-colors">Davron Akhmedov</p>
                  <p className="text-[8px] mt-2 text-gray-600 dark:text-gray-400 transition-colors">kuyidagi kursni tugatgani uchun:</p>
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 transition-colors">Ommaviy Nutq Sirlari</p>
              </div>
              <div className="mt-auto flex justify-between items-end">
                  <div className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm shadow-sm transition-colors">
                      <div className="w-8 h-8 border border-gray-100 dark:border-gray-700 flex flex-wrap">
                        {/* Simulating QR */}
                        <div className="w-1/2 h-1/2 bg-black"></div><div className="w-1/2 h-1/2 bg-white"></div>
                        <div className="w-1/2 h-1/2 bg-white"></div><div className="w-1/2 h-1/2 bg-black"></div>
                      </div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <button className="px-3 py-1 bg-[#2D5A27] dark:bg-[#A8E6CF] dark:text-[#1e3c1a] text-white text-[10px] rounded-md font-medium hover:bg-[#1e3c1a] dark:hover:bg-[#86bfa8] transition-colors">Yozib olish / PDF</button>
                      <div className="text-[7px] text-gray-400 dark:text-gray-500 text-center transition-colors">Tasdiqlash uchun skanerlang</div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Course Bar */}
      <div className="mx-8 mt-auto mb-8 bg-[#A8E6CF] dark:bg-[#2D5A27] rounded-[24px] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-bold text-[#2D5A27] dark:text-[#A8E6CF] shadow-sm tracking-tighter transition-colors">▶</div>
              <div>
                  <p className="text-[10px] font-bold text-[#2D5A27]/60 dark:text-[#A8E6CF]/60 uppercase tracking-wider mb-0.5 transition-colors">Joriy Dars</p>
                  <p className="font-bold text-[#2D5A27] dark:text-white text-sm line-clamp-1 transition-colors">Vaqtni boshqarish: Pomodoro</p>
              </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
              <div className="w-32 sm:w-48 bg-white/40 dark:bg-gray-800/40 h-1.5 rounded-full hidden sm:block transition-colors">
                  <div className="w-[85%] h-full bg-[#2D5A27] dark:bg-[#A8E6CF] rounded-full shadow-[0_0_8px_rgba(45,90,39,0.3)] dark:shadow-[0_0_8px_rgba(168,230,207,0.3)] transition-colors"></div>
              </div>
              <button className="px-6 py-2 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#1e3c1a] rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-all whitespace-nowrap">Davom etish (+50)</button>
          </div>
      </div>
    </div>
  )
}

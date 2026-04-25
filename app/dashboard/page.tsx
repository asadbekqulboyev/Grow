import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect('/login');
  }

  // Fetch user coins
  const { data: coinsData } = await supabase
    .from('user_coins')
    .select('amount')
    .eq('user_id', data.user.id);
  
  const totalCoins = (coinsData || []).reduce((sum, c) => sum + (c.amount || 0), 0);

  // Fetch completed lessons count
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('id, course_id, completed')
    .eq('user_id', data.user.id)
    .eq('completed', true);

  // Fetch completed courses (unique course_ids from progress)
  const completedCourseIds = [...new Set((progressData || []).map(p => p.course_id))];

  // Fetch certificates
  const { data: certsData } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', data.user.id)
    .order('issued_at', { ascending: false })
    .limit(1);

  const latestCert = certsData?.[0] || null;

  // Fetch active days (unique days with any progress)
  const { data: activeDaysData } = await supabase
    .from('user_progress')
    .select('created_at')
    .eq('user_id', data.user.id);

  const uniqueDays = new Set((activeDaysData || []).map(d => 
    new Date(d.created_at).toDateString()
  )).size;

  // Tree level based on coins
  const treeLevel = totalCoins < 200 ? 1 : totalCoins < 500 ? 2 : totalCoins < 1000 ? 3 : totalCoins < 2000 ? 4 : 5;
  const treeLevelNames = ['Urug\'', 'Nihol', 'O\'sib borayotgan nihol', 'Yosh daraxt', 'Bahaybat daraxt'];
  const treeLevelName = treeLevelNames[treeLevel - 1] || 'Urug\'';
  const nextLevelCoins = [200, 500, 1000, 2000, 5000][treeLevel - 1] || 5000;
  const progressPercent = Math.min((totalCoins / nextLevelCoins) * 100, 100);
  const coinsToNext = Math.max(nextLevelCoins - totalCoins, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-[15px] sm:px-8 z-40 sticky top-0 transition-colors duration-300 gap-2">
        <div className="flex items-center">
          <Link href="/dashboard" className="sm:hidden flex items-center">
            <img src="/images/logo.svg" alt="Grow.uz" className="h-8 object-contain dark:invert" />
          </Link>
          <h2 className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white transition-colors truncate">
            Salom, {data.user.user_metadata?.full_name?.split(' ')[0] || 'Foydalanuvchi'}!
          </h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-800 px-4 py-2 rounded-full transition-colors duration-300">
            <span className="text-[10px] bg-yellow-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm">💰</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 hidden sm:inline-block transition-colors">{totalCoins.toLocaleString()} Tangalar</span>
            <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 sm:hidden transition-colors">{totalCoins.toLocaleString()}</span>
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
      <div className="px-[15px] sm:px-8 py-4 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 sm:pb-24">
        
        {/* Left Column: Growth Tree */}
        <div className="md:col-span-12 lg:col-span-7">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 h-[380px] sm:h-[480px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative transition-colors duration-300">
            <div className="absolute top-6 left-6 sm:left-8 w-full">
              <h3 className="text-lg font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">Sizning daraxtingiz</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Level {treeLevel}: {treeLevelName}</p>
            </div>
            
            {/* Visual Tree Representation */}
            <div className="flex-1 w-full flex items-end justify-center pb-6 sm:pb-10 transform scale-75 sm:scale-100 origin-bottom">
              <div className="relative">
                {/* Trunk */}
                <div className="w-6 h-48 bg-[#4d3a2c] mx-auto rounded-t-lg"></div>
                {/* Leaves Layers - grow based on level */}
                <div className={`absolute -top-10 -left-16 w-40 h-40 bg-[#2D5A27] rounded-full blur-[2px] transition-all duration-1000 ${treeLevel >= 2 ? 'opacity-90' : 'opacity-30 scale-50'}`}></div>
                <div className={`absolute -top-20 -left-6 w-32 h-32 bg-[#A8E6CF] rounded-full blur-[1px] transition-all duration-1000 ${treeLevel >= 3 ? 'opacity-80' : 'opacity-20 scale-50'}`}></div>
                <div className={`absolute -top-16 -right-12 w-36 h-36 bg-[#3a7233] rounded-full transition-all duration-1000 ${treeLevel >= 2 ? 'opacity-90' : 'opacity-30 scale-50'}`}></div>
                <div className={`absolute top-4 -right-8 w-24 h-24 bg-[#A8E6CF] rounded-full transition-all duration-1000 ${treeLevel >= 4 ? 'opacity-60' : 'opacity-0 scale-0'}`}></div>
                {/* Glowing fruits */}
                {treeLevel >= 3 && <div className="absolute top-0 left-4 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"></div>}
                {treeLevel >= 4 && <div className="absolute -top-12 -right-2 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"></div>}
                {treeLevel >= 5 && <div className="absolute -top-8 left-10 w-4 h-4 bg-yellow-300 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.9)]"></div>}
              </div>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden transition-colors">
              <div className="bg-[#2D5A27] dark:bg-[#A8E6CF] h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-xs text-center mt-3 text-gray-400 dark:text-gray-500 transition-colors">
              {coinsToNext > 0 ? `Keyingi bosqichgacha ${coinsToNext} tanga` : 'Maksimal daraja!'}
            </p>
          </div>
        </div>

        {/* Right Column: Stats & Certificates */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] rounded-bl-[1.5rem] sm:rounded-bl-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Faol kunlar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{uniqueDays} Kun</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] rounded-br-[1.5rem] sm:rounded-br-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Kurslar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{completedCourseIds.length} <span className="hidden sm:inline">yakunlandi</span><span className="sm:hidden">ta</span></p>
             </div>
          </div>
          
          {/* Recent Certificate Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[280px] sm:h-[328px] transition-colors duration-300 z-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white transition-colors">Oxirgi Sertifikat</h3>
              <Link href="/profile" className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] underline transition-colors">Barchasi</Link>
            </div>
            {latestCert ? (
              <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 relative flex flex-col transition-colors duration-300">
                <div className="flex justify-between">
                    <div className="w-8 h-8 bg-[#2D5A27] dark:bg-[#1e3c1a] rounded-sm text-white flex items-center justify-center font-bold font-serif transition-colors">G</div>
                    <div className="text-[8px] text-right text-gray-400 dark:text-gray-400">ID: {latestCert.cert_code}</div>
                </div>
                <div className="mt-2 sm:mt-4 text-center">
                    <h4 className="text-[12px] sm:text-[14px] font-serif italic text-gray-800 dark:text-gray-200 transition-colors">Mualliflik Sertifikati</h4>
                    <div className="h-[1px] w-12 bg-[#A8E6CF] dark:bg-[#2D5A27] mx-auto my-1 sm:my-2 transition-colors"></div>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 transition-colors">taqdirlandi</p>
                    <p className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] mt-1 transition-colors line-clamp-1">{latestCert.student_name}</p>
                    <p className="text-[8px] mt-1 sm:mt-2 text-gray-600 dark:text-gray-400 transition-colors">quyidagi kursni tugatgani uchun:</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-gray-800 dark:text-gray-200 transition-colors line-clamp-2">{latestCert.course_name}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 flex flex-col items-center justify-center text-center transition-colors">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hali sertifikat yo&apos;q</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Kursni tugatib birinchi sertifikatingizni oling!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Active Course Bar */}
      <div className="mx-4 sm:mx-8 mt-auto mb-28 sm:mb-8 bg-[#A8E6CF] dark:bg-[#2D5A27] rounded-2xl sm:rounded-[24px] p-4 flex gap-4 items-center justify-between shadow-sm transition-colors duration-300 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <Link href="/courses" className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-bold text-[#2D5A27] dark:text-[#A8E6CF] shadow-sm tracking-tighter transition-colors">▶</Link>
              <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#2D5A27]/60 dark:text-[#A8E6CF]/60 uppercase tracking-wider mb-0.5 transition-colors">Kurslar</p>
                  <p className="font-bold text-[#2D5A27] dark:text-white text-xs sm:text-sm truncate transition-colors">O&apos;rganishni davom eting</p>
              </div>
          </div>
          <div className="flex items-center shrink-0">
              <Link href="/courses" className="px-4 py-2 sm:px-6 sm:py-2 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#1e3c1a] rounded-full text-[10px] sm:text-xs font-bold shadow-lg hover:scale-105 transition-all whitespace-nowrap">
                O&apos;tish
              </Link>
          </div>
      </div>
    </div>
  )
}

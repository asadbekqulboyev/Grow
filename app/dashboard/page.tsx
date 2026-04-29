import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';
import { CertificatePreview } from '@/components/CertificatePreview';
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

  // Barcha so'rovlarni PARALLEL bajarish (Promise.all) — tezlik ~3x oshadi
  const [
    { data: coinsData },
    { data: progressData },
    { data: allCertsData },
  ] = await Promise.all([
    supabase
      .from('user_coins')
      .select('amount, created_at')
      .eq('user_id', data.user.id),
    supabase
      .from('user_progress')
      .select('id, lesson_id, completed, completed_at')
      .eq('user_id', data.user.id)
      .eq('completed', true),
    supabase
      .from('certificates')
      .select('*')
      .eq('user_id', data.user.id)
      .order('issued_at', { ascending: false }),
  ]);

  const totalCoins = (coinsData || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  const completedLessonsCount = progressData?.length || 0;

  const completedCoursesCount = allCertsData?.length || 0;
  const latestCert = allCertsData?.[0] || null;

  // Faol kunlar — barcha jadvallardan unikal kunlarni hisoblash
  const allDates = new Set<string>();
  // user_progress dan completed_at
  (progressData || []).forEach(p => {
    if (p.completed_at) allDates.add(new Date(p.completed_at).toDateString());
  });
  // user_coins dan created_at
  (coinsData || []).forEach(c => {
    if (c.created_at) allDates.add(new Date(c.created_at).toDateString());
  });
  // certificates dan issued_at
  (allCertsData || []).forEach(cert => {
    if (cert.issued_at) allDates.add(new Date(cert.issued_at).toDateString());
  });
  const uniqueDays = allDates.size;

  // Tree level based on completed courses (certificates)
  const treeLevel = completedCoursesCount === 0 ? 1 : completedCoursesCount === 1 ? 2 : completedCoursesCount === 2 ? 3 : completedCoursesCount === 3 ? 4 : 5;
  const treeLevelNames = ['Urug\'', 'Nihol', 'O\'sib borayotgan nihol', 'Yosh daraxt', 'Bahaybat daraxt'];
  const treeLevelName = treeLevelNames[treeLevel - 1] || 'Urug\'';
  const nextLevelCourses = [1, 2, 3, 4, 5][treeLevel - 1] || 5;
  const progressPercent = Math.min((completedCoursesCount / nextLevelCourses) * 100, 100);
  const coursesToNext = Math.max(nextLevelCourses - completedCoursesCount, 0);

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
          <div className="bg-gradient-to-b from-white to-[#f8fdf7] dark:from-gray-800 dark:to-gray-800 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 h-[380px] sm:h-[480px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative transition-colors duration-300 overflow-hidden">
            
            {/* Badge */}
            <div className="absolute top-6 left-6 sm:left-8 z-10">
              <h3 className="text-lg font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">Sizning daraxtingiz</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Level {treeLevel}:</span>
                <span className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 px-2.5 py-0.5 rounded-full">{treeLevelName}</span>
              </div>
            </div>

            {/* Yer — tuproq chizig'i */}
            <div className="absolute bottom-[72px] sm:bottom-[88px] left-0 right-0 z-0">
              <div className="h-[3px] bg-gradient-to-r from-transparent via-[#8B6F47]/30 to-transparent mx-8"></div>
              <div className="h-6 bg-gradient-to-b from-[#8B6F47]/8 to-transparent mx-8 rounded-b-full"></div>
            </div>

            {/* ===== DARAXT SVG ===== */}
            <div className="flex-1 w-full flex items-end justify-center pb-6 sm:pb-10 z-[1]">
              <svg viewBox="0 0 300 320" className="w-[200px] h-[240px] sm:w-[260px] sm:h-[300px] drop-shadow-sm" style={{ filter: 'drop-shadow(0 2px 8px rgba(45,90,39,0.1))' }}>

                {/* === Level 1: Urug' === */}
                {treeLevel === 1 && (
                  <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                    {/* Tuproq uyumi */}
                    <ellipse cx="150" cy="290" rx="50" ry="14" fill="#8B6F47" opacity="0.3" />
                    <ellipse cx="150" cy="286" rx="35" ry="10" fill="#6B5035" opacity="0.4" />
                    {/* Urug' */}
                    <ellipse cx="150" cy="270" rx="12" ry="8" fill="#8B6F47" stroke="#6B5035" strokeWidth="1" />
                    <ellipse cx="150" cy="269" rx="8" ry="5" fill="#A67C52" opacity="0.7" />
                    {/* Kichik o'sik */}
                    <path d="M150 262 Q148 252 144 248" stroke="#4a8c42" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <ellipse cx="142" cy="246" rx="5" ry="3.5" fill="#6abf62" transform="rotate(-20 142 246)" />
                  </g>
                )}

                {/* === Level 2: Nihol === */}
                {treeLevel === 2 && (
                  <g>
                    {/* Tuproq */}
                    <ellipse cx="150" cy="292" rx="40" ry="10" fill="#8B6F47" opacity="0.25" />
                    {/* Ildiz ko'rinishi */}
                    <path d="M150 285 Q145 290 138 292" stroke="#6B5035" strokeWidth="1.5" fill="none" opacity="0.3" />
                    <path d="M150 285 Q155 290 162 292" stroke="#6B5035" strokeWidth="1.5" fill="none" opacity="0.3" />
                    {/* Ingichka tana */}
                    <path d="M150 285 Q149 250 150 210" stroke="#5a4030" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M150 285 Q151 250 150 210" stroke="#6B5035" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
                    {/* Chap barg */}
                    <g style={{ animation: 'sway 4s ease-in-out infinite' }}>
                      <path d="M149 240 Q130 225 125 215 Q135 218 149 235" fill="#4a8c42" opacity="0.9" />
                    </g>
                    {/* O'ng barg */}
                    <g style={{ animation: 'sway 4.5s ease-in-out infinite reverse' }}>
                      <path d="M151 230 Q168 218 175 210 Q167 218 151 226" fill="#6abf62" opacity="0.85" />
                    </g>
                    {/* Tepa barg */}
                    <ellipse cx="150" cy="204" rx="8" ry="12" fill="#3a9e34" />
                    <ellipse cx="150" cy="202" rx="5" ry="8" fill="#5ec457" opacity="0.6" />
                  </g>
                )}

                {/* === Level 3: O'sib borayotgan nihol === */}
                {treeLevel === 3 && (
                  <g>
                    {/* Tuproq */}
                    <ellipse cx="150" cy="292" rx="55" ry="12" fill="#8B6F47" opacity="0.2" />
                    {/* Ildiz */}
                    <path d="M148 288 Q138 295 125 296" stroke="#6B5035" strokeWidth="2" fill="none" opacity="0.25" />
                    <path d="M152 288 Q162 295 175 296" stroke="#6B5035" strokeWidth="2" fill="none" opacity="0.25" />
                    {/* Tana */}
                    <path d="M150 288 Q148 240 150 160" stroke="#4d3a2c" strokeWidth="7" fill="none" strokeLinecap="round" />
                    <path d="M150 288 Q152 240 150 160" stroke="#6B5035" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.4" />
                    {/* Shox — chap */}
                    <path d="M150 220 Q130 200 115 195" stroke="#4d3a2c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    {/* Shox — o'ng */}
                    <path d="M150 200 Q170 185 185 182" stroke="#4d3a2c" strokeWidth="3" fill="none" strokeLinecap="round" />
                    {/* Barglar */}
                    <circle cx="115" cy="190" r="22" fill="#2D5A27" opacity="0.85" />
                    <circle cx="120" cy="185" r="15" fill="#4a8c42" opacity="0.7" />
                    <circle cx="185" cy="178" r="20" fill="#2D5A27" opacity="0.8" />
                    <circle cx="180" cy="174" r="13" fill="#3a9e34" opacity="0.6" />
                    {/* Tepa barg */}
                    <circle cx="150" cy="148" r="25" fill="#2D5A27" opacity="0.9" />
                    <circle cx="150" cy="144" r="18" fill="#4a8c42" opacity="0.6" />
                    <circle cx="145" cy="140" r="10" fill="#6abf62" opacity="0.4" />
                    {/* Meva */}
                    <circle cx="122" cy="205" r="4" fill="#f59e0b" opacity="0.9" />
                    <circle cx="122" cy="205" r="2" fill="#fbbf24" opacity="0.6" />
                  </g>
                )}

                {/* === Level 4: Yosh daraxt === */}
                {treeLevel === 4 && (
                  <g>
                    {/* Tuproq va o't */}
                    <ellipse cx="150" cy="294" rx="70" ry="14" fill="#8B6F47" opacity="0.15" />
                    <path d="M90 290 Q95 282 100 290" stroke="#6abf62" strokeWidth="1.5" fill="none" opacity="0.4" />
                    <path d="M200 290 Q205 283 210 290" stroke="#6abf62" strokeWidth="1.5" fill="none" opacity="0.4" />
                    {/* Ildizlar */}
                    <path d="M146 288 Q130 295 110 298" stroke="#6B5035" strokeWidth="2.5" fill="none" opacity="0.2" />
                    <path d="M154 288 Q170 295 190 298" stroke="#6B5035" strokeWidth="2.5" fill="none" opacity="0.2" />
                    {/* Tana */}
                    <path d="M150 290 Q147 230 150 130" stroke="#4d3a2c" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <path d="M150 290 Q153 230 150 130" stroke="#6B5035" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.35" />
                    {/* Shoxlar */}
                    <path d="M150 210 Q120 185 95 175" stroke="#4d3a2c" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M150 180 Q180 160 205 155" stroke="#4d3a2c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    <path d="M150 160 Q125 140 108 132" stroke="#4d3a2c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    {/* Barg qatlamlari */}
                    <circle cx="90" cy="168" r="28" fill="#1e4a1a" opacity="0.85" />
                    <circle cx="100" cy="162" r="22" fill="#2D5A27" opacity="0.8" />
                    <circle cx="210" cy="148" r="26" fill="#1e4a1a" opacity="0.8" />
                    <circle cx="200" cy="143" r="20" fill="#2D5A27" opacity="0.75" />
                    <circle cx="105" cy="126" r="24" fill="#2D5A27" opacity="0.85" />
                    <circle cx="112" cy="122" r="16" fill="#3a9e34" opacity="0.6" />
                    {/* Tepa qismi */}
                    <circle cx="150" cy="115" r="32" fill="#1e4a1a" opacity="0.9" />
                    <circle cx="148" cy="108" r="25" fill="#2D5A27" opacity="0.8" />
                    <circle cx="145" cy="102" r="16" fill="#4a8c42" opacity="0.55" />
                    <circle cx="165" cy="125" r="18" fill="#3a9e34" opacity="0.5" />
                    {/* Mevalar */}
                    <circle cx="98" cy="185" r="4.5" fill="#f59e0b" />
                    <circle cx="195" cy="165" r="4" fill="#f59e0b" />
                    <circle cx="130" cy="140" r="3.5" fill="#ef4444" opacity="0.9" />
                    {/* Meva yaltiroq */}
                    <circle cx="97" cy="184" r="1.5" fill="#fbbf24" opacity="0.7" />
                    <circle cx="194" cy="164" r="1.5" fill="#fbbf24" opacity="0.7" />
                  </g>
                )}

                {/* === Level 5: Bahaybat to'liq daraxt === */}
                {treeLevel >= 5 && (
                  <g>
                    {/* O'tlar */}
                    <path d="M75 290 Q80 280 85 290" stroke="#6abf62" strokeWidth="1.5" fill="none" opacity="0.5" />
                    <path d="M95 292 Q98 284 102 292" stroke="#4a8c42" strokeWidth="1.5" fill="none" opacity="0.4" />
                    <path d="M200 291 Q203 283 207 291" stroke="#6abf62" strokeWidth="1.5" fill="none" opacity="0.45" />
                    <path d="M215 290 Q220 282 225 290" stroke="#4a8c42" strokeWidth="1.5" fill="none" opacity="0.4" />
                    {/* Tuproq */}
                    <ellipse cx="150" cy="295" rx="85" ry="15" fill="#8B6F47" opacity="0.12" />
                    {/* Ildizlar */}
                    <path d="M144 290 Q120 298 90 300" stroke="#6B5035" strokeWidth="3" fill="none" opacity="0.2" />
                    <path d="M156 290 Q180 298 210 300" stroke="#6B5035" strokeWidth="3" fill="none" opacity="0.2" />
                    <path d="M148 292 Q135 300 115 304" stroke="#6B5035" strokeWidth="2" fill="none" opacity="0.15" />
                    {/* Tana — qalin */}
                    <path d="M150 292 Q146 220 150 100" stroke="#3d2b1a" strokeWidth="14" fill="none" strokeLinecap="round" />
                    <path d="M150 292 Q154 220 150 100" stroke="#5a4030" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.3" />
                    {/* Po'stloq chiziq */}
                    <path d="M147 280 Q148 250 146 220" stroke="#2a1d10" strokeWidth="1" fill="none" opacity="0.15" />
                    <path d="M153 270 Q152 240 154 200" stroke="#2a1d10" strokeWidth="1" fill="none" opacity="0.12" />
                    {/* Shoxlar */}
                    <path d="M150 220 Q110 185 75 165" stroke="#3d2b1a" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M150 190 Q190 160 225 148" stroke="#3d2b1a" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                    <path d="M150 165 Q115 135 88 120" stroke="#3d2b1a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    <path d="M150 145 Q180 120 210 108" stroke="#3d2b1a" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M150 130 Q135 108 120 95" stroke="#3d2b1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    {/* KATTA barglar —uch qatlam */}
                    {/* 1-qatlam: eng qorong'i */}
                    <circle cx="68" cy="158" r="32" fill="#133a10" opacity="0.9" />
                    <circle cx="230" cy="140" r="30" fill="#133a10" opacity="0.85" />
                    <circle cx="82" cy="112" r="30" fill="#133a10" opacity="0.9" />
                    <circle cx="215" cy="100" r="28" fill="#133a10" opacity="0.85" />
                    <circle cx="150" cy="82" r="38" fill="#133a10" opacity="0.95" />
                    <circle cx="120" cy="88" r="28" fill="#133a10" opacity="0.85" />
                    {/* 2-qatlam */}
                    <circle cx="75" cy="152" r="25" fill="#1e4a1a" opacity="0.85" />
                    <circle cx="222" cy="135" r="24" fill="#1e4a1a" opacity="0.8" />
                    <circle cx="90" cy="106" r="24" fill="#1e4a1a" opacity="0.85" />
                    <circle cx="207" cy="95" r="22" fill="#1e4a1a" opacity="0.8" />
                    <circle cx="150" cy="76" r="30" fill="#1e4a1a" opacity="0.9" />
                    <circle cx="125" cy="82" r="22" fill="#1e4a1a" opacity="0.8" />
                    <circle cx="175" cy="90" r="20" fill="#1e4a1a" opacity="0.75" />
                    {/* 3-qatlam: eng ochiq */}
                    <circle cx="80" cy="146" r="16" fill="#2D5A27" opacity="0.75" />
                    <circle cx="215" cy="130" r="15" fill="#2D5A27" opacity="0.7" />
                    <circle cx="95" cy="100" r="15" fill="#3a9e34" opacity="0.5" />
                    <circle cx="150" cy="70" r="20" fill="#2D5A27" opacity="0.8" />
                    <circle cx="148" cy="66" r="12" fill="#4a8c42" opacity="0.5" />
                    {/* Oltin mevalar ✨ */}
                    <circle cx="80" cy="175" r="5.5" fill="#f59e0b" />
                    <circle cx="79" cy="174" r="2" fill="#fbbf24" opacity="0.8" />
                    <circle cx="215" cy="155" r="5" fill="#f59e0b" />
                    <circle cx="214" cy="154" r="2" fill="#fbbf24" opacity="0.8" />
                    <circle cx="100" cy="128" r="4.5" fill="#ef4444" />
                    <circle cx="99" cy="127" r="1.8" fill="#f87171" opacity="0.7" />
                    <circle cx="195" cy="115" r="5" fill="#f59e0b" />
                    <circle cx="194" cy="114" r="2" fill="#fbbf24" opacity="0.8" />
                    <circle cx="140" cy="98" r="4" fill="#ef4444" />
                    <circle cx="165" cy="105" r="4.5" fill="#f59e0b" />
                    <circle cx="164" cy="104" r="1.8" fill="#fbbf24" opacity="0.7" />
                    {/* Yulduzcha efekt */}
                    <circle cx="150" cy="55" r="3" fill="#fbbf24" opacity="0.7">
                      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="70" cy="140" r="2.5" fill="#fbbf24" opacity="0.5">
                      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="225" cy="125" r="2.5" fill="#fbbf24" opacity="0.5">
                      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </svg>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden transition-colors relative">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #2D5A27, #4a8c42, #A8E6CF)',
                }}
              ></div>
            </div>
            <p className="text-xs text-center mt-3 text-gray-400 dark:text-gray-500 transition-colors font-medium">
              {coursesToNext > 0 ? `Keyingi bosqichgacha ${coursesToNext} ta kurs tugatish kerak` : '🎉 Maksimal daraja — Tabriklaymiz!'}
            </p>
          </div>
        </div>

        {/* Right Column: Stats & Certificates */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Faol kunlar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{uniqueDays} <span className="text-sm font-semibold opacity-70">kun</span></p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Tugatilgan kurslar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{completedCoursesCount} <span className="text-sm font-semibold opacity-70">ta</span></p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">O&apos;tilgan darslar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{completedLessonsCount} <span className="text-sm font-semibold opacity-70">ta</span></p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1 transition-colors">Sertifikatlar</p>
               <p className="text-xl sm:text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF] transition-colors">{completedCoursesCount} <span className="text-sm font-semibold opacity-70">ta</span></p>
             </div>
          </div>
          
          {/* Recent Certificate Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300 z-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white transition-colors">Oxirgi Sertifikat</h3>
              <Link href="/profile" className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] underline transition-colors">Barchasi</Link>
            </div>
            {latestCert ? (
              <div className="flex-1 flex flex-col">
                {/* Haqiqiy sertifikat rasmi */}
                <CertificatePreview
                  id={latestCert.cert_code}
                  studentName={latestCert.student_name}
                  courseName={latestCert.course_name}
                  date={new Date(latestCert.issued_at).toLocaleDateString('uz-UZ')}
                />
                {/* PDF yuklab olish tugmasi */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <DownloadCertificateBtn
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D5A27] text-white rounded-xl text-xs font-bold hover:bg-[#1e3c1a] transition-colors shadow-sm"
                    certData={{
                      id: latestCert.cert_code,
                      studentName: latestCert.student_name,
                      courseName: latestCert.course_name,
                      date: new Date(latestCert.issued_at).toLocaleDateString('uz-UZ'),
                    }}
                  >
                    📄 PDF yuklab olish
                  </DownloadCertificateBtn>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 flex flex-col items-center justify-center text-center transition-colors py-8">
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

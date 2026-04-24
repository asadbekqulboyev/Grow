import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Star, Shield, Cpu, Target, Award, Users, CheckCircle, MessageSquareQuote, PlayCircle, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#111827] text-gray-900 dark:text-gray-100 font-sans selection:bg-[#A8E6CF] selection:text-[#2D5A27]">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <Image src="/images/logo.png" alt="Grow.UZ Logo" fill className="object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link href="#courses" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">Kurslar</Link>
            <Link href="#features" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">Imkoniyatlar</Link>
            <Link href="#ai-mentor" className="hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors">AI Mentor</Link>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
          {/* Grid Background */}
          <div className="absolute inset-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          {/* Decorative Ambient Orbs (Sharlar) */}
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-[#A8E6CF] dark:bg-[#A8E6CF] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-40 md:opacity-50 animate-float-slow -z-10"></div>
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-[#2D5A27] dark:bg-[#2D5A27] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-30 md:opacity-40 animate-float-medium -z-10" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-yellow-300 dark:bg-yellow-400 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-20 md:opacity-30 animate-float-fast -z-10"></div>
          
          {/* Small Floating Particles */}
          <div className="hidden md:block absolute top-1/3 left-1/4 w-4 h-4 bg-[#A8E6CF] rounded-full blur-[2px] animate-float-fast opacity-60"></div>
          <div className="hidden md:block absolute top-1/2 right-1/4 w-6 h-6 bg-yellow-400 rounded-full blur-[3px] animate-float-medium opacity-40" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
          <div className="hidden md:block absolute bottom-1/3 left-1/3 w-3 h-3 bg-[#2D5A27] rounded-full blur-[1px] animate-float-slow opacity-50"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF] font-bold text-[11px] sm:text-sm mb-6 border border-[#A8E6CF]/30 max-w-full text-left sm:text-center">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
              <span className="leading-tight sm:leading-normal">O&apos;zbekistondagi 1-raqamli Soft Skills akademiyasi</span>
            </div>
            
            <h1 className="text-[2rem] leading-[1.15] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 sm:leading-[1.1]">
              O&apos;zingizni rivojlantiring,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D5A27] to-[#A8E6CF] dark:from-[#A8E6CF] dark:to-[#487343]">
                Kelajagingizni quring
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Notiqlik, SMM, Vaqtni boshqarish va boshqa zamonaviy ko&apos;nikmalarni AI yordamchisiz bilishdan ko&apos;proq narsaga ega bo&apos;ling.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#2D5A27] hover:bg-[#1f421a] shadow-xl shadow-[#2D5A27]/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
              >
                Hoziroq boshlash <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#courses" 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-lg flex items-center justify-center"
              >
                Kurslarni ko&apos;rish
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section id="courses" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 px-6 transition-colors relative overflow-hidden">
          {/* Courses Section Ambient Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A8E6CF] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[150px] opacity-20 animate-float-slow pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2D5A27] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[130px] opacity-10 animate-float-medium pointer-events-none" style={{ animationDelay: '1s' }}></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight">Ommabop Kurslar</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Eng ko&apos;p talab qilinadigan ko&apos;nikmalarni o&apos;rganing va karyerangizni yangi bosqichga olib chiqing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Course 1 */}
              <div className="bg-[#F3F4F6] dark:bg-gray-800 rounded-3xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-transparent dark:border-gray-700 hover:shadow-xl hover:shadow-[#A8E6CF]/10">
                <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/30" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#2D5A27] dark:text-[#A8E6CF]">Top rating</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ommaviy Notiqlik Sirlari</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">Auditoriya oldida ishonch bilan gapirish va odamlarni o&apos;zgartira olish ko&apos;nikmasi.</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold flex items-center gap-1.5 text-yellow-500"><Star className="w-4 h-4 fill-current"/> 4.9</span>
                    <Link href="/login" className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] hover:underline">Kursni boshlash &rarr;</Link>
                  </div>
                </div>
              </div>

              {/* Course 2 */}
              <div className="bg-[#F3F4F6] dark:bg-gray-800 rounded-3xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-transparent dark:border-gray-700 hover:shadow-xl hover:shadow-[#A8E6CF]/10">
                <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="w-16 h-16 text-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">SMM va Marketing</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">Ijtimoiy tarmoqlarda o&apos;z brendingizni yaratish va to&apos;g&apos;ri auditoriyani jalb qilish.</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold flex items-center gap-1.5 text-yellow-500"><Star className="w-4 h-4 fill-current"/> 4.8</span>
                    <Link href="/login" className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] hover:underline">Kursni boshlash &rarr;</Link>
                  </div>
                </div>
              </div>

              {/* Course 3 */}
              <div className="bg-[#F3F4F6] dark:bg-gray-800 rounded-3xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-transparent dark:border-gray-700 hover:shadow-xl hover:shadow-[#A8E6CF]/10">
                <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Time Management</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">Vaqtingizni shijoat va samaradorlik bilan boshqarish orqali maqsadlarga erishish.</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold flex items-center gap-1.5 text-yellow-500"><Star className="w-4 h-4 fill-current"/> 4.9</span>
                    <Link href="/login" className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF] hover:underline">Kursni boshlash &rarr;</Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 font-bold text-[#2D5A27] dark:text-[#A8E6CF] hover:gap-3 transition-all">
                Barcha kurslarni ko&apos;rish <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section with Glass Spheres */}
        <section className="relative -mt-16 z-20 px-6 max-w-7xl mx-auto mb-20 pointer-events-none">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden pointer-events-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A8E6CF]/30 rounded-full mix-blend-multiply filter blur-[60px] animate-float-slow -z-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-[50px] animate-float-medium -z-10"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x-0 md:divide-x divide-gray-200 dark:divide-gray-800">
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2D5A27] to-[#80b379] dark:from-[#A8E6CF] dark:to-[#487343] mb-2 tracking-tight">10K+</div>
                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Faol talaba</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2D5A27] to-[#80b379] dark:from-[#A8E6CF] dark:to-[#487343] mb-2 tracking-tight">50+</div>
                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Video Kurslar</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2D5A27] to-[#80b379] dark:from-[#A8E6CF] dark:to-[#487343] mb-2 tracking-tight">4.9/5</div>
                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">O'rtacha baho</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2D5A27] to-[#80b379] dark:from-[#A8E6CF] dark:to-[#487343] mb-2 tracking-tight">100%</div>
                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Amaliyot</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Bento Grid Section */}
        <section id="features" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
          {/* Features Ambient Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-300 dark:bg-yellow-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[200px] opacity-10 animate-float-slow pointer-events-none"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#A8E6CF] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] opacity-30 animate-float-fast pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight">Nega aynan Grow.UZ?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Ta&apos;lim olish endi qiziqarli, oson va interaktiv. Platformaning o&apos;ziga xos xususiyatlari orqali bilimlaringizni amaliyotda tekshiring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Bento Box 1: Gamification */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#2D5A27] to-[#1a3816] rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-8 text-[#A8E6CF]/20 transform group-hover:scale-110 transition-transform duration-500">
                  <Target className="w-48 h-48" />
                </div>
                <div className="relative z-10 w-2/3">
                  <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-6">
                    <Award className="w-6 h-6 text-[#A8E6CF]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Gamifikatsiya va Darajalar</h3>
                  <p className="text-[#A8E6CF]">Kurslarni tugating, tangalar yig&apos;ing va &quot;Daraxt&quot; darajangizni oshiring. O&apos;rganishni o&apos;yinga aylantiring.</p>
                </div>
              </div>

              {/* Bento Box 2: Certs */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex p-4 rounded-full bg-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF] mb-6">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Haqiqiy Sertifikat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Har bir muvaffaqiyatli tugatilgan kurs uchun QR-kodli, tasdiqlangan sertifikat qilib oling.</p>
              </div>

              {/* Bento Box 3: AI Mentor */}
              <div id="ai-mentor" className="bg-[#A8E6CF]/10 dark:bg-[#A8E6CF]/5 rounded-3xl p-8 flex border border-[#A8E6CF]/30 shadow-sm relative overflow-hidden">
                <div className="flex flex-col justify-center max-w-sm relative z-10">
                  <div className="inline-flex p-3 rounded-2xl bg-[#A8E6CF] text-[#2D5A27] mb-6 w-fit">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Gemini Pro quvvatlagan AI Mentor</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Savollaringiz bormi? Tushunmagan joylaringizni aqlli mentor bilan muhokama qiling va aniq javoblar oling. U sizni har doim qo&apos;llab-quvvatlaydi.</p>
                </div>
                
                {/* Decorative UI element for AI */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-[#A8E6CF]/40 to-transparent rounded-full blur-[40px] pointer-events-none"></div>
              </div>

              {/* Bento Box 4: Library */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 flex items-center border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="flex-1 relative z-10">
                  <div className="inline-flex p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-6 w-fit">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Boy Kutubxona</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">Har haftada yangilanib boruvchi videodarslar bazasi. Istalgan payt, istalgan qurilmada bilimingizni boyiting.</p>
                </div>
                {/* Decorative pattern */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#F3F4F6] dark:bg-gray-900 opacity-50 transform skew-x-[-20deg] translate-x-10 border-l-[20px] border-white dark:border-gray-800"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mentors Section */}
        <section id="mentors" className="py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-6 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 glass-sphere rounded-full animate-float-fast z-10 hidden lg:block border border-white/20"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#2D5A27] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-20 animate-float-slow pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-20">
            <div className="text-center mb-16 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF] font-bold text-sm mb-4 border border-[#2D5A27]/10 dark:border-[#A8E6CF]/20">
                <Users className="w-4 h-4" />
                <span>Tajribali Mutaxassislar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight">Sohaning haqiqiy liderlari</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl text-lg">Amaliyotda pishgan va minglab muvaffaqiyatli keyslarga ega ekspertlar bilan tanishing.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Mentor 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-[#A8E6CF]/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 p-[3px] mb-5 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-indigo-500">A</span>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">Marketing</div>
                <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">Aziz Rahimov</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Senior SMM Manager</p>
                <div className="flex justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              {/* Mentor 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-[#A8E6CF]/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-400 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 p-[3px] mb-5 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-pink-400 to-orange-400">M</span>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold mb-3">Notiqlik</div>
                <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">Madina Oripova</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">TEDx Spikeri</p>
                <div className="flex justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              {/* Mentor 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-[#A8E6CF]/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-[3px] mb-5 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-teal-500">J</span>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold mb-3">Menejment</div>
                <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">Javohir Qodirov</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Time Management</p>
                <div className="flex justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              {/* Mentor 4 */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-[#A8E6CF]/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-red-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-red-400 p-[3px] mb-5 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-red-400">M</span>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3">Loyihalar</div>
                <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">Malika Umarova</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Project Manager</p>
                <div className="flex justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                   <Star className="w-3.5 h-3.5 fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 md:px-12 bg-[#F3F4F6] border-y border-gray-200/50 dark:bg-gray-900 dark:border-gray-800 relative z-10 overflow-hidden">
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#A8E6CF] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-20 animate-float-slow pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 glass-sphere rounded-full animate-float-medium z-10 hidden md:flex items-center justify-center">
             <MessageSquareQuote className="w-16 h-16 text-gray-900/10 dark:text-white/10" />
          </div>

          <div className="max-w-7xl mx-auto relative z-20">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight">O'quvchilar fikrlari</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">Xato qilishdan qo'rqmay, o'z yo'lini topganlarning muvaffaqiyat hikoyalari bilan tanishing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
              {/* Card 1 */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-white/10 group hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-xl relative flex flex-col">
                <MessageSquareQuote className="absolute top-8 right-8 w-12 h-12 text-[#2D5A27]/5 dark:text-[#A8E6CF]/10 group-hover:text-[#2D5A27]/10 dark:group-hover:text-[#A8E6CF]/20 transition-colors pointer-events-none" />
                <div className="flex items-center gap-1 mb-6">
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-8 italic text-base leading-relaxed flex-grow">"SMM kursini tugatib, bir haftadayoq o'zimning ilk yirik mijozimni topdim. Darslar shu qadar aniqlik bilan tuzilganki, huddi amaliy jarayon ichida yurgandek bo'lasiz."</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shadow-inner">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Sardor Mahmudov</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mustaqil SMM-mutaxassis</p>
                  </div>
                </div>
              </div>
              
              {/* Card 2 (Highlighted) */}
              <div className="bg-gradient-to-br from-[#2D5A27] to-[#1a3816] dark:from-[#2D5A27]/90 dark:to-gray-900 text-white p-8 rounded-3xl shadow-2xl relative flex flex-col transform md:-translate-y-4 border border-[#487343]/50">
                <MessageSquareQuote className="absolute top-8 right-8 w-12 h-12 text-[#A8E6CF]/20 pointer-events-none" />
                <div className="flex items-center gap-1 mb-6">
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-50/90 mb-8 italic font-medium text-lg leading-relaxed flex-grow">"AI Mentor funksiyasi shunchaki hayratlanarli! Kechasi uxlab yotganimda darsga tayyorlanayotib, tushunarsiz joylarini bevosita botdan so'ray olaman. Vaqt va asablarni tejaydi."</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full border-2 border-[#A8E6CF]/30 bg-white/10 backdrop-blur-sm text-[#A8E6CF] flex items-center justify-center font-bold text-lg">
                    D
                  </div>
                  <div>
                    <h4 className="font-bold">Dilshod Rahimov</h4>
                    <p className="text-sm text-green-200/80">Tech Startuper</p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-white/10 group hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-xl relative flex flex-col">
                <MessageSquareQuote className="absolute top-8 right-8 w-12 h-12 text-[#2D5A27]/5 dark:text-[#A8E6CF]/10 group-hover:text-[#2D5A27]/10 dark:group-hover:text-[#A8E6CF]/20 transition-colors pointer-events-none" />
                <div className="flex items-center gap-1 mb-6">
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-8 italic text-base leading-relaxed flex-grow">"Notiqlik kursidan olgan bilimlarim asosida universitetda eng yirik loyihani himoya qildim. Hayajonni qanday yengishni ustozlar ajoyib usullar bilan tushuntirib qo'ygan."</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg shadow-inner">
                    N
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Nodira Aliyeva</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Talabasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[#2D5A27] relative overflow-hidden text-center px-6">
          <div className="absolute inset-0 bg-[#1f421a] opacity-50 [mask-image:radial-gradient(circle_at_center,transparent_20%,black_100%)]"></div>
          
          {/* CTA Ambient Orbs */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-[#A8E6CF] rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-float-medium pointer-events-none"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }}></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">Hayotingizni bugundan o&apos;zgartiring</h2>
            <p className="text-[#A8E6CF] text-lg mb-10">Ro&apos;yxatdan o&apos;tish va ilk qadamni qo&apos;yish uchun bir soniya vaqt ketadi.</p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-[#2D5A27] bg-white shadow-2xl hover:scale-105 transition-transform text-lg"
            >
              Bepul boshlash <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 py-12 px-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 flex items-center justify-center relative">
                <Image src="/images/logo.png" alt="Grow.UZ Logo" fill className="object-contain" referrerPolicy="no-referrer" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">O&apos;zbekiston yoshlari uchun sifatli va zamonaviy ko&apos;nikmalar taqdim etuvchi innovatsion o&apos;quv platformasi.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">Bo&apos;limlar</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#courses" className="hover:text-[#2D5A27] transition-colors">Kurslar</Link></li>
              <li><Link href="#ai-mentor" className="hover:text-[#2D5A27] transition-colors">AI Mentor</Link></li>
              <li><Link href="/login" className="hover:text-[#2D5A27] transition-colors">Profil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">Aloqa</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>@growuz_bot</li>
              <li>info@grow.uz</li>
              <li>Toshkent shahri</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Grow.UZ. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <Link href="#" className="hover:text-[#2D5A27] transition-colors">Maxfiylik siyosati</Link>
             <Link href="#" className="hover:text-[#2D5A27] transition-colors">Foydalanish shartlari</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

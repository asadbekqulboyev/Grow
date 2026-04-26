'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Clock, Star, PlayCircle, Coins, Search, ArrowRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  reward_coins: number;
  image_url: string | null;
  author: string | null;
}

const FALLBACK_COURSES: Course[] = [
  { id: 'fb1', title: 'Vaqtni boshqarish: Pomodoro siri', description: 'Pomodoro texnikasi yordamida diqqatni jamlashni oshirish va ko\'proq ish bajarish.', category: 'Vaqtni boshqarish', level: 'Boshlang\'ich', reward_coins: 100, image_url: null, author: 'Asadbek' },
  { id: 'fb2', title: 'Omma oldida ishonchli nutq', description: 'Kishilar oldida hayajonni yengish va o\'z fikrini aniq yetkazish usullari.', category: 'Notiqlik', level: 'O\'rta', reward_coins: 150, image_url: null, author: 'Asadbek' },
  { id: 'fb3', title: 'Jamoani shakllantirish', description: 'Haqiqiy lider qanday bo\'lishi kerak va jamoani umumiy maqsad sari yetaklash.', category: 'Liderlik', level: 'Mukammal', reward_coins: 200, image_url: null, author: 'Asadbek' },
  { id: 'fb4', title: 'Emotsional intellekt (EQ)', description: 'O\'z hissiyotlarini boshqarish va boshqalarni tushunish.', category: 'Muloqot', level: 'O\'rta', reward_coins: 120, image_url: null, author: 'Asadbek' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchCourses() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (isMounted) {
          if (data && data.length > 0) {
            setCourses(data);
          } else {
            setCourses(FALLBACK_COURSES);
          }
        }
      } catch (err) {
        console.error('Kurslarni yuklashda xatolik:', err);
        if (isMounted) setCourses(FALLBACK_COURSES);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCourses();
    
    return () => {
      isMounted = false;
    }
  }, []);

  const categories = useMemo(() => {
    return ['Barchasi', ...Array.from(new Set(courses.map(c => c.category)))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = courses;

    // Category filter
    if (activeCategory !== 'Barchasi') {
      result = result.filter(c => c.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [courses, activeCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-[15px] sm:px-8 z-40 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold dark:text-white truncate">Kurslar</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="px-[15px] sm:px-8 py-6 sm:py-8 pb-24 max-w-7xl mx-auto w-full">
        {/* Search & Filter Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Kurs yoki mavzu qidiring..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-[#A8E6CF] dark:text-white placeholder-gray-400 outline-none transition-shadow"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                  activeCategory === cat 
                  ? 'bg-[#2D5A27] text-white border-[#2D5A27] dark:bg-[#A8E6CF] dark:text-[#111827] dark:border-[#A8E6CF]' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2D5A27] dark:border-gray-800 dark:border-t-[#A8E6CF] rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Natija topilmadi</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              &quot;{searchQuery}&quot; bo&apos;yicha kurs topilmadi. Boshqa kalit so&apos;z bilan qidirib ko&apos;ring.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100 dark:border-gray-800">
                
                {/* Course Image / Banner */}
                <div className="h-48 bg-gradient-to-br from-[#A8E6CF] to-[#2D5A27] relative w-full overflow-hidden">
                  {course.image_url && (
                    <Image 
                      src={course.image_url} 
                      alt={course.title}
                      fill
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {course.image_url && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
                  
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm z-10 border border-white/20">
                    {course.category}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg z-10 border border-gray-100 dark:border-gray-800">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">+{course.reward_coins}</span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                      course.level === 'Boshlang\'ich' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      course.level === 'O\'rta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {course.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors">{course.title}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-[8px]">
                      {(course.author?.[0] || 'A').toUpperCase()}
                    </div>
                    {course.author || 'Asadbek'}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">{course.description}</p>
                  
                  <div className="mt-auto">
                    <Link href={`/courses/${course.id}`} className="w-full py-3 px-4 bg-gray-50 hover:bg-[#A8E6CF]/20 dark:bg-gray-800 dark:hover:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-gray-100 dark:border-gray-700">
                      <PlayCircle className="w-5 h-5" />
                      Boshlash
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Clock, PlayCircle, Coins, Lock, CheckCircle, BookOpen } from 'lucide-react';
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

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let isMounted = true;
    const supabase = createClient();
    
    async function fetchCourseDetails() {
      setIsLoading(true);
      
      try {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (lessonsError) throw lessonsError;
        
        if (isMounted) {
          setCourse(courseData);
          setLessons(lessonsData || []);
        }
      } catch (err) {
        console.error('Kurs ma\'lumotlarini yuklashda xatolik:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchCourseDetails();
    
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2D5A27] dark:border-gray-800 dark:border-t-[#A8E6CF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex flex-col items-center justify-center p-6 text-center transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Kurs topilmadi</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">Kechirasiz, siz qidirayotgan kurs mavjud emas yoki o&apos;chirilgan bo&apos;lishi mumkin.</p>
        <button 
          onClick={() => router.push('/courses')}
          className="bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] px-6 py-3 rounded-xl font-bold transition-colors"
        >
          Kurslarga qaytish
        </button>
      </div>
    );
  }

  const firstLesson = lessons[0];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111827] transition-colors duration-300">
      {/* Dynamic Header Banner */}
      <div className="relative w-full h-[280px] md:h-[400px] overflow-hidden bg-gray-900 group">
        {course.image_url ? (
          <Image 
            src={course.image_url} 
            alt={course.title} 
            fill
            className="object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b3d16] to-[#0d210b]"></div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50 dark:from-[#111827] to-transparent z-10"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="absolute inset-0 z-20 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors mb-4 md:mb-6 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="mt-auto pb-6 md:pb-10">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
              <span className="bg-[#A8E6CF] text-[#111827] text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider">
                {course.category}
              </span>
              <span className="bg-white/20 text-white backdrop-blur-md text-[10px] md:text-xs font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.level}
              </span>
              <span className="bg-yellow-500/20 text-yellow-300 backdrop-blur-md border border-yellow-500/30 text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                +{course.reward_coins} tanga
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 mb-4 md:mb-8 self-start w-fit">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                {(course.author?.[0] || 'A').toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5 md:block">
                <p className="text-[10px] md:text-xs text-white/60 font-medium md:mb-0.5">Ustoz:</p>
                <p className="text-xs md:text-sm text-white font-bold">{course.author || 'Asadbek'}</p>
              </div>
            </div>

            <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-2 md:mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-200 text-xs md:text-base max-w-2xl line-clamp-2 md:line-clamp-none opacity-90 drop-shadow-md">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 -mt-6 md:-mt-8 z-30 pb-24 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Left Column: Lessons */}
        <div className="flex-1 min-w-0 w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center justify-between md:justify-start">
              Darslar ro&apos;yxati
              <span className="md:ml-3 text-xs md:text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-1.5 px-3 rounded-full">
                {lessons.length} ta dars
              </span>
            </h2>
            
            {lessons.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">Hali darslar mavjud emas</h3>
                <p className="text-gray-500 dark:text-gray-500 max-w-sm mx-auto">Tez orada ushbu kursga yangi videodarslar joylanadi. Bizni kuzatib boring!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4">
                {lessons.map((lesson, index) => (
                  <Link 
                    key={lesson.id} 
                    href={`/courses/${courseId}/lesson/${lesson.id}`}
                    className="group flex flex-row items-center justify-between gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-[#2D5A27]/30 dark:hover:border-[#A8E6CF]/30 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${index === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
                        {index === 0 ? <PlayCircle className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      </div>
                      
                      <div className="overflow-hidden min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors truncate">
                          {lesson.order_index}. {lesson.title}
                        </h4>
                        {lesson.description && (
                          <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2.5 py-1.5 md:px-3 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors whitespace-nowrap">
                      <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                      {lesson.duration_minutes} daq
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Sticky Sidebar Info */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Kurs haqida</h3>
            
            <ul className="space-y-4 mb-8">
               <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                 <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                 <span>Nazariy va amaliy bilimlar</span>
               </li>
               <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                 <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                 <span>Sertifikat bilan taqdirlanadi</span>
               </li>
               <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                 <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                 <span>Istalgan vaqtda kirish imkoniyati</span>
               </li>
               <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                 <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                 <span>Qiziqarli uy vazifalari</span>
               </li>
            </ul>

            {firstLesson ? (
              <Link 
                href={`/courses/${courseId}/lesson/${firstLesson.id}`}
                className="w-full bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] py-4 rounded-xl font-bold transition-colors mb-3 flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Kursni boshlash
              </Link>
            ) : (
              <button disabled className="w-full bg-gray-200 dark:bg-gray-800 text-gray-400 py-4 rounded-xl font-bold cursor-not-allowed mb-3 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Darslar hali mavjud emas
              </button>
            )}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Kursni to&apos;liq tugatib {course.reward_coins} tanga yutib oling
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, Clock, PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {}
  return null;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    let isMounted = true;
    const supabase = createClient();

    async function fetchData() {
      setIsLoading(true);
      try {
        const [courseRes, lessonRes, allLessonsRes] = await Promise.all([
          supabase.from('courses').select('id, title').eq('id', courseId).single(),
          supabase.from('lessons').select('*').eq('id', lessonId).single(),
          supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
        ]);

        if (isMounted) {
          setCourse(courseRes.data);
          setLesson(lessonRes.data);
          setAllLessons(allLessonsRes.data || []);
        }
      } catch (err) {
        console.error('Dars yuklashda xatolik:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [courseId, lessonId]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2D5A27] dark:border-gray-800 dark:border-t-[#A8E6CF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dars topilmadi</h2>
        <button onClick={() => router.push('/courses')} className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold">
          Kurslarga qaytish
        </button>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const embedUrl = lesson.video_url ? getYouTubeEmbedUrl(lesson.video_url) : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/courses/${courseId}`)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{course.title}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{lesson.order_index}. {lesson.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lesson.duration_minutes} daq
          </span>
          <span className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {allLessons.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 pb-24 max-w-5xl mx-auto w-full">
        
        {/* Video Player Area */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg mb-6 aspect-video relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : lesson.video_url ? (
            <video
              src={lesson.video_url}
              controls
              className="w-full h-full absolute inset-0 object-contain"
            >
              Brauzeringiz video formatini qo&apos;llab-quvvatlamaydi.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1b3d16] to-[#0d210b] text-white">
              <PlayCircle className="w-16 h-16 text-[#A8E6CF]/50 mb-4" />
              <h3 className="text-lg font-bold mb-2">Video hali joylashtirilmagan</h3>
              <p className="text-sm text-[#A8E6CF]/70">Tez orada ushbu darsga video qo&apos;shiladi</p>
            </div>
          )}
        </div>

        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{lesson.description}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {prevLesson ? (
            <Link
              href={`/courses/${courseId}/lesson/${prevLesson.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Oldingi dars
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${courseId}/lesson/${nextLesson.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827] rounded-2xl font-bold hover:bg-[#1f421a] dark:hover:bg-[#86d4b8] transition-colors shadow-lg"
            >
              Keyingi dars
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href={`/courses/${courseId}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827] rounded-2xl font-bold hover:bg-[#1f421a] dark:hover:bg-[#86d4b8] transition-colors shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Kursni yakunlash
            </Link>
          )}
        </div>

        {/* Lessons Sidebar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
            Barcha darslar
          </h3>
          <div className="space-y-2">
            {allLessons.map((l) => (
              <Link
                key={l.id}
                href={`/courses/${courseId}/lesson/${l.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  l.id === lessonId 
                    ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  l.id === lessonId 
                    ? 'bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827]' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {l.order_index}
                </div>
                <span className="line-clamp-1 text-sm">{l.title}</span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">{l.duration_minutes}&apos;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

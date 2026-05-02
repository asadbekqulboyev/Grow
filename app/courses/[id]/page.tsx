'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Clock, PlayCircle, Coins, Lock, CheckCircle, BookOpen, Award, Send, FileText, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [practicalTasks, setPracticalTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [practicalAnswer, setPracticalAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasQuizPassed, setHasQuizPassed] = useState(false);
  const [hasPracticalDone, setHasPracticalDone] = useState(false);

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

        // 3. User Progress & Completion
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && isMounted) {
          setUser(currentUser);
          
          const lessonIds = (lessonsData || []).map(l => l.id);
          if (lessonIds.length > 0) {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('lesson_id')
              .eq('user_id', currentUser.id)
              .in('lesson_id', lessonIds)
              .eq('completed', true);
            
            const completedCount = progressData?.length || 0;
            const totalCount = lessonIds.length;

            if (completedCount >= totalCount && totalCount > 0) {
              setIsCompleted(true);
              
              // 4. Fetch Certificate
              const { data: certData } = await supabase
                .from('certificates')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('course_id', courseId)
                .maybeSingle();
              
              if (certData && isMounted) {
                setCertificate(certData);
              }
            }
          }

          // Practical tasks va submissions olish
          try {
            const ptRes = await fetch(`/api/practical-task?course_id=${courseId}`);
            const ptData = await ptRes.json();
            if (isMounted) {
              setPracticalTasks(ptData.tasks || []);
              setSubmissions(ptData.submissions || []);
              setHasPracticalDone((ptData.submissions || []).length > 0);
            }
          } catch {}

          // Quiz natijasi tekshirish
          const { data: quizData } = await supabase
            .from('user_coins')
            .select('id')
            .eq('user_id', currentUser.id)
            .like('reason', `%${courseId}%`)
            .limit(1);
          if (isMounted) {
            setHasQuizPassed((quizData?.length || 0) > 0);
          }
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

  const submitPractical = async (taskId: string) => {
    if (!practicalAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/practical-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, course_id: courseId, answer: practicalAnswer }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => [...prev, data.submission]);
        setHasPracticalDone(true);
        setPracticalAnswer('');
      }
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bosqich topilmadi</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">Kechirasiz, siz qidirayotgan bosqich mavjud emas yoki o&apos;chirilgan bo&apos;lishi mumkin.</p>
        <button 
          onClick={() => router.push('/courses')}
          className="bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] px-6 py-3 rounded-xl font-bold transition-colors"
        >
          Bosqichlarga qaytish
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
              Bosqich tarkibi
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

          {/* Amaliy Topshiriq */}
          {practicalTasks.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
                Amaliy topshiriq
              </h2>
              {practicalTasks.map((task) => {
                const existing = submissions.find((s: any) => s.task_id === task.id);
                return (
                  <div key={task.id} className="mb-4 last:mb-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{task.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{task.description}</p>
                    
                    {existing ? (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-bold text-green-800 dark:text-green-300">Topshirildi</span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">{existing.answer}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={practicalAnswer}
                          onChange={(e) => setPracticalAnswer(e.target.value)}
                          placeholder="Javobingizni yozing..."
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#A8E6CF] outline-none resize-none min-h-[100px]"
                        />
                        <button
                          onClick={() => submitPractical(task.id)}
                          disabled={submitting || !practicalAnswer.trim()}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {submitting ? 'Yuborilmoqda...' : 'Topshirish'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sertifikat olish shartlari */}
          {isCompleted && !certificate && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Sertifikat olish shartlari
              </h3>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${hasQuizPassed ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {hasQuizPassed ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="font-medium">Testdan o&apos;tish</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${hasPracticalDone ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {hasPracticalDone ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="font-medium">Amaliy topshiriqni bajarish</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Sticky Sidebar Info */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Bosqich haqida</h3>
            
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

            {isCompleted ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-center">
                   <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                   </div>
                   <h4 className="font-bold text-green-900 dark:text-green-100 text-sm mb-1">Bosqich o'zlashtirildi!</h4>
                   <p className="text-[10px] text-green-700 dark:text-green-400">Siz ushbu bosqichni muvaffaqiyatli yakunlab bo'lgansiz.</p>
                </div>
                
                {certificate ? (
                  <DownloadCertificateBtn 
                    className="w-full bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                    certData={{
                      id: certificate.cert_code,
                      studentName: certificate.student_name,
                      courseName: certificate.course_name,
                      date: new Date(certificate.issued_at).toLocaleDateString('uz-UZ'),
                    }}
                  >
                    <Award className="w-5 h-5" />
                    Sertifikatni yuklash
                  </DownloadCertificateBtn>
                ) : (
                  <Link 
                    href={`/courses/${courseId}/lesson/${firstLesson?.id}`}
                    className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    Sertifikatni olish
                  </Link>
                )}
                
                <Link 
                  href={`/courses/${courseId}/lesson/${firstLesson?.id}`}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Darslarni qayta ko'rish
                </Link>
              </div>
            ) : firstLesson ? (
              <Link 
                href={`/courses/${courseId}/lesson/${firstLesson.id}`}
                className="w-full bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] py-4 rounded-xl font-bold transition-colors mb-3 flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Bosqichni boshlash
              </Link>
            ) : (
              <button disabled className="w-full bg-gray-200 dark:bg-gray-800 text-gray-400 py-4 rounded-xl font-bold cursor-not-allowed mb-3 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Darslar hali mavjud emas
              </button>
            )}
            {!isCompleted && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Bosqichni to&apos;liq tugatib {course.reward_coins} tanga yutib oling
              </p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

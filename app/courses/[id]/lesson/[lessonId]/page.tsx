'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, Clock, PlayCircle, CheckCircle, BookOpen, Award, Loader2, PartyPopper, HelpCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content_text: string | null;
  order_index: number;
  is_free: boolean;
  reward_coins: number;
}

interface Course {
  id: string;
  title: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1&iv_load_policy=3`;
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
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  
  // Test State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [testAnswers, setTestAnswers] = useState<{[key: string]: number}>({});
  const [testResult, setTestResult] = useState<'passed'|'failed'|null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    let isMounted = true;
    const supabase = createClient();

    async function fetchData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const [courseRes, lessonRes, allLessonsRes, quizzesRes] = await Promise.all([
          supabase.from('courses').select('id, title').eq('id', courseId).single(),
          supabase.from('lessons').select('*').eq('id', lessonId).single(),
          supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
          supabase.from('quizzes').select('*').eq('lesson_id', lessonId).order('order_index', { ascending: true }),
        ]);

        if (isMounted) {
          setCourse(courseRes.data);
          setLesson(lessonRes.data);
          setAllLessons(allLessonsRes.data || []);
          setQuizzes((quizzesRes.data as any) || []);
        }

        // Check existing progress
        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('completed', true);

          if (isMounted && progressData) {
            const ids = new Set<string>(progressData.map((p: any) => p.lesson_id));
            setCompletedLessonIds(ids);
            setIsCompleted(ids.has(lessonId));
          }
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

  const handleInitiateCompletion = () => {
    if (quizzes.length > 0 && !isCompleted) {
      setTestMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteLesson();
    }
  };

  const handleSubmitTest = () => {
    let correct = 0;
    quizzes.forEach(q => {
       if (testAnswers[q.id] === q.correct_option_index) correct++;
    });
    
    // Optimal yakunlash - 100% topish talab qilinadi
    if (correct === quizzes.length) {
       setTestResult('passed');
       handleCompleteLesson();
    } else {
       setTestResult('failed');
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch('/api/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
      });
      const data = await res.json();
      
      if (data.success || data.already_completed) {
        setIsCompleted(true);
        setCompletedLessonIds(prev => new Set(prev).add(lessonId));
        setCompletionResult(data);
      }
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setIsCompleting(false);
    }
  };

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
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-[15px] sm:px-8 z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/courses/${courseId}`)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{course.title}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{lesson.order_index}. {lesson.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 px-3 py-1.5 rounded-full whitespace-nowrap">
            {currentIndex + 1} / {allLessons.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-[15px] sm:px-8 py-4 sm:py-8 pb-24 max-w-5xl mx-auto w-full">
        
        {/* Testing State UI */}
        {testMode && !isCompleted ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#2D5A27] dark:text-[#A8E6CF]" />
              Darsni o'zlashtirish testi
            </h2>
            
            {testResult === 'failed' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 text-center animate-in zoom-in duration-300">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Afsuski, to'liq o'zlashtirilmadi</h3>
                <p className="text-red-600/80 dark:text-red-300/80 mb-6 font-medium">Darsni muvaffaqiyatli yakunlash va tangalarni yig'ish uchun barcha savollarga to'g'ri javob berishingiz kerak. Yana bir bor urinib ko'ring yoki videoni qayta ko'ring.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => { setTestMode(false); setTestResult(null); setTestAnswers({}); setCurrentQuizIndex(0); }} className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                    Videoni qayta ko'rish
                  </button>
                  <button onClick={() => { setTestResult(null); setTestAnswers({}); setCurrentQuizIndex(0); }} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
                    Qayta urinish
                  </button>
                </div>
              </div>
            )}

            {testResult !== 'failed' && quizzes.length > 0 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-300">
                {(() => {
                  const q = quizzes[currentQuizIndex];
                  const idx = currentQuizIndex;
                  return (
                    <div key={q.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                      <div className="flex justify-between items-center mb-6">
                         <span className="text-sm font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-4 py-1.5 rounded-full text-center">
                            Savol {idx + 1} / {quizzes.length}
                         </span>
                         <span className="text-sm font-bold text-yellow-600 bg-yellow-100/80 px-4 py-1.5 rounded-full text-center shadow-sm">
                            +{q.reward_coins || 10} tanga
                         </span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white mb-6 text-xl md:text-2xl leading-relaxed">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {(q.options as string[]).map((opt, oIdx) => (
                          <label 
                            key={oIdx} 
                            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 select-none ${
                              testAnswers[q.id] === oIdx 
                                ? 'border-[#2D5A27] bg-[#2D5A27]/5 dark:border-[#A8E6CF] dark:bg-[#A8E6CF]/10 shadow-sm' 
                                : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 shadow-sm'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name={`quiz_${q.id}`} 
                              checked={testAnswers[q.id] === oIdx}
                              onChange={() => setTestAnswers(prev => ({...prev, [q.id]: oIdx}))}
                              className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF] focus:ring-[#2D5A27] dark:focus:ring-[#A8E6CF]"
                            />
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${testAnswers[q.id] === oIdx ? 'border-[#2D5A27] dark:border-[#A8E6CF]' : 'border-gray-300 dark:border-gray-600'}`}>
                               <span className={`text-sm font-bold ${testAnswers[q.id] === oIdx ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-400'}`}>{String.fromCharCode(65 + oIdx)}</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-200 font-medium text-[17px]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <button 
                  onClick={() => {
                     window.scrollTo({ top: 300, behavior: 'smooth' });
                     if (currentQuizIndex < quizzes.length - 1) {
                         setCurrentQuizIndex(prev => prev + 1);
                     } else {
                         handleSubmitTest();
                     }
                  }}
                  disabled={testAnswers[quizzes[currentQuizIndex].id] === undefined}
                  className="w-full py-5 bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] shadow-xl shadow-green-500/20 text-white rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {currentQuizIndex < quizzes.length - 1 ? (
                     <>Keyingi savol <ArrowRight className="w-5 h-5 ml-1" /></>
                  ) : (
                     <>Javoblarni yuborish <CheckCircle className="w-5 h-5 ml-1" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Video Player Area — Protected */}
            <div 
              className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg mb-6 aspect-video relative select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : (
            <div className="w-full h-full absolute inset-0 flex items-center justify-center text-gray-500">
              <PlayCircle className="w-16 h-16 opacity-30" />
            </div>
          )}
        </div>

        {/* Content Text */}
        {lesson.content_text && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" /> Dars eslatmalari
            </h3>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {lesson.content_text}
            </div>
          </div>
        )}

        {/* Lesson Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{lesson.description}</p>
          )}
        </div>

        {/* Completion Button */}
        {!testMode && (
          <div className="mb-6">
            {completionResult?.course_completed ? (
              <div className="bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] rounded-3xl p-6 text-white text-center shadow-lg">
                <PartyPopper className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">🎉 Tabriklaymiz!</h3>
                <p className="text-sm text-white/80 mb-1">Siz kursni to&apos;liq tugatdingiz!</p>
                <p className="text-sm font-bold text-yellow-300">+{completionResult.bonus_coins} bonus tanga qo&apos;lga kiritildi</p>
                <p className="text-xs text-white/60 mt-2">Sertifikat avtomatik yaratildi — Profilga o&apos;ting</p>
                <Link href="/profile" className="inline-block mt-4 px-6 py-2.5 bg-white text-[#2D5A27] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                  <Award className="w-4 h-4 inline mr-1" /> Sertifikatni ko&apos;rish
                </Link>
              </div>
            ) : isCompleted ? (
              <div className="bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 border-2 border-[#2D5A27]/20 dark:border-[#A8E6CF]/20 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-[#2D5A27] dark:text-[#A8E6CF] shrink-0" />
                <div>
                  <p className="font-bold text-[#2D5A27] dark:text-[#A8E6CF]">Dars tugallangan ✅</p>
                  {completionResult?.coins_earned > 0 && (
                    <p className="text-xs text-[#2D5A27]/70 dark:text-[#A8E6CF]/70 mt-0.5">+{completionResult.coins_earned} tanga qo&apos;lga kiritildi</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleInitiateCompletion}
                disabled={isCompleting}
                className="w-full py-4 bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {quizzes.length > 0 ? "Darsni tugatdim va testni boshlash" : "Darsni tugatdim"} — +{lesson.reward_coins} tanga
                  </>
                )}
              </button>
            )}
          </div>
        )}
          </div>
        )}

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
              href={`/courses/${courseId}/quiz`}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors shadow-lg"
            >
              <Award className="w-5 h-5" />
              Testga o&apos;tish
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
                  completedLessonIds.has(l.id)
                    ? 'bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827]'
                    : l.id === lessonId 
                      ? 'bg-[#A8E6CF]/50 text-[#2D5A27]' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {completedLessonIds.has(l.id) ? <CheckCircle className="w-4 h-4" /> : l.order_index}
                </div>
                <span className="line-clamp-1 text-sm">{l.title}</span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">{l.order_index}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

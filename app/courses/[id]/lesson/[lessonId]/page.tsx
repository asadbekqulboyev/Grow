'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, Clock, PlayCircle, CheckCircle, BookOpen, Award, Loader2, PartyPopper, HelpCircle, XCircle } from 'lucide-react';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';
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

function isDirectVideo(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.startsWith('/uploads/') || url.startsWith('/videos/');
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  
  // Certificate specific states
  const [certName, setCertName] = useState("");
  const [certUpdating, setCertUpdating] = useState(false);
  const [certSaved, setCertSaved] = useState(false);
  const [finalGeneratedCertCode, setFinalGeneratedCertCode] = useState<string | null>(null);

  // Test State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [testAnswers, setTestAnswers] = useState<{[key: string]: number}>({});
  const [testResult, setTestResult] = useState<'passed'|'failed'|null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

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
          const sortedLessons = (allLessonsRes.data || []).sort((a, b) => a.order_index - b.order_index);
          setAllLessons(sortedLessons);
          setQuizzes((quizzesRes.data as any) || []);

          // Sequential Locking: Check if user can be on this page
          if (user) {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('lesson_id')
              .eq('user_id', user.id)
              .eq('completed', true);

            const completedIds = new Set<string>((progressData || []).map((p: any) => p.lesson_id));
            setCompletedLessonIds(completedIds);
            setIsCompleted(completedIds.has(lessonId));
            
            // If it's already completed, they can skip the video
            if (completedIds.has(lessonId)) {
              setVideoEnded(true);
              setCanComplete(true);
            }

            // Check if all previous lessons are completed
            const currentIdx = sortedLessons.findIndex(l => l.id === lessonId);
            if (currentIdx > 0) {
              const previousLessons = sortedLessons.slice(0, currentIdx);
              const allPreviousDone = previousLessons.every(pl => completedIds.has(pl.id));
              
              if (!allPreviousDone) {
                // Find first uncompleted lesson
                const firstLocked = sortedLessons.find(l => !completedIds.has(l.id));
                if (firstLocked) {
                  router.replace(`/courses/${courseId}/lesson/${firstLocked.id}`);
                  return;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Dars yuklashda xatolik:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    // YouTube API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      console.log('YT API Ready');
    };
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
       if (testAnswers[q.id] === Number(q.correct_option_index)) correct++;
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
      
      if (!res.ok || data.error) {
        alert("Xatolik: " + (data.error || "Noma'lum xato"));
        setIsCompleting(false);
        return;
      }
      
      if (data.success || data.already_completed) {
        setIsCompleted(true);
        setCompletedLessonIds(prev => new Set(prev).add(lessonId));
        setCompletionResult(data);
        setTestMode(false);
        
        if (!data.course_completed) {
           const idx = allLessons.findIndex(l => l.id === lessonId);
           if (idx !== -1 && idx < allLessons.length - 1) {
              const nxt = allLessons[idx + 1];
              setIsRedirecting(true);
              setTimeout(() => {
                 router.push(`/courses/${courseId}/lesson/${nxt.id}`);
              }, 1500);
           }
        }
      }
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleUpdateCertName = async () => {
    if (certName.trim().length < 3) return;
    setCertUpdating(true);
    try {
      const res = await fetch('/api/update-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, student_name: certName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCertSaved(true);
        if (data.certificate?.cert_code) {
           setFinalGeneratedCertCode(data.certificate.cert_code);
        }
      } else {
        alert("Xatolik: " + data.error);
      }
    } catch (err) {
      alert("Sertifikatni saqlashda xatolik");
    } finally {
      setCertUpdating(false);
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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 sticky top-0 transition-colors duration-300">
        <div className="h-20 flex items-center justify-between px-[15px] sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/courses/${courseId}`)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{course.title}</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{lesson.order_index}. {lesson.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 px-3 py-1.5 rounded-full whitespace-nowrap">
              {currentIndex + 1} / {allLessons.length}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#2D5A27] to-[#A8E6CF] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(45,90,39,0.3)]"
            style={{ width: `${(completedLessonIds.size / allLessons.length) * 100}%` }}
          ></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-[15px] sm:px-8 py-4 sm:py-8 pb-24 max-w-5xl mx-auto w-full">
        
        {/* Testing State UI */}
        {testMode && !isCompleted ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 animate-in fade-in duration-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#2D5A27] dark:text-[#A8E6CF]" />
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
                    <div key={q.id} className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                      <div className="flex justify-between items-center mb-4 sm:mb-5">
                         <span className="text-xs sm:text-sm font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-center">
                            Savol {idx + 1} / {quizzes.length}
                         </span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 text-base sm:text-lg md:text-xl leading-snug">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {(q.options as string[]).map((opt, oIdx) => (
                          <label 
                            key={oIdx} 
                            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all border-2 select-none active:scale-[0.99] ${
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
                              className="hidden"
                            />
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${testAnswers[q.id] === oIdx ? 'border-[#2D5A27] bg-[#2D5A27] dark:border-[#A8E6CF] dark:bg-[#A8E6CF]' : 'border-gray-300 dark:border-gray-600'}`}>
                               <span className={`text-[10px] sm:text-sm font-bold ${testAnswers[q.id] === oIdx ? 'text-white dark:text-gray-900' : 'text-gray-400'}`}>{String.fromCharCode(65 + oIdx)}</span>
                            </div>
                            <span className={`font-medium text-sm sm:text-base ${testAnswers[q.id] === oIdx ? 'text-[#2D5A27] dark:text-[#A8E6CF] font-bold' : 'text-gray-700 dark:text-gray-200'} leading-tight`}>{opt}</span>
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
                  disabled={testAnswers[quizzes[currentQuizIndex].id] === undefined || isCompleting}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] shadow-lg shadow-green-500/20 text-white rounded-xl font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Tekshirilmoqda...
                    </>
                  ) : currentQuizIndex < quizzes.length - 1 ? (
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
              id="yt-player"
              src={`${embedUrl}&enablejsapi=1`}
              title={lesson.title}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                // @ts-ignore
                if (window.YT && window.YT.Player) {
                  // @ts-ignore
                  new window.YT.Player('yt-player', {
                    events: {
                      'onStateChange': (event: any) => {
                        // @ts-ignore
                        if (event.data === window.YT.PlayerState.ENDED) {
                          setVideoEnded(true);
                          setCanComplete(true);
                        }
                      }
                    }
                  });
                } else {
                  // Fallback for cases where YT API is not yet ready
                  setTimeout(() => setCanComplete(true), 15000); // 15 seconds fallback
                }
              }}
            />
          ) : lesson.video_url && isDirectVideo(lesson.video_url) ? (
            <video
              src={lesson.video_url}
              controls
              onEnded={() => {
                setVideoEnded(true);
                setCanComplete(true);
              }}
              className="w-full h-full absolute inset-0 bg-black"
              controlsList="nodownload"
              playsInline
            >
              Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.
            </video>
          ) : (
            <div className="w-full h-full absolute inset-0 flex items-center justify-center text-gray-500" onClick={() => setCanComplete(true)}>
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
              <div className="bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] rounded-3xl p-6 text-white text-center shadow-lg animate-in fade-in zoom-in duration-500">
                <PartyPopper className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Tabriklaymiz!</h3>
                <p className="text-white/90 mb-1 font-medium">Siz kursni to&apos;liq tamomladingiz!</p>
                <p className="font-bold text-yellow-300 mb-6 bg-black/20 p-2 rounded-xl inline-block max-w-max mx-auto shadow-inner">
                  +{completionResult.bonus_coins} bonus tanga qo&apos;lga kiritildi
                </p>

                {/* MODAL OYNA ISHLATAMIZ */}
                {!certSaved && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                      
                      <div className="text-center mb-6">
                         <div className="w-16 h-16 bg-[#2D5A27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-[#2D5A27]" />
                         </div>
                         <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sertifikat uchun ma&apos;lumot</h3>
                         <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                           Sertifikat yuziga muhrlanadigan To'liq ism familiya va sharifingizni aniq xatosiz kiriting:
                         </p>
                      </div>

                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">F.I.SH (To&apos;liq ismingiz)</label>
                          <input 
                            type="text" 
                            placeholder="G'aniyev Alisher Valiyevich" 
                            value={certName}
                            onChange={(e) => setCertName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#2D5A27] focus:bg-white dark:focus:border-[#A8E6CF] transition-all font-bold text-lg"
                          />
                        </div>

                        <button 
                          onClick={handleUpdateCertName} 
                          disabled={certUpdating || certName.trim().length < 5}
                          className="w-full py-4 bg-[#2D5A27] text-white rounded-xl font-bold uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1e3c1a] transition-colors flex items-center justify-center gap-2 shadow-lg mt-2"
                        >
                          {certUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          {certUpdating ? "Saqlanmoqda..." : "Tasdiqlash va Sertifikatni tayyorlash"}
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {certSaved && (
                   <div className="text-center py-4 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                      <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h4 className="font-bold text-xl mb-1 text-white">Hammasi tayyor!</h4>
                      <p className="text-sm text-green-100 mb-6 font-medium">Sertifikatingiz sizning nomingizga maxsus yaratildi.</p>
                      
                      {(finalGeneratedCertCode || completionResult?.cert_code) && (
                        <DownloadCertificateBtn 
                          className="w-full sm:w-auto px-8 py-4 bg-yellow-400 text-yellow-900 rounded-xl font-black uppercase tracking-wide hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto shadow-xl shadow-yellow-500/20"
                          certData={{
                            id: (finalGeneratedCertCode || completionResult?.cert_code) as string,
                            studentName: certName.trim(),
                            courseName: course?.title || 'KURS',
                            date: new Date().toLocaleDateString('uz-UZ'),
                          }}
                        >
                          <Award className="w-5 h-5" />
                          PDF FORMATDA YUKLAB OLISH
                        </DownloadCertificateBtn>
                      )}
                      
                      <Link href="/profile" className="block mt-4 text-sm text-green-100 hover:text-white font-medium underline underline-offset-4">
                         Profil sahifasiga o&apos;tish
                      </Link>
                   </div>
                )}
              </div>
            ) : isCompleted ? (
              <div className="bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 border-2 border-[#2D5A27]/20 dark:border-[#A8E6CF]/20 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-[#2D5A27] dark:text-[#A8E6CF] shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-[#2D5A27] dark:text-[#A8E6CF]">Dars tugallangan ✅</p>
                  {completionResult?.coins_earned > 0 && (
                    <p className="text-xs text-[#2D5A27]/70 dark:text-[#A8E6CF]/70 mt-0.5">
                      +{completionResult.coins_earned} tanga qo'lga kiritildi. {isRedirecting && 'Keyingi darsga o\'tilmoqda...'}
                    </p>
                  )}
                </div>
                {isRedirecting && <Loader2 className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF] animate-spin shrink-0" />}
              </div>
            ) : (
             <button
                onClick={handleInitiateCompletion}
                disabled={isCompleting || (!canComplete && !isCompleted)}
                className="w-full py-4 bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {!canComplete && !isCompleted ? "Videoni oxirigacha ko'ring" : (quizzes.length > 0 ? "Darsni tugatdim va testni boshlash" : (nextLesson ? "Darsni tugatdim" : "Kursni tugatish"))} — +{lesson.reward_coins} tanga
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
              href={isCompleted ? `/courses/${courseId}/lesson/${nextLesson.id}` : '#'}
              onClick={(e) => { if(!isCompleted) { e.preventDefault(); alert("Oldin darsni tugating!"); } }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                isCompleted 
                  ? 'bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827] hover:bg-[#1f421a] dark:hover:bg-[#86d4b8] active:scale-95' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              Keyingi dars
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={() => {
                if (isCompleted) {
                   // Course completed modal is usually shown automatically if isCompleted is true and completionResult says so.
                   // But let's trigger the name update if needed.
                   window.scrollTo({ top: 300, behavior: 'smooth' });
                } else {
                   handleInitiateCompletion();
                }
              }}
              disabled={isCompleting || (!canComplete && !isCompleted)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                isCompleted || canComplete
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-orange-500/20 active:scale-95' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Award className="w-5 h-5" />
              Kursni tugatish
            </button>
          )}
        </div>

        {/* Lessons Sidebar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
            Barcha darslar
          </h3>
          <div className="space-y-2">
            {allLessons.map((l, lIdx) => {
               const isLocked = lIdx > 0 && !completedLessonIds.has(allLessons[lIdx - 1]?.id) && l.id !== lessonId;
               return (
                <Link
                  key={l.id}
                  href={isLocked ? '#' : `/courses/${courseId}/lesson/${l.id}`}
                  onClick={(e) => { if(isLocked) { e.preventDefault(); alert("Oldingi darslarni tugating!"); } }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    l.id === lessonId 
                      ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] font-bold' 
                      : isLocked 
                        ? 'opacity-40 cursor-not-allowed text-gray-400'
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
                  <div className="ml-auto flex items-center">
                    {!completedLessonIds.has(l.id) && isLocked && (
                      <XCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400 shrink-0 ml-1">{l.order_index}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

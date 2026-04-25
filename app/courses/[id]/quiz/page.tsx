'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Award, Loader2, Trophy, HelpCircle, Coins } from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  order_index: number;
  reward_coins: number;
}

interface AnswerResult {
  correct: boolean;
  correct_option_index: number;
  coins_earned: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [totalCoins, setTotalCoins] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const supabase = createClient();

    async function fetchData() {
      setIsLoading(true);
      const [courseRes, quizzesRes] = await Promise.all([
        supabase.from('courses').select('title').eq('id', courseId).single(),
        supabase.from('quizzes').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
      ]);

      setCourseTitle(courseRes.data?.title || '');
      setQuizzes(quizzesRes.data || []);
      setIsLoading(false);
    }

    fetchData();
  }, [courseId]);

  const currentQuiz = quizzes[currentIndex];

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuiz) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: currentQuiz.id,
          selected_option_index: selectedOption,
          course_id: courseId,
        }),
      });
      const data: AnswerResult = await res.json();
      setAnswerResult(data);

      if (data.correct) {
        setTotalCoins(prev => prev + data.coins_earned);
        setCorrectCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswerResult(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2D5A27] dark:border-gray-800 dark:border-t-[#A8E6CF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex flex-col items-center justify-center p-6 text-center">
        <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Testlar hali qo&apos;shilmagan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Bu kurs uchun hali test savollari mavjud emas</p>
        <button onClick={() => router.push(`/courses/${courseId}`)} className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold">
          Kursga qaytish
        </button>
      </div>
    );
  }

  // Final results screen
  if (isFinished) {
    const percentage = Math.round((correctCount / quizzes.length) * 100);
    const isPassed = percentage >= 70;

    return (
      <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 max-w-lg w-full text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isPassed
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'
          }`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isPassed ? '🎉 Tabriklaymiz!' : 'Test yakunlandi'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {courseTitle} - Test natijalari
          </p>

          {/* Score circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                strokeDasharray={`${percentage * 3.14} ${314 - percentage * 3.14}`}
                className={isPassed ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-orange-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#2D5A27] dark:text-[#A8E6CF]">{correctCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">To&apos;g&apos;ri</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold text-red-500">{quizzes.length - correctCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Noto&apos;g&apos;ri</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold text-yellow-500">{totalCoins}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tanga</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setAnswerResult(null);
                setIsFinished(false);
                setTotalCoins(0);
                setCorrectCount(0);
              }}
              className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Qayta topshirish
            </button>
            <Link
              href={`/courses/${courseId}`}
              className="flex-1 py-3 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827] rounded-2xl font-bold hover:bg-[#1f421a] dark:hover:bg-[#86d4b8] transition-colors text-center"
            >
              Kursga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/courses/${courseId}`)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{courseTitle}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Test</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100/80 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            {totalCoins} tanga
          </span>
          <span className="text-xs font-semibold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {quizzes.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-[#2D5A27] to-[#A8E6CF] transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
        />
      </div>

      {/* Quiz Card */}
      <div className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          {/* Question */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 bg-[#A8E6CF]/20 rounded-xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {currentQuiz.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuiz.options.map((option: string, index: number) => {
              let optionStyle = 'border-gray-200 dark:border-gray-700 hover:border-[#2D5A27] dark:hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/5';
              let iconContent = <span className="text-xs font-bold text-gray-400">{String.fromCharCode(65 + index)}</span>;

              if (answerResult) {
                if (index === answerResult.correct_option_index) {
                  optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
                  iconContent = <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
                } else if (index === selectedOption && !answerResult.correct) {
                  optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400';
                  iconContent = <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
                } else {
                  optionStyle = 'border-gray-200 dark:border-gray-700 opacity-50';
                }
              } else if (selectedOption === index) {
                optionStyle = 'border-[#2D5A27] dark:border-[#A8E6CF] bg-[#A8E6CF]/10 ring-2 ring-[#2D5A27]/20 dark:ring-[#A8E6CF]/20';
                iconContent = <span className="text-xs font-bold text-[#2D5A27] dark:text-[#A8E6CF]">{String.fromCharCode(65 + index)}</span>;
              }

              return (
                <button
                  key={index}
                  onClick={() => !answerResult && setSelectedOption(index)}
                  disabled={!!answerResult}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${optionStyle}`}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                    {iconContent}
                  </div>
                  <span className="text-base font-medium text-gray-800 dark:text-gray-200">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          {answerResult && (
            <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 ${
              answerResult.correct
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {answerResult.correct ? (
                <>
                  <CheckCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold">To&apos;g&apos;ri javob! 🎉</p>
                    <p className="text-sm opacity-75">+{answerResult.coins_earned} tanga qo&apos;lga kiritildi</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold">Noto&apos;g&apos;ri javob</p>
                    <p className="text-sm opacity-75">To&apos;g&apos;ri javob: {String.fromCharCode(65 + answerResult.correct_option_index)}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Button */}
          {!answerResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                'Javobni tekshirish'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-[#2D5A27] dark:bg-[#A8E6CF] text-white dark:text-[#111827] rounded-2xl font-bold text-base shadow-lg hover:bg-[#1f421a] dark:hover:bg-[#86d4b8] transition-all flex items-center justify-center gap-2"
            >
              {currentIndex < quizzes.length - 1 ? (
                <>
                  Keyingi savol
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  Natijalarni ko&apos;rish
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

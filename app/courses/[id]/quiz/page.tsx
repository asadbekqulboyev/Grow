'use client';

import { useParams, useRouter } from 'next/navigation';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  useEffect(() => {
    // Automatically redirect back to the course page after a short delay
    const timer = setTimeout(() => {
      if (courseId) {
        router.push(`/courses/${courseId}`);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [courseId, router]);

  return (
    <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center p-6 text-center">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100 dark:border-gray-800">
        <HelpCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bu sahifa eskirgan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Endi testlar bitta umumiy bo'limda emas, balki qaysi darsga tegishli bo'lsa o'sha darsning bevosita o'zida ko'rsatiladi.
          Dars sahifasiga qaytib borib, videoni yakunlagan holda testni topshirishingiz mumkin.
        </p>
        <button onClick={() => router.push(`/courses/${courseId}`)} className="w-full bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5"/>
          Kursga qaytish
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, BookOpen, Code, Globe, Rocket, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';

type Goal = 'grants' | 'soft_skill' | 'hard_skill' | 'language' | 'startup';
type Level = 'beginner' | 'intermediate' | 'advanced';
type TimeGoal = 30 | 60 | 90;

const GOALS: { id: Goal; label: string; emoji: string; desc: string; icon: any; gradient: string }[] = [
  { id: 'grants', label: 'Grantlar', emoji: '🏆', desc: 'Grant yutish va loyiha yaratish', icon: Target, gradient: 'from-amber-400 to-orange-500' },
  { id: 'soft_skill', label: 'Soft skill', emoji: '🧠', desc: 'Notiqlik, kommunikatsiya, liderlik', icon: BookOpen, gradient: 'from-violet-400 to-purple-600' },
  { id: 'hard_skill', label: 'Hard skill', emoji: '💻', desc: 'Dasturlash, dizayn, texnik ko\'nikmalar', icon: Code, gradient: 'from-blue-400 to-cyan-500' },
  { id: 'language', label: 'Til o\'rganish', emoji: '🌍', desc: 'Ingliz, Rus yoki boshqa tillar', icon: Globe, gradient: 'from-emerald-400 to-teal-500' },
  { id: 'startup', label: 'Startup', emoji: '🚀', desc: 'Biznes g\'oya va startup qurish', icon: Rocket, gradient: 'from-pink-400 to-rose-500' },
];

const LEVELS: { id: Level; label: string; emoji: string; desc: string }[] = [
  { id: 'beginner', label: 'Boshlang\'ich', emoji: '🌱', desc: 'Endigina boshlayman' },
  { id: 'intermediate', label: 'O\'rta', emoji: '📈', desc: 'Ba\'zi asoslarni bilaman' },
  { id: 'advanced', label: 'Yuqori', emoji: '🏔️', desc: 'Tajribam bor, chuqurroq o\'rganmoqchiman' },
];

const TIME_GOALS: { id: TimeGoal; label: string; emoji: string; desc: string }[] = [
  { id: 30, label: '30 kun', emoji: '⚡', desc: 'Tez natija — sprint rejim' },
  { id: 60, label: '60 kun', emoji: '🎯', desc: 'O\'rtacha temp — barqaror o\'sish' },
  { id: 90, label: '90 kun', emoji: '🏁', desc: 'Chuqur o\'rganish — to\'liq o\'zgarish' },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [timeGoal, setTimeGoal] = useState<TimeGoal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canProceed = step === 0 ? !!goal : step === 1 ? !!level : !!timeGoal;

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!goal || !level || !timeGoal) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, level, time_goal: timeGoal }),
      });

      if (!res.ok) {
        throw new Error('Xatolik yuz berdi');
      }

      // Streak yangilash
      await fetch('/api/streak', { method: 'POST' });

      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Xatolik yuz berdi');
      setIsSubmitting(false);
    }
  };

  const STEP_TITLES = [
    'Maqsadingizni tanlang',
    'Darajangizni belgilang',
    'Vaqt maqsadingiz',
  ];

  const STEP_SUBTITLES = [
    'Platformada qaysi yo\'nalishda rivojlanmoqchisiz?',
    'Hozirgi bilim darajangiz qanday?',
    'Qancha vaqtda maqsadga yetishni xohlaysiz?',
  ];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] dark:from-[#0a1f0d] dark:via-[#111827] dark:to-[#0a1f0d] flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-[#A8E6CF] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-30 animate-float-slow pointer-events-none"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#2D5A27] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[140px] opacity-20 animate-float-medium pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300 dark:bg-yellow-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[200px] opacity-10 pointer-events-none"></div>

      {/* Logo */}
      <div className="mb-8 sm:mb-10 relative z-10">
        <div className="flex items-center gap-2">
          <img src="/images/logo.svg" alt="Grow.uz" className="h-10 sm:h-12 object-contain dark:invert" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-10 sm:w-14 h-1.5 rounded-full transition-all duration-500 ${
              i <= step
                ? 'bg-gradient-to-r from-[#2D5A27] to-[#4a8c42]'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
          </div>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-bold tabular-nums">
          {step + 1}/3
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl relative z-10">
        {/* Step Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {STEP_TITLES[step]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {STEP_SUBTITLES[step]}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          {/* Step 0: Goal Selection */}
          {step === 0 && GOALS.map((g) => {
            const Icon = g.icon;
            const isSelected = goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left group active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#2D5A27] bg-[#A8E6CF]/15 dark:bg-[#A8E6CF]/10 shadow-lg shadow-[#2D5A27]/10 ring-1 ring-[#2D5A27]/20'
                    : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${g.gradient} flex items-center justify-center shrink-0 shadow-sm ${
                  isSelected ? 'scale-110 shadow-lg' : 'group-hover:scale-105'
                } transition-transform`}>
                  <span className="text-2xl">{g.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base sm:text-lg ${
                    isSelected ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-900 dark:text-white'
                  } transition-colors`}>{g.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{g.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#2D5A27] bg-[#2D5A27]'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Step 1: Level Selection */}
          {step === 1 && LEVELS.map((l) => {
            const isSelected = level === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`w-full flex items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left group active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#2D5A27] bg-[#A8E6CF]/15 dark:bg-[#A8E6CF]/10 shadow-lg shadow-[#2D5A27]/10 ring-1 ring-[#2D5A27]/20'
                    : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{l.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg ${
                    isSelected ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-900 dark:text-white'
                  } transition-colors`}>{l.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{l.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'border-[#2D5A27] bg-[#2D5A27]' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Step 2: Time Goal Selection */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {TIME_GOALS.map((t) => {
                  const isSelected = timeGoal === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTimeGoal(t.id)}
                      className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 group active:scale-[0.97] ${
                        isSelected
                          ? 'border-[#2D5A27] bg-[#A8E6CF]/15 dark:bg-[#A8E6CF]/10 shadow-lg shadow-[#2D5A27]/10 ring-1 ring-[#2D5A27]/20'
                          : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-2">{t.emoji}</span>
                      <h3 className={`font-bold text-lg sm:text-xl ${
                        isSelected ? 'text-[#2D5A27] dark:text-[#A8E6CF]' : 'text-gray-900 dark:text-white'
                      } transition-colors`}>{t.label}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{t.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Summary preview */}
              {goal && level && timeGoal && (
                <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-[#2D5A27]/5 to-[#A8E6CF]/10 dark:from-[#2D5A27]/20 dark:to-[#A8E6CF]/5 rounded-2xl border border-[#A8E6CF]/30 dark:border-[#A8E6CF]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#2D5A27] dark:text-[#A8E6CF]" />
                    <span className="text-sm font-bold text-[#2D5A27] dark:text-[#A8E6CF]">Sizning rejangiz</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Maqsad</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{GOALS.find(g => g.id === goal)?.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Daraja</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{LEVELS.find(l => l.id === level)?.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vaqt</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{timeGoal} kun</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-1 px-6 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.97]"
            >
              <ChevronLeft className="w-4 h-4" />
              Orqaga
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-[0.97] ${
              canProceed && !isSubmitting
                ? 'bg-[#2D5A27] hover:bg-[#1e3c1a] text-white shadow-lg shadow-[#2D5A27]/25 hover:shadow-xl hover:shadow-[#2D5A27]/30'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saqlanmoqda...
              </>
            ) : step === 2 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Boshlash
              </>
            ) : (
              <>
                Davom etish
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

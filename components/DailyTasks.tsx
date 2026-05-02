'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Flame, TrendingUp, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  coins_reward: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, streakRes] = await Promise.all([
        fetch('/api/daily-tasks'),
        fetch('/api/streak', { method: 'POST' }), // POST to update streak on visit
      ]);

      const tasksData = await tasksRes.json();
      const streakData = await streakRes.json();

      if (tasksData.needsOnboarding) {
        setNeedsOnboarding(true);
      } else {
        setTasks(tasksData.tasks || []);
      }

      setStreak({
        current_streak: streakData.current_streak || 0,
        longest_streak: streakData.longest_streak || 0,
      });
    } catch (error) {
      console.error('DailyTasks fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    setTogglingId(taskId);
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed: !currentCompleted }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(prev =>
          prev.map(t =>
            t.id === taskId ? { ...t, completed: !currentCompleted } : t
          )
        );

        // XP qo'shish (faqat task bajarilganda)
        if (!currentCompleted) {
          const task = tasks.find(t => t.id === taskId);
          fetch('/api/level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp_amount: task?.coins_reward || 10, source: 'daily_task' }),
          }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Task toggle error:', error);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Streak Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
          <div className="flex gap-4">
            <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-48"></div>
            </div>
          </div>
        </div>
        {/* Tasks Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
          <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-40 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <a
        href="/onboarding"
        className="block bg-gradient-to-br from-[#2D5A27] to-[#1a3816] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7 text-[#A8E6CF]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Maqsadingizni tanlang!</h3>
            <p className="text-[#A8E6CF] text-sm">Platformadan to&apos;liq foydalanish uchun onboarding-ni tugating.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
        </div>
      </a>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="space-y-4">
      {/* All Tasks Completed Celebration */}
      {allDone && (
        <div className="bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] rounded-2xl p-4 sm:p-5 text-white flex items-center gap-3 shadow-lg animate-in">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-sm sm:text-base">Ajoyib! Barcha vazifalar bajarildi!</p>
            <p className="text-[#A8E6CF] text-xs mt-0.5">Ertaga yangi vazifalar kutmoqda</p>
          </div>
        </div>
      )}
      {/* Streak + Progress Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-400/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              streak.current_streak > 0
                ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-400/25'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Flame className={`w-6 h-6 ${streak.current_streak > 0 ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">{streak.current_streak}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold mt-0.5">kun ketma-ket 🔥</p>
            </div>
          </div>
          {streak.longest_streak > 0 && (
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 relative z-10">
              Rekord: {streak.longest_streak} kun
            </p>
          )}
        </div>

        {/* Today Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#A8E6CF]/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5A27] to-[#4a8c42] flex items-center justify-center shrink-0 shadow-lg shadow-[#2D5A27]/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">{progressPercent}%</p>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold mt-0.5">bugungi progress</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-3 relative z-10">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #2D5A27, #4a8c42, #A8E6CF)',
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📋 Bugungi vazifalar
          </h3>
          <span className="text-xs font-bold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 px-2.5 py-1 rounded-full">
            {completedCount}/{totalCount}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Bugunga vazifalar yo&apos;q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id, task.completed)}
                disabled={togglingId === task.id}
                className={`w-full flex items-start gap-3 p-3 sm:p-4 rounded-xl transition-all duration-300 text-left group active:scale-[0.99] ${
                  task.completed
                    ? 'bg-[#A8E6CF]/10 dark:bg-[#A8E6CF]/5 border border-[#A8E6CF]/20 dark:border-[#A8E6CF]/10'
                    : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {togglingId === task.id ? (
                    <Loader2 className="w-5 h-5 text-[#2D5A27] animate-spin" />
                  ) : task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${
                    task.completed
                      ? 'text-[#2D5A27] dark:text-[#A8E6CF] line-through opacity-70'
                      : 'text-gray-900 dark:text-white'
                  } transition-colors`}>{task.title}</p>
                  {task.description && (
                    <p className={`text-xs mt-0.5 line-clamp-1 ${
                      task.completed ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
                    }`}>{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">💰</span>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{task.coins_reward}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

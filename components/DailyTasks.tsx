'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Flame, TrendingUp, ChevronRight, Loader2, Sparkles, Plus, Lightbulb, X, Trash2, PenLine } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  coins_reward: number;
}

interface Suggestion {
  title: string;
  description: string;
  coins_reward: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [goal, setGoal] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, streakRes] = await Promise.all([
        fetch('/api/daily-tasks'),
        fetch('/api/streak', { method: 'POST' }),
      ]);

      const tasksData = await tasksRes.json();
      const streakData = await streakRes.json();

      if (tasksData.needsOnboarding) {
        setNeedsOnboarding(true);
      } else {
        setTasks(tasksData.tasks || []);
        setSuggestions(tasksData.suggestions || []);
        setGoal(tasksData.goal || '');
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

  // Tavsiyadan qo'shish
  const addFromSuggestion = async (suggestion: Suggestion) => {
    setAddingTask(true);
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          title: suggestion.title,
          description: suggestion.description,
          coins_reward: suggestion.coins_reward,
          goal_type: goal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [...prev, data.task]);
        // Qo'shilgan tavsiyani listdan olib tashlash
        setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
      } else {
        const err = await res.json();
        alert(err.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Add task error:', error);
    } finally {
      setAddingTask(false);
    }
  };

  // O'z vazifasini qo'shish
  const addCustomTask = async () => {
    if (!customTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          title: customTitle.trim(),
          description: customDescription.trim(),
          coins_reward: 10,
          goal_type: 'custom',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [...prev, data.task]);
        setCustomTitle('');
        setCustomDescription('');
        setShowCustomForm(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Add custom task error:', error);
    } finally {
      setAddingTask(false);
    }
  };

  // Task bajarilganligini belgilash
  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    setTogglingId(taskId);
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', taskId, completed: !currentCompleted }),
      });

      if (res.ok) {
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

  // Task o'chirish
  const deleteTask = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', taskId }),
      });

      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Delete task error:', error);
    } finally {
      setDeletingId(null);
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
  const canAddMore = tasks.length < 5;

  return (
    <div className="space-y-4">
      {/* All Tasks Completed Celebration */}
      {allDone && totalCount > 0 && (
        <div className="bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] rounded-2xl p-4 sm:p-5 text-white flex items-center gap-3 shadow-lg">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-sm sm:text-base">Ajoyib! Barcha vazifalar bajarildi!</p>
            <p className="text-[#A8E6CF] text-xs mt-0.5">Davom eting, har bir qadam muhim!</p>
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
          <div className="text-center py-6 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">Hali vazifa yo&apos;q</p>
            <p className="text-xs mt-1">Quyidagi tavsiyalardan tanlang yoki o&apos;zingiz yozing</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                  task.completed
                    ? 'bg-[#A8E6CF]/10 dark:bg-[#A8E6CF]/5 border border-[#A8E6CF]/20 dark:border-[#A8E6CF]/10'
                    : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  disabled={togglingId === task.id}
                  className="mt-0.5 shrink-0"
                >
                  {togglingId === task.id ? (
                    <Loader2 className="w-5 h-5 text-[#2D5A27] animate-spin" />
                  ) : task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-[#2D5A27] dark:hover:text-[#A8E6CF] transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0" onClick={() => toggleTask(task.id, task.completed)}>
                  <p className={`font-bold text-sm cursor-pointer ${
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
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">💰</span>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{task.coins_reward}</span>
                  </div>
                  {!task.completed && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={deletingId === task.id}
                      className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      {deletingId === task.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons: Tavsiya + O'z vazifa */}
        {canAddMore && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setShowSuggestions(!showSuggestions); setShowCustomForm(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                showSuggestions
                  ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 border-[#2D5A27]/20 dark:border-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF]'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Tavsiyalar
            </button>
            <button
              onClick={() => { setShowCustomForm(!showCustomForm); setShowSuggestions(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                showCustomForm
                  ? 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 border-[#2D5A27]/20 dark:border-[#A8E6CF]/20 text-[#2D5A27] dark:text-[#A8E6CF]'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <PenLine className="w-4 h-4" />
              O&apos;zim yozaman
            </button>
          </div>
        )}

        {/* Tavsiyalar ro'yxati */}
        {showSuggestions && canAddMore && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              💡 Maqsadingizga mos tavsiyalar
            </p>
            {suggestions.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">Tavsiyalar tugadi</p>
            ) : (
              suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => addFromSuggestion(suggestion)}
                  disabled={addingTask}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border border-dashed border-[#2D5A27]/20 dark:border-[#A8E6CF]/20 bg-[#A8E6CF]/5 dark:bg-[#A8E6CF]/5 hover:bg-[#A8E6CF]/15 dark:hover:bg-[#A8E6CF]/10 transition-all text-left group"
                >
                  <div className="mt-0.5 shrink-0">
                    <Plus className="w-4 h-4 text-[#2D5A27] dark:text-[#A8E6CF] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{suggestion.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{suggestion.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">💰</span>
                    <span className="text-xs font-bold text-gray-400">{suggestion.coins_reward}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Custom task form */}
        {showCustomForm && canAddMore && (
          <div className="mt-3 space-y-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              ✍️ O&apos;z vazifangizni yozing
            </p>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Vazifa nomi..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#A8E6CF] outline-none"
            />
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Qisqacha izoh (ixtiyoriy)..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#A8E6CF] outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomTask}
                disabled={addingTask || !customTitle.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2D5A27] hover:bg-[#1f421a] dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] text-white dark:text-[#111827] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Qo&apos;shish
              </button>
              <button
                onClick={() => { setShowCustomForm(false); setCustomTitle(''); setCustomDescription(''); }}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Bekor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

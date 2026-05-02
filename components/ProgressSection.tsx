'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const GOAL_LABELS: Record<string, string> = {
  grants: 'Grantlar',
  soft_skill: 'Soft skill',
  hard_skill: 'Hard skill',
  language: 'Til o\'rganish',
  startup: 'Startup',
};

const GOAL_EMOJIS: Record<string, string> = {
  grants: '🏆',
  soft_skill: '🧠',
  hard_skill: '💻',
  language: '🌍',
  startup: '🚀',
};

export default function ProgressSection() {
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<string | null>(null);
  const [timeGoal, setTimeGoal] = useState(30);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [
          { data: profileData },
          { data: allTasks },
          { data: doneTasks },
        ] = await Promise.all([
          supabase.from('user_profiles').select('goal, time_goal, started_at').eq('user_id', user.id).single(),
          supabase.from('daily_tasks').select('id').eq('user_id', user.id),
          supabase.from('daily_tasks').select('id').eq('user_id', user.id).eq('completed', true),
        ]);

        setGoal(profileData?.goal || null);
        setTimeGoal(profileData?.time_goal || 30);
        setStartedAt(profileData?.started_at || null);
        setTotalTasks(allTasks?.length || 0);
        setCompletedTasks(doneTasks?.length || 0);
      } catch (e) {
        console.error('ProgressSection error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32 mb-3"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!goal) return null;

  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Kunlar progressi
  const daysPassed = startedAt
    ? Math.floor((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const daysProgress = Math.min(Math.round((daysPassed / timeGoal) * 100), 100);
  const daysRemaining = Math.max(timeGoal - daysPassed, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
          <Target className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF]" />
          Maqsad Progressi
        </h3>
        <span className="text-xs font-bold text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/20 px-2.5 py-1 rounded-full">
          {GOAL_EMOJIS[goal] || '📌'} {GOAL_LABELS[goal] || goal}
        </span>
      </div>

      {/* Task Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className="font-medium">Vazifalar bajarilishi</span>
          <span className="font-bold text-gray-900 dark:text-white">{completedTasks}/{totalTasks} ({taskProgress}%)</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${taskProgress}%`,
              background: 'linear-gradient(90deg, #2D5A27, #4a8c42, #A8E6CF)',
            }}
          ></div>
        </div>
      </div>

      {/* Time Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className="font-medium">Vaqt maqsadi</span>
          <span className="font-bold text-gray-900 dark:text-white">{daysPassed}/{timeGoal} kun ({daysProgress}%)</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${daysProgress}%`,
              background: 'linear-gradient(90deg, #f59e0b, #f97316, #ef4444)',
            }}
          ></div>
        </div>
        {daysRemaining > 0 && (
          <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{daysRemaining} kun qoldi</p>
        )}
      </div>
    </div>
  );
}

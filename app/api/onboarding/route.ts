import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateDailyTasks, type GoalType } from '@/lib/daily-tasks';

// POST — Onboarding ma'lumotlarini saqlash
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goal, level, time_goal } = body;

    // Validate inputs
    const validGoals = ['grants', 'soft_skill', 'hard_skill', 'language', 'startup'];
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const validTimeGoals = [30, 60, 90];

    if (!validGoals.includes(goal) || !validLevels.includes(level) || !validTimeGoals.includes(time_goal)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // 1. User profile saqlash (upsert — agar mavjud bo'lsa yangilash)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        goal,
        level,
        time_goal,
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error('Profile save error:', profileError);
      return NextResponse.json({ error: 'Profilni saqlashda xatolik' }, { status: 500 });
    }

    // 2. Streak boshlash
    const { error: streakError } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id' });

    if (streakError) {
      console.error('Streak init error:', streakError);
    }

    // 3. Birinchi kunlik tasklar generatsiya qilish
    const tasks = generateDailyTasks(goal as GoalType, [], 3);
    const today = new Date().toISOString().split('T')[0];

    const taskInserts = tasks.map(task => ({
      user_id: user.id,
      title: task.title,
      description: task.description,
      goal_type: goal,
      task_date: today,
      completed: false,
      coins_reward: task.coins_reward,
    }));

    const { error: tasksError } = await supabase
      .from('daily_tasks')
      .upsert(taskInserts, { onConflict: 'user_id,title,task_date' });

    if (tasksError) {
      console.error('Tasks init error:', tasksError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

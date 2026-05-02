import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateDailyTasks, type GoalType } from '@/lib/daily-tasks';

// GET — Bugungi tasklar ro'yxati (auto-generate if empty)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Bugungi tasklar
    const { data: todayTasks, error: tasksError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_date', today)
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('Daily tasks fetch error:', tasksError);
      return NextResponse.json({ error: 'Tasklar yuklanmadi' }, { status: 500 });
    }

    // Agar bugunga task yo'q bo'lsa — avtomatik generatsiya
    if (!todayTasks || todayTasks.length === 0) {
      // User profilini olish
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('goal')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        // Profil yo'q — onboarding kerak
        return NextResponse.json({ tasks: [], needsOnboarding: true });
      }

      // Oxirgi 7 kunlik tarix
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: recentTasks } = await supabase
        .from('daily_tasks')
        .select('title')
        .eq('user_id', user.id)
        .gte('task_date', sevenDaysAgo.toISOString().split('T')[0]);

      const recentTitles = (recentTasks || []).map(t => t.title);

      // Yangi tasklar generatsiya
      const newTasks = generateDailyTasks(profile.goal as GoalType, recentTitles, 3);

      const taskInserts = newTasks.map(task => ({
        user_id: user.id,
        title: task.title,
        description: task.description,
        goal_type: profile.goal,
        task_date: today,
        completed: false,
        coins_reward: task.coins_reward,
      }));

      const { data: insertedTasks, error: insertError } = await supabase
        .from('daily_tasks')
        .upsert(taskInserts, { onConflict: 'user_id,title,task_date' })
        .select();

      if (insertError) {
        console.error('Auto-generate tasks error:', insertError);
        return NextResponse.json({ tasks: [], error: 'Task generatsiya xatosi' });
      }

      return NextResponse.json({ tasks: insertedTasks || [] });
    }

    return NextResponse.json({ tasks: todayTasks });
  } catch (error) {
    console.error('Daily tasks error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — Task bajarilganligini belgilash
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, completed } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID kerak' }, { status: 400 });
    }

    // Task yangilash
    const { data: task, error: updateError } = await supabase
      .from('daily_tasks')
      .update({
        completed: completed !== false,
        completed_at: completed !== false ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Task update error:', updateError);
      return NextResponse.json({ error: 'Task yangilanmadi' }, { status: 500 });
    }

    // Agar task bajarilgan bo'lsa — coin berish
    if (completed !== false && task?.coins_reward) {
      await supabase.from('user_coins').insert({
        user_id: user.id,
        amount: task.coins_reward,
        reason: `Vazifa: ${task.title}`,
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Task complete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

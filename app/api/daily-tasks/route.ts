import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateDailyTasks, type GoalType } from '@/lib/daily-tasks';

// GET — Bugungi tasklar + tavsiyalar (suggestions)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // User profilini olish
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('goal')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ tasks: [], suggestions: [], needsOnboarding: true });
    }

    // Bugungi tasklar (foydalanuvchi o'zi qo'shganlar)
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

    // Tavsiyalar generatsiya (avtomatik qo'shilmaydi, faqat ko'rsatiladi)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentTasks } = await supabase
      .from('daily_tasks')
      .select('title')
      .eq('user_id', user.id)
      .gte('task_date', sevenDaysAgo.toISOString().split('T')[0]);

    const recentTitles = (recentTasks || []).map(t => t.title);
    const todayTitles = (todayTasks || []).map(t => t.title);
    const allExclude = [...new Set([...recentTitles, ...todayTitles])];

    // 5 ta tavsiya berish (lekin qo'shilmaydi!)
    const suggestions = generateDailyTasks(profile.goal as GoalType, allExclude, 5);

    return NextResponse.json({
      tasks: todayTasks || [],
      suggestions,
      goal: profile.goal,
    });
  } catch (error) {
    console.error('Daily tasks error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — Task qo'shish, bajarish yoki o'chirish
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const today = new Date().toISOString().split('T')[0];

    // ===== 1. Yangi task qo'shish (tavsiyadan yoki o'zi yozgan) =====
    if (action === 'add') {
      const { title, description, coins_reward, goal_type } = body;

      if (!title) {
        return NextResponse.json({ error: 'Vazifa nomi kerak' }, { status: 400 });
      }

      // Bugungi tasklar sonini tekshirish (max 5)
      const { data: existing } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_date', today);

      if ((existing?.length || 0) >= 5) {
        return NextResponse.json({ error: 'Kuniga 5 ta vazifagacha qo\'shish mumkin' }, { status: 400 });
      }

      const { data: newTask, error: insertError } = await supabase
        .from('daily_tasks')
        .insert({
          user_id: user.id,
          title,
          description: description || '',
          goal_type: goal_type || 'custom',
          task_date: today,
          completed: false,
          coins_reward: coins_reward || 10,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Task insert error:', insertError);
        return NextResponse.json({ error: 'Vazifa qo\'shib bo\'lmadi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, task: newTask });
    }

    // ===== 2. Task bajarilganligini belgilash =====
    if (action === 'toggle' || !action) {
      const { taskId, completed } = body;

      if (!taskId) {
        return NextResponse.json({ error: 'Task ID kerak' }, { status: 400 });
      }

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
    }

    // ===== 3. Task o'chirish =====
    if (action === 'delete') {
      const { taskId } = body;

      if (!taskId) {
        return NextResponse.json({ error: 'Task ID kerak' }, { status: 400 });
      }

      const { error: deleteError } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)
        .eq('completed', false); // Faqat bajarilmaganini o'chirish

      if (deleteError) {
        console.error('Task delete error:', deleteError);
        return NextResponse.json({ error: 'O\'chirib bo\'lmadi' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Noma\'lum action' }, { status: 400 });
  } catch (error) {
    console.error('Task action error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

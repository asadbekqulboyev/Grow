import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET — Bosqich uchun amaliy topshiriq va user javobini olish
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const courseId = request.nextUrl.searchParams.get('course_id');
    if (!courseId) return NextResponse.json({ error: 'course_id kerak' }, { status: 400 });

    // Amaliy topshiriqlarni olish
    const { data: tasks } = await supabase
      .from('practical_tasks')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    // User javoblarini olish
    const { data: submissions } = await supabase
      .from('practical_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    return NextResponse.json({
      tasks: tasks || [],
      submissions: submissions || [],
    });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

// POST — Amaliy topshiriqqa javob yuborish
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { task_id, course_id, answer } = await request.json();
    if (!task_id || !course_id || !answer?.trim()) {
      return NextResponse.json({ error: 'task_id, course_id va answer kerak' }, { status: 400 });
    }

    // Javobni saqlash (upsert)
    const { data, error } = await supabase
      .from('practical_submissions')
      .upsert({
        user_id: user.id,
        task_id,
        course_id,
        answer: answer.trim(),
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      }, { onConflict: 'user_id,task_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // XP qo'shish — amaliy topshiriq uchun 30 XP
    await supabase.from('user_levels').upsert({
      user_id: user.id,
      total_xp: 30,
      current_level: 1,
    }, { onConflict: 'user_id' });

    // Mavjud XP ni yangilash
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('total_xp')
      .eq('user_id', user.id)
      .single();

    if (levelData) {
      const newXp = (levelData.total_xp || 0) + 30;
      const newLevel = newXp >= 1000 ? 5 : newXp >= 600 ? 4 : newXp >= 300 ? 3 : newXp >= 100 ? 2 : 1;
      await supabase
        .from('user_levels')
        .update({ total_xp: newXp, current_level: newLevel, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, submission: data });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

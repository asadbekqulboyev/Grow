import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiya kerak' }, { status: 401 });
    }

    const { lesson_id, course_id } = await request.json();

    if (!lesson_id || !course_id) {
      return NextResponse.json({ error: 'lesson_id va course_id majburiy' }, { status: 400 });
    }

    // Check if already completed
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson_id)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Bu dars allaqachon tugallangan', already_completed: true });
    }

    // Mark lesson as completed
    const { error: progressError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        course_id,
        lesson_id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    // Award coins for completing a lesson (10 coins per lesson)
    const LESSON_COINS = 10;
    await supabase.from('user_coins').insert({
      user_id: user.id,
      amount: LESSON_COINS,
      reason: 'Dars tugallandi',
      course_id,
    });

    // Check if ALL lessons in the course are completed
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course_id);

    const { data: completedLessons } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .eq('completed', true);

    const totalLessons = allLessons?.length || 0;
    const completedCount = completedLessons?.length || 0;
    let courseCompleted = false;
    let bonusCoins = 0;

    if (totalLessons > 0 && completedCount >= totalLessons) {
      courseCompleted = true;

      // Get course info for certificate
      const { data: courseData } = await supabase
        .from('courses')
        .select('title, reward_coins')
        .eq('id', course_id)
        .single();

      // Award bonus coins for completing the course
      bonusCoins = courseData?.reward_coins || 50;
      await supabase.from('user_coins').insert({
        user_id: user.id,
        amount: bonusCoins,
        reason: `Kurs tugallandi: ${courseData?.title}`,
        course_id,
      });

      // Auto-generate certificate
      const certCode = `GRW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Talaba';

      // Check if certificate already exists for this course
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .single();

      if (!existingCert) {
        await supabase.from('certificates').insert({
          cert_code: certCode,
          user_id: user.id,
          course_id,
          student_name: studentName,
          course_name: courseData?.title || 'Noma\'lum kurs',
        });
      }
    }

    return NextResponse.json({
      success: true,
      coins_earned: LESSON_COINS,
      course_completed: courseCompleted,
      bonus_coins: bonusCoins,
      total_completed: completedCount,
      total_lessons: totalLessons,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

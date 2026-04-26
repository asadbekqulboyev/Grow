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
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Bu dars allaqachon tugallangan', already_completed: true });
    }

    // Mark lesson as completed
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' });

    if (progressError) {
      console.error("Progress Error:", progressError);
      return NextResponse.json({ error: 'Progress save error: ' + progressError.message, details: progressError }, { status: 500 });
    }

    // Get specific lesson coins safely
    const { data: lessonData, error: lError } = await supabase
      .from('lessons')
      .select('reward_coins')
      .eq('id', lesson_id)
      .maybeSingle();

    if (lError) console.error("Could not fetch lesson coins, falling back heavily", lError);

    // Get number of quizzes to determine the reason text
    const { count: quizzesCount } = await supabase
      .from('quizzes')
      .select('id', { count: 'exact', head: true })
      .eq('lesson_id', lesson_id);

    // Award overall coins (Only the Lesson itself, not adding extra quiz coins)
    const LESSON_COINS = lessonData?.reward_coins || 10;
    const totalReward = LESSON_COINS;
    
    const { error: coinsError } = await supabase.from('user_coins').insert({
      user_id: user.id,
      amount: totalReward,
      reason: (quizzesCount && quizzesCount > 0) ? `Dars va sinov testi a'lo darajada yakunlandi` : `Dars tugallandi`,
      course_id,
    });

    if (coinsError) {
       console.error("Coins Error:", coinsError);
       return NextResponse.json({ error: 'Coins error: ' + coinsError.message, details: coinsError }, { status: 500 });
    }

    // Check if ALL lessons in the course are completed
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course_id);

    const allLessonIds = allLessons?.map(l => l.id) || [];

    const { data: completedLessons } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', allLessonIds)
      .eq('completed', true);

    const totalLessons = allLessons?.length || 0;
    const completedCount = completedLessons?.length || 0;
    let courseCompleted = false;
    let bonusCoins = 0;
    let finalCertCode: string | undefined = undefined;

    if (totalLessons > 0 && completedCount >= totalLessons) {
      courseCompleted = true;

      // Get course info for certificate
      const { data: courseData } = await supabase
        .from('courses')
        .select('title, reward_coins')
        .eq('id', course_id)
        .single();

      // Check if certificate already exists for this course
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id, cert_code')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .maybeSingle();

      finalCertCode = existingCert?.cert_code;

      if (!existingCert) {
        // Award bonus coins for completing the course
        bonusCoins = courseData?.reward_coins || 50;
        await supabase.from('user_coins').insert({
          user_id: user.id,
          amount: bonusCoins,
          reason: `Kurs tugallandi: ${courseData?.title}`,
          course_id,
        });

        finalCertCode = `GRW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Talaba';

        await supabase.from('certificates').insert({
          cert_code: finalCertCode,
          user_id: user.id,
          course_id,
          student_name: studentName,
          course_name: courseData?.title || 'Noma\'lum kurs',
          certificate_url: '', // Add empty string to satisfy NOT NULL constraint if it exists
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
      cert_code: courseCompleted ? finalCertCode : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

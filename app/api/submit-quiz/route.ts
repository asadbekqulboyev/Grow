import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiya kerak' }, { status: 401 });
    }

    const { quiz_id, selected_option_index, course_id } = await request.json();

    if (quiz_id === undefined || selected_option_index === undefined) {
      return NextResponse.json({ error: 'quiz_id va selected_option_index majburiy' }, { status: 400 });
    }

    // Fetch the quiz to check answer
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quiz_id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });
    }

    const isCorrect = quiz.correct_option_index === selected_option_index;
    let coinsEarned = 0;

    if (isCorrect) {
      coinsEarned = quiz.reward_coins || 10;
      
      // Award coins
      await supabase.from('user_coins').insert({
        user_id: user.id,
        amount: coinsEarned,
        reason: `Test to'g'ri javob: ${quiz.question.substring(0, 50)}...`,
        course_id: course_id || quiz.course_id,
      });
    }

    return NextResponse.json({
      correct: isCorrect,
      correct_option_index: quiz.correct_option_index,
      coins_earned: coinsEarned,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET — User streak ma'lumotlari
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      current_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      last_active_date: streak?.last_active_date || null,
    });
  } catch (error) {
    console.error('Streak fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — Streak yangilash (user har kirganda chaqiriladi)
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Mavjud streak olish
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!streak) {
      // Birinchi marta — yangi streak yaratish
      const { data: newStreak, error } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_active_date: today,
        })
        .select()
        .single();

      if (error) {
        console.error('Streak create error:', error);
        return NextResponse.json({ error: 'Streak yaratishda xatolik' }, { status: 500 });
      }

      return NextResponse.json({
        current_streak: newStreak?.current_streak || 1,
        longest_streak: newStreak?.longest_streak || 1,
        updated: true,
      });
    }

    // Agar bugun allaqachon yangilangan bo'lsa — skip
    if (streak.last_active_date === today) {
      return NextResponse.json({
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        updated: false,
      });
    }

    // Kechagi kun bilan solishtirish
    const lastActive = new Date(streak.last_active_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak: number;
    if (diffDays === 1) {
      // Ketma-ket kun — streak +1
      newStreak = streak.current_streak + 1;
    } else {
      // 1 kundan ko'p farq — streak qayta boshlanadi
      newStreak = 1;
    }

    const newLongest = Math.max(streak.longest_streak, newStreak);

    const { error: updateError } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Streak update error:', updateError);
      return NextResponse.json({ error: 'Streak yangilanmadi' }, { status: 500 });
    }

    return NextResponse.json({
      current_streak: newStreak,
      longest_streak: newLongest,
      updated: true,
    });
  } catch (error) {
    console.error('Streak error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

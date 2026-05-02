import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET — User level va XP ma'lumotlari
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      // Yangi user — level yaratish
      const { data: newLevel } = await supabase
        .from('user_levels')
        .insert({ user_id: user.id, current_level: 1, total_xp: 0 })
        .select()
        .single();
      return NextResponse.json(newLevel || { current_level: 1, total_xp: 0 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

// POST — XP qo'shish (source: task, course, quiz, streak)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { xp_amount, source } = await request.json();
    if (!xp_amount || xp_amount <= 0) {
      return NextResponse.json({ error: 'xp_amount kerak' }, { status: 400 });
    }

    // Mavjud levelin olish
    let { data: levelData } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!levelData) {
      const { data: newData } = await supabase
        .from('user_levels')
        .insert({ user_id: user.id, current_level: 1, total_xp: 0 })
        .select()
        .single();
      levelData = newData;
    }

    const newXp = (levelData?.total_xp || 0) + xp_amount;
    const newLevel = newXp >= 1000 ? 5 : newXp >= 600 ? 4 : newXp >= 300 ? 3 : newXp >= 100 ? 2 : 1;

    const { data: updated } = await supabase
      .from('user_levels')
      .update({
        total_xp: newXp,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    const levelUp = newLevel > (levelData?.current_level || 1);

    return NextResponse.json({
      ...updated,
      level_up: levelUp,
      source,
    });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

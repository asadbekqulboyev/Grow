import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET — Leaderboard (top foydalanuvchilar XP bo'yicha)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    // RPC funksiyasi orqali leaderboard
    const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: limit });

    if (error) {
      // Agar RPC mavjud bo'lmasa, oddiy query
      const { data: fallbackData } = await supabase
        .from('user_levels')
        .select('user_id, current_level, total_xp')
        .order('total_xp', { ascending: false })
        .limit(limit);

      return NextResponse.json({
        leaderboard: (fallbackData || []).map((item, index) => ({
          ...item,
          rank: index + 1,
          display_name: 'Foydalanuvchi',
          avatar_url: '',
        })),
        current_user_id: user.id,
      });
    }

    return NextResponse.json({
      leaderboard: (data || []).map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
      })),
      current_user_id: user.id,
    });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

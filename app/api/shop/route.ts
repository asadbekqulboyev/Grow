import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST — Shop xaridi (coin sarflash + purchases jadvaliga yozish)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_name, item_type, price } = await request.json();
    if (!item_name || !item_type || !price) {
      return NextResponse.json({ error: 'item_name, item_type, price kerak' }, { status: 400 });
    }

    // Mavjud balansni tekshirish
    const { data: coinsData } = await supabase
      .from('user_coins')
      .select('amount')
      .eq('user_id', user.id);

    const balance = (coinsData || []).reduce((s: number, c: any) => s + (c.amount || 0), 0);
    if (balance < price) {
      return NextResponse.json({ error: 'Tangalar yetarli emas' }, { status: 400 });
    }

    // Avval xarid qilinganmi tekshirish
    const { data: existing } = await supabase
      .from('shop_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_name', item_name)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Bu mahsulot allaqachon xarid qilingan' }, { status: 400 });
    }

    // Coin sarflash
    await supabase.from('user_coins').insert({
      user_id: user.id,
      amount: -price,
      reason: `Do'kon: ${item_name}`,
    });

    // Xaridni saqlash
    await supabase.from('shop_purchases').insert({
      user_id: user.id,
      item_name,
      item_type,
      price,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

// GET — User xaridlari ro'yxati
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('shop_purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false });

    return NextResponse.json({ purchases: data || [] });
  } catch {
    return NextResponse.json({ error: 'Server xatolik' }, { status: 500 });
  }
}

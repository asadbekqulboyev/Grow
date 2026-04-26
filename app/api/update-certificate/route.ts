import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiya kerak' }, { status: 401 });
    }

    const { course_id, student_name } = await request.json();

    if (!course_id || !student_name) {
      return NextResponse.json({ error: 'Ma\'lumot yetarli emas' }, { status: 400 });
    }

    // Ismni yangilash
    let { data, error } = await supabase
      .from('certificates')
      .update({ student_name: student_name })
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .select()
      .maybeSingle();

    if (!data) {
      // Agar sertifikat bazada umuman yo'q bo'lsa (boshqa sabablarga ko'ra saqlanmay qolgan bo'lsa),
      // biz uni yangidan yaratamiz!
      const cert_code = `GRW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data: courseData } = await supabase
        .from('courses')
        .select('title')
        .eq('id', course_id)
        .single();

      const { data: insertedData, error: insertError } = await supabase
        .from('certificates')
        .insert({
          cert_code,
          user_id: user.id,
          course_id,
          student_name: student_name,
          course_name: courseData?.title || 'Maxsus Kurs',
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Certificate INSERT error:", insertError);
        return NextResponse.json({ error: `Sertifikat yaratishda xato: ${insertError.message} (Code: ${insertError.code})` }, { status: 500 });
      }
      
      data = insertedData;
      error = null;
    }

    if (error) {
      console.error("Certificate UPDATE error:", error);
      return NextResponse.json({ error: `Supabase xatosi: ${error.message} (Code: ${error.code})` }, { status: 500 });
    }

    return NextResponse.json({ success: true, certificate: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

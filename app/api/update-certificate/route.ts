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

    // Birinchi navbatda sertifikatni qidiramiz
    let { data: existingCert } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .maybeSingle();

    let certResult;

    if (existingCert) {
      // Yangilash
      const { data: updated, error: updateError } = await supabase
        .from('certificates')
        .update({ student_name: student_name })
        .eq('id', existingCert.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      certResult = updated;
    } else {
      // Yangi yaratish
      const cert_code = `GRW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data: courseData } = await supabase
        .from('courses')
        .select('title')
        .eq('id', course_id)
        .maybeSingle();

      const { data: inserted, error: insertError } = await supabase
        .from('certificates')
        .insert({
          cert_code,
          user_id: user.id,
          course_id,
          student_name: student_name,
          course_name: courseData?.title || 'Maxsus Kurs',
          certificate_url: '', 
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      certResult = inserted;
    }

    return NextResponse.json({ success: true, certificate: certResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient } from '@/lib/supabase/server';
import { CoursesClient } from './CoursesClient';

// Server Component — SEO uchun kurslarni server tomonida olish
export default async function CoursesPage() {
  const supabase = await createClient();
  
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  return <CoursesClient initialCourses={courses || []} />;
}

-- ========================================================
-- 1. JADVALLARNI VA ULARNING USTUNLARINI TO'LIQ ISHONCHLI QILISH
-- ========================================================

-- User Progress jadvalini dars yopilishi (completed) bilan to'ldirish
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID,
  lesson_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Agar table bor-u lekin 'completed' ustuni yo'q bo'lsa (Aynan shu xatoni beryapti!):
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- User Coins jadvali
CREATE TABLE IF NOT EXISTS public.user_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  course_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates jadvali 
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 2. FOYDALANUVCHILAR STATISTIKASINI CHIQARISH
-- ========================================================

DROP FUNCTION IF EXISTS public.get_all_users_stats();

CREATE OR REPLACE FUNCTION public.get_all_users_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_coins BIGINT,
  completed_lessons BIGINT,
  total_certificates BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
      u.id, 
      u.email::TEXT, 
      (u.raw_user_meta_data->>'full_name')::TEXT AS full_name,
      u.created_at,
      COALESCE(SUM(c.amount), 0)::BIGINT as total_coins,
      COUNT(DISTINCT p.lesson_id)::BIGINT as completed_lessons,
      COUNT(DISTINCT cert.id)::BIGINT as total_certificates
  FROM auth.users u
  LEFT JOIN public.user_coins c ON u.id = c.user_id
  LEFT JOIN public.user_progress p ON u.id = p.user_id AND p.completed = true
  LEFT JOIN public.certificates cert ON u.id = cert.user_id
  GROUP BY u.id
  ORDER BY u.created_at DESC;
END;
$$;

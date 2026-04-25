-- ========================================================
-- 1. ROLLARI BOSHQRISH VА BARCHA JADVALLARNI XAVFSIZLASH
-- ========================================================

-- Rollarni saqlash uchun maxsus xavfsiz jadval
CREATE TABLE IF NOT EXISTS public.user_roles (
   user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin', 'superadmin')),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Xavfsizlik qoidalari
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Foydalanuvchilar o'z rollarini ko'rishi mumkin" ON public.user_roles;
CREATE POLICY "Foydalanuvchilar o'z rollarini ko'rishi mumkin" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Agar progress jadvallari chala chuzul bo'lsa darhol tuzatamiz
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;


-- ========================================================
-- 2. ROLNI O'ZGARTIRISH (Front-End dan keluvchi sorov uchun)
-- ========================================================

CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Xavfsizlik: Buni faqat "Superadmin" bajara oladi
  IF NOT ((SELECT auth.jwt()->>'email') IN ('asadbekqulboyev@gmail.com')) THEN
     RAISE EXCEPTION 'Ushbu amal faqata Asosiy Super Admin uchun ruxsat etilgan!';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;


-- ========================================================
-- 3. FOYDALANUVCHILAR STATISTIKASI + ROLI BILAN
-- ========================================================

-- Tip xatolarini oldini olish uchun eskini yo'q qilish
DROP FUNCTION IF EXISTS public.get_all_users_stats();

CREATE OR REPLACE FUNCTION public.get_all_users_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_coins BIGINT,
  completed_lessons BIGINT,
  total_certificates BIGINT,
  role TEXT
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
      COUNT(DISTINCT cert.id)::BIGINT as total_certificates,
      COALESCE(r.role, 'student')::TEXT as role
  FROM auth.users u
  LEFT JOIN public.user_coins c ON u.id = c.user_id
  LEFT JOIN public.user_progress p ON u.id = p.user_id AND p.completed = true
  LEFT JOIN public.certificates cert ON u.id = cert.user_id
  LEFT JOIN public.user_roles r ON u.id = r.user_id
  GROUP BY u.id, r.role
  ORDER BY u.created_at DESC;
END;
$$;

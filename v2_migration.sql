-- ============================================================
-- Grow.UZ V2 — Bosqich, Amaliy Topshiriq, Level, Shop
-- Run this in Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. PRACTICAL TASKS — Har bosqich uchun amaliy topshiriqlar
-- ============================================================

CREATE TABLE IF NOT EXISTS public.practical_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.practical_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view practical tasks"
ON public.practical_tasks FOR SELECT
USING (true);

CREATE POLICY "Admin full access practical tasks"
ON public.practical_tasks FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================================
-- 2. PRACTICAL SUBMISSIONS — Foydalanuvchi javoblari
-- ============================================================

CREATE TABLE IF NOT EXISTS public.practical_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.practical_tasks(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  UNIQUE(user_id, task_id)
);

ALTER TABLE public.practical_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
ON public.practical_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
ON public.practical_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
ON public.practical_submissions FOR UPDATE
USING (auth.uid() = user_id);


-- ============================================================
-- 3. USER LEVELS — Level va XP tizimi
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- Barcha foydalanuvchilar level ma'lumotlarini ko'rishi mumkin (leaderboard uchun)
CREATE POLICY "Anyone can view user levels"
ON public.user_levels FOR SELECT
USING (true);

CREATE POLICY "Users can insert own level"
ON public.user_levels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level"
ON public.user_levels FOR UPDATE
USING (auth.uid() = user_id);


-- ============================================================
-- 4. SHOP PURCHASES — Xaridlar tarixi
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('badge', 'avatar', 'premium_course', 'reward')),
  price INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_name)
);

ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
ON public.shop_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
ON public.shop_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_practical_tasks_course ON public.practical_tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_practical_submissions_user ON public.practical_submissions(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_xp ON public.user_levels(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_user ON public.shop_purchases(user_id);


-- ============================================================
-- Leaderboard uchun: user auth.users dan ism olish funksiyasi
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  current_level INTEGER,
  total_xp INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Foydalanuvchi') AS display_name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', '') AS avatar_url,
    ul.current_level,
    ul.total_xp
  FROM public.user_levels ul
  JOIN auth.users u ON u.id = ul.user_id
  ORDER BY ul.total_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

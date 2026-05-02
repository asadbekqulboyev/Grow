-- ============================================================
-- Grow.UZ — Onboarding, Daily Tasks, Streak System
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. USER PROFILES — Onboarding ma'lumotlari
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal TEXT NOT NULL CHECK (goal IN ('grants', 'soft_skill', 'hard_skill', 'language', 'startup')),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  time_goal INTEGER NOT NULL CHECK (time_goal IN (30, 60, 90)),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);


-- ============================================================
-- 2. DAILY TASKS — Har kunlik vazifalar
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  coins_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, title, task_date)
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tasks"
ON public.daily_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks"
ON public.daily_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks"
ON public.daily_tasks FOR UPDATE
USING (auth.uid() = user_id);


-- ============================================================
-- 3. USER STREAKS — Streak tizimi
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
ON public.user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);


-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);

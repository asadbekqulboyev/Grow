-- Supabase SQL Configuration for AI Mentor Chat

-- 1. Create the table for saving AI chat messages
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own messages" 
ON public.ai_chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" 
ON public.ai_chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.ai_chat_messages 
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.ai_chat_messages 
FOR DELETE
USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- Courses Table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

CREATE POLICY "Admin full access courses" 
ON public.courses 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert example courses if table is empty
INSERT INTO public.courses (title, description, category, level, duration_minutes, reward_coins, image_url)
SELECT * FROM (VALUES
  ('Notiqlik va nutq sirlari', 'Kishilar oldida hayajonni yengish, o''z fikrini aniq yetkazish va Otabek Mahkamovdan notiqlik sirlari.', 'Notiqlik', 'Boshlang''ich', 60, 150, '/images/notiqlik.png'),
  ('Imidj', 'Shaxsiy imidj yaratish va kiyinish madaniyati. Oydinoy Tuxtayeva bilan shaxsiy brending asoslari.', 'Imidj', 'Boshlang''ich', 45, 100, '/images/imidj.png'),
  ('Volontyorlik', 'Jamiyatga yordam berish, volontyorlik tamoyillari va ijtimoiy loyihalarni boshqarish. A''zamxo''ja Rasulov bilan.', 'Volontyorlik', 'Boshlang''ich', 50, 120, '/images/volontyorlik.png'),
  ('SMM nima?', 'Ijtimoiy tarmoqlarda marketing, SMM strategiyalari va brendni rivojlantirish. Rahmatullo Boqijonov darslari.', 'SMM', 'O''rta', 75, 200, '/images/smm.png'),
  ('Vaqtni boshqarish: Modul 5', 'Vaqtni to''g''ri taqsimlash, diqqatni jamlash va unumdorlikni oshirish sirlari.', 'Vaqtni boshqarish', 'O''rta', 40, 100, '/images/vaqtni-boshqarish.png')
) AS v(title, description, category, level, duration_minutes, reward_coins, image_url)
WHERE NOT EXISTS (SELECT 1 FROM public.courses LIMIT 1);

-- --------------------------------------------------------
-- Lessons Table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" 
ON public.lessons 
FOR SELECT 
USING (true);

CREATE POLICY "Admin full access lessons" 
ON public.lessons 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert example lessons
DO $$
DECLARE
  v_course_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lessons LIMIT 1) THEN
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
    
    IF v_course_id IS NOT NULL THEN
      INSERT INTO public.lessons (course_id, title, description, duration_minutes, order_index) VALUES
      (v_course_id, '1-dars: Kirish', 'Ushbu darsda kurs haqida umumiy tushuncha beramiz.', 5, 1),
      (v_course_id, '2-dars: Asosiy qoidalar', 'Asosiy tushuncha va qoidalarni o''rganamiz.', 15, 2),
      (v_course_id, '3-dars: Amaliyot', 'O''rganganlarimizni amalda qo''llash.', 20, 3);
    END IF;
  END IF;
END $$;

-- --------------------------------------------------------
-- Quizzes Table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 1,
  reward_coins INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes" 
ON public.quizzes 
FOR SELECT 
USING (true);

CREATE POLICY "Admin full access quizzes" 
ON public.quizzes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------
-- User Progress Table (tracking lesson completion)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- User Coins Table (gamification currency)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coins" 
ON public.user_coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coins" 
ON public.user_coins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------
-- Certificates Table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view certificates by code" 
ON public.certificates 
FOR SELECT 
USING (true);

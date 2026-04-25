-- Courses (Kurslar) jadvalidagi hamma yetishmayotgan ustunlarni qoshish
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS reward_coins INTEGER DEFAULT 100;

-- Lessons (Darslar) jadvalidagi yetishmayotgan ustunlarni qo'shish (Ehtiyot shart)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_text TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS reward_coins INTEGER DEFAULT 10;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;

-- Eski narsalarni olib tashlash
ALTER TABLE courses DROP COLUMN IF EXISTS duration_minutes;
ALTER TABLE lessons DROP COLUMN IF EXISTS duration_minutes;

-- Endi bemalol ishlatamiz!

-- Lessons jadvaliga yangi ustunlar qo'shish
-- Supabase Dashboard > SQL Editor da ishga tushiring

-- 1. content_text ustuni (dars matni)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_text TEXT;

-- 2. is_free ustuni (bepul darsmi)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- 3. reward_coins ustuni (dars uchun tanga)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS reward_coins INTEGER DEFAULT 10;

-- Tekshirish
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'lessons';

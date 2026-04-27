-- =============================================
-- Foydalanuvchilar ma'lumotlarini tozalash
-- Supabase SQL Editor'da ishga tushiring
-- =============================================

-- 1. Sertifikatlarni o'chirish
DELETE FROM public.certificates;

-- 2. Tangalarni (coins) o'chirish
DELETE FROM public.user_coins;

-- 3. Foydalanuvchilar progressini o'chirish
DELETE FROM public.user_progress;

-- Natijani tekshirish
SELECT 'certificates' as table_name, count(*) as remaining FROM public.certificates
UNION ALL
SELECT 'user_coins', count(*) FROM public.user_coins
UNION ALL
SELECT 'user_progress', count(*) FROM public.user_progress;

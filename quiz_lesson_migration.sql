-- quizzes jadvaliga lesson_id ustunini qo'shish
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Agar faqat bitta kursning emas, aniqlik bo'lishi uchun
-- Agar xohlasangiz course_id va lesson_id ham bor bo'ladi. Bu query orqali biz lesson_id ni ulab qo'ydik.

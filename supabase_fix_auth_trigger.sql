-- Yangi foydalanuvchi ro'yxatdan o'tishini to'sib qo'yayotgan eskirgan Trigger va Funksiyalarni tozalash
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users;

-- Ularga ulangan ehtimoliy funksiyalarni ham olib tashlaymiz
DROP FUNCTION IF EXISTS public.handle_new_user();
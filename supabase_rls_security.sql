-- Rasm yuklash va uni o'chirish uchun Storage RLS siyosati
-- Buni Supabase SQL Editor'da bering

-- 1. Kim bo'lsa ham (hamma) rasmni o'qishi mumkin
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'course-images' );

-- 2. Tizimga kirganlar (Admin) rasm yuklashi mumkin
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'course-images' );

-- 3. Tizimga kirganlar (Admin) bazadagi rasmni o'chirib tashlashi mumkin
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'course-images' );

-- 4. Tizimga kirganlar rasmni yangilay olishi mumkin
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'course-images' );

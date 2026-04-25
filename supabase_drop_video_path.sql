-- Biz YouTube link ishlatsyapmiz, shu sabab eskidan qolib ketgan uje ishlatilmaydigan video_path ustunini yo'qotish
ALTER TABLE lessons DROP COLUMN IF EXISTS video_path;

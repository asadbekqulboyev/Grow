-- Courses jadvaliga mentor(muallif) ismini saqlash uchun author ustunini qo'shish
ALTER TABLE courses ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Asadbek';

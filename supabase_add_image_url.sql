-- Courses jadvaliga rasmni saqlaydigan ustunni qo'shish
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- (Ixtiyoriy) O'chirib tashlangan davomiylik ustunini ombordan ham tozalab yuborish
ALTER TABLE courses DROP COLUMN IF EXISTS duration_minutes;

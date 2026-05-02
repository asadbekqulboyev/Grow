-- ============================================================
-- Grow.UZ — Do'kon mahsulotlari (Shop Items)
-- Run this in Supabase SQL Editor
-- ============================================================

DROP TABLE IF EXISTS public.shop_items CASCADE;

CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 100,
  icon_name TEXT NOT NULL DEFAULT 'Gift',
  color TEXT NOT NULL DEFAULT 'from-amber-400 to-orange-500',
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Barcha foydalanuvchilar ko'rishi mumkin
CREATE POLICY "Anyone can view shop items"
ON public.shop_items FOR SELECT
USING (true);

-- Admin to'liq boshqarish (insert, update, delete)
CREATE POLICY "Admin full access shop items"
ON public.shop_items FOR ALL
USING (true)
WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_shop_items_order ON public.shop_items(order_index);

-- Boshlang'ich mahsulotlar (Fizik sovg'alar)
INSERT INTO public.shop_items (name, description, price, icon_name, color, available, order_index) VALUES
  ('Shopper', 'Grow Academy brendli qulay shopper sumkasi', 430, 'ShoppingBag', 'from-emerald-400 to-teal-500', true, 1),
  ('Termos', 'Issiq va sovuqni saqlovchi sifatli termos', 450, 'Gift', 'from-amber-400 to-orange-500', true, 2),
  ('Stakan', 'Grow Academy brendiga ega chiroyli stakan (krujka)', 350, 'Gift', 'from-blue-400 to-cyan-500', true, 3),
  ('Futbolka', 'Maxsus dizayndagi Grow Academy futbolkasi', 500, 'Sparkles', 'from-purple-400 to-indigo-500', true, 4);

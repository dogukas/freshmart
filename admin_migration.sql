-- ============================================================
-- SİTE İÇİ ADMİN PANELİ (Tüm Kullanıcıların Siparişlerini Görme)
-- Lütfen bu dosyayı Supabase SQL Editor'da çalıştırın.
-- ============================================================

-- 1. Orders tablosuna kimin sipariş verdiğini görmek için user_email sütunu ekliyoruz
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. "teyo758@gmail.com" hesabı için admin okuma yetkileri (Siparişler)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (auth.jwt() ->> 'email' = 'teyo758@gmail.com');

-- 3. "teyo758@gmail.com" hesabı için admin okuma yetkileri (Sipariş Kalemleri)
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
USING (auth.jwt() ->> 'email' = 'teyo758@gmail.com');

-- ==========================================
-- ADIM 1: Kırık trigger'ı kaldır (ZORUNLU - ödeme hatası bunu yapıyor)
-- ==========================================
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP FUNCTION IF EXISTS public.notify_new_order();

-- ==========================================
-- ADIM 2: Siparişlerin ve ürün kalemlerinin çalışması için izinler
-- ==========================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Siparişler: kullanıcı kendi siparişini ekleyip görebilir
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders"
ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Sipariş kalemleri: kullanıcı kendi siparişinin kalemlerini ekleyip görebilir
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Users can insert their own order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = order_id
    AND public.orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = order_id
    AND public.orders.user_id = auth.uid()
  )
);

-- Ürünler: herkes görebilir
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT USING (TRUE);

-- ==========================================
-- TAMAMLANDI. Artık ödeme çalışır.
-- ==========================================

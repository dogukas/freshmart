-- =============================================
-- FreshMart - Tam Entegrasyon SQL Paketi
-- Supabase SQL Editor'a yapıştırıp RUN basın
-- =============================================

-- =============================================
-- ADIM 1: Tabloları ve Sütunları Ayarla
-- =============================================

-- orders tablosuna user_id ekle (yoksa)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- orders tablosuna delivery_address ekle (mobil için)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- orders tablosuna notified_at ekle (bildirim takibi için)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- products tablosuna stock_quantity ekle (stok yönetimi için)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;

-- products tablosuna is_active ekle (ürün yayın durumu)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =============================================
-- ADIM 2: Row Level Security (RLS) Ayarları
-- =============================================

-- --- ORDERS tablosu ---
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Mobil uygulama (service_role key ile) TÜM siparişleri görebilir
-- Bu politika service_role key'i bypass eder (otomatik)

-- --- ORDER_ITEMS tablosu ---
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- --- PRODUCTS tablosu ---
-- Herkes ürünleri görebilsin (okuma izni)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
USING (TRUE);

-- Sadece yetkili (service_role ile) ürün ekleyebilsin veya güncelleyebilsin
-- (service_role key RLS'i otomatik bypass eder — mobil uygulama için ideal)

-- =============================================
-- ADIM 3: Sipariş Bildirimi için Webhook Fonksiyonu
-- =============================================
-- NOT: Bu fonksiyon siparişler geldiğinde çalışır.
-- Mobil uygulamanızın bildirim URL'ini WEBHOOK_URL kısmına yazın.
-- Supabase Dashboard → Database → Webhooks üzerinden de ayarlanabilir.

CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT := 'https://MOBIL-UYGULAMANIZIN-SUNUCUSU.com/api/webhooks/new-order';
  payload JSON;
BEGIN
  -- Bildirim yükü hazırla
  payload := json_build_object(
    'type', 'NEW_ORDER',
    'order_id', NEW.id,
    'total_amount', NEW.total_amount,
    'status', NEW.status,
    'created_at', NEW.created_at,
    'user_id', NEW.user_id
  );

  -- HTTP POST gönder (pg_net uzantısı gereklidir)
  -- Supabase'de pg_net default olarak aktif
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload::text
  );

  RETURN NEW;
END;
$$;

-- Trigger: Her yeni sipariş kaydında çalışır
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- =============================================
-- ADIM 4: Stok Güncelleme (Sipariş verilince otomatik düşsün)
-- =============================================

CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id::TEXT = NEW.product_id
    AND stock_quantity >= NEW.quantity;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_item_insert ON public.order_items;
CREATE TRIGGER on_order_item_insert
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_stock_on_order();

-- =============================================
-- ADIM 5: Realtime Dinleme (Mobil uygulama için)
-- =============================================
-- Mobil uygulamanız aşağıdaki tabloları realtime dinleyebilir.
-- Supabase Dashboard → Database → Replication → "Supabase Realtime"
-- altında bu tabloları etkinleştirin:
--   ✅ orders
--   ✅ order_items
--   ✅ products

-- Realtime'ı SQL ile etkinleştir:
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- =============================================
-- TAMAMLANDI ✅
-- Artık mobil uygulamanız:
--   1. Ürünleri çekebilir (GET /products)
--   2. Siparişleri görebilir (GET /orders) [service_role key ile]
--   3. Yeni sipariş gelince webhook ile haberdar olur
--   4. Sipariş verilince stok otomatik düşer
--   5. Realtime değişiklikleri anlık alabilir
-- =============================================

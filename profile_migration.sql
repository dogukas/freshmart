-- ============================================================
-- KULLANICI PROFİLLERİ TABLOSU
-- Adres ve iletişim bilgilerini tutmak için oluşturuldu (Aşama 4)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  delivery_address text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- YETKİLER (Sadece kendi profiline erişim)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcı profilini görebilir" ON public.profiles;
CREATE POLICY "Kullanıcı profilini görebilir"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanıcı profil oluşturabilir" ON public.profiles;
CREATE POLICY "Kullanıcı profil oluşturabilir"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanıcı kendi profilini güncelleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================================
-- ADMİN YETKİSİ (Sadece teyo758@gmail.com tüm profilleri görebilir)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (auth.jwt() ->> 'email' = 'teyo758@gmail.com');

# FreshMart — Mobil Uygulama Entegrasyon Rehberi

Bu belge, mobil uygulamanızın FreshMart web sitesiyle tam entegrasyon kurabilmesi için
gereken tüm teknik bilgileri içermektedir.

---

## 1. 🚪 API Giriş Noktaları (REST API Endpoints)

Supabase altyapımız sayesinde, aşağıdaki adresler üzerinden tüm veri işlemleri yapılabilir.

### 🔑 Bağlantı Bilgileri (Mobil Uygulamaya Girilecekler)

| Bilgi | Değer |
|-------|-------|
| **API URL** | `https://bozheukheeciwhlzkfwc.supabase.co` |
| **REST Endpoint** | `https://bozheukheeciwhlzkfwc.supabase.co/rest/v1` |
| **Anon API Key** | `sb_publishable_5flXoj0iadssibk6VUdRSA_VqRWh8-j` |

> **NOT:** Mobil uygulamanızdaki "Entegrasyon Merkezi" ekranına yukarıdaki **API URL** ve **Anon API Key** değerlerini yapıştırın. "Bağlantıyı Kaydet" deyin — bitti!

---

## 2. 📦 Ürün Listesi Çekme (Stok Okuma)

Mobil uygulamanız FreshMart'taki tüm ürünleri görmek istediğinde şu isteği atar:

```http
GET https://bozheukheeciwhlzkfwc.supabase.co/rest/v1/products?select=*
Authorization: Bearer sb_publishable_5flXoj0iadssibk6VUdRSA_VqRWh8-j
apikey: sb_publishable_5flXoj0iadssibk6VUdRSA_VqRWh8-j
```

**Dönen JSON Yapısı (Örnek):**
```json
[
  {
    "id": "abc-123",
    "name": "Fresh Mangoes",
    "price": 2.49,
    "category": "fruits",
    "image_url": "https://...",
    "unit": "per kg",
    "badge": "Best Seller",
    "rating": 4.9,
    "reviews": 47
  }
]
```

---

## 3. 📦 Stok Güncelleme — "E-Ticarete Aktar" (Ürün Ekleme)

Mobil uygulamanızdaki **"E-Ticarete Aktar"** butonu bu isteği atar:

```http
POST https://bozheukheeciwhlzkfwc.supabase.co/rest/v1/products
Authorization: Bearer <SERVICE_ROLE_KEY>
apikey: <SERVICE_ROLE_KEY>
Content-Type: application/json

{
  "name": "Ürün Adı",
  "price": 12.99,
  "category": "vegetables",
  "image_url": "https://...",
  "unit": "per piece",
  "badge": "New",
  "rating": 5.0,
  "reviews": 0
}
```

> **Service Role Key için:** Supabase Dashboard → Project Settings → API → "service_role" key kopyalanır. Bu key'i sadece güvenli sunucunuzda (backend'de) kullanın, asla istemciye vermeyin.

---

## 4. 🛒 Sipariş Listesini Çekme

Yeni siparişleri mobil uygulamanızdan görüntülemek için:

```http
GET https://bozheukheeciwhlzkfwc.supabase.co/rest/v1/orders?select=*,order_items(*)&order=created_at.desc
Authorization: Bearer <SERVICE_ROLE_KEY>
apikey: <SERVICE_ROLE_KEY>
```

**Dönen JSON Yapısı (Örnek):**
```json
[
  {
    "id": 10,
    "created_at": "2026-03-29T14:00:00Z",
    "total_amount": 7.48,
    "status": "completed",
    "user_id": "uuid-...",
    "order_items": [
      {
        "product_id": "abc-123",
        "quantity": 2,
        "price": 2.49
      }
    ]
  }
]
```

---

## 5. ⚡ Otomatik Bildirim (Webhook) — "Yeni Sipariş Geldi!"

Sipariş geldiği anda mobil uygulamanıza bildirim düşmesi için **Supabase Webhook** kurulumu yapılması gerekir.

### Adımlar (Supabase Dashboard'dan):

1. **Supabase Dashboard** → **Database** → **Webhooks** → **"Create a new webhook"**
2. Şu bilgileri girin:
   - **Name:** `new_order_notification`
   - **Table:** `orders`
   - **Events:** ✅ `INSERT`
   - **URL:** `https://MOBİL-SUNUCUNUZ.com/api/new-order` ← Mobil uygulamanızın notification endpoint'i
3. **Save** deyin.

Her yeni sipariş geldiğinde Supabase bu URL'e şu JSON'ı gönderir:
```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": 11,
    "total_amount": 15.99,
    "status": "completed",
    "created_at": "2026-03-29T17:00:00Z"
  }
}
```

Mobil uygulamanız bu JSON'ı alır ve kullanıcıya **"Yeni bir siparişiniz var! 🎉"** bildirimi gönderir.

---

## 6. 🔒 Güvenlik Özeti

| Kullanım Durumu | Kullanılacak Key |
|----------------|-------------------|
| Mobil uygulama ürün listesi okuma | `Anon Key` |
| Site üzerinden sipariş görme | `Anon Key` |
| Uygulamadan ürün ekleme/stok güncelleme | `Service Role Key` (Sadece backend'de!) |
| Webhook bildirimleri | Supabase Dashboard'dan ayarlanır |

---

## ✅ Hızlı Başlangıç Kontrol Listesi (Mobile Developer İçin)

- [ ] `API URL` ve `Anon Key` uygulamanın `.env` dosyasına eklendi
- [ ] `GET /products` çalışıyor mu? Test edildi
- [ ] `GET /orders` çalışıyor mu? Test edildi  
- [ ] Supabase Webhook URL'i mobil uygulamanın notification server'ına bağlandı
- [ ] `POST /products` ile test ürün eklendi ve sitede göründü

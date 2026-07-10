# 🚀 Stripe Live Mode & Polygon Mainnet Entegrasyonu

Siber-Devlet uygulamasını **test modundan canlı (live) moda** geçirmek için bu rehberi takip et.

## ⚠️ ÖNEMLİ: Güvenlik ve Sorumluluk

- **Stripe Live Mode** = **Gerçek para işlemleri**
- Herhangi bir bug veya yanlış konfigürasyon = müşteri parasının kaybı
- **Önce Test Mode'da aşırı test et, sonra Live'a geç**
- Private key'leri asla GitHub'a commit etme

---

## 1️⃣ Stripe Live Keys Alma

### Adım 1: Stripe Dashboard'a Git
- https://dashboard.stripe.com/
- Giriş yap (veya hesap oluştur)

### Adım 2: Live Mode Aç
1. Dashboard'un sol üst köşesinde **"Test mode"** toggle'ını aç
2. **"Live mode"** olarak değiştir
3. Uyarı okuyup onay ver

### Adım 3: API Keys'i Kopyala
1. **Settings** → **API Keys** → **Live** sekmesi
2. **Secret key** (sk_live_...)'i kopyala
3. **Publishable key** (pk_live_...)'i de kopyala (opsiyonel, frontend'de kullanılır)

---

## 2️⃣ Render.com'da Environment Variables Ayarla

### Adım 1: Render Dashboard Aç
- https://dashboard.render.com/

### Adım 2: Siber-Devlet Service'i Seç
1. Services listesinden **"siberdevlet"** (veya app adın)
2. **"Settings"** tab'ı tıkla

### Adım 3: Environment Variables Ekle/Güncelle

Aşağıdaki değişkenleri ekle:

```
STRIPE_SECRET_KEY = sk_live_your_actual_key_here
STRIPE_PUBLISHABLE_KEY = pk_live_your_actual_key_here
```

**Örnek (DOĞRU DEĞİL, PAYLAŞILMIŞ DUMMY KEY):**
```
STRIPE_SECRET_KEY = sk_live_51PzX4Bxxxxx...
```

### Adım 4: Kaydet ve Deploy Tetikle
1. **"Save"** butonuna bas
2. Service otomatik restart olacak
3. Render log'unda kontrol et:

```
[SİBER-KURULUM] 💳 ✅ STRIPE LIVE MODE AKTIF
```

---

## 3️⃣ Polygon Mainnet RPC URL Entegrasyonu

### Seçenek A: Alchemy (Önerilen)

1. https://www.alchemy.com/ → Giriş yap
2. **"Create App"** butonuna tıkla
3. **Network:** Polygon Mainnet
4. **Chain:** Polygon
5. Oluştur, sonra API Key'i kopyala
6. Şu format: `https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

### Seçenek B: Infura

1. https://www.infura.io/ → Giriş yap
2. New Project oluştur, **Network: Polygon Mainnet** seç
3. RPC URL: `https://polygon-mainnet.infura.io/v3/YOUR_API_KEY`

### Render'a Ekle

```
POLYGON_RPC_URL = https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
```

---

## 4️⃣ Cüzdan Adresi ve Private Key Setup

### Polygon Cüzdan Adresi (OWNER_CRYPTO_ADDRESS)

**Kurulum:**
1. MetaMask veya Ethers.js kullanarak Polygon cüzdan oluştur
2. Cüzdan adresi: `0x1234567890abcdef...` (42 karakter, `0x` ile başlar)

**Render'a Ekle:**
```
OWNER_CRYPTO_ADDRESS = 0x_your_polygon_wallet_address_here
```

### Private Key (OWNER_CRYPTO_PRIVATE_KEY) - ⚠️ GÜVENLİK KRİTİK

**UYARI: Private key'i asla:**
- GitHub'a commit etme
- Şifresiz güvenli tut
- Kimseyle paylaşma

**Setup:**
1. Cüzdan private key'ini (MetaMask'tan "Export Private Key")
2. Render env'de güvenli olarak sakla:

```
OWNER_CRYPTO_PRIVATE_KEY = 0x_your_private_key_hex_here
```

**NOT:** Uygulama çalışan sunucuda private key gereklidir! Render bir PaaS olduğundan, env'ye eklenmesi gerekir. Alternatif: AWS Secrets Manager veya HashiCorp Vault gibi secure key management sistemi kullan.

---

## 5️⃣ Test Ödeme Akışı

### Stripe Live Test Ödemesi

1. **Frontend:** Abonelik seç → "Öde & Üret" tıkla
2. **Form:** Gerçek kredi kartını gir (veya test kartı)
3. **Ödeme Yapıldı:** Stripe webhooks triggerlenecek
4. **Başarı:** Render logs'unda gözlemle:

```
[FİNANS] ✅ BOTLAR $X.XX TUTARI IBAN HESABINIZA STRIPE ILE TRANSFER ETTİ!
```

### Polygon USDT Test Transferi

1. Render env'de cüzdanı doğruladıktan sonra
2. Admin panel → "Anında Çekim Talebi Gönder (Cash-Out)"
3. Polygon tarafında:

```
[FİNANS] ✅ BOTS TRANSFERRED $X.XX TO YOUR WALLET!
```

---

## 6️⃣ Troubleshooting

### "STRIPE_SECRET_KEY eksik" Hatası

```
[SİBER-KURULUM] 💳 ⚠️ STRIPE_SECRET_KEY ayarlanmamış
```

**Çözüm:**
1. Render env'de `STRIPE_SECRET_KEY = sk_live_...` ekle
2. Save ve restart (otomatik olur)

### "Polygon RPC URL invalid"

```
[FİNANS/FALLBACK] Polygon RPC URL yoksa geçersiz
```

**Çözüm:**
1. Alchemy/Infura'dan URL kontrol et
2. `https://polygon-mainnet...` formatında olmalı
3. API key'i doğru gir

### "OWNER_CRYPTO_PRIVATE_KEY eksik"

```
OWNER_CRYPTO_PRIVATE_KEY environment variable is required
```

**Çözüm:**
1. Polygon cüzdanın private key'ini al
2. Render'a `OWNER_CRYPTO_PRIVATE_KEY = 0x...` ekle
3. Güvenli tut!

---

## 7️⃣ Deployment Kontrol Listesi

- [ ] Stripe Live Keys alındı (sk_live_, pk_live_)
- [ ] STRIPE_SECRET_KEY Render env'ye eklendi
- [ ] Polygon Cüzdan adresi (0x...) Render'da ayarlandı
- [ ] POLYGON_RPC_URL Render'da ayarlandı
- [ ] OWNER_CRYPTO_PRIVATE_KEY güvenli Render'da tutuldu
- [ ] Render logs kontrol edildi: "STRIPE LIVE MODE AKTIF" ve "POLYGON RPC URL AYARLI" mesajları
- [ ] Test ödeme başarıyla tamamlandı
- [ ] QNB Finansbank IBAN'ına para geldi mi kontrol et

---

## 📊 Canlı Sistem Mimarisi

```
┌─────────────────┐
│  Frontend User  │
│  (Subscription) │
└────────┬────────┘
         │
    ┌────▼────────────────────────┐
    │    Stripe Payment Gateway   │
    │   (Live Mode: Real Money)   │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────────────┐
    │  Siber-Devlet Backend             │
    │  - Bot Üretim & Satış            │
    │  - Creator Profit Pool             │
    │  - Ledger Tracking                │
    └────┬────────────────────────────────┘
         │
    ┌────┴──────────┬──────────────────────┐
    │               │                      │
┌───▼────────┐ ┌──▼────────────────┐  ┌──▼────────┐
│   Stripe    │ │  Polygon Network  │  │ QNB Bank  │
│   Payouts   │ │  USDT Transfer    │  │  IBAN TL  │
└────────────┘ └───────────────────┘  └───────────┘
```

---

## 🎯 Sonuç

Yukarıdaki adımları tamamlarsanız:

1. ✅ Müşterilerden gerçek para Stripe üzerinden tahsil olur
2. ✅ Bot geliri otomatik cüzdana ve IBAN'a aktarılır
3. ✅ Polygon USDT transferleri mainnet'te gerçekleşir
4. ✅ QNB Finansbank hesabına TL olarak para düşer

**Hepsi otomatik, sıfır sergiye!**

---

**Son Güncelleme:** v13.0 Gerçek Dünya Açık Kaynak Entegrasyonu

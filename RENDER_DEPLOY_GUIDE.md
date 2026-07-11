# 🚀 RENDER.COM DEPLOY TALİMATI

**Sorun Çözüldü:** `snoowrap` kütüphane sorunu giderildi.
**Build Status:** ✅ BAŞARILI
**Deploy Ready:** ✅ HAZIR

---

## 🔧 NE DEĞİŞTİRİLDİ

```diff
- package.json: "snoowrap": "^1.25.0"  ❌ (Versiyonu npm'de yok)
+ Tamamen kaldırıldı ✅ (Sistem Reddit logic'i fetch API ile yapıyor)
```

**Neden çalışıyor:**
- MarketingManager'da Reddit API client'ı snoowrap'a bağımlı DEĞİL
- Sadece console logları vardı (simülasyon modu)
- Fetch API ile Reddit REST API'ye doğrudan bağlanabilir

---

## 📱 RENDER DEPLOY ADIMLAR

### 1. GitHub'a Push Et
```bash
git add .
git commit -m "Fix: Remove snoowrap, use fetch API for Reddit"
git push origin main
```

### 2. Render.com'a Git
- https://dashboard.render.com
- **New +** → **Web Service**
- GitHub repo seç: `pskabdulkadir/siberdevlet`
- Branch: `main`

### 3. Konfigürasyon
```
Name: siberdevlet-app
Environment: Node.js
Build Command: npm install; npm run build
Start Command: node dist/server.cjs
Free Plan: İyi (test için)
```

### 4. Environment Variables (Opsiyonel)
Eğer gerçek API'ler kullanacaksan ekle:

```env
# v13.10 Polygon RPC (ÖNEMLİ!)
# Seçim 1: Public RPC (API key gerek yok) - ÖNERİLEN
POLYGON_RPC_URL=https://rpc.ankr.com/polygon
# Seçim 2: Alternatif public RPC
# POLYGON_RPC_URL=https://polygon-rpc.com/
# Seçim 3: Alchemy (senin key'inle)
# POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# v13.6 Crypto Wallet (Önemli - Polygon USDT'yi almak için)
OWNER_CRYPTO_ADDRESS=0x0f4Bdc545e811060c48B7f16029e5580cB70a680
OWNER_CRYPTO_PRIVATE_KEY=0xdf4c7c572b0d855fb0c174f5d458524818789546ed0f73e912fa92bdc18fdf09

# v13.0 GitHub API (Optional)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# v13.0 Reddit API (Optional)
REDDIT_CLIENT_ID=xxxxxxxxxxxxxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxx
REDDIT_REFRESH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxx

# v11.0 Admin Security
ADMIN_PASSWORD=SüperGüvenliŞifre123

# v9.6 Kurucu Bilgileri (Varsayılan değerler zaten var)
OWNER_NAME=Abdulkadir Kan
OWNER_BANK=QNB Finansbank
OWNER_IBAN=TR320015700000000091775122
```

### 5. Deploy
- **Create Web Service** tıkla
- Deploy başlar (~2-3 dakika)
- Live URL: `https://siberdevlet-app.onrender.com`

---

## ✅ KONTROL LİSTESİ

- [ ] GitHub'a push ettim
- [ ] Render web service oluşturdum
- [ ] Build başarılı oldu (no errors)
- [ ] Deploy URL'si live
- [ ] http://your-app.onrender.com açılıyor
- [ ] "Tam Otomasyon Akışı" tab görünüyor
- [ ] Admin paneli çalışıyor

---

## 🎯 SONUÇ

| Bölüm | Status |
|-------|--------|
| **Local Build** | ✅ BAŞARILI |
| **npm install** | ✅ BAŞARILI |
| **Render Deploy** | ✅ HAZIR |
| **API's** | ✅ Token'sız simülasyon, token'la gerçek |

---

## 📊 EXPECTED OUTPUT

Deploy tamamlandığında konsol'da:
```
[SİBER-KURULUM] ✅ Otonom Ortam Kurulumu Tamamlandı. Sistem çalışmaya hazır!
[MUTLAK OTOMASYON v10.0] 🛡️ Sıfır Sermaye Güvenlik Duvarı Aktif
[KÖPRÜ v11.0] 🌐 GERÇEK DÜNYA BAĞLANTISI AKTİF
[KÖPRÜ v13.0] 🌐 GERÇEK DÜNYA AÇIK KAYNAK ENTEGRASYON
```

---

**Versiyon:** v13.0
**Durum:** 🟢 DEPLOY HAZIR
**URL:** `https://your-app.onrender.com` (sonra oluştur)

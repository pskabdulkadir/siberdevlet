# GitHub Actions - Render Otomatik Deploy Setup

## ✅ Adımlar

### 1. Render API Key Oluştur
1. https://dashboard.render.com/api-keys adresine git
2. "Create API Key" butonuna tıkla
3. API key'i kopyala

### 2. Render Service ID Bul
1. https://dashboard.render.com adresine git
2. "gaia-simulation" servisini bul
3. URL'den Service ID'yi kopyala (example.onrender.com'dan önceki ID)
   - Örnek: `srv_2qv1234567890` formatında

### 3. GitHub Secrets Ekle
1. GitHub repository settings'e git
   - https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
2. "New repository secret" tıkla
3. İki secret ekle:

#### Secret 1: RENDER_API_KEY
- **Name**: `RENDER_API_KEY`
- **Value**: Render'dan kopyaladığın API key

#### Secret 2: RENDER_SERVICE_ID
- **Name**: `RENDER_SERVICE_ID`
- **Value**: Service ID (srv_xxxxx formatında)

### 4. Test Et
1. Herhangi bir commit/push yap (main branch'e)
2. GitHub → Actions sekmesinde build durumunu izle
3. Başarılı olursa, Render otomatik deploy edilecek

## 📊 Workflow Neler Yapıyor?

```
Code Push → GitHub Actions
    ↓
    ├─ Dependencies install (npm install)
    ├─ Type check (npm run lint)
    ├─ Build (npm run build)
    └─ Render API'ye deploy request gönder
        ↓
        Render otomatik deploy edecek
```

## 🔄 Her Push'de Ne Olur?

1. ✅ Kod push edildi → GitHub Actions tetikleniyor
2. ✅ Node.js 20 kurulu
3. ✅ npm install çalışıyor
4. ✅ Lint/type check yapılıyor
5. ✅ Build başlatılıyor (`npm run build`)
6. ✅ Render API'ye bildirim gönderiliyor
7. ✅ Render otomatik deploy başlatıyor
8. ✅ SQLite database kalıcı tutuluyor
9. ✅ Polygon USDT transfer ayarları geliniyor

## 🚀 Canlı Deploy

Deploy tamamlandığında:
- Yeni kod **live.onrender.com** adresinde görünür
- Database veriler korunur
- Botlar canlı çalışmaya devam eder
- Para otomatik transferi aktif kalır

## 🔗 Bağlantılar

- **GitHub Actions Monitor**: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- **Render Dashboard**: https://dashboard.render.com
- **Live Site**: https://gaia-simulation.onrender.com

## ⚠️ Notlar

- Private key'i GITHUB_SECRET'ta tutma! Render'da environment variable olarak ekle
- Render'da "Auto-Deploy" özelliğini kapatabilirsin (GitHub Actions yeterli)
- Deploy süresi: ~2-3 dakika


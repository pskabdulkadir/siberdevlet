# 🚀 Render + GitHub Actions Otomatik Deploy - Quick Start

## Özet
- **GitHub'a push → GitHub Actions build yapıyor → Render otomatik deploy ediyor**
- **Veriler kalıcı (SQLite) → Polygon USDT otomatik transfer**
- **Her push'de fresh build, deploy otomatik**

---

## 🔧 5 Dakikalık Setup

### 1. Render API Key & Service ID

#### Render API Key Oluştur
```
https://dashboard.render.com/api-keys
→ "Create API Key"
→ Key'i kopyala (sr_xxxxx)
```

#### Service ID Bul
```
https://dashboard.render.com
→ "gaia-simulation" service'i tıkla
→ URL: https://gaia-simulation.onrender.com
→ Dashboard'da ayarlardan Service ID (srv_xxxxx) kopyala
```

### 2. GitHub Secrets Ekle

GitHub Repository Settings:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

İki secret ekle:
```
Name: RENDER_API_KEY
Value: [Render'dan kopyaladığın key]

Name: RENDER_SERVICE_ID
Value: [Service ID]
```

### 3. Render Environment Variables

Render Dashboard → gaia-simulation → Environment:

```
DATABASE_URL = file:./data.db
POLYGON_RPC_URL = https://rpc.ankr.com/polygon
OWNER_CRYPTO_ADDRESS = 0x0f4Bdc545e811060c48B7f16029e5580cB70a680
OWNER_CRYPTO_PRIVATE_KEY = [YOUR_PRIVATE_KEY] ⚠️ CONFIDENTIAL ✅
```

### 4. Commit & Push

```bash
git add .
git commit -m "🚀 Setup: GitHub Actions + Render otomatik deploy"
git push origin main
```

### 5. Test

```
https://github.com/YOUR_REPO/actions
→ Workflow'u izle
→ Başarılı olursa: https://gaia-simulation.onrender.com canlı
```

---

## 🔄 Her Push'de Ne Olur?

```
Developer commit & push (main)
    ↓
GitHub Actions tetikleniyor:
  1. Checkout code
  2. Node.js 20 setup
  3. npm install
  4. npm run lint (type check)
  5. npm run build
  6. Render API'ye deploy request
    ↓
Render otomatik:
  1. Code pull
  2. npm install
  3. npm run build
  4. Prisma migrations
  5. SQLite database attach
  6. Environment variables load
  7. Server start (:3000)
    ↓
✅ LIVE: https://gaia-simulation.onrender.com
   - Botlar üretim yapıyor
   - Pazarlama aktif
   - Polygon USDT canlı
```

---

## 📊 Status Kontrol

### GitHub Actions Status
```
https://github.com/YOUR_REPO/actions
```

### Render Logs
```
https://dashboard.render.com → gaia-simulation → Logs
```

### Live Site
```
https://gaia-simulation.onrender.com
```

---

## 🔐 Security Notes

✅ **Yapılan Doğru:**
- `.gitignore` → `.env` ignore edilmiş
- `.env.example` → Template var (commit edilebilir)
- GitHub Secrets → Public değerleri sadece
- Render Secrets → Private key confidential olarak tutulmuş

❌ **Yapma:**
- Private key'i GitHub'a commit etme
- Render secrets'ı GitHub'a expose etme
- API key'leri hardcode etme

---

## 🚀 Canlı Örnek Workflow

### Push 1: Code change
```bash
git add src/App.tsx
git commit -m "Fix: UI button style"
git push
```
→ GitHub Actions 2 dakika → Render deploy → Live

### Push 2: Server change
```bash
git add server.ts
git commit -m "Feat: New marketplace endpoint"
git push
```
→ GitHub Actions 2 dakika → Render deploy → Live (SQLite data preserved)

### Push 3: Feature
```bash
git add server/PayoutManager.ts
git commit -m "Feat: Polygon USDT auto transfer"
git push
```
→ GitHub Actions → Render → Canlı para transfer aktif

---

## 📈 Monitoring

### Render Metrics
```
Dashboard → Metrics sekmesi
- CPU usage
- Memory usage
- Request/s
```

### Logs
```
Dashboard → Logs
- Build logs
- Runtime logs
- Errors
```

### Polygon Transactions
```
https://polygonscan.com
→ Wallet: 0x0f4Bdc545e811060c48B7f16029e5580cB70a680
→ Tüm USDT transfer'ları burada görünür
```

---

## 🆘 Troubleshooting

### Build başarısız
```
Check: https://github.com/YOUR_REPO/actions
→ Error message oku
→ Meist: npm packages eksik veya syntax error
```

### Deploy başarısız
```
Check: https://dashboard.render.com → Logs
→ Usually: DATABASE_URL veya secrets eksik
→ Render Secret'ları kontrol et
```

### Site açılmıyor
```
1. Wait 2-3 minutes (first deploy slow)
2. Check: https://gaia-simulation.onrender.com/health
3. Render logs'ta error varsa gösterir
```

### Database reset gerekirse
```
Render Dashboard → Settings → Environment Variables
→ DATABASE_URL'yi sil
→ Redeploy
→ Yeni DB oluşturulacak
```

---

## ✅ Final Checklist

```
☐ Render API Key created
☐ Service ID found
☐ GitHub Secrets added (RENDER_API_KEY, RENDER_SERVICE_ID)
☐ Render Environment Variables set
☐ .env.example file created
☐ .gitignore has .env*
☐ First push successful
☐ GitHub Actions passed
☐ Render deploy completed
☐ https://gaia-simulation.onrender.com accessible
☐ /health endpoint returns OK
☐ Botlar canlı çalışıyor
☐ Polygon USDT ready
```

---

**TAMAMLANDI! Artık her push otomatik olarak Render'a deploy edilecek.** 🚀


# Render Dashboard - Private Key & Secrets Setup

## 🔐 Render'da Güvenli Değişken Ayarı

### Step 1: Render Dashboard'a Giriş
1. https://dashboard.render.com adresine git
2. "gaia-simulation" servisini bul
3. "Environment" sekmesine tıkla

### Step 2: Secret Variables Ekle

Aşağıdaki değişkenleri **confidential** olarak ekle:

#### Variable 1: OWNER_CRYPTO_PRIVATE_KEY
```
Key: OWNER_CRYPTO_PRIVATE_KEY
Value: 0xYOUR_PRIVATE_KEY_HEX_HERE (⚠️ Gizli - GitHub'a push ETME!)
Confidential: ✅ (Checkmark)
```

#### Variable 2: POLYGON_RPC_URL
```
Key: POLYGON_RPC_URL
Value: https://rpc.ankr.com/polygon
Confidential: ❌ (Unchecked - Public API)
```

#### Variable 3: DATABASE_URL
```
Key: DATABASE_URL
Value: file:./data.db
Confidential: ❌ (Local SQLite)
```

#### Variable 4: OWNER_CRYPTO_ADDRESS
```
Key: OWNER_CRYPTO_ADDRESS
Value: 0x0f4Bdc545e811060c48B7f16029e5580cB70a680
Confidential: ❌ (Public address)
```

### Step 3: Repo'da Commit & Push

```bash
git add .
git commit -m "🚀 GitHub Actions + Render otomatik deploy setup"
git push origin main
```

### Step 4: Test Deploy

1. Render Dashboard'da "Manual Deploy" butonuna tıkla
2. Build logs'u izle
3. Başarı mesajını bekle

## ✅ Kontrol Listesi

```
☐ Render API Key oluşturuldu
☐ Service ID bulundu
☐ GitHub Secrets eklendi (RENDER_API_KEY, RENDER_SERVICE_ID)
☐ Render Environment Variables eklendi
☐ render.yaml güncellenmiş
☐ .github/workflows/deploy-render.yml var
☐ Test push yapıldı
☐ Deploy başarılı oldu
```

## 🔄 Otomatik Deploy Flow

```
Developer Push
    ↓
GitHub Actions Workflow Tetikleniyor
    ↓
Build Check:
  ├─ npm install
  ├─ npm run lint
  └─ npm run build
    ↓
Render API Request
    ↓
Render Deploy Başlıyor:
  ├─ Kod pull
  ├─ npm install
  ├─ npm run build
  ├─ SQLite database attach
  ├─ .env secrets load
  └─ Server start
    ↓
✅ Live: https://gaia-simulation.onrender.com
```

## 💡 Tips

- **Redeploy ihtiyaç duyarsan**: Render Dashboard'da "Manual Deploy" tıkla
- **Logs izlemek**: Render Dashboard → Logs sekmesi
- **Database reset**: `data.db` dosyasını Render'da sil, yeni start yapacak
- **Private key rotate**: Render → Environment, değiştir ve redeploy

## 🚨 Uyarılar

- ❌ Private key'i GitHub repository'ye COMMIT etme
- ❌ Render Secrets'ı GitHub'a expose etme
- ✅ Tüm secrets Render Dashboard'da "Confidential" mark'la
- ✅ GitHub Actions sadece public değişkenleri kullanır


# PROJECT GAIA v6.0 - Windows Hızlı Başlangıç

## ✅ Sorunlar Çözüldü!

Başlangıçta karşılaştığınız sorunlar:
1. ❌ Docker kurulu değil → ✅ **Gerekli değil!** Local modda çalışıyor
2. ❌ DATABASE_URL tanımlanmamış → ✅ **Tanımlandı!** `.env` dosyasında

Sistem artık **veritabanı olmadan bile çalışıyor** (in-memory mode).

---

## 🚀 HEMEN BAŞLAT (2 adım)

### Adım 1: Bağımlılıkları Kur

```powershell
npm install
```

✅ Zaten yaptığınız!

### Adım 2: Uygulamayı Başlat

```powershell
npm run dev
```

**Beklenen çıktı:**
```
[FastBoot] Simülasyon başlatılıyor...
[BackupManager] Otonom yedekleme servisi başlatıldı
[FastBoot] ✅ BAŞARILI: Seed data yüklendi! Tick #0, 10 bot
Server listening at http://localhost:3000
```

---

## 📱 UYGULAMAYA ULAŞ

Tarayıcıda açın:
```
http://localhost:3000
```

---

## 🗄️ SONRA: PostgreSQL EKLE (Opsiyonel)

Eğer kalıcılık (persistence) ve veritabanı istiyorsanız:

### PostgreSQL Kur (Windows)

**Seçenek 1: Installer**
1. İndir: https://www.postgresql.org/download/windows/
2. Kur (password: `secret`)
3. Port: `5432`

**Seçenek 2: Windows Subsystem for Linux (WSL)**
```powershell
# PowerShell'de WSL'yi aç
wsl

# Ubuntu'da PostgreSQL kur
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Seçenek 3: Easiest - Standalone Executable**
- PostgreSQL Portable: https://www.postgresql.org/download/windows/

### Veritabanı Oluştur

```powershell
# PowerShell'de
psql -U postgres

# PostgreSQL komut satırında
CREATE DATABASE gaia_db;
CREATE USER gaia WITH PASSWORD 'password123';
ALTER ROLE gaia SET client_encoding TO 'utf8';
ALTER ROLE gaia SET default_transaction_isolation TO 'read committed';
ALTER ROLE gaia SET default_transaction_deferrable TO on;
ALTER ROLE gaia SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE gaia_db TO gaia;
\q
```

### .env Dosyasını Güncelle

`.env` dosyasında Database URL'i ekle:

```env
DATABASE_URL="postgresql://gaia:password123@localhost:5432/gaia_db"
```

### Prisma Schema Migrate Yap

```powershell
npx prisma migrate dev --name init
```

### Uygulamayı Yeniden Başlat

```powershell
npm run dev
```

**Artık veritabanı ile çalışıyor!** 🎉

---

## 🔄 VERİ PERSISTENCE TEST

### Test 1: Botları Kontrol Et
```
http://localhost:3000 → "admin" tab
```

Bots tab'ında 10 bot göreceksiniz:
- Avcı-Alpha (100 GAIA)
- Çiftçi-Zeta (100 GAIA)
- Refiner-Beta
- Vb...

### Test 2: Tick Çalıştır

Admin panelinde "SİMÜLASYON RAPORLARI" bölümünde:

```
POST /api/simulation/tick
```

Veya tarayıcıda:
```
http://localhost:3000/api/simulation/tick
```

Bots'un enerjisi azalacak (başlangıç 100 → 99 vb.)

### Test 3: Kapatıp Açıldığında

Terminal'de `Ctrl+C` ile durdur:
```
[ctrl+c]
```

2-3 saniye bekle, tekrar başlat:
```powershell
npm run dev
```

**Yalnızca in-memory mode'dayken:**
- Botlar yeniden seed data'dan yüklenir (enerji reset)
- Tick count sıfırlanır

**PostgreSQL konfigüre ettikten sonra:**
- Botlar **tam olarak kaldıkları state'te** geri yüklenir
- Tick count devam eder
- Enerji değerleri korunur ✅

---

## 🛠️ SORUN GIDERME

### "npm install" hatası
```powershell
# npm cache temizle
npm cache clean --force

# Tekrar dene
npm install
```

### "npm run dev" hata: PORT 3000 meşgul
```powershell
# Başka bir porta başlat
$env:PORT=3001
npm run dev

# veya Windows'ta
set PORT=3001
npm run dev
```

### "postgres: command not found"
PostgreSQL kurulu değil veya PATH'a eklenmedi:

**Çözüm 1:** PostgreSQL installer'dan "Add to PATH" seç
**Çözüm 2:** WSL kullan (daha kolay)
**Çözüm 3:** Şimdilik DATABASE_URL boş bırak, in-memory modda çalış

### Prisma hataları
```powershell
# Prisma yeniden generate et
npx prisma generate

# Yeniden başlat
npm run dev
```

---

## 📊 BACKUPİ KONTROL ET

Eğer 5 dakika beklersek, otomatik yedekleme yapılır:

```powershell
# Yedek dosyasını kontrol et
Get-Content -Path ".\data\state_backup.json" | ConvertFrom-Json

# veya Visual Studio Code'da
code .\data\state_backup.json
```

---

## 🎯 SONRAKI ADIMLAR

1. **Gemini AI Key Ekle** (Opsiyonel)
   ```env
   GEMINI_API_KEY="your-key-here"
   ```

2. **Stripe/Polygon Kurulumu** (Finansal features için)
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   POLYGON_RPC_URL="https://..."
   ```

3. **Üretim Deployment**
   - PostgreSQL production instance
   - Environment variables güvenli yönetimi
   - Backup rotation setup

---

## ✅ BAŞARILI KURULUM İŞARETLERİ

- ✅ `npm run dev` çalışıyor
- ✅ http://localhost:3000 açılıyor
- ✅ 10 bot admin panelinde görülüyor
- ✅ `/api/simulation/tick` çağrısı başarılı
- ✅ Botun enerjisi değişiyor
- ✅ `/data/state_backup.json` oluşturuluyor

---

## 💡 İPUÇLARİ

- **Development:** In-memory mode hızlıdır (DATABASE_URL boş)
- **Testing:** PostgreSQL'i local'de çalıştırıp test edin
- **Production:** Managed PostgreSQL (AWS RDS, Supabase vb.)

---

## 📚 DAHA FAZLA

- Detaylı setup: `PERSISTENCE_SETUP.md`
- Architecture: `PROMPT_GUIDE.md`
- Sorunlar: GitHub Issues

**Hoşgeldiniz! Project GAIA çalışıyor!** 🚀🤖

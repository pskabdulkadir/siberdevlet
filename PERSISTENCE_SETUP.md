# PROJECT GAIA v6.0: SETUP & INSTALLATION

## 🚀 HIZLI BAŞLANGAIÇ (Quick Start)

### Adım 1: PostgreSQL Kurulumu

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Docker (Tercih Edilen)
docker run --name gaia-postgres \
  -e POSTGRES_USER=gaia \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=gaia_db \
  -p 5432:5432 \
  -v gaia_data:/var/lib/postgresql/data \
  -d postgres:15
```

### Adım 2: Veritabanı Oluştur

```bash
# Connection string tanımla
createdb -U postgres gaia_db

# veya Docker'da
docker exec gaia-postgres psql -U gaia -d gaia_db -c "SELECT 1"
```

### Adım 3: Environment Variables Kur

`.env` dosyası oluştur:
```env
DATABASE_URL="postgresql://gaia:secure_password@localhost:5432/gaia_db"
GEMINI_API_KEY="your-key"
STRIPE_SECRET_KEY="sk_test_..."
OWNER_IBAN="TR620000..."
OWNER_CRYPTO_WALLET="0x..."
```

### Adım 4: Prisma Schema Migrate

```bash
# Bağımlılıkları kur
npm install

# PostgreSQL schema'sını oluştur
npx prisma migrate dev --name init

# (veya mevcut schema'yı deploy et)
npx prisma db push
```

### Adım 5: Uygulama Başlat

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

**Beklenen çıktı:**
```
[FastBoot] Simülasyon başlatılıyor...
[BackupManager] Otonom yedekleme servisi başlatıldı
[FastBoot] ✅ BAŞARILI: Veritabanından durum yüklendi!
[BackupManager] /data dizini oluşturuldu.
Server listening at http://localhost:3000
```

---

## 📊 AFTER STARTUP

### Yönetici Paneline Gir
```
http://localhost:3000 → "admin" tabı
```

### Backup Durumunu Kontrol Et
```bash
curl http://localhost:3000/api/admin/backup-info | jq
```

**Çıktı örneği:**
```json
{
  "hasBackup": false,
  "backup": null,
  "lastBackupTime": 0,
  "backupCount": 0
}
```

### Manuel Tick Çalıştır
```bash
curl -X POST http://localhost:3000/api/simulation/tick
```

Sistem otomatik olarak ilk adımdan sonra veritabanına yazacaktır.

---

## 🔄 DEVAM ETTİRME TESTI (Persistence Test)

### Test 1: İlk Başlatma
```bash
npm run dev
# → Seed data (10 bot) oluşturulur
# → Veritabanına yazılır
# Tick #1, 10 bots
```

### Test 2: Kapatma & Yeniden Başlatma
```bash
# Ctrl+C ile durdur

# 5 saniye sonra tekrar başlat
npm run dev
# → Veritabanından yüklenir
# → Tick #1, 10 bots (aynı!)
# ✅ Persistence çalışıyor
```

### Test 3: Veritabanı Sorunları
```bash
# PostgreSQL'i durdur
pg_ctl stop

# Uygulamayı başlat
npm run dev
# → Backup dosyasından restore eder
# → /data/state_backup.json'dan yükler
# ✅ Failover çalışıyor
```

### Test 4: Enerji & Bakiye Persi stence
Admin → "admin" tab → Bot'u seç:
- **Başlangıç:** Enerji 100, Bakiye 100 GAIA
- `npm run dev` → Tick'leri çalıştır (Enerji düşer)
- **Kapatma & Açma:** Enerji & bakiye **korunur**

---

## 🛠️ PRODUCTION SETUP

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: gaia
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: gaia_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://gaia:${DB_PASSWORD}@postgres:5432/gaia_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - ./data:/app/data

volumes:
  postgres_data:
```

### Başlat
```bash
docker-compose up -d
docker-compose logs -f app
```

### Backup Rutini (Cron)

`backup-script.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/mnt/backups/gaia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# JSON backup'ını cloud'a kopyala
cp /app/data/state_backup.json $BACKUP_DIR/state_$TIMESTAMP.json

# PostgreSQL dump
pg_dump gaia_db | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# S3'e yükle (veya Google Cloud Storage)
aws s3 cp $BACKUP_DIR s3://gaia-backups/ --recursive
```

**Cron job (her saat):**
```bash
0 * * * * /usr/local/bin/backup-script.sh >> /var/log/gaia_backup.log 2>&1
```

---

## 🔍 MONİTÖRİNG & SORUN GİDERME

### Database Sağlığı
```bash
# Bots tablosunun boyutu
psql -U gaia -d gaia_db -c "SELECT COUNT(*) FROM bots;"

# Son yedekleme zamanı
psql -U gaia -d gaia_db -c "SELECT MAX(createdAt) FROM backup_logs;"

# Tüm logs
psql -U gaia -d gaia_db -c "SELECT COUNT(*) FROM backup_logs WHERE success=true;"
```

### Hata Logs
```bash
# Application logs
tail -f /var/log/gaia/app.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log

# Backup logs
cat /data/state_backup.json | jq '.state.logs[0:5]'
```

### Bağlantı Sorunları
```bash
# PostgreSQL'e bağlanabilir mi test et
psql postgresql://gaia:password@localhost:5432/gaia_db

# Prisma debug modu
DEBUG="prisma:*" npm run dev
```

---

## 📈 PERFORMANCE TUNING

### PostgreSQL Parametreleri

`postgresql.conf`:
```
shared_buffers = 256MB          # RAM'in 1/4'ü
effective_cache_size = 1GB      # RAM'in 1/2'si
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
```

### Prisma Pooling
```env
DATABASE_URL="postgresql://gaia:password@localhost:5432/gaia_db?connection_limit=20"
```

### İndeksler
```sql
CREATE INDEX idx_bots_status ON bots(status);
CREATE INDEX idx_assets_created ON digital_assets(createdAt DESC);
CREATE INDEX idx_transactions_timestamp ON ledger_transactions(timestamp DESC);
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] PostgreSQL cluster kurulu ve çalışıyor
- [ ] `.env` dosyasında `DATABASE_URL` tanımlanmış
- [ ] `npx prisma migrate deploy` başarıyla çalıştı
- [ ] `/data` dizini yazılabilir izinlere sahip
- [ ] Backup script cron job'da tanımlanmış
- [ ] S3/Cloud Storage bucket oluşturulmuş
- [ ] SSL/TLS sertifikası konfigüre edilmiş
- [ ] Monitoring (Prometheus/Grafana) kurulu
- [ ] Database backup'ları en az günlük
- [ ] Application logs persistent storage'da

---

## 🎯 BAŞARILI DEPLOYMENT İŞARETLERİ

✅ **Bot Persistence:**
```bash
curl http://api.gaia.world/api/admin/backup-info
# → lastBackupTime !== 0
```

✅ **Tick Count Arttığı:**
```bash
curl http://api.gaia.world/api/simulation/state | jq '.activeTicks'
# → 0 → 1 → 2 → ... (yeniden başlatmalar arasında devam ediyor)
```

✅ **Database Büyüyor:**
```bash
psql -c "SELECT pg_database_size('gaia_db');"
# → 1MB → 5MB → 50MB (zamanla büyüyor)
```

✅ **Logs Biriktiğini Görme:**
```bash
curl http://api.gaia.world/api/simulation/state | jq '.logs | length'
# → > 100 entries
```

---

## 🚨 EM ERJENSİ RECOVERY

### Veri Kaybı
```bash
# Backup'tan geri yükle
cp /backup/state_backup.json /app/data/state_backup.json

# Veritabanını PostgreSQL dump'tan restore et
psql -U gaia gaia_db < /backup/db_20250115.sql

# Uygulama yeniden başlat
systemctl restart gaia-app
```

### Database Corruption
```bash
# Full vacuum ve analyze
VACUUM FULL;
ANALYZE;

# Corrupted table'ı reset et
TRUNCATE TABLE bots;
TRUNCATE TABLE digital_assets;
TRUNCATE TABLE ledger_transactions;

# Backup'tan restore et
```

### Disk Space Kaldığını Görme
```bash
# Old backup'ları sil
find /data -name "state_*.json" -mtime +30 -delete

# PostgreSQL eski log'larını temizle
find /var/log/postgresql -mtime +7 -delete
```

---

## 📚 KAYNAKLAR

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance.html)
- [Docker Compose Docs](https://docs.docker.com/compose/)

**Sorular veya sorunlar?** GitHub Issues'a post et!

# PROJECT GAIA: v6.0 - ABSOLUTE PERSISTENCE & FAST-BOOT ENGINE

## Vizyonumuz: Kalıcı Durum (Persistent State) Yönetimi

Project GAIA, gerçek zamanlı otonom simülasyon motoru olarak **RAMde değil, kalıcı veritabanı ve dosya sisteminde** çalışır. Sistem yeniden başladığında, botların enerjisi, bakiyeleri, evrim nesli ve tüm ekonomik geçmiş kayıp olmaz; tam olarak kaldığı saniye devam eder.

---

## 🏗️ 4 KATMANLI MİMARİ

### KATMAN 1: PostgreSQL Persistence Layer
**Amaç:** Tüm dinamik simülasyon verisini veritabanına kalıcı olarak saklamak

**Şema Tabloları:**
- `bots` - Otonom botlar, enerji, bakiye, yetenek matrisleri
- `digital_assets` - Zanaatkar botunun ürettiği varlıklar
- `ledger_transactions` - Mali işlem geçmişi
- `jobs` - BullMQ/Redis kuyruk işleri
- `simulation_meta` - Küresel sistem parametreleri (singleton)
- `backup_logs` - Yedekleme geçmişi

**UPSERT Mekanizması:**
Her simülasyon "Tick" tamamlandıktan sonra StateManager.persistAllState() çalışır:
- Varsa: Bot verilerini güncelle
- Yoksa: Yeni bot kaydını ekle
- Tüm işlem atomic ve eşzamanlı

```typescript
// Her Tick'te otomatik çalışır
await StateManager.persistAllState();
```

---

### KATMAN 2: Fast-Boot Initialization System
**Amaç:** Sunucu başladığında 0'dan değil, kaldığı yerden devam etmek

**Başlatma Akışı:**

1. **Server açılır** → `initializeSimulation()` çalışır
2. **PostgreSQL kontrol** → `StateManager.hydrateFromDatabase()`
   - ✅ Veritabanı doluysa: Tüm botları, varlıkları, bakiyeleri RAM'e yükle
   - ❌ Veritabanı boşsa: Adım 3'e git
3. **Backup dosyası kontrol** → `BackupManager.restoreFromBackup()`
   - ✅ `/data/state_backup.json` varsa: State'i geri yükle
   - ❌ Yoksa: Adım 4'e git
4. **Seed data** → `seedInitialSimulation()`
   - Yalnızca ilk kurulumda çalışır
   - 10 demo bot ve bakanlıkları oluşturur

**Örnek Log Çıktısı:**
```
[FastBoot] Simülasyon başlatılıyor...
[BackupManager] Otonom yedekleme servisi başlatıldı
[FastBoot] ✅ BAŞARILI: Veritabanından durum yüklendi! Tick #1247, 12 bot, 45 varlık.
[FastBoot] ✅ Sistem tam olarak yüklendi ve devam etmeye hazır.
```

---

### KATMAN 3: Filesystem Backup Service (BackupManager)
**Amaç:** Veritabanı çökmelerine karşı çift güvenlik

**Özellikler:**
- **Otomatik Yedekleme:** Her 5 dakikada bir
- **Hedef:** `/data/state_backup.json`
- **İçerik:** Tüm bots, assets, transactions, meta parametreler

**Dosya Yapısı:**
```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "tick": 1247,
  "bots": 12,
  "assets": 45,
  "transactions": 127,
  "totalGAIA": 12500.50,
  "subsidyPool": 3200.00,
  "state": { ... }
}
```

**API Endpoint:**
```
GET /api/admin/backup-info
```

**Manuel Yedekleme:**
```typescript
await BackupManager.performBackup();
```

---

### KATMAN 4: BullMQ & Redis Queue Persistence
**Amaç:** Kuyrukta bekleyen işler sunucu restart'ta kaybolmasın

**Ayar:**
- Redis üzerindeki kuyruklar (Hammadde Rafinesi, Veri Kazıma vb.) **persistent** olarak konfigüre edilir
- Sunucu çökmeden önceki işler buffer'da tutulur
- Sunucu ayağa kalktığında işleri otomatik olarak resume eder

**İş Durumları:**
- `waiting` → İşlem kuyruğunda bekleniyor
- `active` → Bir bot tarafından işleniyor
- `completed` → Tamamlandı
- `failed` → Hata verdi

Sunucu restart sonrası **active** ve **waiting** işler devam eder.

---

## 🔄 PERSISTENCE AKIŞI

### Yazma (Write) - Her Tick'te
```
Simülasyon Tick → State Değişiklikleri → StateManager.persistAllState()
                                          ├─ PostgreSQL Bots UPSERT
                                          ├─ PostgreSQL Assets UPSERT
                                          ├─ PostgreSQL Transactions INSERT
                                          └─ PostgreSQL Meta UPDATE
                                          
Aynı zamanda her 5 dakikada bir:
BackupManager.performBackup() → /data/state_backup.json yazılır
```

### Okuma (Read) - Startup'ta
```
Server Başlar → initializeSimulation()
                ├─ PostgreSQL Hydrate Denemesi
                │  ├─ Başarılı? → RAM'e yükle
                │  └─ Başarısız? → Backup'dan restore et
                ├─ Backup Restore Denemesi
                │  ├─ Başarılı? → State'i geri yükle
                │  └─ Başarısız? → Seed Data oluştur
                └─ Sistem hazır, Tick'leri başlat
```

---

## 🛠️ API ENDPOİNTLERİ

### Persistence & Backup
```bash
# Mevcut yedekleme bilgisini al
GET /api/admin/backup-info

# Simülasyon state'ini kaldığı yerden al
POST /api/simulation/tick

# Otomatik yedekleme durumunu kontrol et
GET /api/admin/reality-metrics  # backupCount ve lastBackupTime içerir
```

### Manuel Operasyonlar
```bash
# Sunucudan manuel yedekleme yap
POST /api/admin/backup-now

# Veritabanından state'i yenile
POST /api/admin/reset-hydration

# Yedekten geri yükle
POST /api/admin/restore-backup
```

---

## 📊 MONITORING

### Yönetici Paneli
Admin → "REALITY BRIDGE" tabında:
- 📊 GERÇEK CPU KULLANIMI
- 🧠 GERÇEK RAM KULLANIMI
- 🌐 GERÇEK AĞ VERİSİ
- 💾 CHROMADB HAFIZA
- ⛓️ BLOCKCHAIN TX (Persistence count)
- 📁 **BACKUP STATUS** → Son yedekleme tarihi, dosya boyutu, bot/asset sayıları

### Log İzleme
```bash
[FastBoot] Sistem başlatıldığında
[StateManager] Her Tick'te persistence işlemleri
[BackupManager] Her 5 dakikada bir yedekleme
[PatchLog] Yazılımcı Bot'un kod değişiklikleri
```

---

## 🔐 VERİ GÜVENLİĞİ

### Çift Dikiş (Redundancy)
1. **PostgreSQL** - Ana depo
2. **JSON Backup** - Yedek sistem
3. **Redis** - İş kuyrukları

Herhangi bir depo çökse, diğerleri devam eder.

### Atomik Operasyonlar
UPSERT işlemleri Prisma üzerinden atomic'tir:
- Bir bot güncellemesi tam olur veya hiç olmaz
- Veri bozulması riski yoktur

### Şifreleme (Opsiyonel)
PostgreSQL bağlantısı SSL/TLS kullanır:
```
DATABASE_URL=postgresql://user:password@host:5432/gaia?sslmode=require
```

---

## 🚀 ÖNEMLİ NOTLAR

### İlk Kurulum
1. `npm install`
2. `.env` dosyasında `DATABASE_URL` tanımla
3. `npx prisma migrate dev` ile şemayı oluştur
4. `npm run dev` ile başlat

### Üretim (Production)
1. PostgreSQL cluster'ı hazırla
2. `/data` dizininin yazılabilir olduğundan emin ol
3. Backup dosyasını düzenli olarak uzak sunucuya aktar
4. Database backup'larını ayda bir tut

### Sorun Giderme
- **Veritabanı bağlantısı hataları:** `DATABASE_URL` kontrol et
- **Yedekleme başarısız:** `/data` dizini izinlerini kontrol et
- **State loading başarısız:** `npx prisma db push` ile şemayı senkronize et

---

## 📈 PERFORMANCE

### Persistence Overhead
- **PostgreSQL UPSERT:** ~50-100ms per tick
- **Backup (5min interval):** ~200-500ms
- **Toplam:** Simülasyon tick'leri 3.5 saniyede bir çalıştığı için ~3% overhead

### Ölçeklendirme
- 1000+ bot: PostgreSQL indeksleri optimize et
- 10000+ işlem: Eski işlemleri archive table'a taşı
- Yedekleme boyutu >100MB: Compression ekle

---

## 🎯 SONUÇ

Project GAIA v6.0, gerçek bir otonom ekonomik simülasyon değildir—**kalıcı olarak çalışan bir sistem**'dir:

✅ Bot enerjileri, bakiyeleri ve evrim nesilleri **sonsuza kadar korunur**
✅ Sistem kapanıp açıldığında **kaldığı saniyeden devam eder**
✅ Veritabanı çökmesinde **yedek dosyalardan kurtarılır**
✅ İşler ve kuyruklar **hiçbir zaman kaybolmaz**

Bu mimari, gerçek dünya otonom ajanlar, kripto ekonomiler ve merkezi olmayan sistemler için temel oluşturur.

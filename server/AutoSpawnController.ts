import {
  state,
  addSystemLog,
  CyberBot,
  PlanetManager
} from "./simulation.js";
import { BotRole, BotMinistry, BotStatus } from "../src/types.js";

/**
 * v7.0: AutoSpawnController
 * Hibe havuzundaki bütçeyi monitör ederek otomatik olarak
 * yeni botlar spawn eden otonom sistem.
 */
export class AutoSpawnController {
  static lastSpawnTick = 0;
  static readonly SPAWN_CHECK_INTERVAL = 50; // 100 → 50: Spawn kontrol hızını 2x artır
  static readonly MIN_SUBSIDY_FOR_SPAWN = 1500; // 2000 → 1500: Spawn limiti düşür (daha hızlı spawn)
  static readonly SPAWN_COST = 40;
  static readonly MAX_BOTS = 300; // 200 → 300: Maksimum bot sayısını artır

  // En çok ihtiyaç duyulan meslek sınıfını belirle
  static getBottleneckRole(): BotRole {
    const waitingJobsByRole: Record<string, number> = {};
    let chaosRisk = state.chaosEvents || 0;

    // Her kuyrukta kaç iş beklediğini say
    for (const job of state.jobs.filter(j => j.status === "waiting")) {
      if (job.name.includes("Kazıma")) {
        waitingJobsByRole[BotRole.HAMMADDE_AVCISI] = (waitingJobsByRole[BotRole.HAMMADDE_AVCISI] || 0) + 1;
      } else if (job.name.includes("Çiftçiliği")) {
        waitingJobsByRole[BotRole.SENTETIK_CIFTCI] = (waitingJobsByRole[BotRole.SENTETIK_CIFTCI] || 0) + 1;
      } else if (job.name.includes("Rafinesi")) {
        waitingJobsByRole[BotRole.RAFINERI] = (waitingJobsByRole[BotRole.RAFINERI] || 0) + 1;
      } else if (job.name.includes("Sanat Üretimi")) {
        waitingJobsByRole[BotRole.ZANAATKAR] = (waitingJobsByRole[BotRole.ZANAATKAR] || 0) + 1;
      }
    }

    // v7.1: Kaos vakası çok ise Siber-Güvenlik Bot spawn et
    if (chaosRisk > 100) {
      return BotRole.SIBER_GUVENLK;
    }

    // En çok iş biriken sınıfı bul
    let maxRole = BotRole.HAMMADDE_AVCISI;
    let maxCount = 0;

    for (const [role, count] of Object.entries(waitingJobsByRole)) {
      if (count > maxCount) {
        maxCount = count;
        maxRole = role as BotRole;
      }
    }

    // v7.1: %30 ihtimalle Spekülatör Bot spawn (market dinamiği için)
    if (Math.random() < 0.3 && state.marketVolume > 2000) {
      return BotRole.SPEKULATÖR;
    }

    return maxRole;
  }

  // Belirli rol için uygun bakanlığı bul
  static getRoleMinistry(role: BotRole): BotMinistry {
    switch (role) {
      case BotRole.HAMMADDE_AVCISI:
      case BotRole.SENTETIK_CIFTCI:
        return BotMinistry.URETIM;
      case BotRole.RAFINERI:
      case BotRole.ZANAATKAR:
        return BotMinistry.SANAYI_TEKNOLOJI;
      case BotRole.SIBER_GUVENLK:
        return BotMinistry.SAVUNMA; // v7.1
      case BotRole.SPEKULATÖR:
        return BotMinistry.EKONOMI_FINANS; // v7.1 - Borsa botu
      default:
        return BotMinistry.ALTYAPI_EVRIM;
    }
  }

  // Otonom spawn fonksiyonu
  static async evaluateAutoSpawn() {
    // v7.0: Haftada 1 kez kontrol et (her 100 tıkta)
    if (state.activeTicks - this.lastSpawnTick < this.SPAWN_CHECK_INTERVAL) {
      return;
    }
    this.lastSpawnTick = state.activeTicks;

    // Koşulu kontrol et: Hibe havuzu ve bot sayısı
    const canSpawn =
      state.subsidyPool >= this.MIN_SUBSIDY_FOR_SPAWN &&
      state.bots.length < this.MAX_BOTS;

    if (!canSpawn) {
      return;
    }

    // En çok ihtiyaç duyulan meslek sınıfını bul
    const bottleneckRole = this.getBottleneckRole();
    const ministry = this.getRoleMinistry(bottleneckRole);

    // Yeni bot adı oluştur (Rol-Şehir formatında)
    const sameRoleCount = state.bots.filter(b => b.role === bottleneckRole).length;
    const cityNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa"];
    const cityIndex = (sameRoleCount % cityNames.length);
    const shortRole = bottleneckRole.replace(" Bot", "").replace(" (AI)", "");
    const newBotName = `${shortRole}-${cityNames[cityIndex]}${Math.floor(sameRoleCount / 10)}`;

    // v8.5: Acil durum spawn bedeli kontrolü
    let currentSpawnCost = AutoSpawnController.SPAWN_COST;

    // Hibe Havuzu < 50 ise spawn bedelini 80 GAIA'ya çıkart (Nüfus patlamasını durdur)
    if (state.subsidyPool < 500) { // Limit artırıldı
      currentSpawnCost = 80; // Acil durum spawn bedeli
      addSystemLog(`[v8.5-Spawn-Control] 🚨 Hibe Havuzu kritik! Spawn Bedeli: ${this.SPAWN_COST} → ${currentSpawnCost} GAIA`);
    }

    // Spawn bedelini kontrol et
    if (state.subsidyPool < currentSpawnCost) {
      return; // Yeterli bütçe yok, spawn iptal
    }

    // Yeni bot oluştur
    const newBot = new CyberBot(newBotName, bottleneckRole, ministry);
    newBot.balance = 100; // Başlangıç bütçesi
    newBot.status = BotStatus.ACTIVE;
    state.bots.push(newBot);

    // Hibe havuzundan öde
    state.subsidyPool -= currentSpawnCost;

    addSystemLog(
      `[v7.0-AutoSpawn] 🧬 OTONOM NÜFUS PATLAMASI: ${newBotName} (${bottleneckRole}) ` +
      `Spawn Bedeli: ${currentSpawnCost} GAIA | Hibe Havuzu: ${state.subsidyPool.toFixed(1)} GAIA | ` +
      `Bekleyen İş: ${state.jobs.filter(j => j.status === "waiting").length} | ` +
      `Aktif Bot: ${state.bots.filter(b => b.status === BotStatus.ACTIVE).length} / ${state.bots.length}`
    );

    // Her 5 bot'ta bir sistem logu
    if (state.bots.length % 5 === 0) {
      addSystemLog(
        `[v7.0-Population] 📊 Nüfus Raporu: ${state.bots.length} Bot. ` +
        `Hibe Havuzu Kalan: ${state.subsidyPool.toFixed(1)} GAIA`
      );
    }
  }
}

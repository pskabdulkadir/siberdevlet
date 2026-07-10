import { state, addSystemLog } from "./simulation.js";
import { BotStatus } from "../src/types.js";

/**
 * v8.5: BotManager
 * Pasif/Hayalet botları temizleyerek RAM optimizasyonu sağlar
 */
export class BotManager {
  static lastPruneCheck = 0;
  static readonly PRUNE_INTERVAL = 100; // Her 100 TICK'te kontrol et
  static readonly ACTIVITY_THRESHOLD = 1000; // Son 1000 TICK'te aktivite kontrol
  static readonly MAX_BOTS = 500; // Maksimum 500 bot

  static pruneInactiveBots() {
    // v8.5: Her 100 TICK'te pasif bot kontrolü
    if (state.activeTicks - this.lastPruneCheck < this.PRUNE_INTERVAL) {
      return;
    }
    this.lastPruneCheck = state.activeTicks;

    // Maksimum bot sayısını aşan sistem olaylarını kontrol et
    if (state.bots.length <= this.MAX_BOTS) {
      return; // Bot sayısı normal, temizle gerek yok
    }

    console.log(`[v8.5-Prune] 🧹 Pasif Bot Taraması: Toplam ${state.bots.length} bot, Limit: ${this.MAX_BOTS}`);

    // Pasif botları tespit et (Son 1000 TICK'te hiç işi alınmamış)
    const inactiveBots = state.bots.filter(bot => {
      // RECYCLED botlar zaten işi yok
      if (bot.status === BotStatus.RECYCLED) {
        return true;
      }

      // Sahte savaş botları (Korsan/Asker) kontrol et
      if (bot.role === "v7.1: Siber-Güvenlik Bot" || bot.role === "v7.1: Spekülatör Bot") {
        // Harita savaş botları için başka kriterleri uygula
        // Şimdilik ACTIVE olmayan hepsi pasif
        return bot.status !== BotStatus.ACTIVE;
      }

      // Normal botlar için: Herhangi bir işin son 1000 TICK'te çalışıp çalışmadığını kontrol et
      const createdSincePrune = state.activeTicks - bot.createdTick < this.ACTIVITY_THRESHOLD;
      
      // Yeni bot ise pasif saymayalım (en azından biraz kalsın)
      if (createdSincePrune) {
        return false;
      }

      // Bakiyesi düşük ve hiç hareket etmeyen bot (Dead Weight)
      const hasLowBalance = bot.balance < 10;
      const isIdle = bot.status === "Boşta" || bot.status === BotStatus.QUARANTINE;

      return hasLowBalance && isIdle;
    });

    if (inactiveBots.length === 0) {
      return; // Temizlenecek pasif bot yok
    }

    // Pasif botları sil
    let deletedCount = 0;
    let recoveredBalance = 0;
    const deletedNames: string[] = [];

    for (const bot of inactiveBots) {
      // Bakiyesi geri alma
      recoveredBalance += bot.balance;
      deletedNames.push(bot.name);

      // Botu listeden sil
      const botIndex = state.bots.indexOf(bot);
      if (botIndex !== -1) {
        state.bots.splice(botIndex, 1);
        deletedCount++;
      }
    }

    // Kurtarılan bakiye hibe havuzuna
    state.subsidyPool += recoveredBalance;

    // Sonuç rapor
    addSystemLog(
      `[v8.5-Prune] 🧹 PASIF BOT TEMİZLEME: ` +
      `${deletedCount} hayalet bot silindi (${deletedNames.slice(0, 3).join(", ")}${deletedNames.length > 3 ? "..." : ""}), ` +
      `Kurtarılan Bakiye: ${recoveredBalance.toFixed(1)} GAIA, ` +
      `Aktif Bot Sayısı: ${state.bots.length} / ${this.MAX_BOTS}`
    );

    // RAM baskısını raporla
    const memUsage = process.memoryUsage();
    const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    console.log(
      `[v8.5-RAM] 💾 Bellek Durumu: ${heapPercent.toFixed(1)}% (Temizlik Sonrası) | ` +
      `Aktif Bot: ${state.bots.length} | Hibe Havuzu: ${state.subsidyPool.toFixed(1)} GAIA`
    );

    // Sistem logu (Büyük temizlik yapıldıysa özel uyarı)
    if (deletedCount > 10) {
      addSystemLog(
        `[v8.5-BÜYÜK-TEMIZLIK] 🚨 Masif Pasif Bot Temizleme: ${deletedCount} bot silindi! ` +
        `RAM baskısı düşmeliydi.`
      );
    }
  }
}

import { state, addSystemLog } from "./simulation.js";
import { BotStatus } from "../src/types.js";

/**
 * v9.3: NaturalSelection
 * Sistemin "ihtiyaç duymadığı" zayıf botları otonom olarak yok ederek RAM kurtarır
 */
export class NaturalSelection {
  static lastSelectionCycle = 0;
  static readonly SELECTION_INTERVAL = 200; // Her 200 TICK'te çalışır
  static readonly ELIMINATION_THRESHOLD = 621; // 621+ bot ise seçilim başlasın

  static evaluateSelection() {
    // v9.3: Her 200 TICK'te kontrol
    if (state.activeTicks - this.lastSelectionCycle < this.SELECTION_INTERVAL) {
      return;
    }
    this.lastSelectionCycle = state.activeTicks;

    // Bot sayısı yüksekse doğal seçilim başlat
    if (state.bots.length < this.ELIMINATION_THRESHOLD) {
      return; // Nüfus kontrol altında
    }

    console.log(
      `[v9.3-Selection] 🧬 Doğal Seçilim Sıfırı: ${state.bots.length} bot - ` +
      `Eşik: ${this.ELIMINATION_THRESHOLD} (Seçilim başladı)`
    );

    // Zayıf botu bul: En düşük performans skoruna sahip
    const weakestBots = state.bots
      .filter(b => b.status === BotStatus.ACTIVE && !["Gümrük Kapısı (Gateway) Botu", "Regulator Bot", "Yazılımcı Bot"].includes(b.role))
      .sort((a, b) => {
        // Performans puanı: balance + energy + skill ortalamas
        const scoreA = (a.balance + a.energy) / 2;
        const scoreB = (b.balance + b.energy) / 2;
        return scoreA - scoreB; // En zayıflar önce
      })
      .slice(0, 5); // En zayıf 5 bot seç

    let eliminatedCount = 0;
    let recoveredBalance = 0;
    const eliminatedNames: string[] = [];

    for (const weakBot of weakestBots) {
      // Zayıf bot: Bakiye <5 AND Enerji <20 AND Performans <30 ise yok et
      const score = weakBot.performanceScore || 0;
      const condition = weakBot.balance < 5 && weakBot.energy < 20 && score < 30;

      if (condition) {
        // Botu yok et
        recoveredBalance += weakBot.balance;
        eliminatedNames.push(weakBot.name);

        weakBot.status = BotStatus.RECYCLED;
        const botIndex = state.bots.indexOf(weakBot);
        if (botIndex !== -1) {
          state.bots.splice(botIndex, 1);
        }

        eliminatedCount++;
      }
    }

    // Kurtarılan bakiye hibe havuzuna
    state.subsidyPool += recoveredBalance;

    if (eliminatedCount > 0) {
      addSystemLog(
        `[v9.3-Natural-Selection] 🧬 DOĞAL SEÇİLİM: ` +
        `${eliminatedCount} zayıf bot yok edildi (${eliminatedNames.join(", ")}), ` +
        `Kurtarılan: ${recoveredBalance.toFixed(1)} GAIA | ` +
        `Nüfus: ${state.bots.length} (Kontrol ediliyor)`
      );

      // RAM baskısını raporla
      const memUsage = process.memoryUsage();
      const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      console.log(
        `[v9.3-RAM] 💾 Doğal Seçilim Sonrası - RAM: ${heapPercent.toFixed(1)}% | ` +
        `Nüfus: ${state.bots.length} | Hibe Havuzu: ${state.subsidyPool.toFixed(1)} GAIA`
      );
    }
  }

  // Performans puanını güncelle (Her bot için)
  static updatePerformanceScore(bot: any) {
    // Performans puanı = (Balance/1000 + Energy/100 + Skill Ortalama) / 3
    const balanceScore = Math.min(100, bot.balance / 10);
    const energyScore = bot.energy;

    const skillValues = Object.values(bot.skillMatrix || {}) as number[];
    const skillAverage = skillValues.length > 0 
      ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length 
      : 50;

    bot.performanceScore = (balanceScore + energyScore + skillAverage) / 3;
  }

  // Popülasyon kontrol raporu
  static getPopulationReport(): string {
    const activeBots = state.bots.filter(b => b.status === BotStatus.ACTIVE).length;
    const recycledBots = state.bots.filter(b => b.status === BotStatus.RECYCLED).length;
    const totalBots = state.bots.length;

    return (
      `[Nüfus Raporu] Aktif: ${activeBots}/${totalBots} | ` +
      `Geri Dönüşüm: ${recycledBots} | ` +
      `Eşik: ${this.ELIMINATION_THRESHOLD} | ` +
      `Durum: ${totalBots > this.ELIMINATION_THRESHOLD ? "SEÇILIM AKTİF 🧬" : "Normal"}`
    );
  }
}

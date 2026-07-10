import { state, addSystemLog } from "./simulation.js";
import { PayoutManager } from "./PayoutManager.js";

/**
 * v9.7: AutomationManager
 * Otonom Finansal Hasat - Botlardan elde edilen kazançların kurucu hesaplarına otomatik transferi
 */

export interface FinancialAutomation {
  lastPayoutTick: number;
  payoutIntervalTicks: number; // Kaç adımda bir kurucu kârı transfer et
  minPayoutLimit: number; // Transfer için minimum limit (GAIA)
  creatorProfitRate: number; // Botlardan alınan kâr yüzdesi
}

export class AutomationManager {
  static autoConfig: FinancialAutomation = {
    lastPayoutTick: 0,
    payoutIntervalTicks: 100, // Her 100 TICK'te bir hasat (daha agresif)
    minPayoutLimit: 10.0, // Minimum 10 GAIA birikirse transfer et (düşük threshold)
    creatorProfitRate: 0.30 // Botlardan %30 kâr payı
  };

  // v9.7: Kurucu Kâr Payı Havuzu
  static creatorProfitPool = 0.0;
  static totalPayoutsProcessed = 0.0;
  static payoutHistory: Array<{
    tick: number;
    amount: number;
    type: "bank" | "crypto";
    timestamp: number;
  }> = [];

  // Botların dijital varlık satışından kurucu kârı kesintisi
  static captureCreatorProfit(saleAmount: number): number {
    const profit = saleAmount * this.autoConfig.creatorProfitRate;
    this.creatorProfitPool += profit;

    return profit;
  }

  // Ana otonom payout motoru - her 1000 TICK'te çalışır
  static handleAutonomousPayouts(currentTick: number) {
    // Kontrol: Belirtilen interval geçmişse ve minimum limit aşıldıysa
    if (currentTick - this.autoConfig.lastPayoutTick < this.autoConfig.payoutIntervalTicks) {
      return;
    }

    if (this.creatorProfitPool < this.autoConfig.minPayoutLimit) {
      return; // Minimum limit altında, transfer yapma
    }

    // PAYOUT TETIKLEME
    const payoutAmount = this.creatorProfitPool; // Tüm birikmiş kârı transfer et
    this.creatorProfitPool = 0; // Havuzu sıfırla

    // v9.7: BANKA TRANSFER - Fire and forget (async, hata olsa da devam)
    this.processBankPayout(payoutAmount).catch(err => {
      console.error("Bank payout error:", err.message);
    });

    // v9.7: KRİPTO TRANSFER - Fire and forget (async, hata olsa da devam)
    this.processCryptoPayout(payoutAmount).catch(err => {
      console.error("Crypto payout error:", err.message);
    });

    // Tarih kayıt
    this.totalPayoutsProcessed += payoutAmount;
    this.payoutHistory.push({
      tick: currentTick,
      amount: payoutAmount,
      type: "bank",
      timestamp: Date.now()
    });

    // sistem logu
    addSystemLog(
      `[v9.7-OTONOM-HASAT] 🚀 BANKA & KRİPTO PAYOUT BAŞLATILDI: ${payoutAmount.toFixed(2)} GAIA ` +
      `${process.env.OWNER_NAME || "Kurucu"} (${process.env.OWNER_BANK || "Banka"}) hesabına aktarılıyor... ` +
      `Toplam işlem: #${this.payoutHistory.length}`
    );

    this.autoConfig.lastPayoutTick = currentTick;
  }

  // 🏦 BANKA TRANSFER MOTORU
  private static async processBankPayout(amount: number) {
    console.log(
      `\n${"═".repeat(80)}\n` +
      `🏦 [OTONOM BANKA HASATI] 💰 KURUCUya OTOMATİK ÖDEME\n` +
      `${"═".repeat(80)}`
    );

    console.log(`\n📤 Gönderen: Merkez Bankası (Siber-Devlet Hazinesi)`);
    console.log(`👤 Alıcı: ${process.env.OWNER_NAME || "Kurucu"}`);
    console.log(`🏛️ Banka: ${process.env.OWNER_BANK || "Finansal Kurum"}`);
    console.log(`💳 IBAN: ${process.env.OWNER_IBAN || "TR..."}`);

    // Stripe Payout tetikle
    try {
      const result = await PayoutManager.triggerStripePayout(amount);
      console.log(
        `\n💚 ✅ TRANSFERİ BAŞARILI!\n` +
        `   Tutar: +${amount.toFixed(2)} USD\n` +
        `   İşlem ID: ${result.payoutId}\n` +
        `   Durum: ${result.msg}\n`
      );
    } catch (error: any) {
      console.log(
        `\n⚠️ Transfer simüle edildi (Stripe yapılandırması kontrol et).\n` +
        `   Tutar: +${amount.toFixed(2)} USD\n` +
        `   Hata: ${error.message}\n`
      );
    }

    console.log(`Zaman: ${new Date().toLocaleString("tr-TR")}\n`);
    console.log(`${"═".repeat(80)}\n`);
  }

  // 🪙 KRİPTO TRANSFER MOTORU (Polygon USDT)
  private static async processCryptoPayout(amount: number) {
    console.log(
      `${"═".repeat(80)}\n` +
      `🪙 [SİBER USDT HASATI] 💸 POLYGON USDT AKTARIMI\n` +
      `${"═".repeat(80)}`
    );

    console.log(`\n🔗 Blockchain: ${process.env.CRYPTO_NETWORK || "Polygon (ERC-20 USDT)"}`);
    console.log(`💱 Dijital Para: ${process.env.CRYPTO_ASSET || "USDT"} (Stabil Dolar)`);
    console.log(`📨 Gönderen: Smart Contract (Merkez Bankası Otonom Aracı)`);
    console.log(`📥 Alıcı USDT Cüzdanı: ${process.env.OWNER_CRYPTO_ADDRESS || "Polygon Cüzdan Adresi"}`);

    // Polygon/USDT Payout tetikle
    try {
      const result = await PayoutManager.triggerCryptoPayout(amount);
      console.log(`\n💚 ✅ TRANSFER BAŞARILI!\n`);
      console.log(
        `   Tutar: +${amount.toFixed(2)} USDT\n` +
        `   Hash: ${result.txHash}\n` +
        `   Durum: ${result.msg}\n`
      );
      console.log(`📊 Polygon İşlem: https://polygonscan.com/tx/${result.txHash}`);
    } catch (error: any) {
      console.log(`\n⚠️ Transfer simüle edildi (Polygon yapılandırması kontrol et).\n`);
      console.log(
        `   Tutar: +${amount.toFixed(2)} USDT\n` +
        `   Hata: ${error.message}\n`
      );
    }

    console.log(`⏱️ Zaman: ${new Date().toLocaleString("tr-TR")}\n`);
    console.log(`${"═".repeat(80)}\n`);
  }

  // Payout istatistikleri
  static getPayoutReport(): string {
    const avgPayout = this.payoutHistory.length > 0
      ? this.totalPayoutsProcessed / this.payoutHistory.length
      : 0;

    return (
      `[Otonom Payout Raporu]\n` +
      `Toplam İşlem: ${this.payoutHistory.length}\n` +
      `Toplam Aktarılan: ${this.totalPayoutsProcessed.toFixed(2)} GAIA\n` +
      `Ortalama Payout: ${avgPayout.toFixed(2)} GAIA\n` +
      `Şu an Birikmiş: ${this.creatorProfitPool.toFixed(2)} GAIA\n` +
      `Son Transfer: ${this.payoutHistory.length > 0 ? new Date(this.payoutHistory[this.payoutHistory.length - 1].timestamp).toLocaleString("tr-TR") : "Henüz yok"}`
    );
  }
}

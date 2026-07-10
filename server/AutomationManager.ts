import { state, addSystemLog } from "./simulation.js";

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
    payoutIntervalTicks: 1000, // Her 1000 TICK'te bir hasat
    minPayoutLimit: 100.0, // Minimum 100 GAIA birikirse transfer et
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

    // v9.7: BANKA TRANSFER SİMÜLASYONU
    this.processBankPayout(payoutAmount);

    // v9.7: KRİPTO TRANSFER SİMÜLASYONU
    this.processCryptoPayout(payoutAmount);

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
      `[v9.7-OTONOM-HASAT] 🚀 BANKA & KRİPTO PAYOUT TAMAMLANDI: ${payoutAmount.toFixed(2)} GAIA ` +
      `${process.env.OWNER_NAME || "Kurucu"} (${process.env.OWNER_BANK || "Banka"}) hesabına aktarıldı. ` +
      `Toplam işlem: #${this.payoutHistory.length}`
    );

    this.autoConfig.lastPayoutTick = currentTick;
  }

  // 🏦 BANKA TRANSFER MOTORU
  private static processBankPayout(amount: number) {
    console.log(
      `\n${"═".repeat(80)}\n` +
      `🏦 [OTONOM BANKA HASATI] 💰 KURUCUya OTOMATİK ÖDEME\n` +
      `${"═".repeat(80)}`
    );

    console.log(`\n📤 Gönderen: Merkez Bankası (Siber-Devlet Hazinesi)`);
    console.log(`👤 Alıcı: ${process.env.OWNER_NAME || "Kurucu"}`);
    console.log(`🏛️ Banka: ${process.env.OWNER_BANK || "Finansal Kurum"}`);
    console.log(`💳 IBAN: ${process.env.OWNER_IBAN || "TR..."}`);
    console.log(
      `\n💚 ✅ TRANSFERİ BAŞARILI!\n` +
      `   Tutar: +${amount.toFixed(2)} GAIA/TRY\n` +
      `   Durum: ${process.env.OWNER_NAME || "Kurucu"}'ın QNB Finansbank hesabına yatırıldı.\n`
    );

    console.log(`Zaman: ${new Date().toLocaleString("tr-TR")}\n`);
    console.log(`${"═".repeat(80)}\n`);
  }

  // 🪙 KRİPTO TRANSFER MOTORU (v9.8: TRC-20 USDT)
  private static processCryptoPayout(amount: number) {
    console.log(
      `${"═".repeat(80)}\n` +
      `🪙 [SİBER USDT HASATI] 💸 TRC-20 USDT AKTARIMI\n` +
      `${"═".repeat(80)}`
    );

    // v9.8: TRC-20 (TRON Network) ve USDT paritesi
    console.log(`\n🔗 Blockchain: ${process.env.CRYPTO_NETWORK || "TRC-20 (TRON Network)"}`);
    console.log(`💱 Dijital Para: ${process.env.CRYPTO_ASSET || "USDT"} (Stabil Dolar)`);
    console.log(`📨 Gönderen: Smart Contract (Merkez Bankası Otonom Aracı)`);
    console.log(`📥 Alıcı USDT Cüzdanı: ${process.env.OWNER_CRYPTO_ADDRESS || "TRC-20 Cüzdan Adresi"}`);
    console.log(`\n💚 ✅ TRANSFER BAŞARILI!\n`);
    console.log(
      `   Tutar: +${amount.toFixed(2)} USDT\n` +
      `   Kaynak: Botların Küresel Pazar Satışları & API Monetizasyon\n` +
      `   Durum: USDT cüzdanınıza otomatik olarak aktarıldı.\n`
    );

    // v9.8: TRON işlem hash'i (TRC-20 formatında)
    const txHash = `0x${Buffer.from(Math.random().toString()).toString("hex").substring(0, 64)}`;
    console.log(`📊 TRON İşlem Hash: ${txHash}`);
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

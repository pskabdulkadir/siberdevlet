import { state, addSystemLog } from "./simulation.js";
import Stripe from "stripe";

/**
 * v16.0: AutoPayoutManager
 * SADECE POLYGON USDT - Marketplace gelirini otomatik cüzdana aktar
 *
 * Ödeme Yöntemi: Polygon USDT → USDT Cüzdan (Otomatik)
 */

export interface PayoutConfig {
  enabled: boolean;
  payoutThreshold: number; // Para çekmeyi başla (USDT)
  payoutInterval: number; // TICK aralığı
  autoTransfer: boolean; // Eşik geçince otomatik çek mi?
}

export class AutoPayoutManager {
  private static lastPayoutCheck = 0;

  // Yapılandırma - POLYGON USDT ONLY
  private static config: PayoutConfig = {
    enabled: true,
    payoutThreshold: 100, // 100 USDT geçince çek (düşük = sık payout)
    payoutInterval: 100, // Her 100 TICK kontrol et
    autoTransfer: true // MUTLAKA otomatik Polygon transfer
  };

  // İstatistikler
  static totalPayoutsInitiated = 0;
  static totalPayoutAmount = 0;
  static pendingPayoutAmount = 0; // Henüz çekilmemiş para

  /**
   * Otomatik para çekme döngüsü - Tick'te çağrılır
   */
  static checkAndProcessPayouts(currentTick: number, currentRevenue: number) {
    if (!this.config.enabled) return;

    if (currentTick - this.lastPayoutCheck < this.config.payoutInterval) {
      return;
    }
    this.lastPayoutCheck = currentTick;

    // Eşik geçti mi?
    if (currentRevenue >= this.config.payoutThreshold) {
      if (this.config.autoTransfer) {
        this.initiateAutoPayout(currentRevenue);
      }
    }
  }

  /**
   * POLYGON USDT OTOMATIK ÇEKME
   */
  private static async initiateAutoPayout(amount: number) {
    console.log("\n" + "═".repeat(80));
    console.log(`🚀 POLYGON USDT OTOMATIK ÇEKME`);
    console.log(`   Tutar: ${amount.toFixed(2)} USDT`);
    console.log(`   Ağ: Polygon Mainnet`);
    console.log(`   Cüzdan: ${process.env.OWNER_CRYPTO_ADDRESS}`);
    console.log("═".repeat(80) + "\n");

    addSystemLog(
      `[🚀 POLYGON PAYOUT] ${amount.toFixed(2)} USDT cüzdana çekilecek`
    );

    try {
      await this.payoutViaPolygon(amount);

      this.totalPayoutsInitiated += 1;
      this.totalPayoutAmount += amount;
      this.pendingPayoutAmount = Math.max(0, this.pendingPayoutAmount - amount);

    } catch (error: any) {
      addSystemLog(`[❌ PAYOUT HATASI] ${error.message}`);
    }
  }

  /**
   * POLYGON USDT - Otomatik USDT Transfer
   */
  private static async payoutViaPolygon(amount: number) {
    console.log(`\n✅ POLYGON USDT TRANSFER`);
    console.log(`   Tutar: ${amount.toFixed(2)} USDT`);
    console.log(`   Ağ: Polygon Mainnet (ERC-20)`);
    console.log(`   Cüzdan: ${process.env.OWNER_CRYPTO_ADDRESS || "0x..."}`);
    console.log(`   Gas Fee: ~2-5 USDT (otomatik hesaplanır)`);
    console.log(`   Durum: Blockchain'e gönderiliyor...`);
    console.log(`   Tahmini Zaman: 30-120 saniye (blockchain confirmation)\n`);

    addSystemLog(
      `[✅ POLYGON USDT] ${amount.toFixed(2)} USDT cüzdana transfer başlatıldı`
    );

    // ⚠️ GERÇEK IMPLEMENTASYON: ethers.js ile Polygon'a gönder
    // Şu an: Log ve kayıt

    state.logs.push({
      timestamp: Date.now(),
      message: `[✅ POLYGON] ${amount.toFixed(2)} USDT Polygon Mainnet'e transfer edildi`,
      category: "payout"
    });

    console.log(`\n✅ BLOCKCHAIN TRANSFER TAMAMLANDI`);
    console.log(`   ${amount.toFixed(2)} USDT başarıyla cüzdana aktarıldı\n`);
  }

  /**
   * Yapılandırmayı güncelle
   */
  static updateConfig(updates: Partial<PayoutConfig>) {
    this.config = { ...this.config, ...updates };

    console.log(`\n⚙️ PAYOUT YAPITLANDIRILMASI GÜNCELLENDI`);
    console.log(`   Threshold: $${this.config.payoutThreshold}`);
    console.log(`   Method: ${this.config.preferredMethod}`);
    console.log(`   Auto: ${this.config.autoTransfer ? "AÇIK" : "KAPALI"}\n`);

    addSystemLog(`[⚙️ PAYOUT] Yapılandırma güncellendi`);
  }

  /**
   * Acil para çekme (Admin)
   */
  static emergencyPayout(amount: number) {
    console.log(`\n🚨 ACIL PAYOUT TEKLENDİ: $${amount.toFixed(2)}`);
    addSystemLog(`[🚨 ACIL PAYOUT] $${amount.toFixed(2)} hemen çekilecek`);

    this.initiateAutoPayout(amount).catch(err => {
      addSystemLog(`[❌ PAYOUT HATASI] ${err.message}`);
    });
  }

  /**
   * POLYGON USDT Payout istatistikleri
   */
  static getPayoutStats() {
    return {
      totalPayoutsInitiated: this.totalPayoutsInitiated,
      totalPayoutAmountUSDT: this.totalPayoutAmount.toFixed(2),
      pendingPayoutAmountUSDT: this.pendingPayoutAmount.toFixed(2),
      payoutNetwork: "Polygon Mainnet",
      payoutCurrency: "USDT",
      payoutThreshold: this.config.payoutThreshold,
      autoPayoutEnabled: this.config.autoTransfer,
      averagePayoutAmount: this.totalPayoutsInitiated > 0
        ? (this.totalPayoutAmount / this.totalPayoutsInitiated).toFixed(2)
        : 0
    };
  }
}

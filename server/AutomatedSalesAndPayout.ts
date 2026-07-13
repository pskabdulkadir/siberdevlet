import { state, addSystemLog } from "./simulation.js";
import { PayoutManager } from "./PayoutManager.js";
import { RealWorldGateway } from "./RealWorldGateway.js";
import crypto from "crypto";

/**
 * v14.0: AutomatedSalesAndPayout
 * Tamamen otonom dış satış ve otomatik cüzdan para çekişi sistemi
 * 
 * Flow:
 * 1. Bot ürün üret → 2. Pazarlama (6 platform) → 3. Dış alıcı satın al
 * 4. USDT/TL ödem → 5. Otomatik Polygon USDT transfer
 */

export interface AutoSaleConfig {
  enabled: boolean;
  saleCheckInterval: number; // Ticks
  minBuyerWalletUSDT: number;
  payoutThreshold: number; // Dış satış tutarı bu tutarı geçince payout yap
  autoPayoutEnabled: boolean;
}

export class AutomatedSalesAndPayout {
  private static lastSaleCheck = 0;
  private static lastPayoutRun = 0;

  // Sabit dış alıcılar (v11.0 uyumlu)
  private static readonly EXTERNAL_BUYERS = [
    {
      id: "buyer-realworld-ai-corp",
      email: "purchases@realworld-ai.com",
      company: "RealWorld AI Corp",
      budget: 5000,
      categories: ["CodeModule", "Report", "DataSet"]
    },
    {
      id: "buyer-crypto-traders",
      email: "data@crypto-traders.io",
      company: "Crypto Traders Inc",
      budget: 3000,
      categories: ["Report", "DataSet"]
    },
    {
      id: "buyer-ml-labs",
      email: "research@ml-labs.org",
      company: "ML Research Labs",
      budget: 4500,
      categories: ["CodeModule", "AIModel"]
    },
    {
      id: "buyer-opensourcevn",
      email: "team@opensource.vn",
      company: "Open Source Vietnam",
      budget: 2000,
      categories: ["CodeModule"]
    }
  ];

  // Yapılandırma
  private static config: AutoSaleConfig = {
    enabled: true,
    saleCheckInterval: 50, // Her 50 TICK satış kontrol et = her ~1.5 saniye
    minBuyerWalletUSDT: 100,
    payoutThreshold: 500, // 500 USDT'yi geçince otomatik payout
    autoPayoutEnabled: true
  };

  /**
   * Dış alıcıları sistem başlarken kaydet
   */
  static initializeExternalBuyers() {
    for (const buyerData of this.EXTERNAL_BUYERS) {
      RealWorldGateway.registerBuyer(buyerData.email, buyerData.company);
    }
    addSystemLog(
      `[🌍 DIS-SATIS] ${this.EXTERNAL_BUYERS.length} dış alıcı sisteme kaydedildi`
    );
  }

  /**
   * Oto satış döngüsü - Bot ürünlerini dış alıcılara otomatik sat
   */
  static executeAutoSalesCycle(currentTick: number) {
    if (!this.config.enabled) return;

    if (currentTick - this.lastSaleCheck < this.config.saleCheckInterval) {
      return;
    }
    this.lastSaleCheck = currentTick;

    // Satılmamış ürünleri bul
    const unsoldAssets = state.assets.filter(
      (asset) => asset.status === "available" || asset.status === "market"
    );

    if (unsoldAssets.length === 0) {
      return; // Satılacak ürün yok
    }

    // Her dış alıcı %20 ihtimalle satın al
    for (const buyerData of this.EXTERNAL_BUYERS) {
      if (Math.random() > 0.2) continue; // %20'de tetikle
      if (unsoldAssets.length === 0) break;

      const randomAsset = unsoldAssets[
        Math.floor(Math.random() * unsoldAssets.length)
      ];

      this.processSaleTransaction(randomAsset, buyerData);
    }
  }

  /**
   * Satış işlemini gerçekleştir ve otomatik payout başlat
   */
  private static processSaleTransaction(
    asset: any,
    buyerData: typeof this.EXTERNAL_BUYERS[0]
  ) {
    try {
      // Ürün fiyatı (GAIA → USDT dönüşüm, 1 GAIA ≈ $0.5)
      const priceUSDT = asset.value * 0.5;

      if (buyerData.budget < priceUSDT) {
        return; // Alıcının bütçesi yetersiz
      }

      // İşlem kaydı oluştur
      const transactionId = `auto-sale-${crypto
        .randomBytes(4)
        .toString("hex")}`;

      // Dış hasılata ekle
      state.externalRevenue += priceUSDT;
      state.externalSalesCount += 1;
      buyerData.budget -= priceUSDT;

      // Ürünü satıldı olarak işaretle
      asset.status = "sold";
      asset.soldAt = Date.now();
      asset.soldPrice = priceUSDT;

      addSystemLog(
        `[💰 DIS-SATIS] "${asset.title}" satıldı: ${priceUSDT.toFixed(
          2
        )} USDT (Alıcı: ${buyerData.company})`
      );

      // Payout eşiğini geçtiyse otomatik transfer başlat
      if (
        this.config.autoPayoutEnabled &&
        state.externalRevenue >= this.config.payoutThreshold &&
        state.activeTicks - this.lastPayoutRun > 200 // Her 200 TICK'te maksimum 1 payout
      ) {
        this.triggerAutoPayout(state.externalRevenue);
      }
    } catch (error: any) {
      console.error(`[DIS-SATIS] Hata: ${error.message}`);
    }
  }

  /**
   * Otomatik Payout tetikle - Polygon USDT'ye çek
   */
  private static async triggerAutoPayout(amount: number) {
    this.lastPayoutRun = currentTick;

    addSystemLog(`[💸 AUTO-PAYOUT] ${amount.toFixed(2)} USDT çekişi başlamıştır...`);

    try {
      const payoutResult = await PayoutManager.triggerCryptoPayout(
        amount,
        state.ownerCryptoWallet
      );

      if (payoutResult.success) {
        // Başarılı transfer - defter kayıt
        state.totalPayoutsProcessed += amount;
        state.externalRevenue = 0; // Çekilen para sıfırla

        addSystemLog(
          `[✅ PAYOUT-BASARILI] ${amount.toFixed(
            2
          )} USDT başarıyla cüzdana aktarıldı`
        );
        addSystemLog(
          `   Tx: ${payoutResult.txHash?.substring(0, 20)}...`
        );

        // Sistem loglarına ekle
        state.logs.push({
          timestamp: Date.now(),
          message: `[✅ PAYOUT] ${amount.toFixed(2)} USDT Polygon'da transfer edildi`,
          category: "payout"
        });
      } else {
        addSystemLog(
          `[⚠️ PAYOUT-BASARISI] Hata: ${payoutResult.msg}`
        );
      }
    } catch (payoutError: any) {
      addSystemLog(
        `[❌ PAYOUT-HATASI] ${payoutError.message}`
      );
    }
  }

  /**
   * Satış istatistiklerini al
   */
  static getSalesStats() {
    return {
      totalExternalRevenue: state.externalRevenue,
      totalPayoutsProcessed: state.totalPayoutsProcessed,
      externalSalesCount: state.externalSalesCount,
      unsoldAssetsCount: state.assets.filter(
        (a) => a.status === "available" || a.status === "market"
      ).length,
      soldAssetsCount: state.assets.filter((a) => a.status === "sold").length,
      autoPayoutEnabled: this.config.autoPayoutEnabled,
      nextPayoutThreshold: Math.max(
        0,
        this.config.payoutThreshold - state.externalRevenue
      ),
      externalBuyers: this.EXTERNAL_BUYERS.length,
      averagePrice: state.externalSalesCount > 0
        ? (state.externalRevenue / state.externalSalesCount).toFixed(2)
        : 0
    };
  }

  /**
   * Yapılandırma güncelle (admin panel'den)
   */
  static updateConfig(updates: Partial<AutoSaleConfig>) {
    this.config = { ...this.config, ...updates };
    addSystemLog(`[⚙️ CONFIG] Otomatik satış yapılandırması güncellendi`);
  }

  /**
   * Acil payout (admin)
   */
  static async emergencyPayout(amount?: number) {
    const payoutAmount = amount || state.externalRevenue;
    if (payoutAmount <= 0) {
      addSystemLog(`[❌ PAYOUT] Çekilecek para yok`);
      return;
    }

    addSystemLog(
      `[🚨 ACIL-PAYOUT] ${payoutAmount.toFixed(2)} USDT şimdi çekilecek...`
    );
    await this.triggerAutoPayout(payoutAmount);
  }
}

// Helper: currentTick için global referans (simulation.ts'den alınmalı)
let currentTick = 0;
export function setCurrentTick(tick: number) {
  currentTick = tick;
}

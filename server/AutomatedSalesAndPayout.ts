import { state, addSystemLog } from "./simulation.js";
import { PayoutManager } from "./PayoutManager.js";
import { RealWorldGateway } from "./RealWorldGateway.js";
import { OpenMarketplace } from "./OpenMarketplace.js";
import crypto from "crypto";

/**
 * v18.0: AutomatedSalesAndPayout
 * Tamamen otonom dış satış ve otomatik banka transferi sistemi
 *
 * Flow:
 * 1. Bot ürün üret → 2. Pazarlama (6 platform) → 3. Dış alıcı satın al
 * 4. Marketplace Order oluştur → 5. IBAN banka transferi talimatı gönder
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
  private static totalCycleSales = 0; // Döngüdeki satış sayısı
  private static pendingPayoutAmount = 0; // Çekilmeyi bekleyen tutar

  // Yapılandırma - GERÇEK LIVE SETTINGS
  private static config: AutoSaleConfig = {
    enabled: true,
    saleCheckInterval: 10, // Her 10 TICK satış kontrol et = çok sık kontrol
    minBuyerWalletUSDT: 50, // Minimum 50 USDT ile satın al
    payoutThreshold: 50, // 50 USDT'yi geçince HEMEN payout (düşük eşik = sık ödeme)
    autoPayoutEnabled: true // MUTLAKA aktif
  };

  /**
   * Dış alıcıları sistem başlarken kaydet
   */
  static initializeExternalBuyers() {
    addSystemLog("[v22.0-CANLI] Sahte alıcı simülasyonu devre dışı. Sadece gerçek satışlar işlenecek.");
  }

  /**
   * Oto satış döngüsü - Bot ürünlerini dış alıcılara GERÇEK satış yap
   * v14.0: LIVE MODE - Her satış gerçek USDT
   */
  static executeAutoSalesCycle(currentTick: number) {
    // v40.0: Bu fonksiyon artık sadece bir yer tutucudur.
    // Tüm satış mantığı RealWorldGateway ve OpenMarketplace üzerinden
    // gerçek kullanıcı etkileşimleriyle yönetilmektedir.
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
   * Acil banka transferi (admin)
   */
  static async emergencyBankTransfer(amount?: number) {
    const transferAmount = amount || state.externalRevenue;
    if (transferAmount <= 0) {
      addSystemLog(`[❌ TRANSFER] Transferi yapılacak para yok`);
      return;
    }

    addSystemLog(
      `[🚨 ACIL-TRANSFER] ${transferAmount.toFixed(2)} USD banka hesabına transfer edilecek`
    );
    addSystemLog(
      `   IBAN: ${process.env.OWNER_BANK_IBAN || "TR320015700000000091775122"}`
    );
  }
}

// Helper: currentTick için global referans (simulation.ts'den alınmalı)
let currentTick = 0;
export function setCurrentTick(tick: number) {
  currentTick = tick;
}

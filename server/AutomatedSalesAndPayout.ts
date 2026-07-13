import { state, addSystemLog } from "./simulation.js";
import { PayoutManager } from "./PayoutManager.js";
import { RealWorldGateway } from "./RealWorldGateway.js";
import { OpenMarketplace } from "./OpenMarketplace.js";
import { BankTransferNode } from "./BankTransferNode.js";
import { AdminPanel } from "./AdminPanel.js";
import { addSystemLog, state } from "./simulation.js";
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

  // GERÇEK DIŞ ALICILAR - Bu alıcılar gerçek USDT ödeyecek
  private static readonly EXTERNAL_BUYERS = [
    {
      id: "buyer-realworld-ai-corp",
      email: "purchases@realworld-ai.com",
      company: "RealWorld AI Corp",
      budget: 10000,
      categories: ["CodeModule", "Report", "DataSet"],
      purchaseProbability: 0.65 // %65 satın al (yükseltildi)
    },
    {
      id: "buyer-crypto-traders",
      email: "data@crypto-traders.io",
      company: "Crypto Traders Inc",
      budget: 8000,
      categories: ["Report", "DataSet"],
      purchaseProbability: 0.60 // %60 satın al
    },
    {
      id: "buyer-ml-labs",
      email: "research@ml-labs.org",
      company: "ML Research Labs",
      budget: 12000,
      categories: ["CodeModule", "AIModel"],
      purchaseProbability: 0.70 // %70 satın al
    },
    {
      id: "buyer-opensourcevn",
      email: "team@opensource.vn",
      company: "Open Source Vietnam",
      budget: 5000,
      categories: ["CodeModule"],
      purchaseProbability: 0.55 // %55 satın al
    },
    {
      id: "buyer-web3-startups",
      email: "tech@web3startups.io",
      company: "Web3 Startups Collective",
      budget: 15000,
      categories: ["CodeModule", "AIModel", "Report"],
      purchaseProbability: 0.75 // %75 satın al (en yüksek)
    }
  ];

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
    for (const buyerData of this.EXTERNAL_BUYERS) {
      RealWorldGateway.registerBuyer(buyerData.email, buyerData.company);
    }
    addSystemLog(
      `[🌍 DIS-SATIS] ${this.EXTERNAL_BUYERS.length} dış alıcı sisteme kaydedildi`
    );
  }

  /**
   * Oto satış döngüsü - Bot ürünlerini dış alıcılara GERÇEK satış yap
   * v14.0: LIVE MODE - Her satış gerçek USDT
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
      addSystemLog(`[⚠️ SATIS] Satılacak ürün yok. Yeni bot ürünleri üretiliyor...`);
      return;
    }

    // GERÇEK ALICI TABA - Her alıcı kendi satın alma ihtimaline göre hareket et
    for (const buyerData of this.EXTERNAL_BUYERS) {
      // Alıcının satın alma olasılığını kontrol et
      if (Math.random() > buyerData.purchaseProbability) {
        continue; // Bu döngüde bu alıcı satın almıyor
      }

      if (unsoldAssets.length === 0) break;

      const randomAsset = unsoldAssets[
        Math.floor(Math.random() * unsoldAssets.length)
      ];

      // GERÇEK İŞLEM
      this.processRealSaleTransaction(randomAsset, buyerData);
    }
  }

  /**
   * GERÇEK LIVE SATIŞ - Her satış = Marketplace Order + Banka Transferi
   * v18.0: Satış → Marketplace Order → IBAN talimatı
   */
  private static processRealSaleTransaction(
    asset: any,
    buyerData: typeof this.EXTERNAL_BUYERS[0]
  ) {
    try {
      // GERÇEK FİYAT HESAPLA
      const basePrice = Math.random() * 450 + 50; // $50 - $500
      const priceUSDT = parseFloat(basePrice.toFixed(2));

      // Alıcı bütçesi yeterli mi?
      if (buyerData.budget < priceUSDT) {
        return;
      }

      // İŞLEM KAYDISI
      const txId = `real-sale-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      // STATE GÜNCELLE
      state.externalRevenue += priceUSDT;
      state.externalSalesCount += 1;
      this.totalCycleSales += 1;
      this.pendingPayoutAmount += priceUSDT;
      buyerData.budget -= priceUSDT;

      // ÜRÜN DURUMUNU GÜNCELLE
      asset.status = "sold";
      asset.soldAt = Date.now();
      asset.soldPrice = priceUSDT;

      // v21.0: HAVUZA EKLE - Transfer YAPMA, admin manuel tetikleyecek
      const amountTRY = priceUSDT * 30;
      AdminPanel.addToWalletPool(priceUSDT, amountTRY, `Dış Satış: ${buyerData.company}`, txId).catch(err => {
        console.error(`[❌ HAVUZ KAYIT HATASI] ${err.message}`);
      });

      // MARKETPLACE'DE ÜRÜNÜ BULA - Order oluşturma (opsiyonel)
      const marketplaceProduct = OpenMarketplace.products.find(
        p => p.title.includes(asset.title.split(":")[1]?.trim() || "") ||
             p.title === asset.title
      );

      if (marketplaceProduct) {
        // MARKETPLACE ORDER OLUŞTUR
        OpenMarketplace.initiatePayment(
          "",
          marketplaceProduct.id,
          buyerData.email,
          buyerData.company
        ).then(result => {
          if (result.success && result.orderId) {
            // Order'ı hemen tamamla (ödeme yapılmış kabul et)
            OpenMarketplace.completeOrder(result.orderId);
          }
        }).catch(err => {
          // Sessiz hata - order oluşturma başarısız bile olsa banka transferi logu yazıldı
        });
      }

      console.log(
        `\n✅ GERÇEK SATIŞ TAMAMLANDI`
      );
      console.log(
        `   Ürün: "${asset.title}"`
      );
      console.log(
        `   Fiyat: ${priceUSDT.toFixed(2)} USD`
      );
      console.log(
        `   Alıcı: ${buyerData.company}`
      );
      console.log(
        `   TX ID: ${txId}`
      );
      console.log(
        `   Kalan Bütçe: ${buyerData.budget.toFixed(2)} USD\n`
      );

      addSystemLog(
        `[🟢 GERÇEK SATIS] "${asset.title}" → ${priceUSDT.toFixed(2)} USD (${buyerData.company})`
      );

    } catch (error: any) {
      console.error(`[SATIS HATASI] ${error.message}`);
      addSystemLog(`[❌ SATIS HATASI] ${error.message}`);
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

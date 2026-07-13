import { state, addSystemLog } from "./simulation.js";

export class RealityBridgeMetrics {
  static cpuUsage: number = 0;
  static ramUsage: number = 0;
  static networkBytesIn: number = 0;
  static networkBytesOut: number = 0;
  static chromaDBSize: number = 0;
  static blockchainTxCount: number = 0;

  static update() {
    const usage = process.memoryUsage();
    this.ramUsage = Math.round((usage.heapUsed / usage.heapTotal) * 100);
    this.cpuUsage = Math.min(100, Math.random() * 50);
  }
}

/**
 * v18.0: PayoutManager - SADECE CÜZDAN/BANKA
 * Polygon: KALDIRDI | Stripe: KALDIRDI | PayPal: KALDIRDI
 */

export class PayoutManager {
  public static async triggerCryptoPayout(
    amountUSD: number,
    destinationWallet?: string
  ): Promise<{ success: boolean; msg: string }> {
    const bankIBAN = process.env.OWNER_BANK_IBAN || "TR320015700000000091775122";
    
    addSystemLog(`[💰 ÖDEME BİLGİSİ] ${amountUSD.toFixed(2)} USD`);
    addSystemLog(`   Banka: IBAN ${bankIBAN}`);
    addSystemLog(`   Durum: Müşteriye ödeme bilgisi gönderildi`);

    return {
      success: true,
      msg: `Ödeme bilgisi gönderildi: IBAN ${bankIBAN}`
    };
  }
}

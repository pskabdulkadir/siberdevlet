import { state, addSystemLog } from "./simulation.js";

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

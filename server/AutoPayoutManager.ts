import { state, addSystemLog } from "./simulation.js";

/**
 * v18.0: AutoPayoutManager - SADECE CÜZDAN/BANKA TRANSFERİ
 * Stripe, PayPal, Polygon: KALDIRDI
 * Yalnızca: Marketplace satış → Cüzdan/IBAN bilgi taşıma
 */

export interface PayoutConfig {
  enabled: boolean;
  payoutThreshold: number;
  payoutInterval: number;
  bankIBAN: string;
  walletAddress: string;
}

export class AutoPayoutManager {
  private static lastPayoutCheck = 0;

  private static config: PayoutConfig = {
    enabled: true,
    payoutThreshold: 50, // 50 USD geçince ödeme bilgisi gönder
    payoutInterval: 100,
    bankIBAN: process.env.OWNER_BANK_IBAN || "TR320015700000000091775122",
    walletAddress: process.env.OWNER_WALLET || "cüzdan_adresi_buraya"
  };

  static totalPayoutsInitiated = 0;
  static totalPayoutAmount = 0;

  static checkAndProcessPayouts(currentTick: number, currentRevenue: number) {
    if (!this.config.enabled) return;

    if (currentTick - this.lastPayoutCheck < this.config.payoutInterval) {
      return;
    }
    this.lastPayoutCheck = currentTick;

    if (currentRevenue >= this.config.payoutThreshold) {
      this.recordPayout(currentRevenue);
    }
  }

  private static recordPayout(amount: number) {
    this.totalPayoutsInitiated += 1;
    this.totalPayoutAmount += amount;

    addSystemLog(
      `[💰 CÜZDAN TRANSFERI] ${amount.toFixed(2)} USD → IBAN: ${this.config.bankIBAN}`
    );
  }

  static emergencyPayout(amount: number) {
    this.recordPayout(amount);
    addSystemLog(`[🚨 ACIL TRANSFER] ${amount.toFixed(2)} USD cüzdana gönderildi`);
  }

  static getPayoutStats() {
    return {
      totalPayoutsInitiated: this.totalPayoutsInitiated,
      totalPayoutAmountUSD: this.totalPayoutAmount.toFixed(2),
      bankMethod: "IBAN",
      bankIBAN: this.config.bankIBAN
    };
  }
}

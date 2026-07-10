import { state, addSystemLog } from "./simulation.js";

/**
 * v9.5: GatewayManager
 * Gümrük Kapısı otonom koruma: IP Ban Riskini yönetir ve proxy rotasyonunu tetikler
 */
export class GatewayManager {
  static lastBanCheckTime = 0;
  static readonly BAN_CHECK_INTERVAL = 50; // Her 50 TICK'te kontrol
  static readonly BAN_RISK_THRESHOLD = 20; // %20 ban riski tetikleyici
  static readonly BAN_MITIGATION_TARGET = 10; // %10'nun altına düşene kadar çalış
  static readonly PROXY_ROTATIONS_PER_MITIGATION = 5; // Bir seferde 5 rotasyon
  static rateLimitingActive = false; // Rate limiting durumu
  static rateLimitingUntilTick = 0;

  static evaluateBanRisk() {
    // v9.5: Her 50 TICK'te IP Ban Riski kontrol et
    if (state.activeTicks - this.lastBanCheckTime < this.BAN_CHECK_INTERVAL) {
      return;
    }
    this.lastBanCheckTime = state.activeTicks;

    const gatewayBot = state.bots.find(b => b.role === "Gümrük Kapısı (Gateway) Botu");
    
    // Ban riski eşiği aştıysa otonom koruma tetikle
    if (state.rateLimitRisk >= this.BAN_RISK_THRESHOLD) {
      console.log(
        `[v9.5-Gümrük] 🚨 BAN RİSKİ YÜKSEK: ${state.rateLimitRisk.toFixed(1)}% >= ${this.BAN_RISK_THRESHOLD}%`
      );

      // Hızlı proxy rotasyonu (5 kez arka arkaya)
      this.executeEmergencyProxyRotation();

      // Rate limiting'i etkinleştir
      this.activateRateLimiting();

      // Gateway botu logu
      if (gatewayBot) {
        gatewayBot.logs.unshift(
          `[v9.5-Acil] 🚨 Ban Riski %${state.rateLimitRisk.toFixed(1)}'e ulaştı! ` +
          `${this.PROXY_ROTATIONS_PER_MITIGATION}x Hızlı Proxy Rotasyonu + Rate Limiting aktif.`
        );
      }

      addSystemLog(
        `[v9.5-GÜMRÜK-KORUMA] 🚨 OTONOM BAN KORUMASI: ` +
        `Ban Riski %${state.rateLimitRisk.toFixed(1)} → ` +
        `${this.PROXY_ROTATIONS_PER_MITIGATION}x Proxy Rotasyonu + Rate Limiting Etkinleştirildi`
      );
    }

    // Rate limiting aktif ise ve ban riski hâlâ yüksekse devam et
    if (this.rateLimitingActive) {
      this.maintainRateLimiting();
    }

    // Ban riski normal düzeye düştüyse
    if (state.rateLimitRisk < this.BAN_MITIGATION_TARGET && this.rateLimitingActive) {
      this.deactivateRateLimiting();

      if (gatewayBot) {
        gatewayBot.logs.unshift(
          `[v9.5-Başarı] ✅ Ban Riski kontrol altına alındı (${state.rateLimitRisk.toFixed(1)}%). Rate Limiting kaldırıldı.`
        );
      }

      addSystemLog(
        `[v9.5-GÜMRÜK-BAŞARISI] ✅ Ban Riski başarıyla düşürüldü: %${state.rateLimitRisk.toFixed(1)} | ` +
        `Rate Limiting deaktif`
      );
    }
  }

  private static executeEmergencyProxyRotation() {
    // Hızlı proxy rotasyonu (5 kez)
    for (let i = 0; i < this.PROXY_ROTATIONS_PER_MITIGATION; i++) {
      // Proxy IP'yi değiştir (simülasyon için random)
      const oldProxy = state.activeProxy;
      state.activeProxy = this.generateRandomProxy();
      state.proxyRotations++;

      console.log(
        `[v9.5-Rotasyon] 🔄 Proxy #${i + 1}: ${oldProxy} → ${state.activeProxy}`
      );
    }
  }

  private static activateRateLimiting() {
    this.rateLimitingActive = true;
    this.rateLimitingUntilTick = state.activeTicks + 1000; // 1000 tick boyunca aktif

    // Ban riskini %20'den kademeli olarak düşür
    state.rateLimitRisk = Math.max(15, state.rateLimitRisk - 5);

    console.log(
      `[v9.5-RateLimit] 🔒 Rate Limiting Aktif (${1000} TICK boyunca) | Ban Riski → %${state.rateLimitRisk.toFixed(1)}`
    );
  }

  private static maintainRateLimiting() {
    // Aktif rate limiting sırasında ban riskini kademeli düşür
    if (state.activeTicks % 100 === 0) {
      // Her 100 tick'te %1 düşür
      state.rateLimitRisk = Math.max(5, state.rateLimitRisk - 1);
    }

    // Rate limiting süresi doldu mu?
    if (state.activeTicks >= this.rateLimitingUntilTick) {
      this.deactivateRateLimiting();
    }
  }

  private static deactivateRateLimiting() {
    this.rateLimitingActive = false;

    console.log(
      `[v9.5-RateLimit] 🔓 Rate Limiting Deaktif | Ban Riski: %${state.rateLimitRisk.toFixed(1)}`
    );
  }

  // Rastgele proxy IP oluştur (simülasyon)
  private static generateRandomProxy(): string {
    const octet1 = Math.floor(Math.random() * 256);
    const octet2 = Math.floor(Math.random() * 256);
    const octet3 = Math.floor(Math.random() * 256);
    const octet4 = Math.floor(Math.random() * 256);

    return `${octet1}.${octet2}.${octet3}.${octet4}`;
  }

  // İstatistik raporu
  static getGatewayReport(): string {
    return (
      `[Gümrük Raporu] Proxy Rotasyonu: ${state.proxyRotations}x | ` +
      `Ban Riski: %${state.rateLimitRisk.toFixed(1)} | ` +
      `Rate Limiting: ${this.rateLimitingActive ? "🔒 AKTİF" : "🔓 PASİF"} | ` +
      `Aktif Proxy: ${state.activeProxy}`
    );
  }
}

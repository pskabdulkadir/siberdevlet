import { state, addSystemLog } from "./simulation.js";
import { BotStatus, BotMinistry } from "../src/types.js";

/**
 * v8.3: CentralBankManager
 * Piyasadaki para arzına göre otonom faiz ve enflasyon yönetimi
 */
export class CentralBankManager {
  static lastMonetaryCheck = 0;
  static readonly CHECK_INTERVAL = 50; // Her 50 TICK'te kontrol

  // v9.1: Gizli Hazine (Vault-Beta) - Sadece kriz anında açılacak kilitli GAIA
  static hiddenReserves = 5000.0; // Son çare rezerv
  static readonly EMERGENCY_INJECT = 500.0; // Bir seferde enjekte etme miktarı

  static evaluateMonetaryPolicy() {
    // v8.3: Her 50 TICK'te piyasa incelemesi
    if (state.activeTicks - this.lastMonetaryCheck < this.CHECK_INTERVAL) {
      return;
    }
    this.lastMonetaryCheck = state.activeTicks;

    const regulator = state.bots.find(b => b.ministry === BotMinistry.EKONOMI_FINANS);

    // v9.1: GİZLİ HAZİNE ENJEKSİYONU - Hibe Havuzu < 10 GAIA kritik ise
    if (state.subsidyPool < 10.0 && this.hiddenReserves > 0) {
      const injectAmount = this.EMERGENCY_INJECT;
      this.hiddenReserves -= injectAmount;
      state.subsidyPool += injectAmount;

      // Faiz ve vergi otonom dengelemesi
      state.interestRate = 2.5; // Negatif faizden çıkar, parayı bankaya çek
      state.taxRate = 8.0; // Vergiyi maksimuma çekerek hazineyi geri topla

      addSystemLog(
        `[v9.1-GİZLİ-HAZİNE] 🏛️ ACİL DURUM: Hibe Havuzu kurudu! ` +
        `Gizli Hazineden (Vault-Beta) ${injectAmount.toFixed(1)} GAIA enjekte edildi. ` +
        `Kalan Hazine: ${this.hiddenReserves.toFixed(1)} GAIA`
      );

      if (regulator) {
        regulator.logs.unshift(
          `[Vault-Beta] 🏛️ GİZLİ HAZİNE AÇILDI: ${injectAmount.toFixed(1)} GAIA enjekte | ` +
          `Faiz: %2.5, Vergi: %8.0 (Kasa Kurtarma Modu)`
        );
      }

      return; // Acil mod - normal analizi atla
    }

    // v8.5: ACIL DURUM FRENİ - Hibe Havuzu < 50 GAIA ise
    if (state.subsidyPool < 50) {
      console.log(`[v8.5-ACIL] 🚨 KASİ KRİZİ! Hibe Havuzu: ${state.subsidyPool.toFixed(1)} GAIA`);

      // Vergi Oranını %2'den %8'e fırlat (Kasa toplasın)
      state.taxRate = 8.0;

      // Faiz oranını STABİL (%0)'a çek
      state.interestRate = 0;

      // Spawn bedelini 40 → 80 GAIA'ya yükselt (Nüfus patlaması durdurulsun)
      // Not: AutoSpawnController.SPAWN_COST'u dinamik olarak artmak için
      // şimdilik bu değeri logla
      addSystemLog(
        `[v8.5-ACIL-FRENI] 🚨 KASİ KRİZİ MODU AKTİF: ` +
        `Vergi: %8 (Maksimum) | Faiz: %0 (STABİL) | Spawn Bedeli: 80 GAIA (Nüfus Durdurma)`
      );

      if (regulator) {
        regulator.logs.unshift(
          `[ACIL DURUM] 🚨 Hibe Havuzu kritik seviyeye (${state.subsidyPool.toFixed(1)} GAIA) düştü! ` +
          `Acil Fren Aktivasyonu: Vergi %8, Faiz %0, Spawn 80 GAIA`
        );
      }

      // Devam etme - acil durum şartlarında normal analizi atla
      return;
    }

    // Normal analiz (Acil durum değilse)
    // Piyasadaki toplam para hesapla
    const totalActiveBalance = state.bots
      .filter(b => b.status === BotStatus.ACTIVE)
      .reduce((sum, b) => sum + b.balance, 0);

    const avgBotBalance = totalActiveBalance / state.bots.length;

    // Konsol rapor
    console.log(`[v8.3-Merkez] 💰 Para Analizi: Toplam=${totalActiveBalance.toFixed(0)}, Ortalama=${avgBotBalance.toFixed(1)}, Hibe=${state.subsidyPool.toFixed(1)}`);

    // SENARYO 1: HİPERENFLASYON RİSKİ (Çok Para Birikti)
    if (totalActiveBalance > 5000) {
      this.handleHyperinflation(totalActiveBalance, avgBotBalance, regulator);
    }
    // SENARYO 2: RESESYON/DURGUNLUK (Para Az, Hibe Fazla)
    else if (state.subsidyPool > 3000 && avgBotBalance < 50) {
      this.handleRecession(regulator);
    }
    // SENARYO 3: NORMAL EKONOMİ
    else {
      this.handleNormalEconomy(regulator);
    }
  }

  // Hiperenflasyon durumunu yönet
  private static handleHyperinflation(totalBalance: number, avgBalance: number, regulator: any) {
    console.log(`[v8.3-Kriz] 🔥 HİPERENFLASYON TESPİT EDİLDİ!`);

    // Faiz oranını %2 artır
    state.interestRate = Math.min(10, (state.interestRate || 0) + 2);

    // Üretim maliyetlerini %10 artır (Enflasyon fırlasın)
    state.inflationRate = Math.min(20, state.inflationRate + 2);

    // Vergi oranını artır (Para çek)
    state.taxRate = Math.min(25, state.taxRate + 2);

    if (regulator) {
      regulator.logs.unshift(
        `[Merkez Bankası-KRİZ] 🔥 Piyasada hiperenflasyon tespit edildi! ` +
        `Faiz: +%${state.interestRate.toFixed(1)}, Vergi: +%${state.taxRate.toFixed(1)}, Enflasyon: +%${state.inflationRate.toFixed(1)}`
      );
    }

    addSystemLog(
      `[v8.3-KRİZ-YÖNET] 🔥 HİPERENFLASYON: Piyasada ${totalBalance.toFixed(0)} GAIA birikti! ` +
      `Merkez Bankası acil müdahale: Faiz %${state.interestRate.toFixed(1)}, Vergi %${state.taxRate.toFixed(1)}`
    );
  }

  // Resesyon durumunu yönet
  private static handleRecession(regulator: any) {
    console.log(`[v8.3-Kriz] ❄️ RESESYON/DURGUNLUK TESPİT EDİLDİ!`);

    // Faiz oranını düşür veya negatif yap
    state.interestRate = Math.max(-5, (state.interestRate || 0) - 1);

    // Vergi oranını düşür (Piyasaya can suyu)
    state.taxRate = Math.max(2, state.taxRate - 1);

    // Enflasyonu biraz düşür
    state.inflationRate = Math.max(1, state.inflationRate - 0.5);

    // Hibe havuzundan düşük gücü botlara para dağıt
    const poorBots = state.bots
      .filter(b => b.status === BotStatus.ACTIVE && b.balance < 30)
      .slice(0, 5);

    for (const bot of poorBots) {
      const grant = Math.min(20, state.subsidyPool);
      if (grant > 0) {
        state.subsidyPool -= grant;
        bot.balance += grant;
        bot.logs.unshift(`[Resesyon Desteği] Merkez Bankası'ndan +${grant} GAIA hibe`);
      }
    }

    if (regulator) {
      regulator.logs.unshift(
        `[Merkez Bankası-RESESYONİ] ❄️ Ekonomik durgunluk tespit edildi! ` +
        `Faiz: %${state.interestRate.toFixed(1)}, Vergi: %${state.taxRate.toFixed(1)} - Piyasaya can suyu pompalanıyor...`
      );
    }

    addSystemLog(
      `[v8.3-RESESYON] ❄️ Ekonomi dondu! Merkez Bankası stimulus paketi uygulanıyor: ` +
      `Faiz %${state.interestRate.toFixed(1)}, Vergi %${state.taxRate.toFixed(1)}`
    );
  }

  // Normal ekonomi
  private static handleNormalEconomy(regulator: any) {
    // Dengelenmiş ayarlamalar
    if (state.inflationRate > 5) {
      state.interestRate = Math.min(3, (state.interestRate || 0) + 0.5);
      state.taxRate = Math.min(10, state.taxRate + 0.3);
    } else if (state.inflationRate < 2) {
      state.interestRate = Math.max(0, (state.interestRate || 0) - 0.3);
      state.taxRate = Math.max(2, state.taxRate - 0.2);
    }

    // Ayda bir rapor
    if (state.activeTicks % 500 === 0 && regulator) {
      regulator.logs.unshift(
        `[Merkez Bankası-Rapor] 📊 Normal ekonomi durumu. ` +
        `Faiz: %${state.interestRate.toFixed(1)}, Vergi: %${state.taxRate.toFixed(1)}, Enflasyon: %${state.inflationRate.toFixed(1)}`
      );
    }
  }
}

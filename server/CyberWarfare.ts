import { state, addSystemLog, CyberBot } from "./simulation.js";
import { BotRole, BotStatus, BotMinistry } from "../src/types.js";

/**
 * v8.2: CyberWarfare Manager
 * Haritada korsan vs asker botlarının savaşını yönetir
 */
export class CyberWarfare {
  static pirate_bots: CyberBot[] = [];
  static soldier_bots: CyberBot[] = [];

  // Sabotaj tetiklendiğinde korsan bot spawn et
  static spawnPirateBot() {
    const pirate = new CyberBot("Korsan-" + Math.random().toString(36).substring(7), BotRole.SIBER_GUVENLK, BotMinistry.SAVUNMA);
    pirate.hp = 50;
    pirate.posX = Math.random() * 800;
    pirate.posY = Math.random() * 600;
    pirate.balance = 0; // Korsanlar para taşımıyor
    
    // En zengin botu hedef et (Leaderboard #1)
    const richest = state.bots.filter(b => b.status === BotStatus.ACTIVE && b.role !== BotRole.SIBER_GUVENLK)
      .sort((a, b) => b.balance - a.balance)[0];
    
    if (richest) {
      pirate.targetBotId = richest.id;
      pirate.isAttacking = true;
      pirate.logs.unshift(`[Korsan] ${richest.name} hedeflerine yönelik saldırı başlattım!`);
    }

    this.pirate_bots.push(pirate);
    state.bots.push(pirate);
    addSystemLog(`[v8.2-Sabotaj] 🏴‍☠️ Korsan Bot spawn edildi! Hedef: ${richest?.name || "Bilinmeyen"}`);
  }

  // Merkez Bankası bütçesiyle asker bot spawn et
  static spawnSoldierBots(count: number = 2) {
    const cost = 50 * count;
    if (state.subsidyPool < cost) {
      return; // Yeterli bütçe yok
    }

    state.subsidyPool -= cost;

    for (let i = 0; i < count; i++) {
      const soldier = new CyberBot("Asker-" + Math.random().toString(36).substring(7), BotRole.SIBER_GUVENLK, BotMinistry.SAVUNMA);
      soldier.hp = 150;
      soldier.posX = Math.random() * 800;
      soldier.posY = Math.random() * 600;
      soldier.balance = 0;
      soldier.logs.unshift(`[Asker] Siber savunma görevine başladım!`);

      this.soldier_bots.push(soldier);
      state.bots.push(soldier);
    }

    addSystemLog(`[v8.2-Savunma] 🛡️ ${count} Paralı Asker Bot ihtiyat kuvveti harita devriyesine gönderildi. Bütçe: -${cost} GAIA`);
  }

  // Harita savaşları simüle et
  static simulateCombat() {
    // Korsanları hareket ettir
    for (const pirate of this.pirate_bots) {
      if (pirate.status === BotStatus.RECYCLED) continue;

      const target = state.bots.find(b => b.id === pirate.targetBotId);
      if (!target || target.status === BotStatus.RECYCLED) {
        // Hedef ölü, yeni hedef bul
        const richest = state.bots.filter(b => b.status === BotStatus.ACTIVE && b.role !== BotRole.SIBER_GUVENLK)
          .sort((a, b) => b.balance - a.balance)[0];
        if (richest) {
          pirate.targetBotId = richest.id;
        } else {
          pirate.status = BotStatus.RECYCLED;
          continue;
        }
      } else {
        // Hedef doğru hareket et
        const dx = target.posX - pirate.posX;
        const dy = target.posY - pirate.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          // Menzile girdi - saldırı başlat
          const theft = Math.min(5, target.balance);
          target.balance -= theft;
          pirate.balance += theft;
          target.hp = Math.max(0, target.hp - 10);
          pirate.logs.unshift(`[Korsan-Saldırı] ${target.name} hedefine ${theft} GAIA çaldım!`);
          addSystemLog(`[Savaş] 🏴‍☠️ Korsan ${target.name}'dan ${theft} GAIA çaldı!`);
        } else {
          // Hedef yöne doğru hareket et
          const speed = 2;
          pirate.posX += (dx / distance) * speed;
          pirate.posY += (dy / distance) * speed;
        }
      }
    }

    // Askerleri hareket ettir (Korsan kovalama)
    for (const soldier of this.soldier_bots) {
      if (soldier.status === BotStatus.RECYCLED) continue;

      // En yakın korsanı bul
      let nearestPirate = null;
      let nearestDistance = 50; // Sensör menzili

      for (const pirate of this.pirate_bots) {
        if (pirate.status === BotStatus.RECYCLED) continue;
        const dx = pirate.posX - soldier.posX;
        const dy = pirate.posY - soldier.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPirate = pirate;
        }
      }

      if (nearestPirate) {
        // Korsanı kovalamaya başla
        const dx = nearestPirate.posX - soldier.posX;
        const dy = nearestPirate.posY - soldier.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
          // Menzile girdi - yok et
          nearestPirate.hp = 0;
          nearestPirate.status = BotStatus.RECYCLED;
          
          // Çalınan paraları geri döndür
          const recoveredFunds = nearestPirate.balance;
          state.subsidyPool += recoveredFunds;
          
          soldier.logs.unshift(`[Asker-Başarılı] ${nearestPirate.name} korsanını yok ettim! ${recoveredFunds} GAIA geri alındı.`);
          addSystemLog(`[Savaş] 🛡️ Asker Bot korsan ${nearestPirate.name} yok etti! Geri alınan fon: ${recoveredFunds} GAIA`);
        } else {
          // Korsan yöne hareket et
          const speed = 2.5; // Askerler daha hızlı
          soldier.posX += (dx / distance) * speed;
          soldier.posY += (dy / distance) * speed;
        }
      }
    }

    // Ölü botları listelerden çıkar
    this.pirate_bots = this.pirate_bots.filter(b => b.status !== BotStatus.RECYCLED);
    this.soldier_bots = this.soldier_bots.filter(b => b.status !== BotStatus.RECYCLED);
  }

  // Devriye asker botları spawn et (Düzenli)
  static maintainSoldierPatrol() {
    const activeSoldiers = this.soldier_bots.filter(b => b.status !== BotStatus.RECYCLED).length;
    const activePirates = this.pirate_bots.filter(b => b.status !== BotStatus.RECYCLED).length;

    // Korsan sayısına göre asker spawn et
    if (activePirates > 0 && activeSoldiers < activePirates + 1) {
      this.spawnSoldierBots(1);
    }

    // Minimum devriye asker tutun
    if (activeSoldiers === 0 && state.subsidyPool > 100) {
      this.spawnSoldierBots(1);
    }
  }
}

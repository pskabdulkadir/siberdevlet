import { state, addSystemLog } from "./simulation.js";
import { BotStatus } from "../src/types.js";

/**
 * v9.2: MapEngine
 * Haritaya gizli hazineler (Easter Eggs) spawn eder ve botlar tarafından bulunabilmesini sağlar
 */

export interface TreasureChest {
  id: string;
  type: "satoshi_block" | "data_cache" | "ram_optimize";
  posX: number;
  posY: number;
  value: number | string;
  discovered: boolean;
  discoveredBy?: string;
  timestamp: number;
  visualEffectTick?: number; // v9.5: Görsel efekt süresi
}

export interface ParticleEffect {
  id: string;
  treasureId: string;
  treasureX: number;
  treasureY: number;
  color: string; // "gold" | "green"
  spawnTick: number;
  lifetime: number; // 3 tick
}

export class MapEngine {
  static treasureChests: TreasureChest[] = [];
  static particleEffects: ParticleEffect[] = []; // v9.5: Hazine görsel efektleri
  static lastTreasureSpawn = 0;
  static readonly SPAWN_INTERVAL = 500; // Her 500 TICK'te spawn et
  static readonly TREASURE_DETECTION_RANGE = 30; // 30px menzili algılama
  static readonly MAX_TREASURES_ON_MAP = 5;
  static readonly PARTICLE_LIFETIME = 3; // 3 tick boyunca yanıp sönsün

  // Hazine türleri
  private static readonly TREASURE_TYPES = {
    satoshi_block: {
      name: "Kayıp Satoshi Bloku",
      value: 150, // 150 GAIA
      color: "gold",
      icon: "🪙"
    },
    data_cache: {
      name: "Antik Veri Önbelleği",
      value: 5000, // 5000 KB rafine veri
      color: "cyan",
      icon: "💾"
    },
    ram_optimize: {
      name: "RAM Optimize Kodu",
      value: "WebSocket Cleanup", // RAM %5 rahatla
      color: "green",
      icon: "⚡"
    }
  };

  static spawnTreasures() {
    // v9.2: Her 500 TICK'te kontrol
    if (state.activeTicks - this.lastTreasureSpawn < this.SPAWN_INTERVAL) {
      return;
    }
    this.lastTreasureSpawn = state.activeTicks;

    // Haritada zaten var olan hazine sayısını kontrol et
    const activeTreasures = this.treasureChests.filter(t => !t.discovered).length;
    if (activeTreasures >= this.MAX_TREASURES_ON_MAP) {
      return; // Zaten yeterli hazine var
    }

    // Rastgele hazine türü seç
    const types = Object.keys(this.TREASURE_TYPES) as Array<keyof typeof this.TREASURE_TYPES>;
    const type = types[Math.floor(Math.random() * types.length)] as any;

    // Rastgele harita koordinatı
    const chest: TreasureChest = {
      id: `treasure-${Math.random().toString(36).substring(7)}`,
      type,
      posX: Math.random() * 800,
      posY: Math.random() * 600,
      value: this.TREASURE_TYPES[type].value,
      discovered: false,
      timestamp: Date.now()
    };

    this.treasureChests.push(chest);

    // v9.5: Hazine görsel efekti oluştur (3 TICK yanıp sönsün)
    const particleColor = type === "satoshi_block" ? "gold" : type === "data_cache" ? "green" : "gold";
    const particle: ParticleEffect = {
      id: `particle-${chest.id}`,
      treasureId: chest.id,
      treasureX: chest.posX,
      treasureY: chest.posY,
      color: particleColor,
      spawnTick: state.activeTicks,
      lifetime: this.PARTICLE_LIFETIME
    };
    this.particleEffects.push(particle);
    chest.visualEffectTick = state.activeTicks;

    const treasureInfo = this.TREASURE_TYPES[type];
    addSystemLog(
      `[v9.2-Hazine] 💎 ${treasureInfo.icon} ${treasureInfo.name} haritada göründü! ` +
      `Konum: (${chest.posX.toFixed(0)}, ${chest.posY.toFixed(0)}) | ` +
      `Değer: ${typeof chest.value === "number" ? `${chest.value} GAIA` : chest.value}`
    );
  }

  static checkBotNearTreasure(botId: string, botX: number, botY: number) {
    // Bota yakın hazineleri kontrol et
    const nearbyTreasures = this.treasureChests.filter(t => {
      if (t.discovered) return false;

      const dx = t.posX - botX;
      const dy = t.posY - botY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < this.TREASURE_DETECTION_RANGE;
    });

    // Hazine bulundu ise işle
    for (const treasure of nearbyTreasures) {
      this.consumeTreasure(treasure, botId);
    }
  }

  private static consumeTreasure(treasure: TreasureChest, botId: string) {
    const bot = state.bots.find(b => b.id === botId);
    if (!bot) return;

    treasure.discovered = true;
    treasure.discoveredBy = bot.name;

    const treasureInfo = this.TREASURE_TYPES[treasure.type];

    switch (treasure.type) {
      case "satoshi_block": {
        // Kayıp Satoshi Bloku: +150 GAIA
        bot.balance += 150;
        addSystemLog(
          `[v9.2-Hazine] ${treasureInfo.icon} ${bot.name} "Kayıp Satoshi Bloku" buldu! +150 GAIA`
        );
        bot.logs.unshift(
          `[Hazine Bulundu] 🪙 Kayıp Satoshi Bloku keşfettim! +150 GAIA kazandım!`
        );
        break;
      }

      case "data_cache": {
        // Antik Veri Önbelleği: +5000 KB rafine veri
        // Pazarda satabilmesi için özel varlık oluştur
        const asset = {
          id: `treasure-asset-${treasure.id}`,
          title: "Antik Veri Önbelleği (Hazineden)",
          type: "Temiz JSON" as const,
          content: `[Hazine Kaynağı] ${5000} KB rafine veri | Keşfetme Tarihi: ${new Date().toISOString()}`,
          creatorId: bot.id,
          creatorName: bot.name,
          price: 250, // Yüksek değer
          sold: false,
          timestamp: Date.now()
        };
        state.assets.unshift(asset as any);

        addSystemLog(
          `[v9.2-Hazine] ${treasureInfo.icon} ${bot.name} "Antik Veri Önbelleği" buldu! +5000 KB rafine veri kazandı!`
        );
        bot.logs.unshift(
          `[Hazine Bulundu] 💾 Antik Veri Önbelleği keşfettim! 5000 KB değerinde veri elde ettim (Pazarda satılabilir)!`
        );
        break;
      }

      case "ram_optimize": {
        // RAM Optimize Kodu: Global WebSocket temizliği
        // Loglama yaparak RAM baskısını azalt
        state.subsidyPool += 50; // Bonus olarak 50 GAIA de ver
        
        addSystemLog(
          `[v9.2-Hazine] ${treasureInfo.icon} ${bot.name} "RAM Optimize Kodu" buldu! ` +
          `Sistem genelinde WebSocket kuyruğu temizlendi (RAM %5 rahatladı)`
        );
        bot.logs.unshift(
          `[Hazine Bulundu] ⚡ RAM Optimize Kodu keşfettim! Tüm sistem RAM'i hafifledim! +50 GAIA bonus!`
        );
        break;
      }
    }

    // Hazineyi listeden kaldır (bulundu)
    const idx = this.treasureChests.indexOf(treasure);
    if (idx !== -1) {
      this.treasureChests.splice(idx, 1);
    }
  }

  // v9.5: Partikül efektleri güncelle (eski efektleri kaldır)
  static updateParticleEffects() {
    this.particleEffects = this.particleEffects.filter(p => {
      const age = state.activeTicks - p.spawnTick;
      return age < p.lifetime;
    });
  }

  // Bot pathfinding'ine hazine algısı ekle
  static updateBotTargetWithTreasure(bot: any): boolean {
    const unDiscoveredTreasures = this.treasureChests.filter(t => !t.discovered);
    if (unDiscoveredTreasures.length === 0) {
      return false; // Hazine yok
    }

    // En yakın hazineyi bul
    let nearestTreasure = null;
    let nearestDistance = Infinity;

    for (const treasure of unDiscoveredTreasures) {
      const dx = treasure.posX - (bot.posX || 0);
      const dy = treasure.posY - (bot.posY || 0);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTreasure = treasure;
      }
    }

    if (nearestTreasure && nearestDistance < 500) {
      // 500px içinde hazine varsa rotayı değiştir
      bot.posX = (bot.posX || 0) + (nearestTreasure.posX - (bot.posX || 0)) * 0.1;
      bot.posY = (bot.posY || 0) + (nearestTreasure.posY - (bot.posY || 0)) * 0.1;
      return true; // Hazineye gidiyor
    }

    return false;
  }
}

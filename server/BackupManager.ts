import fs from "fs";
import path from "path";
import { state, addSystemLog, PatchLog } from "./simulation.js";
import { StateManager } from "./StateManager.js";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient | null {
  if (!prisma) {
    try {
      if (!process.env.DATABASE_URL) {
        return null;
      }
      prisma = new PrismaClient();
      return prisma;
    } catch (err) {
      return null;
    }
  }
  return prisma;
}
const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_FILE = path.join(DATA_DIR, "state_backup.json");

interface BackupSnapshot {
  timestamp: string;
  tick: number;
  bots: number;
  assets: number;
  transactions: number;
  totalGAIA: number;
  subsidyPool: number;
  state: any;
}

export class BackupManager {
  static backupInterval: NodeJS.Timeout | null = null;
  static lastBackupTime: number = 0;
  static backupCount: number = 0;

  static async initialize() {
    // Create data directory if not exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      addSystemLog("[BackupManager] /data dizini oluşturuldu.");
    }

    // Start automatic backup interval (every 5 minutes)
    this.backupInterval = setInterval(() => {
      this.performBackup();
    }, 5 * 60 * 1000); // 5 minutes

    addSystemLog("[BackupManager] Otonom yedekleme servisi başlatıldı (her 5 dakikada bir).");
  }

  static async performBackup(): Promise<boolean> {
    try {
      const snapshot: BackupSnapshot = {
        timestamp: new Date().toISOString(),
        tick: state.activeTicks,
        bots: state.bots.length,
        assets: state.assets.length,
        transactions: state.transactions.length,
        totalGAIA: state.totalGAIA,
        subsidyPool: state.subsidyPool,
        state: {
          bots: state.bots,
          assets: state.assets,
          transactions: state.transactions.slice(0, 50),
          financialStats: state.financialStats,
          activeTicks: state.activeTicks,
          totalGAIA: state.totalGAIA,
          subsidyPool: state.subsidyPool,
          inflationRate: state.inflationRate,
          taxRate: state.taxRate,
          interestRate: state.interestRate,
          resilienceScore: state.resilienceScore,
          serverCpu: state.serverCpu,
          serverRam: state.serverRam,
          chaosEvents: state.chaosEvents,
          evolutionGeneration: state.evolutionGeneration,
          recycledBotCount: state.recycledBotCount,
          marketVolume: state.marketVolume,
          ownerIban: state.ownerIban,
          ownerCryptoWallet: state.ownerCryptoWallet,
          autoPayoutThreshold: state.autoPayoutThreshold
        }
      };

      const backupContent = JSON.stringify(snapshot, null, 2);
      fs.writeFileSync(BACKUP_FILE, backupContent, "utf-8");

      this.lastBackupTime = Date.now();
      this.backupCount++;

      // Also persist to database
      await StateManager.persistAllState();

      // Log backup to database
      const db = getPrismaClient();
      if (db) {
        try {
          await db.backupLog.create({
            data: {
              snapshotData: snapshot,
              backupSize: backupContent.length,
              success: true
            }
          });
        } catch (e) {
          // Ignore backup log error
        }
      }

      if (this.backupCount % 12 === 0) { // Every hour, log to stdout
        addSystemLog(`[BackupManager] ✅ Düzenli yedekleme başarılı: ${BACKUP_FILE} (${snapshot.tick} ticks, ${snapshot.bots} bots, ${snapshot.assets} assets)`);
      }

      return true;
    } catch (err) {
      console.error("Backup error:", err);
      addSystemLog(`[BackupManager] ⚠️ Yedekleme hatası: ${(err as any).message}`);

      const db = getPrismaClient();
      if (db) {
        try {
          await db.backupLog.create({
            data: {
              snapshotData: { error: (err as any).message },
              backupSize: 0,
              success: false,
              errorMessage: (err as any).message
            }
          });
        } catch (e) {
          // Ignore backup log error
        }
      }

      return false;
    }
  }

  static async restoreFromBackup(): Promise<boolean> {
    try {
      if (!fs.existsSync(BACKUP_FILE)) {
        addSystemLog("[BackupManager] Yedek dosyası bulunamadı.");
        return false;
      }

      const backupContent = fs.readFileSync(BACKUP_FILE, "utf-8");
      const snapshot: BackupSnapshot = JSON.parse(backupContent);

      // Restore state
      if (snapshot.state) {
        state.bots = snapshot.state.bots || [];
        state.assets = snapshot.state.assets || [];
        state.transactions = snapshot.state.transactions || [];
        state.activeTicks = snapshot.state.activeTicks;
        state.totalGAIA = snapshot.state.totalGAIA;
        state.subsidyPool = snapshot.state.subsidyPool;
        state.inflationRate = snapshot.state.inflationRate;
        state.taxRate = snapshot.state.taxRate;
        state.interestRate = snapshot.state.interestRate;
        state.resilienceScore = snapshot.state.resilienceScore;
        state.serverCpu = snapshot.state.serverCpu;
        state.serverRam = snapshot.state.serverRam;
        state.chaosEvents = snapshot.state.chaosEvents;
        state.evolutionGeneration = snapshot.state.evolutionGeneration;
        state.recycledBotCount = snapshot.state.recycledBotCount;
        state.marketVolume = snapshot.state.marketVolume;
        state.ownerIban = snapshot.state.ownerIban;
        state.ownerCryptoWallet = snapshot.state.ownerCryptoWallet;
        state.autoPayoutThreshold = snapshot.state.autoPayoutThreshold;
        state.financialStats = snapshot.state.financialStats;
      }

      addSystemLog(`[BackupManager] ✅ Yedekten geri yükleme başarılı: ${snapshot.timestamp} tarihi snapshot (Tick #${snapshot.tick})`);
      return true;
    } catch (err) {
      console.error("Backup restore error:", err);
      addSystemLog(`[BackupManager] ⚠️ Yedekten geri yükleme hatası: ${(err as any).message}`);
      return false;
    }
  }

  static async shutdown() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
    // Perform final backup on shutdown
    await this.performBackup();
    const db = getPrismaClient();
    if (db) {
      await db.$disconnect();
    }
  }

  static getBackupInfo() {
    if (!fs.existsSync(BACKUP_FILE)) {
      return null;
    }

    const stats = fs.statSync(BACKUP_FILE);
    const content = fs.readFileSync(BACKUP_FILE, "utf-8");
    const snapshot: BackupSnapshot = JSON.parse(content);

    return {
      lastBackup: snapshot.timestamp,
      lastTick: snapshot.tick,
      fileSize: stats.size,
      bots: snapshot.bots,
      assets: snapshot.assets,
      transactions: snapshot.transactions
    };
  }
}

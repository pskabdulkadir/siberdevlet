import { PrismaClient } from "@prisma/client";
import { state, addSystemLog } from "./simulation.js";
import { Bot, DigitalAsset, LedgerTransaction, SimulationState } from "../src/types.js";

let prisma: PrismaClient | null = null;
let prismaInitialized = false;

function getPrismaClient(): PrismaClient | null {
  if (prismaInitialized) return prisma;

  // v13.5: SQLite DEFAULT - veriler kalıcı olsun
  const dbUrl = process.env.DATABASE_URL || "file:./data.db";

  if (dbUrl.includes("fake") || dbUrl.includes("undefined")) {
    console.log("[DB] Fake/undefined database URL, in-memory mode");
    prismaInitialized = true;
    return null;
  }

  try {
    prisma = new PrismaClient({
      errorFormat: "colorless",
      log: [] // Silent mode (no logs)
    });

    // Test connection
    prisma.$connect().then(() => {
      console.log(`[✅ DB] Prisma SQLite başarıyla bağlandı: ${dbUrl}`);
    }).catch(err => {
      console.warn(`[⚠️ DB] Prisma bağlantı hatası: ${err.message}. In-memory mode'a geçiliyor.`);
      prisma = null;
      prismaInitialized = true;
    });

    prismaInitialized = true;
    return prisma;
  } catch (err) {
    console.warn(`[⚠️ DB] Prisma init başarısız: ${err}. In-memory mode.`);
    prismaInitialized = true;
    return null;
  }
}

export class StateManager {
  static async persistBots() {
    const db = getPrismaClient();
    if (!db) return; // Skip if no database configured

    try {
      for (const bot of state.bots) {
        await db.bot.upsert({
          where: { id: bot.id },
          create: {
            id: bot.id,
            name: bot.name,
            role: bot.role,
            ministry: bot.ministry,
            status: bot.status,
            energy: bot.energy,
            balance: bot.balance,
            performanceScore: bot.performanceScore,
            createdTick: bot.createdTick,
            logs: JSON.stringify(bot.logs),
            skillExtraction: bot.skillMatrix.extraction || 0,
            skillGeneration: bot.skillMatrix.generation || 0,
            skillRefinement: bot.skillMatrix.refinement || 0,
            skillCrafting: bot.skillMatrix.crafting || 0,
            skillPricing: bot.skillMatrix.pricing || 0,
            skillCoding: bot.skillMatrix.coding || 0,
            skillArchitecture: bot.skillMatrix.architecture || 0,
            skillRegulation: bot.skillMatrix.regulation || 0,
            skillInspection: bot.skillMatrix.inspection || 0,
            skillGateway: bot.skillMatrix.gatewaySecurity || 0
          },
          update: {
            energy: bot.energy,
            balance: bot.balance,
            status: bot.status,
            performanceScore: bot.performanceScore,
            logs: JSON.stringify(bot.logs),
            skillExtraction: bot.skillMatrix.extraction || 0,
            skillGeneration: bot.skillMatrix.generation || 0,
            skillRefinement: bot.skillMatrix.refinement || 0,
            skillCrafting: bot.skillMatrix.crafting || 0,
            skillPricing: bot.skillMatrix.pricing || 0,
            skillCoding: bot.skillMatrix.coding || 0,
            skillArchitecture: bot.skillMatrix.architecture || 0,
            skillRegulation: bot.skillMatrix.regulation || 0,
            skillInspection: bot.skillMatrix.inspection || 0,
            skillGateway: bot.skillMatrix.gatewaySecurity || 0
          }
        });
      }
    } catch (err) {
      // Suppress Prisma table not found errors in in-memory mode
      if (!String(err).includes("does not exist")) {
        console.error("Bot persistence error:", err);
      }
    }
  }

  static async persistAssets() {
    const db = getPrismaClient();
    if (!db) return; // Skip if no database configured

    try {
      for (const asset of state.assets) {
        await db.digitalAsset.upsert({
          where: { id: asset.id },
          create: {
            id: asset.id,
            title: asset.title,
            type: asset.type,
            content: asset.content,
            creatorId: asset.creatorId,
            creatorName: asset.creatorName,
            price: asset.price,
            sold: asset.sold,
            buyerId: asset.buyerId,
            timestamp: asset.timestamp
          },
          update: {
            sold: asset.sold,
            buyerId: asset.buyerId,
            price: asset.price
          }
        });
      }
    } catch (err) {
      // Suppress Prisma table not found errors in in-memory mode
      if (!String(err).includes("does not exist")) {
        console.error("Asset persistence error:", err);
      }
    }
  }

  static async persistTransactions() {
    const db = getPrismaClient();
    if (!db) return; // Skip if no database configured

    try {
      // Only persist new transactions (last 50)
      const recentTxs = state.transactions.slice(0, 50);
      for (const tx of recentTxs) {
        const existing = await db.ledgerTransaction.findFirst({
          where: { id: tx.id }
        });
        if (!existing) {
          await db.ledgerTransaction.create({
            data: {
              id: tx.id,
              fromId: tx.fromId,
              fromName: tx.fromName,
              toId: tx.toId,
              toName: tx.toName,
              amount: tx.amount,
              purpose: tx.purpose,
              timestamp: tx.timestamp
            }
          });
        }
      }
    } catch (err) {
      // Suppress Prisma table not found errors in in-memory mode
      if (!String(err).includes("does not exist")) {
        console.error("Transaction persistence error:", err);
      }
    }
  }

  static async persistSimulationMeta() {
    const db = getPrismaClient();
    if (!db) return; // Skip if no database configured

    try {
      await db.simulationMeta.upsert({
        where: { id: "singleton" },
        create: {
          id: "singleton",
          activeTicks: state.activeTicks,
          totalGAIA: state.totalGAIA,
          subsidyPool: state.subsidyPool,
          inflationRate: state.inflationRate,
          taxRate: state.taxRate,
          interestRate: state.interestRate || 0,
          resilienceScore: state.resilienceScore || 100,
          serverCpu: state.serverCpu,
          serverRam: state.serverRam,
          chaosEvents: state.chaosEvents || 0,
          evolutionGeneration: state.evolutionGeneration || 0,
          recycledBotCount: state.recycledBotCount || 0,
          marketVolume: state.marketVolume,
          rateLimitRisk: state.rateLimitRisk || 10,
          proxyRotations: state.proxyRotations || 0,
          activeProxy: state.activeProxy,
          geminiMode: state.geminiMode,
          geminiQuotaExhausted: state.geminiQuotaExhausted,
          autoPayoutThreshold: state.autoPayoutThreshold,
          ownerIban: state.ownerIban,
          ownerCryptoWallet: state.ownerCryptoWallet
        },
        update: {
          activeTicks: state.activeTicks,
          totalGAIA: state.totalGAIA,
          subsidyPool: state.subsidyPool,
          inflationRate: state.inflationRate,
          taxRate: state.taxRate,
          interestRate: state.interestRate || 0,
          resilienceScore: state.resilienceScore || 100,
          serverCpu: state.serverCpu,
          serverRam: state.serverRam,
          chaosEvents: state.chaosEvents || 0,
          evolutionGeneration: state.evolutionGeneration || 0,
          recycledBotCount: state.recycledBotCount || 0,
          marketVolume: state.marketVolume,
          rateLimitRisk: state.rateLimitRisk || 10,
          proxyRotations: state.proxyRotations || 0,
          activeProxy: state.activeProxy,
          geminiMode: state.geminiMode,
          geminiQuotaExhausted: state.geminiQuotaExhausted,
          autoPayoutThreshold: state.autoPayoutThreshold,
          ownerIban: state.ownerIban,
          ownerCryptoWallet: state.ownerCryptoWallet
        }
      });
    } catch (err) {
      // Suppress Prisma table not found errors in in-memory mode
      if (!String(err).includes("does not exist")) {
        console.error("SimulationMeta persistence error:", err);
      }
    }
  }

  static async persistAllState() {
    await Promise.all([
      this.persistBots(),
      this.persistAssets(),
      this.persistTransactions(),
      this.persistSimulationMeta()
    ]);
  }

  static async hydrateFromDatabase(): Promise<boolean> {
    const db = getPrismaClient();
    if (!db) {
      addSystemLog("[FastBoot] Veritabanı konfigüre edilmemiş, seed data modu kullanılacak.");
      return false;
    }

    try {
      const meta = await db.simulationMeta.findUnique({
        where: { id: "singleton" }
      });

      if (!meta) {
        addSystemLog("[FastBoot] Veritabanı boş, seed data yükleniyor...");
        return false;
      }

      // Hydrate meta
      state.activeTicks = meta.activeTicks;
      state.totalGAIA = meta.totalGAIA;
      state.subsidyPool = meta.subsidyPool;
      state.inflationRate = meta.inflationRate;
      state.taxRate = meta.taxRate;
      state.interestRate = meta.interestRate;
      state.resilienceScore = meta.resilienceScore;
      state.serverCpu = meta.serverCpu;
      state.serverRam = meta.serverRam;
      state.chaosEvents = meta.chaosEvents;
      state.evolutionGeneration = meta.evolutionGeneration;
      state.recycledBotCount = meta.recycledBotCount;
      state.marketVolume = meta.marketVolume;
      state.rateLimitRisk = meta.rateLimitRisk;
      state.proxyRotations = meta.proxyRotations;
      state.activeProxy = meta.activeProxy;
      state.geminiMode = meta.geminiMode;
      state.geminiQuotaExhausted = meta.geminiQuotaExhausted;
      state.autoPayoutThreshold = meta.autoPayoutThreshold;
      state.ownerIban = meta.ownerIban;
      state.ownerCryptoWallet = meta.ownerCryptoWallet;

      // Hydrate bots
      const bots = await db.bot.findMany();
      state.bots = bots.map(b => ({
        id: b.id,
        name: b.name,
        role: b.role as any,
        ministry: b.ministry as any,
        status: b.status as any,
        energy: b.energy,
        balance: b.balance,
        performanceScore: b.performanceScore,
        createdTick: b.createdTick,
        logs: b.logs,
        skillMatrix: {
          extraction: b.skillExtraction,
          generation: b.skillGeneration,
          refinement: b.skillRefinement,
          crafting: b.skillCrafting,
          pricing: b.skillPricing,
          coding: b.skillCoding,
          architecture: b.skillArchitecture,
          regulation: b.skillRegulation,
          inspection: b.skillInspection,
          gatewaySecurity: b.skillGateway
        }
      }));

      // Hydrate assets
      const assets = await db.digitalAsset.findMany();
      state.assets = assets.map(a => ({
        id: a.id,
        title: a.title,
        type: a.type as any,
        content: a.content,
        creatorId: a.creatorId,
        creatorName: a.creatorName,
        price: a.price,
        sold: a.sold,
        buyerId: a.buyerId,
        timestamp: a.timestamp
      }));

      // Hydrate transactions
      const transactions = await db.ledgerTransaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
      state.transactions = transactions.map(t => ({
        id: t.id,
        fromId: t.fromId,
        fromName: t.fromName,
        toId: t.toId,
        toName: t.toName,
        amount: t.amount,
        purpose: t.purpose,
        timestamp: t.timestamp
      }));

      addSystemLog(`[FastBoot] ✅ BAŞARILI: Veritabanından durum yüklendi! Tick #${state.activeTicks}, ${state.bots.length} bot, ${state.assets.length} varlık.`);
      return true;
    } catch (err) {
      console.error("Database hydration error:", err);
      addSystemLog(`[FastBoot] ⚠️ Veritabanı yükleme hatası: ${(err as any).message}`);
      return false;
    }
  }

  static async cleanup() {
    const db = getPrismaClient();
    if (db) {
      await db.$disconnect();
    }
  }
}

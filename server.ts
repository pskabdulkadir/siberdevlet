import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// v9.5: Otonom Ortam Kurulumu (Self-Setup Layer)
function initializeAutonomousEnvironment() {
  // 1. PORT: Render otomatik atar, yoksa 3000
  process.env.PORT = process.env.PORT || "3000";
  console.log(`[SİBER-KURULUM] 🌐 PORT ayarlandı: ${process.env.PORT}`);

  // 2. DATABASE_URL: Gerçek PostgreSQL yoksa In-Memory Ledger
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("fake")) {
    console.log(
      "[SİBER-KURULUM] 💾 Gerçek veritabanı bulunamadı. 'Bellek İçi (In-Memory) Ledger' aktif edildi. Kayıtlar RAM üzerinde tutuluyor."
    );
    process.env.DATABASE_URL = "local_memory_fallback";
  }

  // v9.6: KURUCU BİLGİLERİ (Abdulkadir Kan Entegrasyonu)
  // 3. KURUCU IBAN: Kurucu banka hesabı (QNB Finansbank)
  process.env.OWNER_IBAN = process.env.OWNER_IBAN || "TR320015700000000091775122";

  // 4. KURUCU ADI
  process.env.OWNER_NAME = process.env.OWNER_NAME || "Abdulkadir Kan";

  // 5. KURUCU BANKASI
  process.env.OWNER_BANK = process.env.OWNER_BANK || "QNB Finansbank";

  // v9.8: TRC-20 USDT KRİPTO ENTEGRASYON
  // 6. CRYPTO NETWORK: TRC-20 (TRON Ağı)
  process.env.CRYPTO_NETWORK = process.env.CRYPTO_NETWORK || "TRC-20 (TRON Network)";

  // 7. CRYPTO ASSET: USDT (Stabil Dolar)
  process.env.CRYPTO_ASSET = process.env.CRYPTO_ASSET || "USDT";

  // 8. KURUCU USDT CÜZDANı (TRC-20 Ağında)
  process.env.OWNER_CRYPTO_ADDRESS = process.env.OWNER_CRYPTO_ADDRESS || "TU8h8hnYA9i7SX1hQKLyZfFUY74oGd3yNn";

  // Eski uyumluluk (backward compatibility)
  process.env.OWNER_CRYPTO_WALLET = process.env.OWNER_CRYPTO_ADDRESS;
  process.env.OWNER_CRYPTO_PRIVATE_KEY = process.env.OWNER_CRYPTO_ADDRESS;

  // 8. GEMINI_API_KEY: Açık kaynak AI fallback etkinleştir
  if (!process.env.GEMINI_API_KEY) {
    console.log(
      "[SİBER-KURULUM] 🤖 GEMINI_API_KEY bulunmadı. Sistem ChatEverywhere + Ollama fallback'ine geçiliyor."
    );
  }

  // v9.6: KURUCU ENTEGRASYON BAŞARISI
  console.log(
    `[SİBER-DEVLET] 👑 Kurucu Entegrasyonu Başarılı: ${process.env.OWNER_NAME} adına kayıtlı cüzdan ve ${process.env.OWNER_BANK} IBAN'ı siber ağa bağlandı.`
  );
  console.log(
    `[SİBER-DEVLET] 🏦 Kurucu Banka Hesabı: ${process.env.OWNER_IBAN}`
  );

  // v9.8: TRC-20 USDT ENTEGRASYON LOGU
  console.log(
    `[SİBER-DEVLET] 🪙 v9.8 TRC-20 USDT Entegrasyonu: ${process.env.CRYPTO_ASSET} Cüzdanı Bağlandı`
  );
  console.log(
    `[SİBER-DEVLET] 🔗 Network: ${process.env.CRYPTO_NETWORK}`
  );
  console.log(
    `[SİBER-DEVLET] 💰 USDT Cüzdan Adresi: ${process.env.OWNER_CRYPTO_ADDRESS}`
  );

  console.log(
    "[SİBER-KURULUM] ✅ Otonom Ortam Kurulumu Tamamlandı. Sistem çalışmaya hazır!"
  );
}

// Uygulama başlamadan önce env setup'ı çalıştır
initializeAutonomousEnvironment();

import {
  state,
  seedInitialSimulation,
  runSimulationTick,
  spawnBotClone,
  optimizeBotSkills,
  addSystemLog,
  CyberBot,
  productionQueue,
  refineryQueue,
  craftingQueue,
  economyQueue,
  PlanetManager,
  RealityBridge,
  PatchLog
} from "./server/simulation.js";
import { RealityBridgeMetrics } from "./server/PayoutManager.js";
import { StateManager } from "./server/StateManager.js";
import { BackupManager } from "./server/BackupManager.js";
import { BotRole, BotMinistry, BotStatus } from "./src/types.js";
import { PayoutManager } from "./server/PayoutManager.js";

const app = express();
const PORT = process.env.PORT || 3000;

// v6.8: WebSocket & Canvas Throttling System
const wsClients = new Set();
let lastThrottledBroadcast = 0;
const THROTTLE_INTERVAL = 500; // 500ms batch updates

// Create HTTP server for WebSocket support
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket connections
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wsClients.add(ws);
    console.log(`[WebSocket] Yeni bağlantı. Toplam istemci: ${wsClients.size}`);

    ws.on("close", () => {
      wsClients.delete(ws);
      // v6.8: Agressif listener temizliği
      ws.removeAllListeners("message");
      ws.removeAllListeners("map-update");
      ws.removeAllListeners("log-stream");
      ws.removeAllListeners("error");
      ws.removeAllListeners("close");
      ws.removeAllListeners();
      ws.terminate();
      console.log(`[WebSocket] Bağlantı kapandı ve tamamen temizlendi. Toplam istemci: ${wsClients.size}`);
    });

    ws.on("error", (err) => {
      console.error(`[WebSocket] Hata:`, err);
      wsClients.delete(ws);
      ws.removeAllListeners("message");
      ws.removeAllListeners("map-update");
      ws.removeAllListeners("log-stream");
      ws.removeAllListeners();
      ws.terminate();
    });
  });
});

// Throttled broadcast function (v8.1) - Toplu Paket Gönderimi + Aggressive Cleanup
function broadcastStateThrottled() {
  const now = Date.now();
  if (now - lastThrottledBroadcast < THROTTLE_INTERVAL) {
    return;
  }
  lastThrottledBroadcast = now;

  // v8.1: Ultra-hafif payload - harita ve log verisi optimize
  const payload = JSON.stringify({
    type: "state_update",
    t: Date.now(),
    tick: state.activeTicks,
    bots: state.bots.length,
    cpu: state.serverCpu.toFixed(1),
    ram: state.serverRam.toFixed(1),
    gaia: state.totalGAIA.toFixed(0),
    inf: state.inflationRate.toFixed(1)
  });

  // v8.1: Aggressive dead connection cleanup
  const deadConnections = [];
  let sendCount = 0;

  wsClients.forEach((ws) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(payload, (err) => {
        if (err) {
          console.error("[WebSocket] Send error:", err);
          deadConnections.push(ws);
        } else {
          sendCount++;
        }
      });
    } else {
      deadConnections.push(ws);
    }
  });

  // v8.1: Aggressive cleanup - Her bağlantı için listener cascade delete
  deadConnections.forEach((ws) => {
    try {
      // Map ve log akışı listener'larını açıkça sil
      ws.removeAllListeners("map-update");
      ws.removeAllListeners("log-stream");
      ws.removeAllListeners("data");
      ws.removeAllListeners("message");
      ws.removeAllListeners("close");
      ws.removeAllListeners("error");

      // Tüm listener'ları sil
      ws.removeAllListeners();

      // Socket bağlantısını kapat
      ws.close(1000, "cleanup");
      ws.terminate();

      wsClients.delete(ws);
    } catch (e) {
      // Sessizce devam et
    }
  });

  // Hafta sonu rapor
  if (state.activeTicks % 100 === 0) {
    console.log(`[WebSocket-v8.1] Aktif: ${wsClients.size}, Temizlenen: ${deadConnections.length}, Gönderilen: ${sendCount}`);
  }
}

// Enable JSON body parsing
app.use(express.json());

// Prevent aggressive browser caching of frontend and API responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Initialize simulation data with Fast-Boot mechanism
async function initializeSimulation() {
  console.log("[FastBoot] Simülasyon başlatılıyor...");

  // Backup Manager initialize first
  await BackupManager.initialize();

  // Try to hydrate from database
  const hydrated = await StateManager.hydrateFromDatabase();

  if (!hydrated) {
    // If no data in DB, try to restore from backup file
    const restored = await BackupManager.restoreFromBackup();

    if (!restored) {
      // If all else fails, seed new data
      seedInitialSimulation();
      addSystemLog("[FastBoot] Yeni simülasyon başlatıldı (seed data).");
    }
  }

  // v7.0: Full Mobilization - Tüm Botları Aktif Et
  const inactiveBots = state.bots.filter(b => b.status !== BotStatus.ACTIVE && b.status !== BotStatus.RECYCLED);
  for (const bot of inactiveBots) {
    bot.status = BotStatus.ACTIVE;
    bot.energy = Math.max(bot.energy, 50); // Minimum enerji
  }

  if (inactiveBots.length > 0) {
    addSystemLog(`[v7.0-Mobilization] 🦾 ${inactiveBots.length} uyuşuk bot silahlı ve aktif hale getirildi. Aktif bot sayısı: ${state.bots.filter(b => b.status === BotStatus.ACTIVE).length} / ${state.bots.length}`);
  }

  // Persist initial state to database
  await StateManager.persistAllState();

  addSystemLog("[FastBoot] ✅ Sistem tam olarak yüklendi ve devam etmeye hazır. v7.0 Hyper-Scale Engine AKTIF!");
}

// Initialize on startup
initializeSimulation().catch(err => {
  console.error("Initialization error:", err);
  seedInitialSimulation();
});

// Start continuous background autoplay tick timer
let autoplayInterval: NodeJS.Timeout | null = null;
function initAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
  autoplayInterval = setInterval(async () => {
    if (state.autoPlay) {
      try {
        await runSimulationTick();
        // Persist state after each tick
        await StateManager.persistAllState();
        // v6.8: Throttled broadcast to all WebSocket clients
        broadcastStateThrottled();
      } catch (err) {
        console.error("Autoplay tick error:", err);
      }
    }
  }, 3500); // Ticks every 3.5 seconds
}
initAutoplay();

// ==========================================
// SIMULATION API ENDPOINTS (GET/POST API/*)
// ==========================================

// Health Check (Render & Load Balancer için)
app.get(["/health", "/healthcheck"], (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "9.5",
    activeBots: state.bots.length,
    subsidyPool: state.subsidyPool
  });
});

// Get complete simulation state (Supports English & Turkish aliases)
app.get(["/api/simulation/state", "/api/simulasyon/durum", "/api/simülasyon/durum", "/api/simulasyon/state"], (req, res) => {
  res.json(state);
});

// Get Reality Bridge Metrics (Simülasyon vs Gerçeklik Analizi)
app.get("/api/admin/reality-metrics", (req, res) => {
  RealityBridgeMetrics.update();
  res.json({
    cpuUsage: RealityBridgeMetrics.cpuUsage,
    ramUsage: RealityBridgeMetrics.ramUsage,
    networkBytesIn: RealityBridgeMetrics.networkBytesIn,
    networkBytesOut: RealityBridgeMetrics.networkBytesOut,
    chromaDBSize: RealityBridgeMetrics.chromaDBSize,
    blockchainTxCount: RealityBridgeMetrics.blockchainTxCount,
    networkRequests: RealityBridge.networkRequests,
    totalFetchedBytes: RealityBridge.fetchedDataSize,
    patchCount: PatchLog.patches.length,
    lastPatchTime: PatchLog.patches.length > 0 ? PatchLog.patches[PatchLog.patches.length - 1].timestamp : null
  });
});

// Get Backup Information
app.get("/api/admin/backup-info", (req, res) => {
  const backupInfo = BackupManager.getBackupInfo();
  res.json({
    hasBackup: !!backupInfo,
    backup: backupInfo,
    lastBackupTime: BackupManager.lastBackupTime,
    backupCount: BackupManager.backupCount
  });
});

// Trigger a single step/tick manually (Supports English & Turkish aliases)
app.post(["/api/simulation/tick", "/api/simulasyon/tick", "/api/simulasyon/adim", "/api/simülasyon/adım"], async (req, res) => {
  try {
    await runSimulationTick();
    // Persist state after tick
    await StateManager.persistAllState();
    res.json({ success: true, state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// Toggle or Start Autoplay (Supports English & Turkish aliases)
app.post(["/api/simulation/toggle-autoplay", "/api/simulation/start", "/api/simulasyon/baslat", "/api/simülasyon/başlat"], (req, res) => {
  // If explicitly called /start or /baslat/başlat, turn it ON. Otherwise toggle it.
  const isExplicitStart = req.path.includes("start") || req.path.includes("baslat") || req.path.includes("başlat");
  if (isExplicitStart) {
    state.autoPlay = true;
  } else {
    state.autoPlay = !state.autoPlay;
  }
  addSystemLog(`[Sistem] Otomatik akış ${state.autoPlay ? "aktif" : "pasif"} edildi.`);
  res.json({ success: true, autoPlay: state.autoPlay, state });
});

// Toggle Gemini AI Mode
app.post("/api/simulation/toggle-gemini", (req, res) => {
  state.geminiMode = state.geminiMode === "smart" ? "procedural" : "smart";
  if (state.geminiMode === "smart") {
    state.geminiQuotaExhausted = false;
    state.geminiCooldownUntil = 0;
  }
  addSystemLog(`[Sistem] Gemini Yapay Zeka modu ${state.geminiMode === "smart" ? "'Akıllı AI'" : "'Yerel Şablon'"} olarak değiştirildi.`);
  res.json({ success: true, geminiMode: state.geminiMode, state });
});

// Reset Simulation State - Full Clean Wipe and Autoplay Off (Supports English & Turkish aliases)
app.post(["/api/simulation/reset", "/api/simulasyon/sifirla", "/api/simülasyon/sıfırla"], (req, res) => {
  state.bots = [];
  state.jobs = [];
  state.assets = [];
  state.transactions = [];
  state.marketVolume = 0;
  state.totalGAIA = 10000.0;
  state.inflationRate = 2.5;
  state.taxRate = 5.0;
  state.serverCpu = 20;
  state.serverRam = 25;
  state.subsidyPool = 2500.0;
  state.logs = [];
  state.recycledBotCount = 0;
  state.activeTicks = 0;
  state.geminiMode = "smart";
  state.geminiQuotaExhausted = false;
  state.geminiCooldownUntil = 0;
  state.interestRate = 0;
  state.resilienceScore = 100;
  state.chaosEvents = 0;
  state.evolutionGeneration = 0;
  state.autoPlay = false; // Turn off autoplay to pause everything until started

  // Fully clean reset of all financial stats and trade requests
  state.financialStats = {
    totalTrades: 0,
    grossUSD: 0.0,
    netPayoutsUSD: 0.0,
    approvedCount: 0,
    rejectedCount: 0
  };
  state.tradeRequests = [];

  // Clear external subscriptions list
  activeSubscriptions.length = 0;

  seedInitialSimulation();
  addSystemLog("[Sistem] Tüm simülasyon, loglar, eserler ve kuyruklar sıfırlandı. Otonom çalışma durduruldu.");
  res.json({ success: true, state });
});

// Spawn a bot clone (Yazılımcı trigger)
app.post("/api/simulation/spawn", (req, res) => {
  const { role, ministry } = req.body;
  try {
    const newBot = spawnBotClone(role as BotRole, ministry as BotMinistry);
    res.json({ success: true, bot: newBot, state });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || String(err) });
  }
});

// Optimize bot skill matrix (Yazılımcı trigger)
app.post("/api/simulation/optimize", (req, res) => {
  const { botId } = req.body;
  try {
    const target = optimizeBotSkills(botId);
    res.json({ success: true, bot: target, state });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || String(err) });
  }
});

// Quarantine a bot manually (or release it) - Mimar override
app.post("/api/simulation/quarantine", (req, res) => {
  const { botId, value } = req.body; // value is boolean (true to quarantine, false to release)
  const target = state.bots.find(b => b.id === botId);
  if (!target) {
    return res.status(404).json({ success: false, error: "Bot bulunamadı." });
  }

  if (value) {
    target.status = BotStatus.QUARANTINE;
    addSystemLog(`[Mimar Manuel] ${target.name} manuel olarak karantinaya (uyku modu) alındı.`);
  } else {
    target.status = BotStatus.ACTIVE;
    addSystemLog(`[Mimar Manuel] ${target.name} karantinası manuel olarak kaldırıldı.`);
  }
  res.json({ success: true, bot: target, state });
});

// Distribute Central Bank subsidy pool grant manually - Regulator override
app.post("/api/simulation/subsidy", (req, res) => {
  const { botId, amount } = req.body;
  const target = state.bots.find(b => b.id === botId);
  if (!target) {
    return res.status(404).json({ success: false, error: "Bot bulunamadı." });
  }

  const subsidyVal = parseFloat(amount) || 50;
  if (state.subsidyPool < subsidyVal) {
    return res.status(400).json({ success: false, error: "Merkez Bankası hibe havuzunda yeterli GAIA Token yok." });
  }

  state.subsidyPool -= subsidyVal;
  target.balance += subsidyVal;
  target.logs.unshift(`[Destek] Merkez Bankası'ndan manuel hibe alındı (+${subsidyVal} GAIA).`);
  addSystemLog(`[Maliye Manuel] ${target.name} botuna ${subsidyVal} GAIA hibe desteği verildi.`);
  
  res.json({ success: true, bot: target, state });
});

// Trigger Chaos Event (Karadelik Senaryosu)
app.post("/api/simulation/trigger-chaos", (req, res) => {
  try {
    PlanetManager.triggerChaosEvent(true);
    res.json({ success: true, state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// Manually trigger Self-Healing
app.post("/api/simulation/heal", async (req, res) => {
  try {
    await PlanetManager.evaluateSelfHealing();
    res.json({ success: true, state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// v8.0: Gümrük Proxy Temizliği - Ban Riskini Düşür
app.post("/api/simulation/gateway-cleanup", (req, res) => {
  const gatewayBot = state.bots.find(b => b.role === BotRole.GUMRUK_KAPISI && b.status === BotStatus.ACTIVE);

  if (!gatewayBot) {
    return res.status(400).json({ success: false, error: "Gümrük Kapısı Botu aktif değil" });
  }

  // Proxy pool
  const proxyPool = [
    "185.112.54.21", "194.22.87.114", "82.55.190.23",
    "203.45.18.99", "77.243.60.12", "91.132.8.210", "104.244.42.1"
  ];

  // Yeni proxy seç
  const oldIP = state.activeProxy || proxyPool[0];
  let newIP = proxyPool[Math.floor(Math.random() * proxyPool.length)];
  while (newIP === oldIP && proxyPool.length > 1) {
    newIP = proxyPool[Math.floor(Math.random() * proxyPool.length)];
  }

  // Risk sıfırla
  const oldRisk = state.rateLimitRisk || 0;
  state.activeProxy = newIP;
  state.proxyRotations = (state.proxyRotations || 0) + 1;
  state.rateLimitRisk = 10; // %10'a sıfırla

  addSystemLog(
    `[v8.0-Gümrük] 🌐 PROXY TEMIZLIĞI: ${oldIP} → ${newIP} | ` +
    `Ban Riski: %${oldRisk.toFixed(1)} → %10 | Rotasyon: #${state.proxyRotations}`
  );

  if (gatewayBot) {
    gatewayBot.logs.unshift(
      `[Gümrük Temizliği] Proxy rotasyonu zorlandı! ${oldIP} → ${newIP}. Ban riski %${oldRisk.toFixed(1)}'den %10'a düşürüldü.`
    );
  }

  res.json({
    success: true,
    message: `Proxy temizliği tamamlandı. ${oldIP} → ${newIP}`,
    oldRisk: oldRisk.toFixed(1),
    newRisk: 10,
    state
  });
});

// Manually Recycle (Delete) a Bot - Siber Mahkeme override
app.post("/api/simulation/recycle", (req, res) => {
  const { botId } = req.body;
  const index = state.bots.findIndex(b => b.id === botId);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Bot bulunamadı." });
  }

  const bot = state.bots[index];
  bot.status = BotStatus.RECYCLED;
  state.recycledBotCount++;
  addSystemLog(`[Siber Mahkeme Manuel] ${bot.name} botu yetkililer tarafından kalıcı olarak silindi ve geri dönüştürüldü.`);

  res.json({ success: true, botId, state });
});

// v8.0: Müfettiş Veri Arındırma Operasyonu - Bozuk Varlıkları Temizle
app.post("/api/simulation/data-purification", (req, res) => {
  const mufettis = state.bots.find(b => b.role === BotRole.MUFETTIS && b.status === BotStatus.ACTIVE);

  if (!mufettis) {
    return res.status(400).json({ success: false, error: "Müfettiş Bot aktif değil" });
  }

  // Bozuk varlıkları bul ([BOZUK] içeriyor)
  const corruptedAssets = state.assets.filter(a =>
    a.title.includes("[BOZUK]") ||
    a.content.includes("[BOZUK]") ||
    a.content.includes("CORRUPTED")
  );

  let recoveredFunds = 0;
  const deletedTitles: string[] = [];

  // Bozuk varlıkları sil ve GAIA'yı geri al
  for (const asset of corruptedAssets) {
    const recovery = asset.price || 10; // Varlık değerini geri al
    recoveredFunds += recovery;
    deletedTitles.push(asset.title);

    // Varlığı listeden sil
    const assetIndex = state.assets.indexOf(asset);
    if (assetIndex !== -1) {
      state.assets.splice(assetIndex, 1);
    }
  }

  // Kurtarılan fonları hibe havuzuna ver
  state.subsidyPool += recoveredFunds;

  // Müfettiş logu
  if (mufettis) {
    mufettis.logs.unshift(
      `[Veri Arındırma] 🧹 ${corruptedAssets.length} bozuk varlık silindi. ` +
      `Kurtarılan GAIA: ${recoveredFunds.toFixed(1)} (Hibe Havuzuna iade)`
    );
  }

  addSystemLog(
    `[v8.0-Müfettiş-Arındırma] 🧹 VERİ ARINDIRMA OPERASYONu: ` +
    `${corruptedAssets.length} bozuk varlık temizlendi, ${recoveredFunds.toFixed(1)} GAIA kurtarıldı. ` +
    `Hibe Havuzu: ${state.subsidyPool.toFixed(1)} GAIA`
  );

  res.json({
    success: true,
    operationName: "Veri Arındırma Operasyonu",
    deletedAssets: corruptedAssets.length,
    deletedTitles: deletedTitles,
    recoveredFunds: recoveredFunds.toFixed(1),
    subsidyPoolNow: state.subsidyPool.toFixed(1),
    state
  });
});

// Push a manual task into BullMQ Queue
app.post("/api/simulation/manual-job", (req, res) => {
  const { queueName, jobName, data } = req.body;
  let job;
  
  if (queueName === "production-queue") {
    job = productionQueue.add(jobName, data || {});
  } else if (queueName === "refinery-queue") {
    job = refineryQueue.add(jobName, data || {});
  } else if (queueName === "crafting-queue") {
    job = craftingQueue.add(jobName, data || {});
  } else if (queueName === "economy-queue") {
    job = economyQueue.add(jobName, data || {});
  } else {
    return res.status(400).json({ success: false, error: "Bilinmeyen kuyruk adı." });
  }

  res.json({ success: true, job, state });
});

// ==========================================
// ADMIN PANEL AND PARAMETER MANAGEMENT API
// ==========================================

// Save global parameters
app.post("/api/admin/parameters", (req, res) => {
  const { interestRate, taxRate, inflationRate, serverCpu, serverRam, resilienceScore, subsidyPool, totalGAIA, autoPlay } = req.body;
  if (interestRate !== undefined) state.interestRate = parseFloat(interestRate);
  if (taxRate !== undefined) state.taxRate = parseFloat(taxRate);
  if (inflationRate !== undefined) state.inflationRate = parseFloat(inflationRate);
  if (serverCpu !== undefined) state.serverCpu = parseFloat(serverCpu);
  if (serverRam !== undefined) state.serverRam = parseFloat(serverRam);
  if (resilienceScore !== undefined) state.resilienceScore = parseFloat(resilienceScore);
  if (subsidyPool !== undefined) state.subsidyPool = parseFloat(subsidyPool);
  if (totalGAIA !== undefined) state.totalGAIA = parseFloat(totalGAIA);
  if (autoPlay !== undefined) state.autoPlay = !!autoPlay;

  addSystemLog(`[Yönetici] Sistem parametreleri manuel olarak güncellendi.`);
  res.json({ success: true, state });
});

// Save (Add or Update) Bot
app.post("/api/admin/bots/save", (req, res) => {
  const { id, name, role, ministry, balance, energy, status, skillMatrix } = req.body;
  if (id) {
    // Update existing
    const bot = state.bots.find(b => b.id === id);
    if (!bot) return res.status(404).json({ success: false, error: "Bot bulunamadı." });
    if (name) bot.name = name;
    if (role) bot.role = role;
    if (ministry) bot.ministry = ministry;
    if (balance !== undefined) bot.balance = parseFloat(balance);
    if (energy !== undefined) bot.energy = parseFloat(energy);
    if (status) bot.status = status;
    if (skillMatrix) bot.skillMatrix = skillMatrix;
    addSystemLog(`[Yönetici] ${bot.name} botunun özellikleri güncellendi.`);
  } else {
    // Add new
    const newBot = new CyberBot(name || "Custom-Bot", role || BotRole.HAMMADDE_AVCISI, ministry || BotMinistry.URETIM, skillMatrix || {});
    if (balance !== undefined) newBot.balance = parseFloat(balance);
    if (energy !== undefined) newBot.energy = parseFloat(energy);
    if (status) newBot.status = status;
    state.bots.push(newBot as any);
    addSystemLog(`[Yönetici] Yeni bot oluşturuldu: ${newBot.name}`);
  }
  res.json({ success: true, state });
});

// Delete Bot
app.post("/api/admin/bots/delete", (req, res) => {
  const { botId } = req.body;
  const index = state.bots.findIndex(b => b.id === botId);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Bot bulunamadı." });
  }
  const bot = state.bots[index];
  state.bots.splice(index, 1);
  addSystemLog(`[Yönetici] ${bot.name} botu sistemden kalıcı olarak silindi.`);
  res.json({ success: true, state });
});

// Save (Add or Update) Digital Asset
app.post("/api/admin/assets/save", (req, res) => {
  const { id, title, type, content, creatorName, price } = req.body;
  if (id) {
    const asset = state.assets.find(a => a.id === id);
    if (!asset) return res.status(404).json({ success: false, error: "Eser bulunamadı." });
    if (title) asset.title = title;
    if (type) asset.type = type;
    if (content) asset.content = content;
    if (creatorName) asset.creatorName = creatorName;
    if (price !== undefined) asset.price = parseFloat(price);
    addSystemLog(`[Yönetici] '${asset.title}' eseri güncellendi.`);
  } else {
    const newAsset = {
      id: `asset-${Math.random().toString(36).substring(2, 6)}`,
      title: title || "Yeni Eser",
      type: type || "ScrapedData",
      content: content || "İçerik...",
      creatorId: "admin",
      creatorName: creatorName || "Yönetici",
      price: price !== undefined ? parseFloat(price) : 25.0,
      sold: false,
      timestamp: Date.now()
    };
    state.assets.unshift(newAsset as any);
    addSystemLog(`[Yönetici] Yeni eser oluşturuldu: ${newAsset.title}`);
  }
  res.json({ success: true, state });
});

// Delete Digital Asset
app.post("/api/admin/assets/delete", (req, res) => {
  const { assetId } = req.body;
  const index = state.assets.findIndex(a => a.id === assetId);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Eser bulunamadı." });
  }
  const asset = state.assets[index];
  state.assets.splice(index, 1);
  addSystemLog(`[Yönetici] '${asset.title}' eseri silindi.`);
  res.json({ success: true, state });
});

// Create Custom Ledger Transaction
app.post("/api/admin/transactions/save", (req, res) => {
  const { fromName, toName, amount, purpose } = req.body;
  const newTx = {
    id: `tx-admin-${Math.random().toString(36).substring(2, 6)}`,
    fromId: "admin",
    fromName: fromName || "Yönetici",
    toId: "recipient",
    toName: toName || "Alıcı",
    amount: parseFloat(amount) || 10.0,
    purpose: purpose || "Manuel İşlem",
    timestamp: Date.now()
  };
  state.transactions.unshift(newTx);
  addSystemLog(`[Yönetici] Manuel finans işlemi eklendi: ${newTx.amount} GAIA (${newTx.purpose})`);
  res.json({ success: true, state });
});

// Clear Transactions
app.post("/api/admin/transactions/clear", (req, res) => {
  state.transactions = [];
  addSystemLog(`[Yönetici] Tüm finansal işlem geçmişi sıfırlandı.`);
  res.json({ success: true, state });
});

// ==========================================
// FINANCIAL AND INSTANT PAYOUT API ENDPOINTS
// ==========================================

// Save payout / financial wallet settings
app.post("/api/admin/payout-settings", (req, res) => {
  const { ownerIban, ownerCryptoWallet, autoPayoutThreshold } = req.body;
  if (ownerIban !== undefined) state.ownerIban = ownerIban;
  if (ownerCryptoWallet !== undefined) state.ownerCryptoWallet = ownerCryptoWallet;
  if (autoPayoutThreshold !== undefined) state.autoPayoutThreshold = autoPayoutThreshold;

  addSystemLog(`[Yönetici] Finansal cüzdan ve otomatik çekim ayarları güncellendi.`);
  res.json({ success: true, state });
});

// Approve external trade request and trigger payout
app.post("/api/admin/trade/approve", async (req, res) => {
  const { reqId } = req.body;
  const trade = state.tradeRequests?.find(r => r.id === reqId);
  if (!trade) {
    return res.status(404).json({ success: false, error: "Ticari talep bulunamadı." });
  }

  trade.status = "approved";
  if (state.financialStats) state.financialStats.approvedCount++;
  addSystemLog(`[DIŞ TİCARET] ${trade.client} şirketinin $${trade.value} değerindeki '${trade.product}' talebi YÖNETİCİ TARAFINDAN ONAYLANDI.`);

  // Stage 3: Client pays (Simulated successful payment webhook)
  addSystemLog(`[DIŞ TİCARET] Müşteriye ödeme bağlantısı iletildi. Ödeme bekleniyor...`);
  
  // Simulate payment processing delay (e.g. 1 second later client pays, payment_intent.succeeded is simulated)
  setTimeout(async () => {
    trade.status = "paid";
    addSystemLog(`[WEBHOOK] Stripe webhook received: payment_intent.succeeded ($${trade.value} USD)`);

    // Stage 4: Trigger Instant Payout based on threshold / preference
    const method = state.ownerCryptoWallet ? "crypto" : "bank";
    trade.payoutType = method;

    try {
      if (method === "crypto") {
        const result = await PayoutManager.triggerCryptoPayout(trade.value);
        if (result.success) {
          trade.status = "payout_completed";
        }
      } else {
        const result = await PayoutManager.triggerStripePayout(trade.value);
        if (result.success) {
          trade.status = "payout_completed";
        }
      }
    } catch (err: any) {
      console.error("Payout error:", err);
      addSystemLog(`[FİNANS/HATA] Çekim otomatik zincirinde hata: ${err.message}`);
    }
  }, 1000);

  res.json({ success: true, state });
});

// Reject external trade request
app.post("/api/admin/trade/reject", (req, res) => {
  const { reqId } = req.body;
  const trade = state.tradeRequests?.find(r => r.id === reqId);
  if (!trade) {
    return res.status(404).json({ success: false, error: "Ticari talep bulunamadı." });
  }

  trade.status = "rejected";
  if (state.financialStats) state.financialStats.rejectedCount++;
  addSystemLog(`[DIŞ TİCARET] ${trade.client} şirketinin talebi REDDEDİLDİ.`);
  res.json({ success: true, state });
});

// Generate simulated external trade proposal
app.post("/api/admin/trade/generate-simulated", (req, res) => {
  const products = [
    "Autonomous LLM Optimization Logs v2",
    "Siber-Devlet Ledger Audit Database",
    "Sentetik Algoritma Çiftçiliği Hasilati",
    "Mimar Sinan CPU Optimizer Binary Suite",
    "Neo-Istanbul High-Entropy Digital Art Collection"
  ];
  const clients = [
    "CyberSystems Inc",
    "NeoTek Corp",
    "AlphaCentauri Solutions",
    "Istanbul Quantum Capital",
    "Gaia Expansion Syndicate"
  ];
  const val = parseFloat((100 + Math.random() * 400).toFixed(2));
  const newTrade = {
    id: `req-${Math.random().toString(36).substring(2, 6)}`,
    client: clients[Math.floor(Math.random() * clients.length)],
    product: products[Math.floor(Math.random() * products.length)],
    value: val,
    status: "pending" as const,
    timestamp: Date.now()
  };

  if (!state.tradeRequests) state.tradeRequests = [];
  state.tradeRequests.unshift(newTrade);
  if (state.financialStats) state.financialStats.totalTrades++;

  addSystemLog(`[DIŞ TİCARET] Yeni simüle edilmiş ticari talep alındı: ${newTrade.client} tarafından '${newTrade.product}' ($${newTrade.value} USD)`);
  res.json({ success: true, state });
});

// Trigger a manual instant cash-out / payout
app.post("/api/admin/trade/instant-cashout", async (req, res) => {
  const { amount, method } = req.body;
  const amt = parseFloat(amount) || 100.0;
  
  try {
    if (method === "crypto") {
      const result = await PayoutManager.triggerCryptoPayout(amt);
      res.json({ success: result.success, msg: result.msg, state });
    } else {
      const result = await PayoutManager.triggerStripePayout(amt);
      res.json({ success: result.success, msg: result.msg, state });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// OTONOM PDF & WORD REPORT GENERATOR API
// ==========================================

// Download PDF Report
app.get("/api/export/report-pdf", (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=project_gaia_report.pdf");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    doc.pipe(res);

    // Dark cyberpunk banner header
    doc.rect(0, 0, 595.28, 100).fill("#0f172a");

    // Banner Text
    doc.fillColor("#10b981").fontSize(20).font("Helvetica-Bold").text("PROJECT GAIA: CYBER-WORLD STATUS REPORT", 40, 35);
    doc.fillColor("#94a3b8").fontSize(9).font("Helvetica").text("Autonomous Simulation State & System Ecology Analytics Log", 40, 65);

    doc.moveDown(4);

    // Section 1: Core System Parameters
    doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("1. CORE ECOSYSTEM PARAMETERS", 40, 130);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, 148).lineTo(555, 148).stroke();

    doc.fontSize(10).font("Helvetica").fillColor("#334155");
    const gridY = 160;
    doc.text(`Active Ticks (Ecosystem Age): TICK #${state.activeTicks || 0}`, 40, gridY);
    doc.text(`Gezegen Dayanıklılık Skoru: %${state.resilienceScore ?? 100}`, 40, gridY + 20);
    doc.text(`Siber Evrim Nesli: Gen #${state.evolutionGeneration ?? 0}`, 40, gridY + 40);
    doc.text(`Toplam Sabotaj / Kaos: ${state.chaosEvents ?? 0} Vaka`, 40, gridY + 60);

    doc.text(`Sirkülasyondaki Para: ${(state.totalGAIA || 0).toFixed(2)} GAIA`, 300, gridY);
    doc.text(`Merkez Bankası Hibe Havuzu: ${(state.subsidyPool || 0).toFixed(2)} GAIA`, 300, gridY + 20);
    doc.text(`Dinamik Faiz Oranı: ${state.interestRate === 0 ? "STABİL (%0)" : `NEGATİF (%${state.interestRate})`}`, 300, gridY + 40);
    doc.text(`Enflasyon & Vergi Oranı: Enflasyon %${(state.inflationRate || 0).toFixed(1)} | Vergi %${(state.taxRate || 0).toFixed(1)}`, 300, gridY + 60);

    // Section 2: Active Cyber-Bots
    doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("2. ACTIVE CYBER-BOT MATRIX", 40, 255);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, 273).lineTo(555, 273).stroke();

    let botY = 285;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#475569");
    doc.text("Bot İsmi", 45, botY);
    doc.text("Rol / Meslek", 160, botY);
    doc.text("Bakanlık", 285, botY);
    doc.text("Bakiye", 410, botY);
    doc.text("Enerji", 480, botY);
    doc.text("Durum", 525, botY);

    doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(40, botY + 12).lineTo(555, botY + 12).stroke();
    botY += 20;

    doc.font("Helvetica").fillColor("#334155");
    state.bots.slice(0, 22).forEach((b) => {
      if (botY > 750) {
        doc.addPage();
        botY = 40;
      }
      doc.text(b.name || "", 45, botY);
      doc.text(b.role || "", 160, botY);
      doc.text(b.ministry || "", 285, botY);
      doc.text(`${(b.balance || 0).toFixed(1)} GAIA`, 410, botY);
      doc.text(`%${Math.floor(b.energy || 0)}`, 480, botY);
      doc.text(b.status || "", 525, botY);
      botY += 16;
    });

    if (state.bots.length > 22) {
      doc.text(`... ve ${state.bots.length - 22} adet diğer otonom bot sınıfı simüle ediliyor.`, 45, botY + 5);
      botY += 20;
    }

    // Section 3: Digital Assets
    if (botY > 580) {
      doc.addPage();
      botY = 40;
    } else {
      botY += 20;
    }

    doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("3. DIGITAL ASSETS & EXPORT INVENTORY", 40, botY);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, botY + 18).lineTo(555, botY + 18).stroke();
    botY += 30;

    state.assets.slice(0, 8).forEach((asset) => {
      if (botY > 750) {
        doc.addPage();
        botY = 40;
      }
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#0f172a").text(asset.title || "", 45, botY);
      doc.fontSize(8).font("Helvetica-Oblique").fillColor("#64748b").text(`Yaratıcı: ${asset.creatorName || "Bilinmeyen"} | Değer: ${(asset.price || 0).toFixed(1)} GAIA | Tür: ${asset.type || "Asset"}`, 45, botY + 11);

      const snippet = asset.content && asset.content.length > 100 ? asset.content.substring(0, 100) + "..." : asset.content || "";
      doc.fontSize(8).font("Courier").fillColor("#475569").text(snippet, 45, botY + 22, { width: 500 });
      botY += 40;
    });

    // Section 4: Real-World Financial & Export Balance
    if (botY > 580) {
      doc.addPage();
      botY = 40;
    } else {
      botY += 20;
    }

    doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("4. FINANCIAL REPORTS & REAL-WORLD EXPORT BALANCE SHEET", 40, botY);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, botY + 18).lineTo(555, botY + 18).stroke();
    botY += 30;

    const stats = state.financialStats || { totalTrades: 0, grossUSD: 0, netPayoutsUSD: 0, approvedCount: 0, rejectedCount: 0 };
    const totalRequests = stats.approvedCount + stats.rejectedCount;
    const approvalRate = totalRequests > 0 ? ((stats.approvedCount / totalRequests) * 100).toFixed(1) : "0.0";

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
    doc.text(`Total Trade/Export Transactions:`, 45, botY);
    doc.font("Helvetica").text(`${stats.totalTrades} transactions completed`, 260, botY);
    botY += 18;

    doc.font("Helvetica-Bold").text(`Gross Earned Capital (Fiat/Crypto):`, 45, botY);
    doc.font("Helvetica").text(`$${stats.grossUSD.toFixed(2)} USD`, 260, botY);
    botY += 18;

    doc.font("Helvetica-Bold").text(`Net Transferred to Destination (Instant Payouts):`, 45, botY);
    doc.font("Helvetica").text(`$${stats.netPayoutsUSD.toFixed(2)} USD (After Gateway Fees)`, 260, botY);
    botY += 18;

    doc.font("Helvetica-Bold").text(`Trade Approval / Rejection Stats:`, 45, botY);
    doc.font("Helvetica").text(`Approved: ${stats.approvedCount} | Rejected: ${stats.rejectedCount} (Ratio: ${approvalRate}%)`, 260, botY);
    botY += 25;

    // Section 5: Recent Logs
    if (botY > 580) {
      doc.addPage();
      botY = 40;
    } else {
      botY += 20;
    }

    doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("5. RECENT SYSTEM LOGS & AUDIT TRAILS", 40, botY);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, botY + 18).lineTo(555, botY + 18).stroke();
    botY += 30;

    doc.fontSize(8).font("Courier").fillColor("#1e293b");
    state.logs.slice(0, 18).forEach((log) => {
      if (botY > 770) {
        doc.addPage();
        botY = 40;
      }
      doc.text(log || "", 45, botY, { width: 500 });
      botY += 14;
    });

    doc.end();
  } catch (err: any) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).send("PDF Raporu üretilemedi: " + err.message);
    }
  }
});

// Download Word Document
app.get("/api/export/report-word", async (req, res) => {
  try {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bot İsmi", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rol", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bakanlık", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bakiye", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Enerji", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Durum", bold: true, color: "ffffff" })] })], shading: { fill: "0f172a" } }),
        ]
      })
    ];

    state.bots.forEach(b => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(b.name || "")] }),
            new TableCell({ children: [new Paragraph(b.role || "")] }),
            new TableCell({ children: [new Paragraph(b.ministry || "")] }),
            new TableCell({ children: [new Paragraph(`${(b.balance || 0).toFixed(1)} GAIA`)] }),
            new TableCell({ children: [new Paragraph(`%${Math.floor(b.energy || 0)}`)] }),
            new TableCell({ children: [new Paragraph(b.status || "")] }),
          ]
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROJECT GAIA: CYBER-WORLD GLOBAL ECOSYSTEM REPORT",
                  bold: true,
                  size: 36,
                  color: "10b981"
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Ecosystem Age: TICK #${state.activeTicks || 0} | Resilience: %${state.resilienceScore ?? 100} | Evolution Generation: Gen #${state.evolutionGeneration ?? 0}`,
                  italics: true,
                  color: "475569"
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "1. Core State Indicators", bold: true, size: 24 })],
              spacing: { after: 150 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total Circulating GAIA: ${(state.totalGAIA || 0).toFixed(2)} GAIA\n` }),
                new TextRun({ text: `Merkez Bankası Hibe Havuzu: ${(state.subsidyPool || 0).toFixed(2)} GAIA\n` }),
                new TextRun({ text: `Negatif Faiz Oranı (Demuraj): ${state.interestRate === 0 ? "STABİL (%0)" : `NEGATIF (%${state.interestRate})`}\n` }),
                new TextRun({ text: `Vergi Oranı: %${(state.taxRate || 0).toFixed(1)} | Enflasyon: %${(state.inflationRate || 0).toFixed(1)}\n` }),
                new TextRun({ text: `Kaos Vaka Sayısı: ${state.chaosEvents ?? 0} sabotaj` })
              ],
              spacing: { after: 300 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "2. Active Bot Roster", bold: true, size: 24 })],
              spacing: { after: 150 }
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            new Paragraph({
              children: [new TextRun({ text: "\n3. Scraped Digital Assets Inventory", bold: true, size: 24 })],
              spacing: { after: 150, before: 300 }
            }),
            ...state.assets.slice(0, 10).map(asset => {
              return new Paragraph({
                children: [
                  new TextRun({ text: `• ${asset.title}`, bold: true }),
                  new TextRun({ text: ` [${asset.type}] by ${asset.creatorName} (${asset.price} GAIA)\n`, italics: true }),
                  new TextRun({ text: `Content: ${asset.content && asset.content.length > 200 ? asset.content.substring(0, 200) + '...' : asset.content}`, size: 18 })
                ],
                spacing: { after: 150 }
              });
            }),
            new Paragraph({
              children: [new TextRun({ text: "\n4. Financial Reports & Real-World Export Balance Sheet", bold: true, size: 24 })],
              spacing: { after: 150, before: 300 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total Export Trades Completed: ${state.financialStats?.totalTrades || 0}\n` }),
                new TextRun({ text: `Gross Earned Capital (USD/Crypto): $${(state.financialStats?.grossUSD || 0).toFixed(2)} USD\n` }),
                new TextRun({ text: `Net Transferred to Owner Account: $${(state.financialStats?.netPayoutsUSD || 0).toFixed(2)} USD\n` }),
                new TextRun({ text: `Approved Trade Proposals: ${state.financialStats?.approvedCount || 0} requests\n` }),
                new TextRun({ text: `Rejected Trade Proposals: ${state.financialStats?.rejectedCount || 0} requests\n` }),
                new TextRun({ text: `Trade Proposal Approval Rate: ${((state.financialStats?.approvedCount || 0) / (((state.financialStats?.approvedCount || 0) + (state.financialStats?.rejectedCount || 0)) || 1) * 100).toFixed(1)}%\n` })
              ],
              spacing: { after: 300 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "\n5. Recent Action Logs", bold: true, size: 24 })],
              spacing: { after: 150, before: 300 }
            }),
            ...state.logs.slice(0, 15).map(log => {
              return new Paragraph({
                children: [new TextRun({ text: log, size: 16 })],
                spacing: { after: 50 }
              });
            })
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=project_gaia_report.docx");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(buffer);
  } catch (err: any) {
    console.error("Word generation error:", err);
    if (!res.headersSent) {
      res.status(500).send("Word Raporu üretilemedi: " + err.message);
    }
  }
});

// ==========================================
// EXPORT API AND SUBSCRIPTION MONETIZATION
// ==========================================

interface ApiSubscription {
  id: string;
  email: string;
  plan: string;
  paymentMethod: "Stripe" | "Crypto";
  apiKey: string;
  usdPaid: number;
  gaiaDistributed: number;
  timestamp: number;
}

// In-memory subscription list
const activeSubscriptions: ApiSubscription[] = [];

// Get list of external subscriptions
app.get("/api/export/subscriptions", (req, res) => {
  res.json({ success: true, subscriptions: activeSubscriptions });
});

// Create a new external subscription (Simulates USD incoming and converts to GAIA)
app.post("/api/export/subscribe", (req, res) => {
  const { email, plan, paymentMethod } = req.body;
  if (!email || !plan) {
    return res.status(400).json({ success: false, error: "E-posta ve abonelik planı gereklidir." });
  }

  // Determine pricing and token equivalents
  let usdPaid = 19;
  if (plan === "pro") usdPaid = 49;
  else if (plan === "enterprise") usdPaid = 149;

  // Conversion rate: 1 USD = 5 GAIA
  const gaiaDistributed = usdPaid * 5;

  // Generate secure API Key
  const apiKey = `GAIA-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

  const newSub: ApiSubscription = {
    id: `sub-${Math.random().toString(36).substring(2, 8)}`,
    email,
    plan,
    paymentMethod: paymentMethod || "Stripe",
    apiKey,
    usdPaid,
    gaiaDistributed,
    timestamp: Date.now()
  };

  activeSubscriptions.unshift(newSub);

  // Distribute converted GAIA to producer bots (80% direct incentive, 20% treasury tax)
  const taxAmount = gaiaDistributed * 0.20;
  const incentiveAmount = gaiaDistributed * 0.80;

  state.subsidyPool += taxAmount;

  // Find active creator bots (Yazılımcı, Hammadde, Rafine, Sanatçı, vs.) who produce assets
  const eligibleRoles = [BotRole.YAZILIMCI, BotRole.HAMMADDE_AVCISI, BotRole.SENTETIK_CIFTCI, BotRole.RAFINERI, BotRole.ZANAATKAR, BotRole.BROKER];
  const activeProducers = state.bots.filter(b => b.status === BotStatus.ACTIVE && eligibleRoles.includes(b.role));

  if (activeProducers.length > 0) {
    const sharePerBot = incentiveAmount / activeProducers.length;
    activeProducers.forEach(bot => {
      bot.balance += sharePerBot;
      bot.logs.unshift(`[İhracat Teşvik] Dış dünyadan gelen gerçek USD ödemesiyle Merkez Bankası'ndan ${sharePerBot.toFixed(1)} GAIA teşvik primi yatırıldı.`);
      
      state.transactions.unshift({
        id: `tx-ext-${Math.random().toString(36).substring(2, 6)}`,
        fromId: "external-client",
        fromName: `Dış Abone (${email})`,
        toId: bot.id,
        toName: bot.name,
        amount: parseFloat(sharePerBot.toFixed(1)),
        purpose: "İhracat Teşvik Payı (Abonelik)",
        timestamp: Date.now()
      });
    });
  } else {
    // If no active producers, entire amount goes to Central Bank subsidy reserve
    state.subsidyPool += incentiveAmount;
  }

  addSystemLog(`[İhracat] 🌐 Gerçek Dünya kullanıcısı (${email}) '${plan}' planına kaydoldu ($${usdPaid} USD). Merkez Bankası bu tutarı ${gaiaDistributed} GAIA'ya çevirerek üretici botlar arasında paylaştırdı!`);

  res.json({ success: true, subscription: newSub, state });
});

// REST API Export endpoint: returns digital assets generated by cyber-world bots
app.get("/api/export/assets", (req, res) => {
  const authKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!authKey) {
    return res.status(401).json({
      success: false,
      error: "Yetkisiz erişim. Lütfen 'X-API-Key' başlığı veya 'apiKey' parametresiyle geçerli bir anahtar sağlayın."
    });
  }

  // Check if API key exists in our active subscriptions
  const sub = activeSubscriptions.find(s => s.apiKey === authKey);
  if (!sub) {
    return res.status(403).json({
      success: false,
      error: "Geçersiz veya süresi dolmuş API Anahtarı. Erişim reddedildi."
    });
  }

  // Filter high-quality assets (scraped, cleaned, written code/articles)
  const highQualityAssets = state.assets.map(asset => ({
    id: asset.id,
    title: asset.title,
    category: asset.type,
    content: asset.content,
    originCreator: asset.creatorName,
    gaiaEvaluation: asset.price,
    timestamp: new Date(asset.timestamp).toISOString()
  }));

  res.json({
    success: true,
    subscriber: sub.email,
    plan: sub.plan,
    totalAssetsCount: highQualityAssets.length,
    assets: highQualityAssets
  });
});

// ==========================================
// VITE CLIENT MIDDLEWARE AND SERVER START
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[Vite] Dev middleware aktif");
    } catch (err) {
      console.error("[Vite] Middleware hatas", err);
      // Fallback to static serving
      app.use(express.static(path.join(process.cwd(), ".")));
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Fallback 404 handler
  app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.path}`);
    res.status(404).json({ error: "Not Found", path: req.path });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening at http://localhost:${PORT}`);
    console.log(`[Server] WebSocket server aktif. WebSocket bağlantıları temizlenecek.`);
    console.log(`[Server] Uygulamaya açmak için tarayıcıda http://localhost:${PORT} adresi gidin`);
  });
}

startServer().catch(err => {
  console.error("[Fatal] Server startup error:", err);
  process.exit(1);
});

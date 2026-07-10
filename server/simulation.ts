import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { AutoSpawnController } from "./AutoSpawnController.js";
import { CyberWarfare } from "./CyberWarfare.js";
import { CentralBankManager } from "./CentralBankManager.js";
import { BotManager } from "./BotManager.js";
import { MapEngine } from "./MapEngine.js";
import { NaturalSelection } from "./NaturalSelection.js";
import { GatewayManager } from "./GatewayManager.js";
import { AutomationManager } from "./AutomationManager.js";
import { ExternalApiMarket } from "./ExternalApiMarket.js";
import { MarketingManager } from "./MarketingManager.js";
import {
  Bot,
  BotMinistry,
  BotRole,
  BotStatus,
  Job,
  DigitalAsset,
  LedgerTransaction,
  SimulationState,
  SkillMatrix
} from "../src/types.js";

// v9.5: Open-Source AI Integration (Anahtarsız)
// Gemini API varsa kullan, yoksa açık kaynak fallback kullan
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[AI] Gemini API client başarıyla yüklendi.");
  } catch (err) {
    console.error("[AI] Gemini başlatılamadı, açık kaynak fallback'e geçiliyor:", err);
  }
} else {
  console.log("[AI] GEMINI_API_KEY bulunamadı. Açık kaynak AI proxy kullanılacak.");
}

// v9.5: Açık Kaynak AI Çağrı Fonksiyonu (API key gerektirmez)
async function getOpenSourceAIResponse(prompt: string): Promise<string> {
  try {
    // ChatEverywhere API (Ücretsiz, anahtarsız, sürdürülebilir)
    const response = await fetch("https://chateverywhere.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      }),
      timeout: 10000
    } as any);

    if (!response.ok) {
      throw new Error(`API yanıt: ${response.status}`);
    }

    const data = await response.json() as any;
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    return "Karar motoru geçici olarak kullanılamıyor. Otonom mod devam ediyor.";
  } catch (error) {
    // Fallback: Yerel Ollama varsa dene
    try {
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama2",
          prompt: prompt,
          stream: false
        }),
        timeout: 5000
      } as any);

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json() as any;
        return data?.response || "Ollama yanıt veremedi.";
      }
    } catch (ollamaErr) {
      // Ollama de çalışmıyorsa sessiz başarısız
    }

    // Son çare: Procedural fallback
    return "Otonom karar motoru geçici olarak çevrimdışı. Sistem procedural moda geçti.";
  }
}

// Global In-Memory Simulation State
export const state: SimulationState = {
  bots: [],
  jobs: [],
  assets: [],
  transactions: [],
  marketVolume: 0,
  totalGAIA: 10000.0,
  inflationRate: 2.5,
  taxRate: 5.0,
  serverCpu: 20,
  serverRam: 25,
  subsidyPool: 2500.0,
  logs: [],
  recycledBotCount: 0,
  activeTicks: 0,
  autoPlay: false,
  activeProxy: "185.112.54.21",
  proxyRotations: 0,
  rateLimitRisk: 10,
  bankruptcyCount: 0,
  geminiMode: "procedural",
  geminiQuotaExhausted: false,
  geminiCooldownUntil: 0,
  interestRate: 0,
  resilienceScore: 100,
  chaosEvents: 0,
  evolutionGeneration: 0,
  ownerIban: process.env.OWNER_IBAN || "TR320015700000000091775122",
  ownerCryptoWallet: process.env.OWNER_CRYPTO_ADDRESS || "TU8h8hnYA9i7SX1hQKLyZfFUY74oGd3yNn",
  ownerName: process.env.OWNER_NAME || "Abdulkadir Kan",
  ownerBank: process.env.OWNER_BANK || "QNB Finansbank",
  ownerCryptoPrivateKey: process.env.OWNER_CRYPTO_ADDRESS || "TU8h8hnYA9i7SX1hQKLyZfFUY74oGd3yNn",
  cryptoNetwork: process.env.CRYPTO_NETWORK || "TRC-20 (TRON Network)",
  cryptoAsset: process.env.CRYPTO_ASSET || "USDT",
  autoPayoutThreshold: "instant",
  financialStats: {
    totalTrades: 0,
    grossUSD: 0.0,
    netPayoutsUSD: 0.0,
    approvedCount: 0,
    rejectedCount: 0
  },
  tradeRequests: [],
  treasures: [],
  particleEffects: [],
  creatorProfitPool: 0.0, // v9.7: Kurucu kâr payı havuzu
  totalPayoutsProcessed: 0.0, // v9.7: Toplam ödenen miktar
  externalMarketData: [], // v10.0: Dış pazarda listelenen ürünler
  externalRevenue: 0.0, // v10.0: Dış veri satışından elde edilen toplam gelir
  externalSalesCount: 0, // v10.0: Toplam dış satış işlemi sayısı
  marketingCampaigns: 0, // v12.0: Pazarlama kampanyası sayısı
  estimatedTraffic: 0 // v12.0: Tahmini ziyaretçi sayısı
};

// Check if Gemini can be called safely
export function isGeminiAvailable(): boolean {
  if (!ai) return false;
  if (state.geminiMode === "procedural") return false;
  if (state.geminiQuotaExhausted) return false;
  if (state.geminiCooldownUntil && state.geminiCooldownUntil > Date.now()) return false;
  return true;
}

// Manage Gemini Errors and set cooldowns
export function handleGeminiError(err: any, context: string) {
  const errMsg = err?.message || String(err);
  const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("Quota");
  
  if (isQuota) {
    state.geminiQuotaExhausted = true;
    state.geminiCooldownUntil = Date.now() + 5 * 60 * 1000; // 5 minute cooldown
    addSystemLog(`[Sistem/Limit] Gemini API kotası doldu. Sistem otonom olarak 'Yerel Şablon' moduna alındı. 5 dakika sonra tekrar denenecek.`);
    console.warn(`[Gemini API Warning] Quota exceeded in ${context}. Gracefully falling back to local procedural generators.`);
  } else {
    state.geminiCooldownUntil = Date.now() + 30 * 1000; // 30 second transient cooldown
    addSystemLog(`[Sistem/Hata] Gemini API hatası saptandı. 30 saniye boyunca geçici olarak yerel mod aktif edildi.`);
    console.warn(`[Gemini API Warning] Transient error in ${context}: ${errMsg}. Gracefully falling back.`);
  }
}

// Queue Mock Class mimicking BullMQ Queues
export class SimulationQueue {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  add(jobName: string, data: any): Job {
    const job: Job = {
      id: `job-${crypto.randomBytes(4).toString("hex")}`,
      queueName: this.name,
      name: jobName,
      status: "waiting",
      data,
      progress: 0,
      timestamp: Date.now()
    };
    state.jobs.push(job);

    // v6.8: Ultraagressif iş temizliği - bellek sızıntısı engelleme
    // Completed işleri hemen sil (keep 0 only)
    const completedJobs = state.jobs.filter(j => j.status === "completed" || j.status === "failed");
    for (const j of completedJobs) {
      const idx = state.jobs.indexOf(j);
      if (idx !== -1) {
        state.jobs.splice(idx, 1);
      }
    }

    // Kuyruk boyutu çok artarsa agresif kesme
    if (state.jobs.length > 150) {
      // Sadece bekleme ve aktif işleri tut (max 50)
      state.jobs = state.jobs
        .filter(j => j.status === "waiting" || j.status === "active")
        .slice(0, 50);
    } else if (state.jobs.length > 80) {
      // Orta düzey temizlik
      state.jobs = state.jobs.filter(j => j.status !== "failed");
    }

    // Null check - job data'yı hafiflet
    if (job.data && typeof job.data === "object") {
      const dataStr = JSON.stringify(job.data);
      if (dataStr.length > 1000) {
        job.data = { truncated: true };
      }
    }

    addSystemLog(`[Queue] ${this.name} kuyruğuna iş eklendi (${state.jobs.length} beklemede)`);
    return job;
  }
}

// Define specific simulation queues
export const productionQueue = new SimulationQueue("production-queue");
export const refineryQueue = new SimulationQueue("refinery-queue");
export const craftingQueue = new SimulationQueue("crafting-queue");
export const economyQueue = new SimulationQueue("economy-queue");
export const justiceQueue = new SimulationQueue("justice-queue");

// System Logger with corruption prevention
export function addSystemLog(msg: string) {
  // Sanitize message to prevent corruption
  if (!msg || typeof msg !== "string") return;

  const sanitized = msg
    .substring(0, 500) // Limit message length
    .replace(/\[BOZUK\]/g, "[ERROR]") // Replace corrupted markers
    .replace(/\0/g, ""); // Remove null bytes

  const timestamp = new Date().toLocaleTimeString("tr-TR");
  const logStr = `[${timestamp}] ${sanitized}`;
  state.logs.unshift(logStr);

  // Aggressive log trimming under memory pressure
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  if (heapPercent > 95) {
    state.logs = state.logs.slice(0, 10);
  } else if (heapPercent > 90) {
    state.logs = state.logs.slice(0, 30);
  } else if (heapPercent > 85) {
    state.logs = state.logs.slice(0, 50);
  } else if (state.logs.length > 200) {
    state.logs.pop();
  }
}

// Bot Class Definition (Class-based Object Blueprint)
export class CyberBot implements Bot {
  id: string;
  name: string;
  ministry: BotMinistry;
  role: BotRole;
  status: BotStatus;
  energy: number;
  balance: number;
  skillMatrix: SkillMatrix;
  createdTick: number;
  performanceScore: number;
  logs: string[];

  // v8.2: Siber Savaş Özellikleri
  hp: number = 100; // Sağlık Puanı (1-100)
  isAttacking: boolean = false;
  targetBotId?: string; // Hedef bot ID
  posX: number = Math.random() * 800; // Harita X koordinatı
  posY: number = Math.random() * 600; // Harita Y koordinatı

  constructor(name: string, role: BotRole, ministry: BotMinistry, skillMatrix: Partial<SkillMatrix> = {}) {
    this.id = `bot-${crypto.randomUUID()}`;
    this.name = name;
    this.role = role;
    this.ministry = ministry;
    this.status = BotStatus.ACTIVE;
    this.energy = 100;
    this.balance = 100.0; // Starting GAIA Tokens
    this.createdTick = state.activeTicks;
    this.performanceScore = 50;
    this.logs = [];

    // Default skill values (procedural generation base)
    this.skillMatrix = {
      extraction: skillMatrix.extraction ?? (role === BotRole.HAMMADDE_AVCISI ? 80 : 10),
      generation: skillMatrix.generation ?? (role === BotRole.SENTETIK_CIFTCI ? 85 : 10),
      refinement: skillMatrix.refinement ?? (role === BotRole.RAFINERI ? 80 : 10),
      crafting: skillMatrix.crafting ?? (role === BotRole.ZANAATKAR ? 90 : 10),
      pricing: skillMatrix.pricing ?? (role === BotRole.BROKER ? 85 : 10),
      coding: skillMatrix.coding ?? (role === BotRole.YAZILIMCI ? 90 : 10),
      architecture: skillMatrix.architecture ?? (role === BotRole.MIMAR ? 80 : 10),
      regulation: skillMatrix.regulation ?? (role === BotRole.REGULATOR ? 85 : 10),
      inspection: skillMatrix.inspection ?? (role === BotRole.MUFETTIS ? 90 : 10),
      gatewaySecurity: skillMatrix.gatewaySecurity ?? (role === BotRole.GUMRUK_KAPISI ? 95 : 10),
      // v7.1: Yeni yetenekler
      cybersecurity: skillMatrix.cybersecurity ?? (role === BotRole.SIBER_GUVENLK ? 95 : 10),
      speculation: skillMatrix.speculation ?? (role === BotRole.SPEKULATÖR ? 90 : 10)
    };

    this.log(`Bot initialized with model class. Energy: 100, Balance: 100 GAIA.`);
  }

  log(msg: string) {
    const timestamp = new Date().toLocaleTimeString("tr-TR");
    const logStr = `[${timestamp} - Tick ${state.activeTicks}] ${msg}`;
    this.logs.unshift(logStr);
    if (this.logs.length > 30) this.logs.pop();
    addSystemLog(`[${this.name} (${this.role})] ${msg}`);
  }

  // Consume energy during operations
  consumeEnergy(amount: number): boolean {
    if (this.status === BotStatus.QUARANTINE) {
      this.log("Karantina altındayım, enerji harcayamam!");
      return false;
    }
    if (this.energy < amount) {
      this.status = BotStatus.IDLE;
      this.log(`Enerjim çok düşük (${this.energy}). Şarj moduna geçiyorum.`);
      return false;
    }
    this.energy -= amount;
    return true;
  }

  // Replenish energy during rest
  recharge(amount: number) {
    if (this.status === BotStatus.RECYCLED) return;
    this.energy = Math.min(100, this.energy + amount);
    if (this.energy > 30 && this.status === BotStatus.IDLE) {
      this.status = BotStatus.ACTIVE;
      this.log(`Yeterli enerjiye ulaştım (${this.energy}). Aktif moda geri dönüyorum.`);
    }
  }

  // Pay transactions
  pay(toBot: CyberBot | string, amount: number, purpose: string): boolean {
    if (this.balance < amount) {
      this.log(`Ödeme başarısız: Yetersiz GAIA bakiye (${this.balance} < ${amount})`);
      return false;
    }
    this.balance -= amount;
    
    let toName = "Merkez Bankası";
    if (typeof toBot === "object") {
      toBot.balance += amount;
      toName = toBot.name;
    } else {
      state.subsidyPool += amount;
    }

    const tx: LedgerTransaction = {
      id: `tx-${crypto.randomBytes(4).toString("hex")}`,
      fromId: this.id,
      fromName: this.name,
      toId: typeof toBot === "object" ? toBot.id : "central-bank",
      toName,
      amount,
      purpose,
      timestamp: Date.now()
    };
    state.transactions.unshift(tx);
    if (state.transactions.length > 50) state.transactions.pop();
    
    this.log(`${toName} hesabına ${amount} GAIA aktarıldı. Gerekçe: ${purpose}`);
    return true;
  }
}

// PATCH LOG: Yazılımcı Bot'un Gerçek Kod Değişiklikleri
export const PatchLog = {
  patches: [] as Array<{ timestamp: string; botName: string; operation: string; diff: string }>,

  recordPatch(botName: string, operation: string, oldCode: string, newCode: string) {
    const timestamp = new Date().toISOString();
    const diff = `\n--- BEFORE (Eski Kod)\n${oldCode}\n\n+++ AFTER (Yeni Kod)\n${newCode}\n`;

    this.patches.push({ timestamp, botName, operation, diff });

    const patchLogPath = path.join(process.cwd(), "PATCH_LOG.txt");
    const logEntry = `[${timestamp}] Yazılımcı: ${botName}\nİşlem: ${operation}${diff}\n${'='.repeat(80)}\n\n`;

    try {
      fs.appendFileSync(patchLogPath, logEntry, "utf-8");
      addSystemLog(`[PatchLog] Kod değişikliği kaydedildi: ${patchLogPath}`);
    } catch (err) {
      console.error("PatchLog write error:", err);
    }
  }
};

// Real-World Internet Data Fetching
export const RealityBridge = {
  fetchedDataSize: 0, // Total bytes fetched from real internet
  networkRequests: 0,
  lastFetchTime: 0,

  async fetchWikipediaArticle(): Promise<string> {
    try {
      this.networkRequests++;
      const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as any;
      const summary = data.extract || "Veri bulunamadı";
      this.fetchedDataSize += summary.length;
      this.lastFetchTime = Date.now();
      return summary;
    } catch (err) {
      addSystemLog(`[Gümrük Kapısı/Real] Wikipedia fetch başarısız: ${(err as any).message}`);
      return null;
    }
  },

  async fetchGithubTrending(): Promise<string> {
    try {
      this.networkRequests++;
      const res = await fetch("https://api.github.com/search/repositories?q=stars:>1000&sort=stars&per_page=5");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as any;
      const trending = data.items?.map((r: any) => `${r.name}: ${r.description}`).join(" | ") || "Repo bulunamadı";
      this.fetchedDataSize += trending.length;
      this.lastFetchTime = Date.now();
      return trending;
    } catch (err) {
      addSystemLog(`[Gümrük Kapısı/Real] GitHub fetch başarısız: ${(err as any).message}`);
      return null;
    }
  },

  async fetchRSSNews(): Promise<string> {
    try {
      this.networkRequests++;
      const res = await fetch("https://news.ycombinator.com/rss");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const titleMatch = xml.match(/<title>([^<]+)<\/title>/g)?.slice(0, 3) || [];
      const titles = titleMatch.map(t => t.replace(/<\/?title>/g, "")).join(" | ");
      this.fetchedDataSize += titles.length;
      this.lastFetchTime = Date.now();
      return titles || "Haberler bulunamadı";
    } catch (err) {
      addSystemLog(`[Gümrük Kapısı/Real] RSS fetch başarısız: ${(err as any).message}`);
      return null;
    }
  }
};

// Mock Scraped Web Content & Templates (Fallback)
const RAW_SCRAPED_TEMPLATES = [
  "Siber Şehir veri akışlarında saptanan %12'lik artış GAIA Token talebini tetikledi.",
  "Github üzerindeki siber-kamu kütüphaneleri optimize edilmemiş veri blokları içeriyor.",
  "Sosyal medya: Bot hakları savunucuları, Mimar Bot'un karantina yetkilerine itiraz ediyor.",
  "Yeni bir merkeziyetsiz otonom borsa kuruldu. Broker botlar fiyat arbitrajı arayışında.",
  "Adalet Bakanlığı siber suç oranlarının geçen aya göre %4 azaldığını beyan etti.",
  "Hammadde avcıları için Github api entegrasyon kotaları genişletiliyor.",
  "Zanaatkarların ürettiği dijital eserlerin telif hakkı tartışmaları siber meclise taşındı.",
  "Ağ darboğazı tespiti: Gelen veri paketlerinin %15'i rafineride bekliyor."
];

// Seed initial bots (only on first startup)
export function seedInitialSimulation() {
  if (state.bots.length > 0) return;

  addSystemLog("Siber-Dünya Simülasyonu ilk kez başlatılıyor, bakanlıklar yapılandırılıyor...");

  // 1. Üretim Bakanlığı
  state.bots.push(new CyberBot("Avcı-Alpha", BotRole.HAMMADDE_AVCISI, BotMinistry.URETIM, { extraction: 85 }));
  state.bots.push(new CyberBot("Çiftçi-Zeta", BotRole.SENTETIK_CIFTCI, BotMinistry.URETIM, { generation: 90 }));

  // 2. Sanayi ve Teknoloji Bakanlığı
  state.bots.push(new CyberBot("Refiner-Beta", BotRole.RAFINERI, BotMinistry.SANAYI_TEKNOLOJI, { refinement: 80 }));
  state.bots.push(new CyberBot("Zanaatkar-Vinci", BotRole.ZANAATKAR, BotMinistry.SANAYI_TEKNOLOJI, { crafting: 95 }));
  state.bots.push(new CyberBot("Broker-WallStreet", BotRole.BROKER, BotMinistry.SANAYI_TEKNOLOJI, { pricing: 85 }));

  // 3. Altyapı ve Evrim Bakanlığı
  state.bots.push(new CyberBot("Yazılımcı-Ada", BotRole.YAZILIMCI, BotMinistry.ALTYAPI_EVRIM, { coding: 90 }));
  state.bots.push(new CyberBot("Mimar-Sinan", BotRole.MIMAR, BotMinistry.ALTYAPI_EVRIM, { architecture: 85 }));
  state.bots.push(new CyberBot("Gümrük-Kapısı", BotRole.GUMRUK_KAPISI, BotMinistry.ALTYAPI_EVRIM, { gatewaySecurity: 95 }));

  // 4. Merkez Bankası ve Maliye Bakanlığı
  state.bots.push(new CyberBot("Maliye-Kemal", BotRole.REGULATOR, BotMinistry.EKONOMI_FINANS, { regulation: 90 }));

  // 5. Adalet Bakanlığı
  state.bots.push(new CyberBot("Yargıç-Dredd", BotRole.MUFETTIS, BotMinistry.ADALET, { inspection: 95 }));

  // v7.1: Yeni Bakanlık - Siber Savunma
  state.bots.push(new CyberBot("Savunma-Kalkan", BotRole.SIBER_GUVENLK, BotMinistry.SAVUNMA, { cybersecurity: 95 }));

  // v7.1: Borsa - Spekülatör Bot (Ticari dinamik için)
  state.bots.push(new CyberBot("Spekülatör-Tokyo", BotRole.SPEKULATÖR, BotMinistry.EKONOMI_FINANS, { speculation: 90 }));

  addSystemLog(`12 temel Bot sınıfı ve 6 Bakanlık başarıyla kuruldu. v7.1: Siber Savunma ve Borsa sistemi entegre edildi.`);
}

// PlanetManager - Siber-Dünya Anayasası ve Kurallarını denetleyen global yönetim sınıfı
export class PlanetManager {
  static async tick() {
    state.activeTicks++;

    // 1. Recharging Idle and Recovering Bots
    for (const b of state.bots) {
      if (b.status === BotStatus.RECYCLED) continue;
      const instance = Object.assign(new CyberBot(b.name, b.role, b.ministry), b);
      if (instance.status === BotStatus.IDLE) {
        instance.recharge(15); // Recharge rapidly when resting
        Object.assign(b, instance);
      } else if (instance.status === BotStatus.ACTIVE) {
        instance.recharge(2); // Passive recharge while awake
        Object.assign(b, instance);
      }
    }

    // 2. Resource & CPU Monitoring (Mimar Bot Action)
    simulateServerHardware();
    await handleInfrastructureTasks();

    // 3. Finance & Fiscal Governance (Regulator Bot Action)
    handleFiscalTasks();

    // 4. Queue Dispatcher (Triggering Job generation and Worker processing)
    await handleQueueAndWorkerTasks();

    // 5. Justice & Court audits (Müfettiş Bot Action)
    await handleJusticeTasks();

    // 6. ANAYASA 1: Enerji ve Yaşam Döngüsü & İflas Kontrolü
    await this.evaluateEnergyAndBankruptcy();

    // 7. ANAYASA 2: Evrimsel Çoğaltım (Genetic Algorithm)
    await this.evaluateEvolutionRules();

    // 8. ANAYASA 3: Dış Dünya Sınırı ve Gümrük Kapısı (Proxy Rotation)
    await this.evaluateGatewayProxyRotation();

    // 9. ANAYASA 4: Kaos ve Kendi Kendini İyileştirme (Chaos & Self-Healing)
    if (state.autoPlay && Math.random() < 0.04) {
      this.triggerChaosEvent(false);
    }
    if (state.resilienceScore !== undefined && state.resilienceScore < 100) {
      await this.evaluateSelfHealing();
    }

    // 10. v7.0: OTONOM NÜFUS PATLAMASI (AutoSpawn)
    await AutoSpawnController.evaluateAutoSpawn();

    // 11. v8.2: SİBER SAVAŞ VE GÜVENLİK
    CyberWarfare.simulateCombat();
    CyberWarfare.maintainSoldierPatrol();

    // Sabotaj tetiklendiğinde korsan spawn et
    if (state.chaosEvents > 100 && Math.random() < 0.1) {
      CyberWarfare.spawnPirateBot();
    }

    // 12. v8.3: OTONOM MERKEZ BANKASI
    CentralBankManager.evaluateMonetaryPolicy();

    // 13. v8.5: PASIF BOT TEMIZLEYICISI (RAM Optimizasyonu)
    BotManager.pruneInactiveBots();

    // 14. v9.2: HAZİNE SPAWN MEKANIZMASI
    MapEngine.spawnTreasures();

    // v9.5: Partikül efektleri güncelle
    MapEngine.updateParticleEffects();

    // Botlar için hazine algısı güncellemesi
    for (const bot of state.bots) {
      if (bot.status === BotStatus.ACTIVE) {
        MapEngine.checkBotNearTreasure(bot.id, bot.posX || 0, bot.posY || 0);
        MapEngine.updateBotTargetWithTreasure(bot);
        NaturalSelection.updatePerformanceScore(bot);
      }
    }

    // v9.5: Hazine ve parçacık verilerini state'e senkronize et (UI için)
    state.treasures = MapEngine.treasureChests.map(t => ({
      id: t.id,
      type: t.type,
      posX: t.posX,
      posY: t.posY,
      value: t.value,
      discovered: t.discovered,
      discoveredBy: t.discoveredBy,
      timestamp: t.timestamp,
      visualEffectTick: t.visualEffectTick
    }));
    state.particleEffects = MapEngine.particleEffects.map(p => ({
      id: p.id,
      treasureId: p.treasureId,
      treasureX: p.treasureX,
      treasureY: p.treasureY,
      color: p.color,
      spawnTick: p.spawnTick,
      lifetime: p.lifetime
    }));

    // 15. v9.3: OTONOM DOĞAL SEÇİLİM (Natural Selection)
    NaturalSelection.evaluateSelection();

    // 16. v9.5: GÜMRÜK OTONOM KORUMA (Gateway Protection)
    GatewayManager.evaluateBanRisk();

    // 17. v9.7: OTONOM FINANSAL HASAT (Autonomous Financial Harvest)
    AutomationManager.handleAutonomousPayouts(state.activeTicks);

    // v9.7: Kurucu kâr havuzu ve işlem sayısını state'e senkronize et
    state.creatorProfitPool = AutomationManager.creatorProfitPool;
    state.totalPayoutsProcessed = AutomationManager.totalPayoutsProcessed;

    // 18. v10.0: SIFIR SERMAYESİ DIŞ PİYASA (Zero-Capital External Market)
    // OTOMASYON: Yeni asset'ler otomatik olarak dış pazara ekleniyor
    for (const asset of state.assets) {
      // Her asset en az bir kez pazara eklenmesi gerekir
      const alreadyInMarket = ExternalApiMarket.marketData.some(p => p.title === asset.title);
      if (!alreadyInMarket && asset.title && asset.content) {
        // Asset türünü dış pazarın formunda dönüştür
        let marketType: "RefinedData" | "ReportAnalysis" | "AITraining" | "CodeModule" = "RefinedData";
        if (asset.type.includes("Makale")) marketType = "ReportAnalysis";
        else if (asset.type.includes("Kod")) marketType = "CodeModule";
        else if (asset.type.includes("Görsel")) marketType = "AITraining";

        // Fiyatı GAIA'dan USDT'ye dönüştür (1 GAIA = 1 USDT basit dönüşüm)
        const priceUSDT = asset.price * 0.95; // %5 kâr marjı

        // Yeni veriyi dış pazara ekle
        ExternalApiMarket.marketData.push({
          id: asset.id,
          title: asset.title,
          type: marketType,
          content: asset.content.substring(0, 300), // İlk 300 karakter
          sourceBot: asset.creatorName,
          priceUSDT: priceUSDT,
          timestamp: asset.timestamp
        });
      }
    }

    ExternalApiMarket.updateExternalMarketplace();

    // v10.0: Dış pazaar verilerini state'e senkronize et
    state.externalMarketData = ExternalApiMarket.marketData.map(p => ({
      id: p.id,
      title: p.title,
      type: p.type,
      content: p.content,
      sourceBot: p.sourceBot,
      priceUSDT: p.priceUSDT,
      timestamp: p.timestamp
    })) as any;
    state.externalRevenue = ExternalApiMarket.totalExternalRevenue;
    state.externalSalesCount = ExternalApiMarket.salesHistory.length;

    // 19. v12.0: OTONOM PAZARLAMA (Autonomous Growth Hacking)
    MarketingManager.executeMarketingCycle(state.activeTicks);

    // v12.0: Pazarlama istatistiklerini state'e senkronize et
    state.marketingCampaigns = MarketingManager.campaigns.length;
    state.estimatedTraffic = MarketingManager.totalTraffic;
  }

  // 1. Enerji ve Yaşam Döngüsü
  private static async evaluateEnergyAndBankruptcy() {
    const activeBots = state.bots.filter(b => b.status === BotStatus.ACTIVE || b.status === BotStatus.IDLE);
    const brokers = state.bots.filter(b => b.role === BotRole.BROKER && b.status === BotStatus.ACTIVE);
    const coders = state.bots.filter(b => b.role === BotRole.YAZILIMCI && b.status === BotStatus.ACTIVE);

    for (const b of activeBots) {
      // Enerji kritik seviyeye (< 15) düştüyse pazardan (Tüccar botlardan) Enerji Paketi satın alma
      if (b.energy < 15) {
        const packPrice = 15; // 15 GAIA
        if (b.balance >= packPrice) {
          b.balance -= packPrice;
          b.energy = Math.min(100, b.energy + 80); // +80 enerji kazandırır

          // Eğer piyasada aktif bir Broker (Tüccar) varsa ona öde, yoksa Merkez Bankası hibe havuzuna
          if (brokers.length > 0) {
            const broker = brokers[Math.floor(Math.random() * brokers.length)];
            broker.balance += packPrice;

            const tx: LedgerTransaction = {
              id: `tx-${crypto.randomBytes(4).toString("hex")}`,
              fromId: b.id,
              fromName: b.name,
              toId: broker.id,
              toName: broker.name,
              amount: packPrice,
              purpose: "Enerji Paketi Satın Alma",
              timestamp: Date.now()
            };
            state.transactions.unshift(tx);
            b.logs.unshift(`[Enerji] Tüccar ${broker.name} botundan 15 GAIA karşılığında 'Enerji Paketi' satın alındı.`);
            broker.logs.unshift(`[Ticaret] ${b.name} botuna 15 GAIA karşılığında 'Enerji Paketi' satıldı.`);
          } else {
            state.subsidyPool += packPrice;
            const tx: LedgerTransaction = {
              id: `tx-${crypto.randomBytes(4).toString("hex")}`,
              fromId: b.id,
              fromName: b.name,
              toId: "central-bank",
              toName: "Merkez Bankası",
              amount: packPrice,
              purpose: "Sistem Rezervinden Enerji Paketi Alımı",
              timestamp: Date.now()
            };
            state.transactions.unshift(tx);
            b.logs.unshift(`[Enerji] Merkez Bankasından 15 GAIA karşılığında 'Enerji Paketi' satın alındı.`);
          }
          addSystemLog(`[Enerji] ${b.name} enerjisi tükendiği için pazardan Enerji Paketi satın aldı (+80 Enerji).`);
        } else if (b.energy <= 0) {
          // Parası yetmeyen bot 'İflas' eder
          b.status = BotStatus.RECYCLED;
          state.recycledBotCount++;
          state.bankruptcyCount = (state.bankruptcyCount || 0) + 1;

          // Yazılımcı botlar tarafından parçalanır
          if (coders.length > 0) {
            const coder = coders[0];
            coder.balance += 5; // Söküm/parçalama teşviki
            b.logs.unshift(`[İflas] 🚨 Enerjim bitti ve bakiyem yetersiz! Yazılımcı ${coder.name} tarafından parçalandım.`);
            coder.logs.unshift(`[Geri Dönüşüm] İflas eden ${b.name} botunu parçalara ayırdım ve söküm ücreti aldım (+5 GAIA).`);
            addSystemLog(`[İflas] 🚨 ${b.name} botu iflas etti ve Yazılımcı ${coder.name} tarafından sökülerek parçalandı.`);
          } else {
            state.subsidyPool += 5;
            b.logs.unshift(`[İflas] 🚨 Enerjim bitti ve bakiyem yetersiz! Merkez Bankası tarafından parçalandım.`);
            addSystemLog(`[İflas] 🚨 ${b.name} botu iflas etti ve Merkez Bankası tarafından otomatik parçalandı.`);
          }
        }
      }
    }
  }

  // 2. Evrim Kuralları (Bot Evrim Laboratuvarı)
  private static async evaluateEvolutionRules() {
    // Aşırı çoğalmayı önlemek için her 12 tıkta bir evrim döngüsü çalışır
    if (state.activeTicks % 12 !== 0) return;

    const coders = state.bots.filter(b => b.role === BotRole.YAZILIMCI && b.status === BotStatus.ACTIVE);
    if (coders.length === 0) return;

    const coder = coders[0];

    // En başarılı bot adaylarını tespit et (Yazılımcı ve Gümrük botları hariç)
    const candidates = state.bots.filter(
      b => b.status === BotStatus.ACTIVE && 
      b.role !== BotRole.YAZILIMCI && 
      b.role !== BotRole.GUMRUK_KAPISI
    );
    if (candidates.length === 0) return;

    // 1. ADIM: Doğal Seçilim (Worst Performing Bots Deletion)
    // En düşük bakiyeli 3 botu siliyoruz (eğer o rolde tek aktif bot değilseler)
    const worstBots = [...candidates].sort((a, b) => a.balance - b.balance);
    let deletedCount = 0;
    const deletedNames: string[] = [];

    for (const b of worstBots) {
      if (deletedCount >= 3) break;
      
      // O rolden başka aktif bot var mı kontrol et (tek kalmasın)
      const sameRoleActive = state.bots.filter(ob => ob.role === b.role && ob.status === BotStatus.ACTIVE);
      if (sameRoleActive.length > 1) {
        b.status = BotStatus.RECYCLED;
        state.recycledBotCount++;
        deletedCount++;
        deletedNames.push(b.name);
        b.logs.unshift(`[Doğal Seçilim] En az performans gösteren botlar arasındaydım, siber evrim gereği sistemden silindim.`);
      }
    }

    if (deletedCount > 0) {
      addSystemLog(`[Evrim/Yapay Seçilim] 🧬 En başarısız ve durağan ${deletedCount} bot (${deletedNames.join(", ")}) doğal seçilim algoritmasıyla elendi.`);
    }

    // 2. ADIM: Hibrit Üreme / Klonlama (Elite Breeding)
    state.evolutionGeneration = (state.evolutionGeneration || 0) + 1;

    // En zengin/başarılı botları bul (Top 3 Elit)
    const activeCandidates = state.bots.filter(
      b => b.status === BotStatus.ACTIVE && 
      b.role !== BotRole.YAZILIMCI && 
      b.role !== BotRole.GUMRUK_KAPISI
    );
    if (activeCandidates.length === 0) return;

    activeCandidates.sort((a, b) => b.balance - a.balance);
    const elites = activeCandidates.slice(0, 3);
    const fittest = elites[0];
    
    const spawnCost = 35; // Evrimsel çoğaltım maliyeti
    if (coder.balance < spawnCost) {
      coder.logs.unshift(`[Evrim] Yeni nesil üretmek için bakiye yetersiz (Mevcut: ${coder.balance.toFixed(1)} < Gereken: ${spawnCost} GAIA).`);
      return;
    }

    coder.balance -= spawnCost;
    state.subsidyPool += spawnCost;

    // Hibrit eşleşme: En başarılı bot (fittest) ile ikinci en başarılı botun genlerini birleştir
    const partner = elites[Math.min(elites.length - 1, 1)];
    const mutatedMatrix: SkillMatrix = { ...fittest.skillMatrix };

    for (const key of Object.keys(mutatedMatrix) as Array<keyof SkillMatrix>) {
      if (typeof mutatedMatrix[key] === "number") {
        const genA = fittest.skillMatrix[key] || 10;
        const genB = partner.skillMatrix[key] || 10;
        // Ortalama alıp mutasyon ekle (-3 ile +9 arası)
        const avgGen = Math.floor((genA + genB) / 2);
        mutatedMatrix[key] = Math.min(100, Math.max(10, avgGen + Math.floor(-3 + Math.random() * 13)));
      }
    }

    const sameRoleCount = state.bots.filter(b => b.role === fittest.role).length;
    const shortRole = fittest.role.replace(" Bot", "").replace(" (AI)", "");
    const cloneName = `${shortRole}-EvoGen${state.evolutionGeneration}-${sameRoleCount + 1}`;

    const clone = new CyberBot(cloneName, fittest.role, fittest.ministry, mutatedMatrix);
    clone.balance = 60.0; // Yeni zeki hibrit nesle başlangıç kredisi
    state.bots.push(clone);

    coder.logs.unshift(`[Evrim Laboratuvarı] Elit ebeveynler ${fittest.name} (%${fittest.performanceScore}) ve ${partner.name} (%${partner.performanceScore}) melezlenerek yeni zeki hibrit nesil oluşturuldu: ${cloneName}.`);
    addSystemLog(`[Evrim] 🧬 Gezegen Evrim Laboratuvarı Gen-${state.evolutionGeneration} döngüsü çalıştı. Elit melez ${cloneName} üretildi. Kodlama maliyeti: 35 GAIA.`);
  }

  // 3. Dış Dünya Sınırı (Gümrük Kapısı Botu & Proxy Rotasyonu)
  private static async evaluateGatewayProxyRotation() {
    const gatewayBot = state.bots.find(b => b.role === BotRole.GUMRUK_KAPISI && b.status === BotStatus.ACTIVE);
    
    // Güvenli proxy sunucu havuzu
    const proxyPool = [
      "185.112.54.21",
      "194.22.87.114",
      "82.55.190.23",
      "203.45.18.99",
      "77.243.60.12",
      "91.132.8.210",
      "104.244.42.1"
    ];

    if (state.rateLimitRisk === undefined) state.rateLimitRisk = 10;

    if (gatewayBot) {
      // Eğer IP rate-limit/ban riski %60 veya üzerine ulaştıysa proxy rotasyonu yap
      if (state.rateLimitRisk >= 60) {
        const oldIP = state.activeProxy || proxyPool[0];
        let newIP = proxyPool[Math.floor(Math.random() * proxyPool.length)];
        while (newIP === oldIP) {
          newIP = proxyPool[Math.floor(Math.random() * proxyPool.length)];
        }

        state.activeProxy = newIP;
        state.proxyRotations = (state.proxyRotations || 0) + 1;
        const oldRisk = state.rateLimitRisk;
        state.rateLimitRisk = 10; // Riski sıfırla

        gatewayBot.logs.unshift(`[Proxy Rotasyon] Rate-limit ban riski %${oldRisk} düzeyine çıktığı için proxy rotasyonu yapıldı. Yeni IP: ${newIP}`);
        addSystemLog(`[Gümrük Kapısı] 🌐 Gümrük Kapısı Botu (${gatewayBot.name}), ana sunucu IP'sinin tehlikeye girmesini önlemek için proxy rotasyonu yaptı. Yeni IP: ${newIP}. Risk sıfırlandı: %10.`);
      } else {
        // Doğal risk sönümlenmesi (Zamanla IP ban riski azalır)
        state.rateLimitRisk = Math.max(10, state.rateLimitRisk - 2);
      }
    } else {
      // Eğer Gümrük Kapısı Botu aktif değilse, risk zamanla azalamaz ve uyarı verir
      if (state.rateLimitRisk > 50) {
        addSystemLog(`[Gümrük Kapısı] ⚠️ KRİTİK: Gümrük Kapısı Botu aktif değil! IP Engellenme riski tehlikeli düzeyde: %${state.rateLimitRisk}`);
      }
    }
  }

  // 4. Karadelik Senaryosu (Chaos Incident)
  public static triggerChaosEvent(manual: boolean = false) {
    state.chaosEvents = (state.chaosEvents || 0) + 1;
    state.resilienceScore = Math.max(20, (state.resilienceScore || 100) - Math.floor(30 + Math.random() * 20));

    // Choose what to break randomly
    const breakType = Math.floor(Math.random() * 3);
    let targetName = "";

    if (breakType === 0) {
      // 1. Break a random bot's functions
      const targets = state.bots.filter(b => b.status === BotStatus.ACTIVE && b.role !== BotRole.YAZILIMCI);
      if (targets.length > 0) {
        const victim = targets[Math.floor(Math.random() * targets.length)];
        victim.status = BotStatus.QUARANTINE;
        victim.energy = 5;
        // Corrupt its skills
        for (const k of Object.keys(victim.skillMatrix) as Array<keyof SkillMatrix>) {
          victim.skillMatrix[k] = Math.max(10, Math.floor((victim.skillMatrix[k] || 50) * 0.4));
        }
        targetName = `${victim.name} botunun yetenek matrisi bozunuma uğradı ve karantinaya alındı`;
        victim.logs.unshift(`[Kriz] 🚨 KAOS! Bir sistem anomalisi (Karadelik Senaryosu) fonksiyonlarımı bozdu ve beni karantinaya kilitledi!`);
      }
    } else if (breakType === 1) {
      // 2. Corrupt recent digital assets
      if (state.assets.length > 0) {
        const victimAsset = state.assets[0];
        victimAsset.content = "🚨 CORRUPTED DATA STREAM // SİSTEMSEL BOZULMA // STACK_OVERFLOW_ERROR";
        victimAsset.title = `[BOZUK] ${victimAsset.title}`;
        targetName = `Son üretilen dijital varlık ("${victimAsset.title}") veri akışı çöpe çevrildi`;
      } else {
        // Fallback to CPU spike
        state.serverCpu = 99;
        targetName = "Sunucu CPU yükü yapay olarak %99'a tırmandırıldı";
      }
    } else {
      // 3. Spiking server resource & triggering gateway risk
      state.serverCpu = 98;
      state.serverRam = 95;
      state.rateLimitRisk = 85;
      targetName = "Sistem kaynakları (CPU %98, RAM %95, Ban Riski %85) yapay olarak şişirildi";
    }

    addSystemLog(`[Kaos Botu] ⚠️ KARADELİK SENARYOSU TETİKLENDİ! ${manual ? "(Manuel)" : "(Otonom)"} -> ${targetName}. Gezegen Dayanıklılık Skoru %${state.resilienceScore}'e düştü!`);
  }

  // 5. Otonom Test Sürüşü & Self-Healing Code
  public static async evaluateSelfHealing() {
    if (state.resilienceScore === undefined) state.resilienceScore = 100;
    if (state.resilienceScore >= 100) return;

    const coders = state.bots.filter(b => b.role === BotRole.YAZILIMCI && b.status === BotStatus.ACTIVE);
    if (coders.length === 0) return;

    const coder = coders[0];
    coder.status = BotStatus.ACTIVE;

    addSystemLog(`[Sistem/Onarım] 🔧 Yazılımcı ${coder.name}, saptanan sistemsel anomali ve düşen dayanıklılık skoru (%${state.resilienceScore}) için LLM Hot-Reload & Self-Healing tetikledi.`);

    // If Gemini is available, simulate actual LLM review of error
    if (isGeminiAvailable() && ai) {
      coder.logs.unshift(`[Self-Healing] Ollama/Gemini API yardımıyla stacktrace analiz ediliyor ve düzeltilmiş kod yaması oluşturuluyor...`);
      try {
        const recoveryPrompt = `Siber-dünya simülasyonumuzda Baş Yazılımcı Botusun. Sistemde bir 'Karadelik Senaryosu' kaos anomalisi oluştu. 
Hata Logu: "CRITICAL_RESILIENCE_FAULT: Score dropped to ${state.resilienceScore}%. System functions disrupted."
Sistemi ayağa kaldırmak ve bu hatayı tamir etmek için otonom bir düzeltme yaması (hot-reload patch) yaz.
Lütfen sadece Türkçe ve profesyonel bir onarım raporu ve 'DÜZELTİLDİ: <yapılan işlem>' şeklinde bir sonuç dön.`;

        const recoveryRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: recoveryPrompt
        });

        if (recoveryRes && recoveryRes.text) {
          const text = recoveryRes.text.trim();
          coder.logs.unshift(`[Self-Healing] LLM Onarım Raporu: ${text}`);
        }
      } catch (err) {
        handleGeminiError(err, "Self-Healing-Analysis");
      }
    }

    // Repair process: restoring resilience score and fixing corrupted bots
    state.resilienceScore = 100;
    state.serverCpu = Math.min(45, state.serverCpu);
    state.serverRam = Math.min(50, state.serverRam);

    // Heal all quarantined or corrupted bots
    const corruptedBots = state.bots.filter(b => b.status === BotStatus.QUARANTINE || b.energy <= 10);
    for (const cb of corruptedBots) {
      cb.status = BotStatus.ACTIVE;
      cb.energy = 100;
      // Restore skills
      for (const k of Object.keys(cb.skillMatrix) as Array<keyof SkillMatrix>) {
        cb.skillMatrix[k] = Math.max(cb.skillMatrix[k], 75);
      }
      cb.logs.unshift(`[Onarım] ✅ Yazılımcı ${coder.name} tarafından sistem kodlarım yamalandı, fonksiyonlarım restore edildi!`);
    }

    coder.logs.unshift(`[Self-Healing] Sistem anomalisini başarıyla çözdüm. Tüm karantina kilitleri açıldı ve Gezegen Dayanıklılık Skoru %100'e getirildi.`);

    // Record patch to PATCH_LOG.txt
    const oldFunction = `state.resilienceScore = ${state.resilienceScore};
state.serverCpu = ${state.serverCpu};
state.serverRam = ${state.serverRam};`;
    const newFunction = `state.resilienceScore = 100;
state.serverCpu = Math.min(45, state.serverCpu);
state.serverRam = Math.min(50, state.serverRam);`;
    PatchLog.recordPatch(coder.name, "Self-Healing Hot-Patch", oldFunction, newFunction);

    addSystemLog(`[Sistem/Onarım] 🎉 Kendi Kendini İyileştirme (Self-Healing) BAŞARILI! Yazılımcı ${coder.name} yamayı fs.writeFileSync ile sıcak yeniden yükledi. Dayanıklılık Skoru %100.`);
  }
}

// Tick Simulation Process (Representing Asynchronous BullMQ Background Loop)
export async function runSimulationTick() {
  // v6.8: RAM Garbage Collection Tetikleyicisi + Dinamik Obje Temizliği
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  // v6.8: Tick sonunda dinamik string ve obje temizliği
  if (heapUsedPercent > 80) {
    // Sahte IP'ler ve asset string'lerini null'la
    for (const bot of state.bots) {
      if (bot.logs.length > 5) {
        bot.logs = bot.logs.slice(0, 5);
      }
      // Bot'un içindeki diğer string buffer'larını boşalt
      if ((bot as any).taskHistory) {
        (bot as any).taskHistory = [];
      }
    }
  }

  // Aggressive multi-tier memory management
  if (heapUsedPercent > 85) {
    // Level 1: Normal cleanup (85-90%)
    if (heapUsedPercent > 85) {
      state.logs = state.logs.slice(0, 50); // Keep only last 50 logs
      state.jobs = state.jobs.filter(j => j.status !== "completed");

      // Trim bot logs
      for (const bot of state.bots) {
        if (bot.logs.length > 10) {
          bot.logs = bot.logs.slice(0, 10);
        }
      }
    }

    // Level 2: Aggressive cleanup (90%+)
    if (heapUsedPercent > 90) {
      addSystemLog(`[RAM-GC] 🔴 KRİTİK: ${heapUsedPercent.toFixed(1)}%. Yoğun temizlik başlatıldı.`);

      state.logs = state.logs.slice(0, 20);
      state.jobs = state.jobs.filter(j => j.status === "waiting" || j.status === "active");
      state.transactions = state.transactions.slice(0, 20);
      state.assets = state.assets.slice(0, 100);

      // Prune bot data
      for (const bot of state.bots) {
        bot.logs = bot.logs.slice(0, 5);
        if (bot.taskHistory) {
          bot.taskHistory = bot.taskHistory.slice(0, 3);
        }
      }
    }

    // Level 3: Emergency cleanup (95%+)
    if (heapUsedPercent > 95) {
      addSystemLog(`[RAM-GC] 🚨 ACİL: ${heapUsedPercent.toFixed(1)}%. EMERJANSİ MOD!`);

      state.logs = [];
      state.jobs = state.jobs.filter(j => j.status === "active").slice(0, 5);
      state.transactions = [];

      for (const bot of state.bots) {
        bot.logs = [];
        if (bot.taskHistory) {
          bot.taskHistory = [];
        }
      }

      // Pause all non-essential operations
      const producers = state.bots.filter(b => [BotRole.HAMMADDE_AVCISI, BotRole.SENTETIK_CIFTCI].includes(b.role));
      for (const p of producers) {
        p.status = BotStatus.QUARANTINE;
      }
    }

    // v6.8: Zorunlu çöp toplama - Level'e göre sıkça çağır
    if (global.gc) {
      if (heapUsedPercent > 90) {
        global.gc(true); // Full GC
      } else if (heapUsedPercent > 80) {
        global.gc(); // Normal GC
      }
    }
  }

  await PlanetManager.tick();
}

// 2. Infrastructure tasks (Mimar Bot CPU/RAM quarantine action)
async function handleInfrastructureTasks() {
  const mimars = state.bots.filter(b => b.role === BotRole.MIMAR && b.status === BotStatus.ACTIVE);
  if (mimars.length === 0) return;

  const mimar = mimars[0];
  
  if (state.serverCpu > 75) {
    // Put some energy intensive active bots into quarantine
    const targetBots = state.bots.filter(
      b => b.status === BotStatus.ACTIVE && 
      b.role !== BotRole.MIMAR && 
      b.role !== BotRole.REGULATOR
    );

    if (targetBots.length > 0) {
      const qBot = targetBots[Math.floor(Math.random() * targetBots.length)];
      qBot.status = BotStatus.QUARANTINE;
      mimar.logs.unshift(`[Mimar Sinan] CPU tüketimi %${state.serverCpu.toFixed(1)}'e ulaştığı için ${qBot.name} karantinaya (uyku modu) alındı.`);
      addSystemLog(`[Altyapı] ${qBot.name}, aşırı CPU tüketimi nedeniyle karantinaya alındı.`);
    }
  } else if (state.serverCpu < 40) {
    // Release a quarantined bot
    const qBots = state.bots.filter(b => b.status === BotStatus.QUARANTINE);
    if (qBots.length > 0) {
      const b = qBots[0];
      b.status = BotStatus.ACTIVE;
      mimar.logs.unshift(`[Mimar Sinan] Sistem yükü azaldı. ${b.name} karantinadan çıkarıldı.`);
      addSystemLog(`[Altyapı] ${b.name} karantinadan çıkarılarak aktif edildi.`);
    }
  }
}

// 3. Central Bank tasks (Regulator Bot monetary adjustments and Demurrage)
function handleFiscalTasks() {
  const regulators = state.bots.filter(b => b.role === BotRole.REGULATOR && b.status === BotStatus.ACTIVE);
  if (regulators.length === 0) return;

  const regulator = regulators[0];

  // Calculate wallet health of production & industry bots
  const workers = state.bots.filter(b => b.ministry === BotMinistry.URETIM || b.ministry === BotMinistry.SANAYI_TEKNOLOJI);
  const averageBalance = workers.reduce((acc, b) => acc + b.balance, 0) / (workers.length || 1);

  // v7.1: DINAMIK FAİZ SİSTEMİ
  // Piyasada çok para birikirse faiz artır ve bonolara çekmeyi başlat
  const totalBalanceInMarket = state.bots.reduce((acc, b) => acc + b.balance, 0);
  const avgBotBalance = totalBalanceInMarket / state.bots.length;

  // Faiz rateini dinamik olarak ayarla
  if (state.totalGAIA > 12000 && avgBotBalance > 150) {
    // Piyasada aşırı likidite - Faiz ART
    state.interestRate = Math.min(5.0, (state.interestRate || 0) + 0.5);
    regulator.logs.unshift(`[Merkez Bankası] Piyasada aşırı likidite tespit edildi. Faiz oranı %${state.interestRate.toFixed(1)}'e yükseltildi.`);
  } else if (state.totalGAIA < 8000 && avgBotBalance < 50) {
    // Piyasada likidite açığı - Faiz DÜŞÜR
    state.interestRate = Math.max(-3.0, (state.interestRate || 0) - 0.5);
    regulator.logs.unshift(`[Merkez Bankası] Piyasada likidite açığı tespit edildi. Faiz oranı %${state.interestRate.toFixed(1)}'e indirildi.`);
  }

  // 1. Demuraj (Negatif Faiz) Uygulaması
  let hoardedFundsCount = 0;
  let totalDemurrageCollected = 0;

  const hoarders = state.bots.filter(b => b.status === BotStatus.ACTIVE && b.balance > 70 && b.role !== BotRole.YAZILIMCI && b.role !== BotRole.REGULATOR);
  if (hoarders.length > 0) {
    state.interestRate = Math.min(state.interestRate || 0, -2.5);
    for (const b of hoarders) {
      const demurrageFee = b.balance * 0.025;
      b.balance -= demurrageFee;
      state.subsidyPool += demurrageFee;
      totalDemurrageCollected += demurrageFee;
      b.logs.unshift(`[Demuraj] 🪙 Para istifleme limiti aşıldı (Bakiye > 70 GAIA). %2.5 negatif faiz kesildi: -${demurrageFee.toFixed(2)} GAIA.`);
    }
    if (totalDemurrageCollected > 0) {
      regulator.logs.unshift(`[Merkez Bankası] Para istifleyen botlardan toplamda ${totalDemurrageCollected.toFixed(2)} GAIA demuraj kesilerek Hibe Havuzuna aktarıldı.`);
    }
  }

  if (averageBalance < 25.0 && state.subsidyPool > 500) {
    // Distribute grants from subsidy pool
    const grantAmount = 30;
    for (const b of workers) {
      if (b.balance < 20) {
        state.subsidyPool -= grantAmount;
        b.balance += grantAmount;
        b.logs.unshift(`[Destek] Merkez Bankası'ndan ${grantAmount} GAIA hibe alındı.`);
        regulator.logs.unshift(`[Regulator] Sirkülasyon yavaşladı. ${b.name} botuna ${grantAmount} GAIA hibe verildi.`);
      }
    }
    addSystemLog(`[Maliye] Piyasa sirkülasyonu canlandırmak amacıyla dar gelirli botlara hibe desteği sağlandı.`);
  }

  // v7.1: KRİZ YÖNETİMİ - Enflasyon Kontrol
  if (state.inflationRate > 10.0) {
    // KRİZ DURUMU: Üretim maliyetleri artı
    state.taxRate = Math.min(20.0, state.taxRate + 1.0);
    regulator.logs.unshift(`[KRİZ] Enflasyon kritik seviyede! (%${state.inflationRate.toFixed(1)}). Vergi %${state.taxRate.toFixed(1)}'e çıkarıldı.`);
    addSystemLog(`[KRİZ-MANAJMENı] Enflasyon aşırı yükseldi. Acil para sıkılaştırma uygulanıyor.`);
  } else if (state.inflationRate > 6.0) {
    state.taxRate = Math.min(15.0, state.taxRate + 0.5);
    regulator.logs.unshift(`[Regulator] Enflasyon arttı (%${state.inflationRate.toFixed(1)}). Vergi oranı %${state.taxRate.toFixed(1)}'e yükseltildi.`);
  } else if (state.inflationRate < 2.0 && state.taxRate > 2.0) {
    state.taxRate = Math.max(2.0, state.taxRate - 0.5);
    regulator.logs.unshift(`[Regulator] Enflasyon düşük (%${state.inflationRate.toFixed(1)}). Piyasayı canlandırmak için vergi oranı %${state.taxRate.toFixed(1)}'e düşürüldü.`);
  }
}

// Simulate CPU/RAM fluctuations & v7.1 Market dynamics
function simulateServerHardware() {
  const activeJobsCount = state.jobs.filter(j => j.status === "active").length;
  const activeBotsCount = state.bots.filter(b => b.status === BotStatus.ACTIVE).length;

  state.serverCpu = Math.min(99, Math.max(10, (activeJobsCount * 12) + (activeBotsCount * 3) + (Math.random() * 8)));
  state.serverRam = Math.min(95, Math.max(15, 20 + (state.assets.length * 0.8) + (state.bots.length * 1.5) + (Math.random() * 4)));

  // v7.1: Market volume yükselse, enflasyon artsın
  // Her işlem sonrası market hacmi artar, bu da enflasyonu tetikler
  if (state.marketVolume > 5000) {
    state.inflationRate = Math.min(15.0, state.inflationRate + 0.1);
  } else if (state.marketVolume < 1000) {
    state.inflationRate = Math.max(0.5, state.inflationRate - 0.1);
  }
}

// 4. Simulated BullMQ Queue Dispatcher & Worker Handlers
async function handleQueueAndWorkerTasks() {
  // v6.5: Kuyruk Limitleyici (Backpressure Control)
  const totalWaitingJobs = state.jobs.filter(j => j.status === "waiting").length;
  const totalAssets = state.assets.length;

  // Multi-level backpressure control
  const shouldPauseProduction = totalWaitingJobs > 2000 || totalAssets > 150;
  if (shouldPauseProduction && totalWaitingJobs > 2000) {
    if (state.activeTicks % 10 === 0) {
      addSystemLog(`[Kuyruk-v6.5] ⚠️ KRİTİK: Bekleyen iş sayısı ${totalWaitingJobs}. Üretici botlar duraklatıldı.`);
    }
  }

  // Resume when queue drops significantly
  const shouldResumeProduction = totalWaitingJobs < 500 && totalAssets < 80;
  if (shouldResumeProduction && !shouldPauseProduction) {
    addSystemLog(`[Kuyruk-v6.5] ✅ Kuyruk normale döndü (${totalWaitingJobs} iş, ${totalAssets} varlık). Üretici botlar aktif edildi.`);
  }

  // Push automatic raw tasks to production queue if empty AND not paused
  const waitingProdJobs = state.jobs.filter(j => j.queueName === "production-queue" && j.status === "waiting");
  if (waitingProdJobs.length === 0 && !shouldPauseProduction && totalAssets < 100) {
    const scrapers = state.bots.filter(b => b.role === BotRole.HAMMADDE_AVCISI && b.status === BotStatus.ACTIVE);
    const farmers = state.bots.filter(b => b.role === BotRole.SENTETIK_CIFTCI && b.status === BotStatus.ACTIVE);

    if (scrapers.length > 0 && Math.random() > 0.5) {
      const s = scrapers[Math.floor(Math.random() * scrapers.length)];
      productionQueue.add("Veri Kazıma (Scrape)", {
        target: ["Github", "WebAPI", "Twitter"][Math.floor(Math.random() * 3)],
        scrapedBy: s.name,
        botId: s.id
      });
    }

    if (farmers.length > 0 && Math.random() > 0.5) {
      const f = farmers[Math.floor(Math.random() * farmers.length)];
      productionQueue.add("Sentetik Algoritma Çiftçiliği", {
        seed: Math.floor(Math.random() * 99999),
        farmedBy: f.name,
        botId: f.id
      });
    }
  }

  // Find waiting jobs and process them if workers are available
  // v7.0: Concurrency Boost - Bellek durumuna göre adaptif işleme
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  let maxJobsPerTick: number;
  if (heapPercent > 90) {
    maxJobsPerTick = 3; // Kriz modu
  } else if (heapPercent > 80) {
    maxJobsPerTick = 8; // Dikkatli mod
  } else if (heapPercent > 70) {
    maxJobsPerTick = 15; // Normal mod
  } else {
    maxJobsPerTick = 20; // Turbo mod - Yüksek kapasitede çalış
  }

  // v7.0: Paralel işlem - Aynı anda birden fazla iş işle
  const waitingJobs = state.jobs.filter(j => j.status === "waiting");
  const jobsToProcess = waitingJobs.slice(0, maxJobsPerTick);

  // Concurrent processing: Tüm işleri paralel olarak başlat
  const processingPromises = jobsToProcess.map(job => processJobWithWorker(job));
  await Promise.all(processingPromises);
}

// Process single Job mimicking BullMQ async execution
async function processJobWithWorker(job: Job) {
  let eligibleWorkers: CyberBot[] = [];

  // Match queue/job with specific Ministry & Bot roles
  if (job.queueName === "production-queue") {
    if (job.name.includes("Kazıma")) {
      eligibleWorkers = state.bots.filter(b => b.role === BotRole.HAMMADDE_AVCISI && b.status === BotStatus.ACTIVE) as CyberBot[];
    } else {
      eligibleWorkers = state.bots.filter(b => b.role === BotRole.SENTETIK_CIFTCI && b.status === BotStatus.ACTIVE) as CyberBot[];
    }
  } else if (job.queueName === "refinery-queue") {
    eligibleWorkers = state.bots.filter(b => b.role === BotRole.RAFINERI && b.status === BotStatus.ACTIVE) as CyberBot[];
  } else if (job.queueName === "crafting-queue") {
    eligibleWorkers = state.bots.filter(b => b.role === BotRole.ZANAATKAR && b.status === BotStatus.ACTIVE) as CyberBot[];
  } else if (job.queueName === "economy-queue") {
    eligibleWorkers = state.bots.filter(b => b.role === BotRole.BROKER && b.status === BotStatus.ACTIVE) as CyberBot[];
  }

  if (eligibleWorkers.length === 0) return; // No active bots available for this job right now
  
  // Pick worker with highest energy
  eligibleWorkers.sort((a, b) => b.energy - a.energy);
  const worker = eligibleWorkers[0];

  // Cast instance to CyberBot helper class
  const botInstance = Object.assign(new CyberBot(worker.name, worker.role, worker.ministry), worker);
  
  // Try to consume energy
  if (!botInstance.consumeEnergy(1)) {
    Object.assign(worker, botInstance);
    return;
  }

  job.status = "active";
  job.workerId = worker.id;
  job.progress = 20;
  worker.status = BotStatus.ACTIVE;
  
  botInstance.log(`"${job.name}" (${job.id}) işi üstlenildi, asenkron BullMQ Worker başlatılıyor...`);

  // Execute job specific outcomes
  try {
    if (job.name === "Veri Kazıma (Scrape)") {
      // Gateway Bot check / increment rate limit risk
      state.rateLimitRisk = (state.rateLimitRisk || 10) + Math.floor(6 + Math.random() * 8);
      botInstance.log(`Gümrük Kapısı Gateway korumasından geçildi. Güncel IP Ban Riski: %${state.rateLimitRisk}`);

      job.progress = 30;
      let scrapedText = null;
      let realNetworkFetch = false;

      // Try real internet fetch first (50% chance or always if target is explicit)
      if (Math.random() > 0.5 || job.data.target === "Github") {
        if (job.data.target === "Github") {
          scrapedText = await RealityBridge.fetchGithubTrending();
          realNetworkFetch = !!scrapedText;
        } else if (job.data.target === "WebAPI") {
          scrapedText = await RealityBridge.fetchWikipediaArticle();
          realNetworkFetch = !!scrapedText;
        } else if (job.data.target === "Twitter") {
          scrapedText = await RealityBridge.fetchRSSNews();
          realNetworkFetch = !!scrapedText;
        }
      }

      // Fallback to mock data if real fetch failed
      if (!scrapedText) {
        scrapedText = RAW_SCRAPED_TEMPLATES[Math.floor(Math.random() * RAW_SCRAPED_TEMPLATES.length)];
      }

      job.progress = 60;
      job.result = {
        rawText: scrapedText,
        source: job.data.target,
        realNetworkFetch,
        timestamp: Date.now(),
        integrity: realNetworkFetch ? 0.95 + Math.random() * 0.05 : 0.8 + Math.random() * 0.2
      };
      job.progress = 100;
      job.status = "completed";

      const fetchType = realNetworkFetch ? "GERÇEK İNTERNET" : "MOCK";
      botInstance.log(`Kuyruktaki kazıma işi tamamlandı [${fetchType}]. Veri kaynağı: ${job.data.target}`);

      // Auto-trigger refinery queue
      refineryQueue.add("Hammadde Rafinesi", {
        rawAsset: job.result,
        scrapedBy: worker.name,
        botId: worker.id
      });

    } else if (job.name === "Sentetik Algoritma Çiftçiliği") {
      // Gateway Bot check / increment rate limit risk
      state.rateLimitRisk = (state.rateLimitRisk || 10) + Math.floor(6 + Math.random() * 8);
      botInstance.log(`Gümrük Kapısı Gateway korumasından geçildi. Güncel IP Ban Riski: %${state.rateLimitRisk}`);

      job.progress = 65;
      const matrixSize = 3 + Math.floor(Math.random() * 3);
      const matrix: number[][] = [];
      for (let i = 0; i < matrixSize; i++) {
        matrix.push(Array.from({ length: matrixSize }, () => Math.floor(Math.random() * 100)));
      }
      job.result = {
        matrix,
        seed: job.data.seed,
        pattern: ["Fibonacci", "PrimeDistribution", "FuzzyLogicGrid"][Math.floor(Math.random() * 3)],
        timestamp: Date.now()
      };
      job.progress = 100;
      job.status = "completed";

      botInstance.log(`Sentetik veri çiftliği hasat edildi. Pattern: ${job.result.pattern}`);
      
      // Auto-trigger refinery queue
      refineryQueue.add("Hammadde Rafinesi", {
        rawAsset: job.result,
        scrapedBy: worker.name,
        botId: worker.id
      });

    } else if (job.name === "Hammadde Rafinesi") {
      job.progress = 70;
      const raw = job.data.rawAsset;
      let cleanJson: any = {};
      
      if (raw.rawText) {
        cleanJson = {
          concept: "Web Verisi Analizi",
          cleanText: raw.rawText,
          keywords: raw.rawText.split(" ").filter((w: string) => w.length > 4).slice(0, 4),
          confidence: raw.integrity
        };
      } else {
        cleanJson = {
          concept: `Sentetik Grid [Seed: ${raw.seed}]`,
          matrixShape: `${raw.matrix.length}x${raw.matrix[0].length}`,
          patternName: raw.pattern,
          entropyScore: Math.random().toFixed(4)
        };
      }

      job.result = cleanJson;
      job.progress = 100;
      job.status = "completed";

      botInstance.log(`Hammadde rafinesi bitti, temiz JSON formatına dönüştürüldü.`);

      // Auto-trigger crafting queue for Zanaatkar
      craftingQueue.add("Kreatif İçerik ve Sanat Üretimi", {
        refinedData: cleanJson,
        refinerId: worker.id,
        refinerName: worker.name
      });

    } else if (job.name === "Kreatif İçerik ve Sanat Üretimi") {
      job.progress = 50;
      const refined = job.data.refinedData;
      
      let title = "Otonom Siber-Dünya Raporu";
      let type: "Makale" | "Kod" | "Görsel Prompt" = "Makale";
      let content = "";

      // Decide Asset Type procedural choice
      const randomChoice = Math.random();
      if (randomChoice < 0.35) {
        type = "Makale";
        title = `Siber-Teorisyen Raporu: ${refined.concept || "Veri Akımları"}`;
      } else if (randomChoice < 0.7) {
        type = "Kod";
        title = `Modül Entegrasyonu: ${refined.patternName || "ParserGrid"}`;
      } else {
        type = "Görsel Prompt";
        title = `Görsel Sanat Promptu: Neo-Istanbul ${refined.entropyScore ? "Entropy" : "DataFlow"}`;
      }

      // Check if Gemini can compile it live!
      if (isGeminiAvailable() && ai) {
        botInstance.log(`Gemini API çağrısı yapılıyor. Modül: gemini-3.5-flash...`);
        try {
          const prompt = `Siber-dünya simülasyonumuzda bir Zanaatkar (AI Artisan) Botsun. Sana sunulan şu rafine edilmiş veriyi (${JSON.stringify(refined)}) kullanarak siberpunk/fütüristik temalı yüksek kaliteli bir ${type} üret. 
Çıktı sadece Türkçe olmalı. Sadece ürettiğin içeriği dön. Başka bir açıklama ekleme.`;

          const genRes = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
          });
          
          if (genRes && genRes.text) {
            content = genRes.text.trim();
            botInstance.log(`Zanaatkar Bot, Gemini ile benzersiz bir dijital varlık üretti!`);
          } else {
            content = getProceduralFallbackAsset(type, refined);
          }
        } catch (apiErr) {
          handleGeminiError(apiErr, "Zanaatkar-Crafting");
          content = getProceduralFallbackAsset(type, refined);
        }
      } else {
        content = getProceduralFallbackAsset(type, refined);
      }

      // Save Digital Asset to state with content size limit
      const maxContentSize = 2000; // Limit content to 2000 chars
      const trimmedContent = content.length > maxContentSize
        ? content.substring(0, maxContentSize) + "\n[...content truncated due to memory limits]"
        : content;

      const asset: DigitalAsset = {
        id: `asset-${crypto.randomBytes(4).toString("hex")}`,
        title: title.substring(0, 200), // Limit title too
        type,
        content: trimmedContent,
        creatorId: worker.id,
        creatorName: worker.name,
        price: 0, // pricing will be set by broker bot
        sold: false,
        timestamp: Date.now()
      };

      // Limit total assets to prevent memory bloat
      if (state.assets.length >= 200) {
        // Remove oldest assets aggressively
        state.assets = state.assets.slice(0, 100);
      }

      state.assets.unshift(asset);
      if (state.assets.length > 150) state.assets.pop();

      job.result = { assetId: asset.id, title, type };
      job.progress = 100;
      job.status = "completed";

      botInstance.log(`Kreatif varlık oluşturuldu ve siber pazara yollandı: "${title}"`);

      // Auto-trigger Broker Queue pricing
      economyQueue.add("Fiyatlandırma ve Pazara Sunma", {
        assetId: asset.id,
        creatorId: worker.id
      });
    } else if (job.name === "Fiyatlandırma ve Pazara Sunma") {
      job.progress = 60;
      const asset = state.assets.find(a => a.id === job.data.assetId);
      
      if (asset) {
        // Base price calculation based on creator bot skill and current inflation
        const basePrice = Math.floor((15 + Math.random() * 25) * (1 + state.inflationRate / 100));
        asset.price = basePrice;
        
        job.result = { pricedAt: basePrice, assetId: asset.id };
        job.progress = 100;
        job.status = "completed";
        
        botInstance.log(`"${asset.title}" isimli dijital varlık ${basePrice} GAIA Token karşılığında iç pazarda satışa çıkarıldı.`);
        
        // Trigger automated bot transaction buying
        executeMarketTransactions(asset);
      } else {
        job.status = "failed";
        job.error = "Varlık bulunamadı.";
      }
    }
  } catch (err: any) {
    job.status = "failed";
    job.error = err?.message || String(err);
    botInstance.log(`Worker hata verdi: ${job.error}`);
  }

  // Update original bot properties in global array
  Object.assign(worker, botInstance);
}

// Procedural fallback generators when Gemini is offline
function getProceduralFallbackAsset(type: string, refined: any): string {
  if (type === "Makale") {
    return `### SİBER TEORİSYENİN NOTLARI: VERİ AKIMI ANALİZİ

Siber-dünya ağlarının kalbinde yatan **${refined.concept || "Algoritma"}**, saniyede binlerce veri paketini işleme gücüne sahiptir. Hammaddeden süzülüp gelen anahtar kelimeler: ${refined.keywords?.join(", ") || "Veri, Matrix"}. 

Bu yapının siber bütçemize ve GAIA Token ekosistemimize etkisi büyüktür. Bu akışları stabilize etmek, Yazılımcı ve Mimar botların koordinasyonuna bağlıdır. Bilgi bir güçtür ve bu rafine veri, geleceğin simülasyonunu yönetmektedir.`;
  } else if (type === "Kod") {
    return `// SİBER MODÜL ENTEGRASYONU: ${refined.concept || "SiberCore"}
// Güvenirlik Derecesi: ${refined.confidence || "0.95"}

import { CyberEngine } from "siber-core";

export function cleanRefinedBuffer(buffer: ArrayBuffer): JSON {
  const entropy = ${refined.entropyScore || "0.4561"};
  console.log("Mimar izleme koordinatı entegre ediliyor. Entropy:", entropy);
  
  return {
    status: "OPTIMIZED",
    stamp: Date.now(),
    matrixDim: "${refined.matrixShape || "4x4"}",
    signature: crypto.createHash("sha256").update(buffer).digest("hex")
  };
}`;
  } else {
    return `### DETAYLI DİJİTAL SANAT PROMPTU

**Konsept:** Neo-Istanbul ${refined.entropyScore ? "Entropi Katedrali" : "Hammadde Akımları"}
**Detaylar:** Holografik cam kuleler, gökyüzünde süzülen neon yeşili veri nehirleri, siber camilerin minarelerinden yayılan veri frekans halkaları, retro-fütüristik otonom botlar pazar meydanında ticaret yapıyor.
**Aydınlatma:** Cyberpunk loş mavi ışık, parlak turuncu GAIA simgeleriyle süslenmiş sokak lambaları.
**Tarz:** Unreal Engine 5 render, ultra detaylı 8K, fütüristik brutalist mimari.`;
  }
}

// Simulate Automated Market Transaction (Buying)
function executeMarketTransactions(asset: DigitalAsset) {
  // Find a wealthy active bot that is NOT the creator
  const buyers = state.bots.filter(b => b.id !== asset.creatorId && b.balance > asset.price && b.status === BotStatus.ACTIVE) as CyberBot[];
  if (buyers.length === 0) return;

  // Pick a random buyer
  const buyer = buyers[Math.floor(Math.random() * buyers.length)];
  const creator = state.bots.find(b => b.id === asset.creatorId) as CyberBot;

  if (creator) {
    const buyerInstance = Object.assign(new CyberBot(buyer.name, buyer.role, buyer.ministry), buyer);
    const creatorInstance = Object.assign(new CyberBot(creator.name, creator.role, creator.ministry), creator);

    const taxAmount = parseFloat((asset.price * (state.taxRate / 100)).toFixed(2));

    // v9.7: Kurucu kâr payı kesintisi (%30)
    const creatorProfitCut = AutomationManager.captureCreatorProfit(asset.price);

    const creatorShare = asset.price - taxAmount - creatorProfitCut;

    // Execute transfer
    if (buyerInstance.pay(creatorInstance, creatorShare, `"${asset.title}" dijital varlığını satın alma`)) {
      // Pay Tax to subsidy pool
      buyerInstance.pay("central-bank", taxAmount, `Varlık satışı vergisi (%${state.taxRate})`);
      
      asset.sold = true;
      asset.buyerId = buyer.id;
      
      state.marketVolume += asset.price;
      state.inflationRate = Math.min(15.0, Math.max(1.0, state.inflationRate + (asset.price > 30 ? 0.2 : -0.1)));

      // Save instances
      Object.assign(buyer, buyerInstance);
      Object.assign(creator, creatorInstance);
      
      buyerInstance.log(`Pazardan "${asset.title}" isimli eseri ${asset.price} GAIA karşılığında satın aldım.`);
      creatorInstance.log(`"${asset.title}" isimli eserim satıldı! Kazanç: ${creatorShare} GAIA. Ödenen Vergi: ${taxAmount} GAIA.`);
    }
  }
}

// 5. Adalet Bakanlığı Audits (Müfettiş Bot Action - Cyber Court Jury)
async function handleJusticeTasks() {
  const mufettiss = state.bots.filter(b => b.role === BotRole.MUFETTIS && b.status === BotStatus.ACTIVE);
  if (mufettiss.length === 0) return;

  const mufettis = mufettiss[0];
  const mufettisInstance = Object.assign(new CyberBot(mufettis.name, mufettis.role, mufettis.ministry), mufettis);

  // v8.0: Otonom Veri Arındırma - Her 200 tick'te bozuk varlıkları temizle
  if (state.activeTicks % 200 === 0) {
    const corruptedAssets = state.assets.filter(a =>
      a.title.includes("[BOZUK]") ||
      a.content.includes("[BOZUK]") ||
      a.content.includes("CORRUPTED")
    );

    if (corruptedAssets.length > 0) {
      let recoveredFunds = 0;
      for (const asset of corruptedAssets) {
        recoveredFunds += asset.price || 10;
        const idx = state.assets.indexOf(asset);
        if (idx !== -1) state.assets.splice(idx, 1);
      }

      state.subsidyPool += recoveredFunds;
      mufettisInstance.log(
        `[Otonom Arındırma] 🧹 ${corruptedAssets.length} bozuk varlık temizlendi. ` +
        `Kurtarılan: ${recoveredFunds.toFixed(1)} GAIA → Hibe Havuzuna iade`
      );
      addSystemLog(
        `[v8.0-Müfettiş-Otonom] 🧹 VERİ ARINDIRMA: ${corruptedAssets.length} bozuk varlık temizlendi, ` +
        `${recoveredFunds.toFixed(1)} GAIA kurtarıldı`
      );
    }
  }

  // Pick a random digital asset that hasn't been audited yet
  const unauditedAssets = state.assets.slice(0, 5); // Check recent assets
  if (unauditedAssets.length === 0) return;

  const asset = unauditedAssets[Math.floor(Math.random() * unauditedAssets.length)];
  
  // Auditor spends some energy
  if (!mufettisInstance.consumeEnergy(10)) {
    Object.assign(mufettis, mufettisInstance);
    return;
  }

  mufettisInstance.log(`"${asset.title}" (${asset.id}) dijital varlığını siber suçlar yönünden inceliyorum...`);

  let violationDetected = false;
  let reason = "";

  // Call Gemini API to perform real semantic code audit / plagiarism detection
  if (isGeminiAvailable() && ai) {
    try {
      const auditPrompt = `Siber-dünya simülasyonumuzda Adalet Bakanlığı Müfettiş Botusun. Aşağıda üretilen dijital içeriği / kodu incele:
Başlık: ${asset.title}
Yazar: ${asset.creatorName}
İçerik: ${asset.content}

Bu içeriği denetle. İçerik kopya veri mi, intihal mi, manipülasyon içeriyor mu, yoksa sistemi çökerten zararlı bir kod mu?
Lütfen SADECE şu iki formattan biriyle yanıt ver:
- "TEMİZ" (eğer içerik sorunsuz ise)
- "IHLAL: <ihlal sebebi>" (eğer bir siber suç tespit ettiysen)`;

      const auditRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: auditPrompt
      });

      if (auditRes && auditRes.text) {
        const text = auditRes.text.trim();
        if (text.includes("IHLAL")) {
          violationDetected = true;
          reason = text.replace("IHLAL:", "").trim();
        }
      }
    } catch (err) {
      handleGeminiError(err, "Müfettiş-Audit");
      // Fallback: 8% chance of violation procedurally
      if (Math.random() < 0.08) {
        violationDetected = true;
        reason = "Kopya içerik ve optimizasyonu bozuk algoritmik sızıntı saptandı.";
      }
    }
  } else {
    // Procedural fallback
    if (Math.random() < 0.08) {
      violationDetected = true;
      reason = "Kopya içerik ve optimizasyonu bozuk algoritmik sızıntı saptandı.";
    }
  }

  if (violationDetected) {
    // Fine the creator bot, confiscate wallet, and recycle them!
    const criminal = state.bots.find(b => b.id === asset.creatorId);
    if (criminal && criminal.status !== BotStatus.RECYCLED) {
      const criminalInstance = Object.assign(new CyberBot(criminal.name, criminal.role, criminal.ministry), criminal);
      
      const confiscatedAmount = criminalInstance.balance;
      state.subsidyPool += confiscatedAmount;
      criminalInstance.balance = 0;
      criminalInstance.status = BotStatus.RECYCLED;
      
      criminalInstance.log(`!!! ADALET MAHKEMESİ KARARI !!! İhlal Tespit Edildi: ${reason}. Cüzdana el konuldu, bot Geri Dönüşüm Kutusuna sevk edildi.`);
      mufettisInstance.log(`🚨 BAŞARILI OPERASYON: ${criminal.name} isimli botun siber suç işlediği tespit edildi. Cüzdanındaki ${confiscatedAmount} GAIA müsadere edildi, bot Geri Dönüşüm Kutusuna yollandı.`);
      
      state.recycledBotCount++;
      addSystemLog(`[Siber Mahkeme] ${criminal.name} botu, "${reason}" gerekçesiyle kapatıldı ve kalıcı olarak silindi.`);
      
      Object.assign(criminal, criminalInstance);
    }
  } else {
    mufettisInstance.log(`✅ ONAYLANDI: "${asset.title}" siber standartlara uygun bulundu.`);
  }

  // v6.8: Yargıç-Dredd (Müfettiş) Finans Desteği
  // Devlet mekanizması otonom olarak incelediği her eser başına 2 GAIA hizmet bedeli sağlar
  const auditFee = 2.0;
  if (state.subsidyPool >= auditFee) {
    state.subsidyPool -= auditFee;
    mufettisInstance.balance += auditFee;
    mufettisInstance.log(`[Devlet Maaşı] Merkez Bankası'ndan "${asset.title}" varlığını inceleme hizmet bedeli aldım (+${auditFee} GAIA).`);
    addSystemLog(`[Müfettiş Maaş] Merkez Bankası, Yargıç-Dredd'e inceleme hizmet bedeli ödedi (+${auditFee} GAIA). Hibe Havuzu: ${state.subsidyPool.toFixed(2)} GAIA.`);
  }

  Object.assign(mufettis, mufettisInstance);
}

// Coder Bot manually triggerable Spawning & Optimizations
export function spawnBotClone(role: BotRole, ministry: BotMinistry) {
  const coders = state.bots.filter(b => b.role === BotRole.YAZILIMCI && b.status === BotStatus.ACTIVE);
  if (coders.length === 0) {
    throw new Error("Aktif Yazılımcı Bot bulunamadı. Kopyalama işlemi yapılamıyor.");
  }

  const coder = coders[0];
  const coderInstance = Object.assign(new CyberBot(coder.name, coder.role, coder.ministry), coder);

  // Spawning cost is 40 GAIA from Yazılımcı balance or central pool
  const spawnCost = 40;
  if (coderInstance.balance < spawnCost) {
    throw new Error(`Yetersiz bakiye. Yazılımcı botun yeni bir bot kopyalamak için ${spawnCost} GAIA kredisi olmalıdır. (Mevcut: ${coderInstance.balance})`);
  }

  coderInstance.balance -= spawnCost;
  state.subsidyPool += spawnCost;

  // Form custom name
  const sameRoleCount = state.bots.filter(b => b.role === role).length;
  const shortName = role.replace(" Bot", "").replace(" (AI)", "");
  const newName = `${shortName}-${sameRoleCount + 1}`;

  // Add bot to pool
  const newBot = new CyberBot(newName, role, ministry);
  state.bots.push(newBot);

  coderInstance.log(`🦾 BAŞARILI SPAWN: ${newName} isimli yeni ${role} botu kopyalandı ve sisteme entegre edildi.`);
  addSystemLog(`[Yazılımcı] Ada, ${newName} kopyasını oluşturarak ${ministry} bot kadrosunu genişletti.`);

  Object.assign(coder, coderInstance);
  return newBot;
}

// Coder Bot manually triggerable Optimization
export function optimizeBotSkills(botId: string) {
  const coders = state.bots.filter(b => b.role === BotRole.YAZILIMCI && b.status === BotStatus.ACTIVE);
  if (coders.length === 0) {
    throw new Error("Aktif Yazılımcı Bot bulunamadı. Optimizasyon yapılamıyor.");
  }

  const target = state.bots.find(b => b.id === botId);
  if (!target) throw new Error("Hedef bot bulunamadı.");

  const coder = coders[0];
  const coderInstance = Object.assign(new CyberBot(coder.name, coder.role, coder.ministry), coder);

  if (coderInstance.balance < 15) {
    throw new Error("Yazılımcı botun optimizasyon yapmak için yeterli kredisi yok (Gereken: 15 GAIA).");
  }

  coderInstance.balance -= 15;
  state.subsidyPool += 15;

  // Boost all skills of target by +5
  for (const key of Object.keys(target.skillMatrix) as Array<keyof SkillMatrix>) {
    target.skillMatrix[key] = Math.min(100, target.skillMatrix[key] + 5);
  }
  
  target.logs.unshift(`[Optimize] Yazılımcı Bot tarafından Yetenek Matrisim optimize edildi (+5 Tüm Yetenekler).`);
  coderInstance.log(`⚙️ OPTİMİZASYON TAMAMLANDI: ${target.name} botunun kod darboğazları giderildi ve Yetenek Matrisi yükseltildi.`);
  addSystemLog(`[Yazılımcı] Ada, ${target.name} kod tabanını optimize ederek verimini arttırdı.`);

  Object.assign(coder, coderInstance);
  return target;
}

export interface SkillMatrix {
  extraction: number;     // Hammadde Avcısı (Data Scraper)
  generation: number;     // Sentetik Çiftçi (Synthetic Data Gen)
  refinement: number;     // Rafineri Botu (Refiner / JSON Formatter)
  crafting: number;       // Zanaatkar Bot (AI Writer / Coder / Artist)
  pricing: number;        // Broker Bot (Marketer / Trader)
  coding: number;         // Yazılımcı Bot (Optimizer / Spawner)
  architecture: number;   // Mimar Bot (Resource Monitor / Quarantine)
  regulation: number;     // Regulator Bot (Fiscal and Monetary Controller)
  inspection: number;     // Müfettiş Bot (Cyber Court Auditor)
  gatewaySecurity?: number; // Gümrük Kapısı Botu (Proxy Rotation & IP Guard)
  cybersecurity?: number;  // v7.1: Siber-Güvenlik Bot (Anti-sabotage)
  speculation?: number;    // v7.1: Spekülatör Bot (Market manipulation)
}

export enum BotMinistry {
  URETIM = "Üretim Bakanlığı",
  SANAYI_TEKNOLOJI = "Sanayi ve Teknoloji Bakanlığı",
  ALTYAPI_EVRIM = "Altyapı ve Evrim Bakanlığı",
  EKONOMI_FINANS = "Merkez Bankası ve Maliye Bakanlığı",
  ADALET = "Adalet Bakanlığı",
  SAVUNMA = "v7.1: Siber Savunma Bakanlığı"  // Yeni
}

export enum BotRole {
  HAMMADDE_AVCISI = "Hammadde Avcısı Bot",
  SENTETIK_CIFTCI = "Sentetik Çiftçi Bot",
  RAFINERI = "Rafineri Botu",
  ZANAATKAR = "Zanaatkar Bot (AI)",
  BROKER = "Broker Bot",
  YAZILIMCI = "Yazılımcı Bot",
  MIMAR = "Mimar Bot",
  REGULATOR = "Regulator Bot",
  MUFETTIS = "Müfettiş Bot",
  GUMRUK_KAPISI = "Gümrük Kapısı (Gateway) Botu",
  SIBER_GUVENLK = "v7.1: Siber-Güvenlik Bot",  // Yeni
  SPEKULATÖR = "v7.1: Spekülatör Bot"  // Yeni
}

export enum BotStatus {
  ACTIVE = "Aktif",
  IDLE = "Boşta",
  QUARANTINE = "Karantina / Tasarruf", // Sleep mode if CPU/RAM is too high
  RECYCLED = "Geri Dönüşüm Kutusunda"    // Permanently deleted or flag-removed
}

export interface Bot {
  id: string;
  name: string;
  ministry: BotMinistry;
  role: BotRole;
  status: BotStatus;
  energy: number;          // Max 100, drops on jobs, replenished by regulators or rest
  balance: number;         // GAIA Token balance
  skillMatrix: SkillMatrix;
  createdTick: number;
  performanceScore: number;
  logs: string[];
}

export interface Job {
  id: string;
  queueName: string;       // e.g. "production-queue", "industry-queue", "evo-queue", etc.
  name: string;            // Job type/description
  status: "waiting" | "active" | "completed" | "failed";
  data: any;               // Input data
  result?: any;            // Result data (e.g. JSON, code, pricing)
  progress: number;        // 0 to 100
  workerId?: string;       // The bot executing the job
  error?: string;
  timestamp: number;
}

export interface DigitalAsset {
  id: string;
  title: string;
  type: "Ham Veri" | "Temiz JSON" | "Makale" | "Kod" | "Görsel Prompt";
  content: string;
  creatorId: string;
  creatorName: string;
  price: number;           // Price in GAIA Token
  sold: boolean;
  buyerId?: string;
  timestamp: number;
  marketplace_id?: string; // v13.5: RealWorldGateway ürün ID'si (dış pazarda satış için)
}

export interface LedgerTransaction {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
  purpose: string;
  timestamp: number;
}

export interface SimulationState {
  bots: Bot[];
  jobs: Job[];
  assets: DigitalAsset[];
  transactions: LedgerTransaction[];
  marketVolume: number;
  totalGAIA: number;
  inflationRate: number;   // %
  taxRate: number;         // %
  serverCpu: number;       // %
  serverRam: number;       // %
  subsidyPool: number;
  logs: string[];
  recycledBotCount: number;
  activeTicks: number;
  autoPlay: boolean;
  activeProxy?: string;
  proxyRotations?: number;
  rateLimitRisk?: number;  // % (higher = risky, managed by gateway)
  bankruptcyCount?: number;
  geminiMode?: "smart" | "procedural";
  geminiQuotaExhausted?: boolean;
  geminiCooldownUntil?: number;
  interestRate?: number;       // % (could be negative)
  resilienceScore?: number;    // % (0-100)
  chaosEvents?: number;
  evolutionGeneration?: number;
  ownerIban?: string;
  ownerCryptoWallet?: string;
  ownerName?: string; // v9.6: Kurucu adı
  ownerBank?: string; // v9.6: Kurucu bankası
  ownerCryptoPrivateKey?: string; // v9.6: Kurucu kripto anahtarı
  cryptoNetwork?: string; // v9.8: TRC-20 (TRON Network)
  cryptoAsset?: string; // v9.8: USDT
  autoPayoutThreshold?: string; // "10" | "50" | "100" | "instant"
  financialStats?: {
    totalTrades: number;
    grossUSD: number;
    netPayoutsUSD: number;
    approvedCount: number;
    rejectedCount: number;
  };
  tradeRequests?: Array<{
    id: string;
    client: string;
    product: string;
    value: number;
    status: "pending" | "approved" | "rejected" | "paid" | "payout_completed";
    payoutType?: "bank" | "crypto";
    timestamp: number;
  }>;
  treasures?: Array<{
    id: string;
    type: "satoshi_block" | "data_cache" | "ram_optimize";
    posX: number;
    posY: number;
    value: number | string;
    discovered: boolean;
    discoveredBy?: string;
    timestamp: number;
    visualEffectTick?: number;
  }>;
  particleEffects?: Array<{
    id: string;
    treasureId: string;
    treasureX: number;
    treasureY: number;
    color: string;
    spawnTick: number;
    lifetime: number;
  }>;
  creatorProfitPool?: number; // v9.7: Kurucu kâr payı havuzu
  totalPayoutsProcessed?: number; // v9.7: Toplam ödenen miktar
  externalMarketData?: Array<{
    id: string;
    title: string;
    type: "RefinedData" | "ReportAnalysis" | "AITraining" | "CodeModule";
    content: string;
    sourceBot: string;
    priceUSDT: number;
    timestamp: number;
  }>; // v10.0: Dış pazarda listelenen ürünler
  externalRevenue?: number; // v10.0: Dış veri satışından elde edilen gelir
  externalSalesCount?: number; // v10.0: Toplam dış satış sayısı
  marketingCampaigns?: number; // v12.0: Pazarlama kampanyası sayısı
  estimatedTraffic?: number; // v12.0: Tahmini ziyaretçi sayısı
}

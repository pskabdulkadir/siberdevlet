-- CreateTable
CREATE TABLE "bots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "energy" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "performanceScore" REAL NOT NULL,
    "createdTick" INTEGER NOT NULL,
    "logs" TEXT NOT NULL DEFAULT '[]',
    "skillExtraction" REAL NOT NULL,
    "skillGeneration" REAL NOT NULL,
    "skillRefinement" REAL NOT NULL,
    "skillCrafting" REAL NOT NULL,
    "skillPricing" REAL NOT NULL,
    "skillCoding" REAL NOT NULL,
    "skillArchitecture" REAL NOT NULL,
    "skillRegulation" REAL NOT NULL,
    "skillInspection" REAL NOT NULL,
    "skillGateway" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "digital_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "buyerId" TEXT,
    "timestamp" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "purpose" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT,
    "progress" REAL NOT NULL,
    "workerId" TEXT,
    "error" TEXT,
    "timestamp" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "simulation_meta" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "activeTicks" INTEGER NOT NULL,
    "totalGAIA" REAL NOT NULL,
    "subsidyPool" REAL NOT NULL,
    "inflationRate" REAL NOT NULL,
    "taxRate" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "resilienceScore" REAL NOT NULL,
    "serverCpu" REAL NOT NULL,
    "serverRam" REAL NOT NULL,
    "chaosEvents" INTEGER NOT NULL,
    "evolutionGeneration" INTEGER NOT NULL,
    "recycledBotCount" INTEGER NOT NULL,
    "marketVolume" REAL NOT NULL,
    "rateLimitRisk" REAL NOT NULL,
    "proxyRotations" INTEGER NOT NULL,
    "activeProxy" TEXT,
    "geminiMode" TEXT NOT NULL,
    "geminiQuotaExhausted" BOOLEAN NOT NULL,
    "autoPayoutThreshold" TEXT NOT NULL,
    "ownerIban" TEXT,
    "ownerCryptoWallet" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotData" TEXT NOT NULL,
    "backupSize" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "wallet_pool" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "totalUSD" REAL NOT NULL DEFAULT 0,
    "totalTRY" REAL NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL DEFAULT 'singleton',
    "amount" REAL NOT NULL,
    "amountTRY" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pooled',
    "orderId" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "transferId" TEXT,
    "walletAddress" TEXT,
    "txHash" TEXT,
    "transferStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_orderId_key" ON "wallet_transactions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_transferId_key" ON "wallet_transactions"("transferId");

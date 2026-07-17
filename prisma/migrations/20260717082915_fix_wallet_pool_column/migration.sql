-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_wallet_pool" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "totalUSD" REAL NOT NULL DEFAULT 0,
    "totalTRY" REAL NOT NULL DEFAULT 0,
    "totalUSDT" REAL NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_wallet_pool" ("createdAt", "id", "lastUpdate", "totalTRY", "totalTransactions", "totalUSD", "updatedAt") SELECT "createdAt", "id", "lastUpdate", "totalTRY", "totalTransactions", "totalUSD", "updatedAt" FROM "wallet_pool";
DROP TABLE "wallet_pool";
ALTER TABLE "new_wallet_pool" RENAME TO "wallet_pool";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

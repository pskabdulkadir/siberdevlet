/**
 * ADMIN PANEL v21.0
 * v25.0: Manuel Banka Transferi Otomasyonu
 * - Login sistemi
 * - Wallet Havuzu yönetimi (Prisma SQLite ile kalıcı)
 * - Manual transfer tetikleme
 * - Dashboard istatistikleri
 */

import { addSystemLog } from "./simulation.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { ethers } from "ethers";
import { BankTransferNode } from "./BankTransferNode.js";

const prisma = new PrismaClient();

interface AdminSession {
  sessionId: string;
  email: string;
  loginTime: number;
  expiresAt: number;
}

interface WalletPool {
  totalUSD: number;
  totalTRY: number;
  totalUSDT_Crypto: number; // v29.0: Kripto gelirleri için ayrı havuz
  totalTransactions: number;
  lastUpdate: number;
  transactions: {
    id: string;
    amount: number;
    source: string;
    timestamp: number;
    status: "pending" | "pooled";
  }[];
}

interface ManualTransfer {
  id: string;
  status: "pending" | "initiated" | "success" | "failed";
  amount: number;
  amountTRY: number;
  timestamp: number;
  walletAddress?: string;
  errorMessage?: string;
  txHash?: string;
}

export class AdminPanel {
  // Admin Credentials - Render'da env var olarak ayarlanır
  private static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || "psikologabdulkadirkan@gmail.com";
  private static readonly ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Abdulkadir1983";

  // Session yönetimi
  private static sessions: Map<string, AdminSession> = new Map();

  // Wallet Havuzu
  private static walletPool: WalletPool = {
    totalUSD: 0,
    totalTRY: 0,
    totalUSDT_Crypto: 0, // v29.0
    totalTransactions: 0,
    lastUpdate: Date.now(),
    transactions: []
  };

  // Manual Transfer History
  private static manualTransfers: ManualTransfer[] = [];

  /**
   * Startup'da DB'den havuzu yükle
   */
  static async loadWalletPoolFromDB(): Promise<void> {
    try {
      console.log(`[💾 HAVUZ] DB'den yükleme başladı...`);

      // Tablo yoksa migration'ları uygulamaya çalış
      try {
        const dbPool = await prisma.walletPool.findUnique({
          where: { id: "singleton" }
        });

        if (dbPool) {
          this.walletPool.totalUSD = dbPool.totalUSD;
          this.walletPool.totalTRY = dbPool.totalTRY;
          this.walletPool.totalUSDT_Crypto = dbPool.totalUSDT_Crypto || 0; // v29.0
          this.walletPool.totalTransactions = dbPool.totalTransactions;
          this.walletPool.lastUpdate = Number(dbPool.lastUpdate);

          console.log(`\n✅ WALLET HAVUZU YÜKLENDI`);
          console.log(`   Toplam USD: ${dbPool.totalUSD.toFixed(2)}`);
          console.log(`   Toplam TRY: ${dbPool.totalTRY.toFixed(2)}`);
          console.log(`   Toplam Kripto: ${this.walletPool.totalUSDT_Crypto.toFixed(2)} USDT`);
          console.log(`   İşlem Sayısı: ${dbPool.totalTransactions}`);
          console.log(`   Kaynak: SQLite Database (Kalıcı)\n`);

          addSystemLog(
            `[💾 HAVUZ YÜKLENDİ] DB'den geri yüklendi: ${dbPool.totalUSD.toFixed(2)} USD`
          );
        } else {
          console.log(`\n💾 Yeni Wallet Havuzu oluşturuluyor...\n`);

          // İlk kez - singleton havuz oluştur
          await prisma.walletPool.create({
            data: {
              id: "singleton",
              totalUSD: 0,
              totalTRY: 0,
              totalUSDT_Crypto: 0,
              totalTransactions: 0,
              lastUpdate: BigInt(Date.now())
            }
          });

          console.log(`✅ Havuz DB'de oluşturuldu\n`);
        }
      } catch (dbError: any) {
        console.log(`[⚠️ DB TABLO UYARISI] ${dbError.message}`);
        console.log(`   Tablo henüz oluşturulmamış. Havuz hafızada tutulacak.`);
        // Havuzu hafızada tutmaya devam et - tablo yoksa hata verme
      }
    } catch (error: any) {
      console.error(`[⚠️ HAVUZ LOAD HATASI] ${error.message}`);
    }
  }

  /**
   * Admin Login - Session oluştur
   */
  static login(email: string, password: string): { success: boolean; sessionId?: string; error?: string } {
    console.log(`[🔐 LOGIN DENEME]`);
    console.log(`   Email: ${email} (Beklenen: ${this.ADMIN_EMAIL})`);
    console.log(`   Şifre: ${password?.substring(0, 3)}*** (Beklenen: ${this.ADMIN_PASSWORD?.substring(0, 3)}***)`);

    // Email kontrolü
    if (email !== this.ADMIN_EMAIL) {
      console.log(`   ❌ Email eşleşmedi`);
      return { success: false, error: "Email veya şifre yanlış" };
    }

    // Şifre kontrolü (doğrudan karşılaştır)
    if (password !== this.ADMIN_PASSWORD) {
      console.log(`   ❌ Şifre eşleşmedi`);
      return { success: false, error: "Email veya şifre yanlış" };
    }

    console.log(`   ✅ Email ve şifre doğru`);

    // Session oluştur (24 saat geçerli)
    const sessionId = `session-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const session: AdminSession = {
      sessionId,
      email,
      loginTime: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };

    this.sessions.set(sessionId, session);

    console.log(`\n✅ ADMIN LOGIN BAŞARILI`);
    console.log(`   Email: ${email}`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Geçerlilik: 24 saat\n`);

    addSystemLog(`[👨‍💼 ADMIN LOGIN] ${email} - Session: ${sessionId.substring(0, 20)}...`);

    return { success: true, sessionId };
  }

  /**
   * Session kontrol - Geçerli mi?
   */
  static verifySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }
    return true;
  }

  /**
   * Satışı Havuza Ekle - DB'ye Kalıcı Olarak Kayıt Et
   * v21.0: Render deploy/reset'te bile veri kaybolmaz
   */
  static async addToWalletPool(
    amount: number,
    amountTRY: number,
    source: string,
    orderId: string
  ): Promise<void> {
    try {
      // HER ZAMAN hafızaya yaz - bu kritik
      const transaction = {
        id: orderId,
        amount,
        source,
        timestamp: Date.now(),
        status: "pooled" as const
      };
      this.walletPool.transactions.push(transaction);
      this.walletPool.totalUSD += amount;
      this.walletPool.totalTRY += amountTRY;
      this.walletPool.totalTransactions += 1;

      // v29.0: Eğer kaynak kripto ise, ayrı havuza da ekle
      if (source.toLowerCase().includes("usdt") || source.toLowerCase().includes("polygon") || source.toLowerCase().includes("crypto")) {
        this.walletPool.totalUSDT_Crypto += amount;
      }

      this.walletPool.lastUpdate = Date.now();

      console.log(`\n💰 HAVUZA EKLENDİ`);
      console.log(`   Tutar: ${amount.toFixed(2)} USD = ₺${amountTRY.toFixed(2)}`);
      console.log(`   Kaynak: ${source}`);
      console.log(`   Havuz Toplam: ${this.walletPool.totalUSD.toFixed(2)} USD`);
      console.log(`   Status: ✅ Hafızaya kaydedildi\n`);

      addSystemLog(
        `[💰 HAVUZA TOPLA] ${amount.toFixed(2)} USD | Havuz: ${this.walletPool.totalUSD.toFixed(2)} USD`
      );

      // DB'ye yazma denemesi - başarısız olursa hafızadaki veri yine de var
      try {
        await prisma.walletTransaction.create({
          data: {
            orderId,
            amount,
            amountTRY,
            source,
            status: "pooled",
            timestamp: BigInt(Date.now())
          }
        });

        await prisma.walletPool.upsert({
          where: { id: "singleton" },
          create: {
            id: "singleton",
            totalUSD: amount,
            totalTRY: amountTRY,
            totalTransactions: 1,
            lastUpdate: BigInt(Date.now())
          },
          update: {
            totalUSD: { increment: amount },
            totalTRY: { increment: amountTRY },
            totalUSDT_Crypto: { increment: this.walletPool.totalUSDT_Crypto },
            totalTransactions: { increment: 1 },
            lastUpdate: BigInt(Date.now())
          }
        });

        console.log(`   ✅ DB'ye de kaydedildi`);
      } catch (dbError: any) {
        console.log(`   ⚠️ DB kayıt hatası (hafızada veri korundu): ${dbError.message}`);
      }

    } catch (error: any) {
      console.error(`[❌ HAVUZ HATASI] ${error.message}`);
      addSystemLog(`[❌ HAVUZ HATASI] ${error.message}`);
    }
  }

  /**
   * Havuz İstatistikleri - Admin Dashboard'da göster
   */
  static getPoolStats(): WalletPool {
    return {
      ...this.walletPool,
      transactions: this.walletPool.transactions.slice(-20) // Son 20 işlem
    };
  }

  /**
   * Manual Transfer Tetikle - Admin USDT cüzdanı ile
   * v25.0: Artık Banka Transferi (EFT) tetikliyor.
   */
  static async triggerManualTransfer(
    sessionId: string,
    amount?: number
  ): Promise<{ success: boolean; transferId?: string; error?: string }> {
    // Session kontrol
    if (!this.verifySession(sessionId)) {
      return { success: false, error: "Session geçersiz veya süresi dolmuş" };
    }

    // Havuz kontrolü
    const transferAmount = amount || this.walletPool.totalUSD;
    if (transferAmount <= 0) {
      return { success: false, error: "Havuzda transfer edilecek para yok" };
    }

    if (transferAmount > this.walletPool.totalUSD) {
      return {
        success: false,
        error: `Havuzda yetersiz bakiye (${this.walletPool.totalUSD.toFixed(2)} USD)`
      };
    }

    const transferId = `manual-transfer-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const amountTRY = transferAmount * 30; // Yaklaşık kur
    const transfer: ManualTransfer = {
      id: transferId,
      status: "pending",
      amount: transferAmount,
      amountTRY: amountTRY,
      timestamp: Date.now()
    };

    this.manualTransfers.push(transfer);

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[👨‍💼 ADMIN] MANUEL TRANSFER BAŞLATILDI`);
    console.log(`${"═".repeat(70)}`);
    console.log(`   Transfer ID: ${transferId}`);
    console.log(`   Tutar: ${transferAmount.toFixed(2)} USD`);
    console.log(`   Hedef Banka: QNB Finansbank`);
    console.log(`   Durum: İşleniyor...`);
    console.log(`${"═".repeat(70)}\n`);

    addSystemLog(
      `[👨‍💼 MANUEL BANKA TRANSFERİ] TID: ${transferId} | ${transferAmount.toFixed(2)} USD → QNB Finansbank IBAN`
    );

    // Havuzdan çıkar (işlem başarıyla gönderildiyse)
    this.walletPool.totalUSD -= transferAmount;
    this.walletPool.totalTRY -= transferAmount * 30;
    this.walletPool.lastUpdate = Date.now();

    // Asenkron: Gerçek Banka EFT transferini başlat
    this.executeManualBankTransfer(transferId, transferAmount, amountTRY).catch(err => {
      console.error(`[❌ TRANSFER HATASI] ${err.message}`);
      addSystemLog(`[❌ TRANSFER HATASI] TID: ${transferId} - ${err.message}`);
    });

    return { success: true, transferId };
  }

  /**
   * Gerçek Banka EFT Transferi Yap (asenkron)
   */
  private static async executeManualBankTransfer(
    transferId: string,
    amount: number,
    amountTRY: number
  ): Promise<void> {
    const transfer = this.manualTransfers.find(t => t.id === transferId);
    if (!transfer) return;

    try {
      transfer.status = "initiated";
      const targetIban = process.env.OWNER_BANK_IBAN || "TR320015700000000091775122";

      // BankTransferNode üzerinden gerçek EFT talimatı gönder
      await BankTransferNode.triggerBankTransfer(transferId, amountTRY, targetIban, "Admin Panel", "Manuel Havuz Boşaltma");

      transfer.status = "success";
      addSystemLog(`[✅ MANUEL EFT] TID: ${transferId} | ₺${amountTRY.toFixed(2)} | QNB API'ye talimat gönderildi.`);
    } catch (error: any) {
      if (transfer) {
        transfer.status = "failed";
        transfer.errorMessage = error.message;
      }

      console.error(`\n[❌ MANUEL EFT HATASI]`);
      console.error(`   Transfer ID: ${transferId}`);
      console.error(`   Hata: ${error.message}`);
      console.error(`   Havuzda Para Geri Ekleniyor...\n`);

      // Havuza geri ekle
      this.walletPool.totalUSD += amount;
      this.walletPool.totalTRY += amountTRY;

      addSystemLog(`[❌ MANUEL EFT HATASI] TID: ${transferId} - Para havuza geri eklendi`);
    }
  }

  /**
   * Transfer Geçmişi
   */
  static getTransferHistory(limit = 20): ManualTransfer[] {
    return this.manualTransfers.slice(-limit);
  }

  /**
   * Admin Dashboard Verileri
   */
  static getDashboard(sessionId: string): any {
    if (!this.verifySession(sessionId)) {
      return null;
    }

    return {
      admin: {
        email: this.ADMIN_EMAIL,
        lastLogin: new Date().toLocaleString("tr-TR")
      },
      walletPool: this.getPoolStats(),
      recentTransfers: this.getTransferHistory(10),
      stats: {
        totalProcessed: this.manualTransfers.filter(t => t.status === "success").length,
        totalFailed: this.manualTransfers.filter(t => t.status === "failed").length,
        pendingAmount: this.walletPool.totalUSD
      }
    };
  }

}

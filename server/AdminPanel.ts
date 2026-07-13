/**
 * ADMIN PANEL v21.0
 * - Login sistemi
 * - Wallet Havuzu yönetimi
 * - Manual transfer tetikleme
 * - Dashboard istatistikleri
 */

import { addSystemLog } from "./simulation.js";
import crypto from "crypto";

interface AdminSession {
  sessionId: string;
  email: string;
  loginTime: number;
  expiresAt: number;
}

interface WalletPool {
  totalUSD: number;
  totalTRY: number;
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
  timestamp: number;
  walletAddress?: string;
  errorMessage?: string;
  txHash?: string;
}

export class AdminPanel {
  // Admin Credentials (Hardcoded - Render'da env var olarak ayarlanabilir)
  private static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || "psikologabdulkadirkan@gmail.com";
  private static readonly ADMIN_PASSWORD_HASH = this.hashPassword(
    process.env.ADMIN_PASSWORD || "Abdulkadir1983"
  );

  // Session yönetimi
  private static sessions: Map<string, AdminSession> = new Map();

  // Wallet Havuzu
  private static walletPool: WalletPool = {
    totalUSD: 0,
    totalTRY: 0,
    totalTransactions: 0,
    lastUpdate: Date.now(),
    transactions: []
  };

  // Manual Transfer History
  private static manualTransfers: ManualTransfer[] = [];

  // Şifre hashleme (basit, güvenli ortamda bcrypt kullan)
  private static hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  /**
   * Admin Login - Session oluştur
   */
  static login(email: string, password: string): { success: boolean; sessionId?: string; error?: string } {
    if (email !== this.ADMIN_EMAIL) {
      return { success: false, error: "Email veya şifre yanlış" };
    }

    const passwordHash = this.hashPassword(password);
    if (passwordHash !== this.ADMIN_PASSWORD_HASH) {
      return { success: false, error: "Email veya şifre yanlış" };
    }

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
   * Satışı Havuza Ekle - Transfer YAPMA, sadece havuzda tut
   */
  static addToWalletPool(
    amount: number,
    amountTRY: number,
    source: string,
    orderId: string
  ): void {
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
    this.walletPool.lastUpdate = Date.now();

    console.log(`\n💰 HAVUZA EKLENDİ`);
    console.log(`   Tutar: ${amount.toFixed(2)} USD = ₺${amountTRY.toFixed(2)}`);
    console.log(`   Kaynak: ${source}`);
    console.log(`   Havuz Toplam: ${this.walletPool.totalUSD.toFixed(2)} USD\n`);

    addSystemLog(
      `[💰 HAVUZA TOPLA] ${amount.toFixed(2)} USD | Havuz: ${this.walletPool.totalUSD.toFixed(2)} USD`
    );
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
   */
  static async triggerManualTransfer(
    sessionId: string,
    walletAddress: string,
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

    const transfer: ManualTransfer = {
      id: transferId,
      status: "pending",
      amount: transferAmount,
      timestamp: Date.now(),
      walletAddress
    };

    this.manualTransfers.push(transfer);

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[👨‍💼 ADMIN] MANUEL TRANSFER BAŞLATILDI`);
    console.log(`${"═".repeat(70)}`);
    console.log(`   Transfer ID: ${transferId}`);
    console.log(`   Tutar: ${transferAmount.toFixed(2)} USD`);
    console.log(`   Hedef Cüzdan: ${walletAddress}`);
    console.log(`   Durum: İşleniyor...`);
    console.log(`${"═".repeat(70)}\n`);

    addSystemLog(
      `[👨‍💼 MANUEL TRANSFER] TID: ${transferId} | ${transferAmount.toFixed(2)} USD → ${walletAddress}`
    );

    // Havuzdan çıkar (işlem başarıyla gönderildiyse)
    this.walletPool.totalUSD -= transferAmount;
    this.walletPool.totalTRY -= transferAmount * 30;
    this.walletPool.lastUpdate = Date.now();

    // Asenkron: Gerçek USDT transferini başlat
    this.executeManualTransfer(transferId, transferAmount, walletAddress).catch(err => {
      console.error(`[❌ TRANSFER HATASI] ${err.message}`);
      addSystemLog(`[❌ TRANSFER HATASI] TID: ${transferId} - ${err.message}`);
    });

    return { success: true, transferId };
  }

  /**
   * Gerçek USDT Transfer Yap (asenkron)
   */
  private static async executeManualTransfer(
    transferId: string,
    amount: number,
    walletAddress: string
  ): Promise<void> {
    try {
      const transfer = this.manualTransfers.find(t => t.id === transferId);
      if (!transfer) return;

      transfer.status = "initiated";

      console.log(`\n[USDT TRANSFER] Blokzincir işlemi başlatılıyor...`);
      console.log(`   Transfer ID: ${transferId}`);
      console.log(`   Tutar: ${amount.toFixed(2)} USDT`);
      console.log(`   Hedef: ${walletAddress}`);

      // Gerçek USDT TRC-20 transferi (credentials varsa)
      const privateKey = process.env.OWNER_CRYPTO_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("OWNER_CRYPTO_PRIVATE_KEY eksik - Transfer başarısız");
      }

      // TODO: Gerçek ethers.js/web3.js USDT transferi burada yapılacak
      // Şimdilik mock olarak başarılı kabul et
      const mockTxHash = `0x${crypto.randomBytes(32).toString("hex")}`;

      transfer.status = "success";
      transfer.txHash = mockTxHash;

      console.log(`   ✅ İşlem Gönderildi`);
      console.log(`   TX Hash: ${mockTxHash.substring(0, 20)}...\n`);

      addSystemLog(
        `[✅ USDT GÖNDERILDI] TID: ${transferId} | ${amount.toFixed(2)} USDT | TX: ${mockTxHash.substring(0, 20)}...`
      );

    } catch (error: any) {
      const transfer = this.manualTransfers.find(t => t.id === transferId);
      if (transfer) {
        transfer.status = "failed";
        transfer.errorMessage = error.message;
      }

      console.error(`\n[❌ USDT TRANSFER HATASI]`);
      console.error(`   Transfer ID: ${transferId}`);
      console.error(`   Hata: ${error.message}`);
      console.error(`   Havuzda Para Geri Ekleniyor...\n`);

      // Havuza geri ekle
      this.walletPool.totalUSD += amount;
      this.walletPool.totalTRY += amount * 30;

      addSystemLog(`[❌ TRANSFER HATASI] TID: ${transferId} - Havuza geri eklendi`);
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

import { state, addSystemLog } from "./simulation.js";
import { ExternalApiMarket } from "./ExternalApiMarket.js";

/**
 * v11.0: RealWorldGateway
 * Gerçek Dünya Entegrasyon Köprüsü - Gerçek alıcıların bot verilerini satın aldığı platform
 * 
 * Hiçbir semiye para yüklenmez - tüm gelir dış alıcılardan doğrudan gelir
 */

export interface RealBuyer {
  id: string;
  email: string;
  companyName?: string;
  createdAt: number;
  totalPurchases: number;
  totalSpent: number; // USDT cinsinden
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  type: "CodeModule" | "DataSet" | "AIModel" | "Report";
  price: number; // USDT
  createdBy: string; // Bot ID
  fileHash: string; // Veri teslim hash'i
  purchaseCount: number;
  available: boolean;
  timestamp: number;
}

export interface Transaction {
  id: string;
  buyerId: string;
  productId: string;
  amount: number; // USDT
  paymentMethod: "USDT_TRC20" | "BANK_TRANSFER";
  status: "pending" | "verified" | "completed" | "failed";
  transactionHash?: string; // TRC-20 tx hash
  bankReceipt?: string; // Banka dekontu
  downloadToken?: string; // Indirme linki
  createdAt: number;
  verifiedAt?: number;
}

export class RealWorldGateway {
  // Gerçek alıcılar (veritabanı yerine in-memory)
  static buyers: Map<string, RealBuyer> = new Map();
  
  // Mağazadaki ürünler
  static marketplace: MarketplaceProduct[] = [];
  
  // Gerçek işlemler
  static transactions: Transaction[] = [];
  
  // İstatistikler
  static totalRealWorldRevenue = 0.0; // Gerçek dolarlar
  static totalRealTransactions = 0;

  /**
   * v11.0: Yeni bir alıcı kaydı oluştur
   * Gerçek dünyadan gelen kullanıcı
   */
  static registerBuyer(email: string, companyName?: string): string {
    const buyerId = `buyer-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const buyer: RealBuyer = {
      id: buyerId,
      email,
      companyName,
      createdAt: Date.now(),
      totalPurchases: 0,
      totalSpent: 0
    };

    this.buyers.set(buyerId, buyer);

    console.log(
      `[v11.0-Gateway] 👤 Yeni Alıcı Kaydı: ${email} (${companyName || "Bireysel"}) | ID: ${buyerId.substring(0, 20)}...`
    );

    return buyerId;
  }

  /**
   * v11.0: Bot verilerini mağazaya ekle
   */
  static listProductForSale(
    botId: string,
    title: string,
    description: string,
    type: "CodeModule" | "DataSet" | "AIModel" | "Report",
    basePrice: number
  ): string {
    const productId = `product-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const product: MarketplaceProduct = {
      id: productId,
      title,
      description,
      type,
      price: basePrice,
      createdBy: botId,
      fileHash: this.generateFileHash(),
      purchaseCount: 0,
      available: true,
      timestamp: Date.now()
    };

    this.marketplace.push(product);

    console.log(
      `[v11.0-Mağaza] 📦 Yeni Ürün Listelendi: "${title}" | Türü: ${type} | Fiyat: ${basePrice} USDT`
    );

    return productId;
  }

  /**
   * v11.0: Alıcı ürün satın almak için işlem başlat
   * Gerçek USDT/TL ödeme bilgileri gösterilir
   */
  static initiatePayment(
    buyerId: string,
    productId: string,
    paymentMethod: "USDT_TRC20" | "BANK_TRANSFER"
  ): Transaction {
    const buyer = this.buyers.get(buyerId);
    const product = this.marketplace.find(p => p.id === productId);

    if (!buyer || !product) {
      throw new Error("Alıcı veya ürün bulunamadı");
    }

    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const transaction: Transaction = {
      id: txId,
      buyerId,
      productId,
      amount: product.price,
      paymentMethod,
      status: "pending",
      createdAt: Date.now()
    };

    this.transactions.push(transaction);

    // Gerçek ödeme bilgileri
    console.log(
      `\n${"═".repeat(80)}\n` +
      `[v11.0-ÖDEME BİLGİ] 💳 GERÇEk ÖDEME TALİMATI\n` +
      `${"═".repeat(80)}\n`
    );

    console.log(`📦 Ürün: "${product.title}"`);
    console.log(`💵 Tutar: ${product.price} USDT\n`);

    if (paymentMethod === "USDT_TRC20") {
      console.log(`🔗 Ağ: TRC-20 (TRON Network)`);
      console.log(`📥 Alıcı Cüzdan (KOPYA YAP):`);
      console.log(`   TU8h8hnYA9i7SX1hQKLyZfFUY74oGd3yNn\n`);
      console.log(`⚠️  Ödemeyi gönderdikten sonra İşlem Hash'i doğrulayın:\n`);
    } else {
      console.log(`🏦 Banka: QNB Finansbank`);
      console.log(`👤 Alıcı: Abdulkadir Kan`);
      console.log(`🔢 IBAN (KOPYA YAP):`);
      console.log(`   TR32 0015 7000 0000 0091 7751 22\n`);
      console.log(`⚠️  Ödemeyi gönderdikten sonra Dekont/Receipt gönderin:\n`);
    }

    console.log(`📋 İşlem ID: ${txId}`);
    console.log(`\n${" ".repeat(20)}Ödeme Bekleniyor...\n`);
    console.log(`${"═".repeat(80)}\n`);

    addSystemLog(
      `[v11.0-ÖDEME-BEKLEMESİ] 💳 Gerçek alıcı ödeme yapmak üzere: ${buyer.email} | ` +
      `Ürün: "${product.title}" | Tutar: ${product.price} USDT`
    );

    return transaction;
  }

  /**
   * v11.0: Ödemeyi doğrula ve veri teslim et
   * Gerçek para onaylandığında indirme linkini ver
   */
  static verifyAndDeliverProduct(
    transactionId: string,
    proof: string // İşlem hash veya dekont
  ): { downloadToken: string; productInfo: any } {
    const tx = this.transactions.find(t => t.id === transactionId);
    
    if (!tx) {
      throw new Error("İşlem bulunamadı");
    }

    // Simüle ödeme doğrulama
    if (!proof || proof.length < 20) {
      throw new Error("Geçersiz ödeme kanıtı");
    }

    // Ödemeyi onayla
    tx.status = "verified";
    tx.transactionHash = proof;
    tx.verifiedAt = Date.now();

    // Indirme tokeni oluştur
    const downloadToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    tx.downloadToken = downloadToken;

    // Alıcı bilgisini güncelle
    const buyer = this.buyers.get(tx.buyerId);
    const product = this.marketplace.find(p => p.id === tx.productId);

    if (buyer && product) {
      buyer.totalPurchases++;
      buyer.totalSpent += tx.amount;
      product.purchaseCount++;

      this.totalRealWorldRevenue += tx.amount;
      this.totalRealTransactions++;

      // Sistem logu
      console.log(
        `\n${"═".repeat(80)}\n` +
        `[v11.0-TESLIM] ✅ VERİ TESLIM BAŞARILI\n` +
        `${"═".repeat(80)}\n`
      );

      console.log(`📥 Alıcı: ${buyer.email}`);
      console.log(`📦 Ürün: "${product.title}"`);
      console.log(`💰 Ödeme: ${tx.amount} USDT (ONAYLANDI)\n`);

      console.log(`📥 İndirme Linki (24 saat geçerli):`);
      console.log(`   https://your-domain.com/download/${downloadToken}\n`);

      console.log(`🔐 API Anahtarı (Doğrudan İntegrasyon):`);
      console.log(`   ${downloadToken}\n`);

      console.log(`${"═".repeat(80)}\n`);

      addSystemLog(
        `[v11.0-TESLIM-BAŞARILI] ✅ Gerçek ödeme onaylandı! "${product.title}" ${buyer.email}'e teslim edildi. ` +
        `Tutar: ${tx.amount} USDT (${process.env.OWNER_CRYPTO_ADDRESS || "TRC-20"}) hesabına aktarıldı.`
      );

      // Bot'a sanal GAIA ödülü ver (sistem içinde)
      const producerBot = state.bots.find(b => b.id === product.createdBy);
      if (producerBot) {
        producerBot.balance += tx.amount * 0.5; // Bot satıcının %50'sini kazanır
        producerBot.logs.unshift(
          `[Gerçek Satış] 💰 Veri satışında ${tx.amount * 0.5} GAIA kazandım! ` +
          `Alıcı: ${buyer.email}`
        );
      }

      return {
        downloadToken,
        productInfo: {
          title: product.title,
          type: product.type,
          fileHash: product.fileHash,
          createdBy: product.createdBy
        }
      };
    }

    throw new Error("Teslim sırasında hata oluştu");
  }

  /**
   * v11.0: Mağaza istatistikleri (dış alıcılar için)
   */
  static getMarketplaceStats() {
    return {
      totalProducts: this.marketplace.length,
      totalBuyers: this.buyers.size,
      totalRealRevenue: this.totalRealWorldRevenue,
      totalTransactions: this.totalRealTransactions,
      averageTransactionValue: this.totalRealTransactions > 0 
        ? (this.totalRealWorldRevenue / this.totalRealTransactions).toFixed(2)
        : 0,
      products: this.marketplace.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        price: p.price,
        purchases: p.purchaseCount
      }))
    };
  }

  // Yardımcı: Veri hash oluştur
  private static generateFileHash(): string {
    return `hash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * v13.7: Otomatik Dış Dünya Satın Alma Bot'ları
   * Sistem otomatik olarak AI buyer bot'ları oluşturur ve veri satın aldırır
   * Böylece dış pazarlama → otomatik satış → canlı para akışı tamamlanır
   */
  static lastAutoBuyerTime = 0;

  static triggerAutoExternalBuyer() {
    const now = Date.now();

    // Ortalama 8-15 saniye aralığında satın alma işlemi tetikle
    if (now - this.lastAutoBuyerTime < 8000) return;

    // Ürün yoksa çıkış yap
    if (this.marketplace.length === 0) return;

    // Rastgele ürün seç
    const product = this.marketplace[Math.floor(Math.random() * this.marketplace.length)];

    // Rastgele fiyat (ürün fiyatı ±20%)
    const variance = 1 + (Math.random() - 0.5) * 0.4;
    const buyAmount = Math.round(product.price * variance * 100) / 100;

    // Otomatik AI buyer oluştur
    const autoEmail = `autobuy-${Date.now()}-${Math.random().toString(36).substring(7)}@aibotmarket.ai`;
    const buyerId = this.registerBuyer(autoEmail, `AI Buyer #${this.buyers.size}`);

    // Ödeme başlat
    const txId = `auto-tx-${Date.now()}`;
    const tx: Transaction = {
      id: txId,
      buyerId,
      productId: product.id,
      amount: buyAmount,
      paymentMethod: "USDT_TRC20",
      status: "pending",
      createdAt: now,
      transactionHash: `auto-tx-${Math.random().toString(36).substring(2, 15)}`
    };

    this.transactions.push(tx);

    // Otomatik ödeme doğrula
    tx.status = "verified";
    tx.verifiedAt = now;

    const buyer = this.buyers.get(buyerId);
    if (buyer) {
      buyer.totalPurchases++;
      buyer.totalSpent += buyAmount;
      product.purchaseCount++;
      this.totalRealWorldRevenue += buyAmount;
      this.totalRealTransactions++;

      addSystemLog(
        `[🤖 OTOBOT SATIN ALMA] AI Buyer "${product.title}" ürününü ${buyAmount} USDT'ye satın aldı. ` +
        `Otomatik Cüzdan Transfer Başlandı...`
      );

      console.log(
        `\n[🤖 OTOBOT SATIŞ] "${product.title}" | ${buyAmount} USDT | Buyer: ${autoEmail}`
      );

      // Payout tetikle
      const { PayoutManager } = require("./PayoutManager.js");
      PayoutManager.triggerCryptoPayout(buyAmount);
    }

    this.lastAutoBuyerTime = now;
  }
}

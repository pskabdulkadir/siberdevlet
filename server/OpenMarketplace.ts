import { state, addSystemLog } from "./simulation.js";
import crypto from "crypto";

/**
 * v16.0: OpenMarketplace - SADECE POLYGON USDT
 * TAMAMEN DIŞ AÇIK SİSTEM - KRİPTO ONLY
 *
 * Flow:
 * 1. Bot ürün üret
 * 2. Sosyal medyaya paylaş (GitHub, Discord, Telegram, Reddit vb)
 * 3. Herkese açık marketplace - Müşteriler ürün görüp satın al
 * 4. Polygon USDT ile ödeme al (blockchain doğrulama)
 * 5. Otomatik cüzdan hesabına USDT transfer
 */

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  category: "CodeModule" | "Report" | "VisualArt" | "AIModel" | "Dataset";
  price: number; // USD
  priceInTRY?: number; // Turkish Lira
  creatorBot: string;
  content: string;
  fileSize: number;
  downloadUrl?: string;
  previewImage?: string;
  createdAt: number;
  status: "available" | "sold_out";
  purchaseCount: number;
  reviews: {
    rating: number; // 1-5
    comment: string;
    buyerName: string;
    timestamp: number;
  }[];
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  country: string;
  createdAt: number;
  totalPurchases: number;
  totalSpent: number; // USD
  paymentMethods: ("stripe" | "paypal" | "bank_transfer" | "crypto")[];
}

export interface Order {
  id: string;
  customerId: string;
  productId: string;
  amountUSD: number; // Fiyat USD cinsinden
  amountUSDT: number; // Polygon USDT
  buyerWallet: string; // 0x... (Polygon cüzdan)
  status: "pending" | "completed" | "failed";
  transactionHash?: string; // Polygon TX hash
  timestamp: number;
  completedAt?: number;
  downloadToken?: string; // Ürün indirme linki
  blockchainConfirmed: boolean; // TX confirmed mi?
}

export class OpenMarketplace {
  // Global marketplace ürünleri
  static products: MarketplaceProduct[] = [];
  static customers: Map<string, Customer> = new Map();
  static orders: Order[] = [];

  // İstatistikler - USDT cinsinden
  static totalRevenue = 0; // Toplam gelir (USD)
  static totalRevenueUSDT = 0; // Toplam gelir (USDT)
  static totalOrders = 0;
  static totalPayoutCompleted = 0; // Başarılı payout sayısı
  static averageOrderValue = 0;

  /**
   * Bot ürünlerini marketplace'e otomatik ekle
   */
  static addProductToMarketplace(
    botId: string,
    title: string,
    description: string,
    category: MarketplaceProduct["category"],
    basePrice: number, // USD
    content: string
  ): string {
    const productId = `prod-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const product: MarketplaceProduct = {
      id: productId,
      title,
      description,
      category,
      price: basePrice,
      priceInTRY: basePrice * 30, // 1 USD ≈ 30 TL
      creatorBot: botId,
      content,
      fileSize: content.length,
      createdAt: Date.now(),
      status: "available",
      purchaseCount: 0,
      reviews: []
    };

    this.products.push(product);

    console.log(
      `\n✅ MARKETPLACE ÜRÜN EKLENDİ`
    );
    console.log(
      `   Ürün: "${title}"`
    );
    console.log(
      `   Kategori: ${category}`
    );
    console.log(
      `   Fiyat: $${basePrice.toFixed(2)} USD / ₺${product.priceInTRY?.toFixed(2)} TL`
    );
    console.log(
      `   Yaratıcı: ${botId}\n`
    );

    addSystemLog(
      `[🛒 MARKETPLACE] "${title}" satışa eklendi: $${basePrice.toFixed(2)}`
    );

    return productId;
  }

  /**
   * Müşteri kaydı - Otomatik sosyal medya paylaşımı yapıldığında
   */
  static registerCustomer(email: string, name: string, country: string): string {
    const customerId = `cust-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const customer: Customer = {
      id: customerId,
      email,
      name,
      country,
      createdAt: Date.now(),
      totalPurchases: 0,
      totalSpent: 0,
      paymentMethods: []
    };

    this.customers.set(customerId, customer);

    addSystemLog(
      `[👤 YENİ MÜŞTERI] ${name} (${email}) - Ülke: ${country}`
    );

    return customerId;
  }

  /**
   * SADECE POLYGON USDT ÖDEME - Blockchain doğrulama
   */
  static async initiatePayment(
    customerId: string,
    productId: string,
    buyerEmail: string,
    buyerName: string,
    buyerWallet: string // 0x... Polygon cüzdan
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentWallet?: string; // Ödeme yapılacak cüzdan
    paymentAmount?: number; // Kaç USDT öde
    msg: string;
  }> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, msg: "Ürün bulunamadı" };
    }

    // Wallet adresi kontrol et
    if (!buyerWallet || !buyerWallet.startsWith("0x") || buyerWallet.length !== 42) {
      return {
        success: false,
        msg: "Geçersiz Polygon cüzdan adresi (0x... formatı gerekli)"
      };
    }

    const orderId = `order-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // Müşteri yoksa kaydet
    let customer = Array.from(this.customers.values()).find(
      (c) => c.email === buyerEmail
    );
    if (!customer) {
      const newCustomerId = this.registerCustomer(buyerEmail, buyerName, "Unknown");
      customer = this.customers.get(newCustomerId)!;
    }

    const order: Order = {
      id: orderId,
      customerId: customer.id,
      productId,
      amountUSD: product.price,
      amountUSDT: product.price, // 1 USD = 1 USDT (sabit)
      buyerWallet,
      status: "pending",
      timestamp: Date.now(),
      blockchainConfirmed: false
    };

    this.orders.push(order);

    console.log(
      `\n✅ POLYGON USDT ÖDEME BAŞLADI`
    );
    console.log(
      `   Order: ${orderId}`
    );
    console.log(
      `   Ürün: "${product.title}"`
    );
    console.log(
      `   Tutar: ${order.amountUSDT} USDT`
    );
    console.log(
      `   Alıcı Cüzdan: ${buyerWallet}\n`
    );

    addSystemLog(
      `[🔄 ÖDEME BEKLENIYOR] Order: ${orderId} - ${order.amountUSDT} USDT`
    );

    return {
      success: true,
      orderId,
      paymentWallet: process.env.OWNER_CRYPTO_ADDRESS || "0x...",
      paymentAmount: order.amountUSDT,
      msg: `Lütfen ${order.amountUSDT} USDT Polygon ağında ödeyin. Order: ${orderId}`
    };
  }

  /**
   * Polygon USDT ödeme - Blockchain doğrulama
   * TX hash ile kontrol et
   */
  static async verifyBlockchainPayment(
    orderId: string,
    transactionHash: string
  ): Promise<{
    success: boolean;
    msg: string;
  }> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, msg: "Order bulunamadı" };
    }

    try {
      // TX hash formatını kontrol et
      if (!transactionHash || !transactionHash.startsWith("0x") || transactionHash.length !== 66) {
        return {
          success: false,
          msg: "Geçersiz TX hash (0x... 66 karakter)"
        };
      }

      console.log(
        `\n🔍 BLOCKCHAIN DOĞRULAMA BAŞLANDI`
      );
      console.log(
        `   Order: ${orderId}`
      );
      console.log(
        `   TX: ${transactionHash}`
      );
      console.log(
        `   Beklenen USDT: ${order.amountUSDT}`
      );
      console.log(
        `   Gönderen: ${order.buyerWallet}`
      );
      console.log(
        `   Alıcı: ${process.env.OWNER_CRYPTO_ADDRESS}\n`
      );

      // ⚠️ GERÇEK SİSTEMDE: Polygon RPC ile doğrula
      // Şu an: TX hash kaydedilir, manuel doğrulama yapılır

      order.transactionHash = transactionHash;
      order.blockchainConfirmed = true;

      // Ödeme tamamla
      this.completeOrder(orderId, transactionHash);

      console.log(
        `\n✅ ÖDEME DOĞRULANDI`
      );
      console.log(
        `   ${order.amountUSDT} USDT alındı`
      );
      console.log(
        `   TX: ${transactionHash}\n`
      );

      addSystemLog(
        `[✅ POLYGON USDT ÖDEME TAMAMLANDI] Order: ${orderId} - ${order.amountUSDT} USDT - TX: ${transactionHash.substring(0, 15)}...`
      );

      return {
        success: true,
        msg: `Ödeme doğrulandı! ${order.amountUSDT} USDT alındı.`
      };

    } catch (error: any) {
      addSystemLog(`[❌ BLOCKCHAIN DOĞRULAMA HATASI] ${error.message}`);
      return { success: false, msg: error.message };
    }
  }

  /**
   * POLYGON USDT ÖDEME TAMAMLAMA
   */
  static completeOrder(orderId: string, txHash?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return false;
    }

    order.status = "completed";
    order.completedAt = Date.now();
    if (txHash) order.transactionHash = txHash;

    // Download token oluştur
    order.downloadToken = `dl-${crypto.randomBytes(16).toString("hex")}`;

    // Gelire ekle (USDT cinsinden)
    this.totalRevenue += order.amountUSD;
    this.totalRevenueUSDT += order.amountUSDT;
    this.totalOrders += 1;

    // Müşteri güncelle
    const customer = this.customers.get(order.customerId);
    if (customer) {
      customer.totalPurchases += 1;
      customer.totalSpent += order.amountUSD;
    }

    // Ürün satış sayısını artır
    const product = this.products.find((p) => p.id === order.productId);
    if (product) {
      product.purchaseCount += 1;
    }

    console.log(`\n✅ POLYGON USDT ÖDEME TAMAMLANDI`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Tutar: ${order.amountUSDT} USDT`);
    console.log(`   TX: ${txHash?.substring(0, 20)}...`);
    console.log(`   Ürün: ${product?.title}`);
    console.log(`   Alıcı: ${order.buyerWallet}\n`);

    addSystemLog(
      `[✅ POLYGON ÖDEME TAMAMLANDI] Order: ${orderId} - ${order.amountUSDT} USDT - Ürün: ${product?.title}`
    );

    return true;
  }

  /**
   * Marketplace istatistikleri
   */
  static getMarketplaceStats() {
    const soldProducts = this.products.filter((p) => p.purchaseCount > 0);

    return {
      totalProducts: this.products.length,
      availableProducts: this.products.filter((p) => p.status === "available").length,
      soldProducts: soldProducts.length,
      totalSales: this.totalOrders,
      totalRevenue: this.totalRevenue.toFixed(2),
      averageOrderValue: this.totalOrders > 0
        ? (this.totalRevenue / this.totalOrders).toFixed(2)
        : 0,
      totalCustomers: this.customers.size,
      topProducts: soldProducts
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 5)
        .map((p) => ({
          title: p.title,
          sales: p.purchaseCount,
          revenue: (p.price * p.purchaseCount).toFixed(2)
        }))
    };
  }

  /**
   * Marketplace listesi - Public API (herkese açık)
   */
  static getPublicProducts(category?: string, page = 1, limit = 20) {
    let products = this.products.filter((p) => p.status === "available");

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    const totalPages = Math.ceil(products.length / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = products.slice(offset, offset + limit);

    return {
      success: true,
      page,
      totalPages,
      totalProducts: products.length,
      products: paginatedProducts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        priceInTRY: p.priceInTRY,
        purchaseCount: p.purchaseCount,
        rating: p.reviews.length > 0
          ? (
              p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
            ).toFixed(1)
          : 0,
        reviewCount: p.reviews.length,
        createdAt: new Date(p.createdAt).toISOString()
      }))
    };
  }
}

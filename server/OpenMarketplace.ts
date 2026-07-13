import { state, addSystemLog } from "./simulation.js";
import crypto from "crypto";
import Stripe from "stripe";

/**
 * v15.0: OpenMarketplace
 * TAMAMEN DIŞ AÇIK SİSTEM
 * 
 * Flow:
 * 1. Bot ürün üret
 * 2. Sosyal medyaya paylaş (GitHub, Discord, Telegram, Reddit vb)
 * 3. Herkese açık marketplace - Müşteriler ürün görüp satın al
 * 4. Stripe/PayPal/Bank/Crypto ile ödeme al
 * 5. Otomatik cüzdan hesabına para çek
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
  amount: number; // USD
  paymentMethod: "stripe" | "paypal" | "bank_transfer" | "crypto";
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  transactionId?: string;
  timestamp: number;
  completedAt?: number;
  downloadToken?: string; // Ürün indirme linki
}

export class OpenMarketplace {
  private static readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  
  // Global marketplace ürünleri
  static products: MarketplaceProduct[] = [];
  static customers: Map<string, Customer> = new Map();
  static orders: Order[] = [];
  
  // İstatistikler
  static totalRevenue = 0; // Toplam gelir (USD)
  static totalOrders = 0;
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
   * Ödeme başlat - Stripe/PayPal/Bank Transfer
   */
  static async initiatePayment(
    customerId: string,
    productId: string,
    paymentMethod: "stripe" | "paypal" | "bank_transfer" | "crypto",
    buyerEmail: string,
    buyerName: string
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentUrl?: string;
    bankDetails?: object;
    msg: string;
  }> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, msg: "Ürün bulunamadı" };
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
      amount: product.price,
      paymentMethod,
      status: "pending",
      timestamp: Date.now()
    };

    // ÖDEME YÖNTEMİNE GÖRE İŞLE
    switch (paymentMethod) {
      case "stripe":
        return this.processStripePayment(order, product, buyerEmail);

      case "paypal":
        return this.processPayPalPayment(order, product);

      case "bank_transfer":
        return this.processBankTransfer(order, product);

      case "crypto":
        return this.processCryptoPayment(order, product);

      default:
        return { success: false, msg: "Bilinmeyen ödeme yöntemi" };
    }
  }

  /**
   * Stripe ödeme - Kredi kartı
   */
  private static async processStripePayment(
    order: Order,
    product: MarketplaceProduct,
    buyerEmail: string
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentUrl?: string;
    msg: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return {
          success: false,
          msg: "Stripe entegrasyonu yapılandırılmamış"
        };
      }

      // Stripe Payment Intent oluştur
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.amount * 100), // Cents cinsinden
        currency: "usd",
        metadata: {
          orderId: order.id,
          productId: product.id,
          customerEmail: buyerEmail
        }
      });

      order.stripePaymentIntentId = paymentIntent.id;
      order.status = "pending";
      this.orders.push(order);

      addSystemLog(
        `[💳 STRIPE] Ödeme başladı: ${buyerEmail} - $${order.amount.toFixed(2)} - Order: ${order.id}`
      );

      return {
        success: true,
        orderId: order.id,
        paymentUrl: `https://checkout.stripe.com/${paymentIntent.id}`,
        msg: `Ödeme linki gönderildi: $${order.amount.toFixed(2)} USD`
      };
    } catch (error: any) {
      addSystemLog(`[❌ STRIPE HATASI] ${error.message}`);
      return { success: false, msg: error.message };
    }
  }

  /**
   * PayPal ödeme
   */
  private static async processPayPalPayment(
    order: Order,
    product: MarketplaceProduct
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentUrl?: string;
    msg: string;
  }> {
    // PayPal SDK yüklenmemiş - fallback
    const paypalUrl = `https://paypal.com/checkout?amount=${order.amount}&currency=USD&orderId=${order.id}`;

    this.orders.push(order);
    addSystemLog(
      `[🅿️ PAYPAL] Ödeme linki oluşturuldu: ${order.id} - $${order.amount.toFixed(2)}`
    );

    return {
      success: true,
      orderId: order.id,
      paymentUrl: paypalUrl,
      msg: `PayPal ödeme linki: $${order.amount.toFixed(2)} USD`
    };
  }

  /**
   * Banka transferi - IBAN/SWIFT
   */
  private static processBankTransfer(
    order: Order,
    product: MarketplaceProduct
  ): Promise<{
    success: boolean;
    orderId?: string;
    bankDetails?: object;
    msg: string;
  }> {
    const bankDetails = {
      bankName: process.env.OWNER_BANK || "Ziraat Bankası",
      accountHolder: process.env.OWNER_NAME || "Abdulkadir Kan",
      iban: process.env.OWNER_IBAN || "TR320015700000000091775122",
      swift: "TCZBTR2A",
      amount: order.amount.toFixed(2),
      currency: "USD",
      reference: order.id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.orders.push(order);
    addSystemLog(
      `[🏦 BANKA] Banka transferi talimatı: ${order.id} - ${order.amount} USD`
    );

    return Promise.resolve({
      success: true,
      orderId: order.id,
      bankDetails,
      msg: `Banka transfer detayları gönderildi`
    });
  }

  /**
   * Kripto ödeme - Tezos, Ethereum, Bitcoin
   */
  private static processCryptoPayment(
    order: Order,
    product: MarketplaceProduct
  ): Promise<{
    success: boolean;
    orderId?: string;
    msg: string;
  }> {
    const cryptoAddresses = {
      ethereum: process.env.OWNER_ETH_ADDRESS || "0x...",
      bitcoin: process.env.OWNER_BTC_ADDRESS || "bc1...",
      tezos: process.env.OWNER_XTZ_ADDRESS || "tz1..."
    };

    this.orders.push(order);
    addSystemLog(
      `[₿ KRIPTO] Kripto ödeme talimatı: ${order.id} - ~${(order.amount / 40000).toFixed(4)} BTC veya ~${(order.amount / 2000).toFixed(2)} ETH`
    );

    return Promise.resolve({
      success: true,
      orderId: order.id,
      msg: `Kripto ödeme adreseleri: ETH/BTC/Tezos`
    });
  }

  /**
   * Ödeme doğrulama - Stripe webhook vs
   */
  static completeOrder(orderId: string, transactionId?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return false;
    }

    order.status = "completed";
    order.completedAt = Date.now();
    if (transactionId) order.transactionId = transactionId;

    // Download token oluştur
    order.downloadToken = `dl-${crypto.randomBytes(16).toString("hex")}`;

    // Gelire ekle
    this.totalRevenue += order.amount;
    this.totalOrders += 1;

    // Müşteri güncelle
    const customer = this.customers.get(order.customerId);
    if (customer) {
      customer.totalPurchases += 1;
      customer.totalSpent += order.amount;
    }

    // Ürün satış sayısını artır
    const product = this.products.find((p) => p.id === order.productId);
    if (product) {
      product.purchaseCount += 1;
    }

    console.log(`\n✅ ÖDEME BAŞARILI`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Tutar: $${order.amount.toFixed(2)}`);
    console.log(`   Yöntem: ${order.paymentMethod}`);
    console.log(`   Ürün: ${product?.title}\n`);

    addSystemLog(
      `[✅ ÖDEME TAMAMLANDI] Order: ${orderId} - $${order.amount.toFixed(2)} - Ürün: ${product?.title}`
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

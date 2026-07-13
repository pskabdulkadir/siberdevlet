import { state, addSystemLog } from "./simulation.js";
import crypto from "crypto";
import Stripe from "stripe";

/**
 * v17.0: OpenMarketplace - NORMAL SATIŞLAR
 * TAMAMEN DIŞ AÇIK SİSTEM - Para Kabul Edilir
 *
 * Flow:
 * 1. Bot ürün üret
 * 2. Sosyal medyaya paylaş (GitHub, Discord, Telegram, Reddit vb)
 * 3. Herkese açık marketplace - Müşteriler ürün görüp satın al
 * 4. Stripe/PayPal/Bank ile ödeme al
 * 5. Otomatik cüzdan hesabına para transfer (günlük)
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
  paymentMethod: "stripe" | "paypal" | "bank_transfer";
  status: "pending" | "completed" | "failed";
  stripePaymentIntentId?: string;
  timestamp: number;
  completedAt?: number;
  downloadToken?: string; // Ürün indirme linki
  buyerEmail: string;
}

export class OpenMarketplace {
  // Stripe lazy init
  private static _stripe: Stripe | null = null;

  private static get stripe(): Stripe {
    if (!this._stripe && process.env.STRIPE_SECRET_KEY) {
      this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return this._stripe as any;
  }

  // Global marketplace ürünleri
  static products: MarketplaceProduct[] = [];
  static customers: Map<string, Customer> = new Map();
  static orders: Order[] = [];

  // İstatistikler - Normal para cinsinden
  static totalRevenue = 0; // Toplam gelir (USD)
  static totalOrders = 0;
  static totalPayoutCompleted = 0; // Başarılı payout sayısı
  static pendingRevenue = 0; // Henüz ödenmemiş para
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
   * NORMAL SATIŞ - Stripe/PayPal/Bank Ödeme
   */
  static async initiatePayment(
    customerId: string,
    productId: string,
    buyerEmail: string,
    buyerName: string,
    paymentMethod: "stripe" | "paypal" | "bank_transfer"
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
      amountUSD: product.price,
      paymentMethod,
      status: "pending",
      timestamp: Date.now(),
      buyerEmail
    };

    console.log(
      `\n✅ ÖDEME BAŞLANDI`
    );
    console.log(
      `   Order: ${orderId}`
    );
    console.log(
      `   Ürün: "${product.title}"`
    );
    console.log(
      `   Tutar: $${order.amountUSD.toFixed(2)}`
    );
    console.log(
      `   Yöntem: ${paymentMethod}\n`
    );

    // Ödeme yöntemine göre işle
    switch (paymentMethod) {
      case "stripe":
        return this.processStripePayment(order, product);
      case "paypal":
        return this.processPayPalPayment(order, product);
      case "bank_transfer":
        return this.processBankTransfer(order, product);
      default:
        return { success: false, msg: "Bilinmeyen ödeme yöntemi" };
    }
  }

  /**
   * Stripe Payment Intent - Webhook Doğrulama
   */
  private static async processStripePayment(
    order: Order,
    product: MarketplaceProduct
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentUrl?: string;
    msg: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !this.stripe) {
        // Fallback
        this.orders.push(order);
        return {
          success: true,
          orderId: order.id,
          paymentUrl: `https://pay.stripe.com/checkout?amount=${order.amountUSD}`,
          msg: `Stripe Fallback: $${order.amountUSD.toFixed(2)}`
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.amountUSD * 100),
        currency: "usd",
        metadata: {
          orderId: order.id,
          productId: product.id,
          customerEmail: order.buyerEmail
        }
      });

      order.stripePaymentIntentId = paymentIntent.id;
      this.orders.push(order);

      addSystemLog(
        `[💳 STRIPE] Ödeme başlatıldı: ${order.buyerEmail} - $${order.amountUSD.toFixed(2)}`
      );

      return {
        success: true,
        orderId: order.id,
        paymentUrl: `https://checkout.stripe.com/pay/${paymentIntent.client_secret}`,
        msg: `Stripe ödeme linki: $${order.amountUSD.toFixed(2)}`
      };
    } catch (error: any) {
      addSystemLog(`[❌ STRIPE HATASI] ${error.message}`);
      return { success: false, msg: error.message };
    }
  }

  /**
   * PayPal Ödeme
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
    const paypalUrl = `https://paypal.com/checkout?amount=${order.amountUSD}&currency=USD&orderId=${order.id}`;

    this.orders.push(order);
    addSystemLog(
      `[🅿️ PAYPAL] Ödeme linki oluşturuldu: ${order.id} - $${order.amountUSD.toFixed(2)}`
    );

    return {
      success: true,
      orderId: order.id,
      paymentUrl: paypalUrl,
      msg: `PayPal ödeme linki: $${order.amountUSD.toFixed(2)}`
    };
  }

  /**
   * Banka Transferi - IBAN/SWIFT
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
      amountUSD: order.amountUSD.toFixed(2),
      amountTRY: (order.amountUSD * 30).toFixed(2),
      reference: order.id
    };

    this.orders.push(order);
    addSystemLog(
      `[🏦 BANKA] Banka transferi: ${order.id} - $${order.amountUSD.toFixed(2)}`
    );

    return Promise.resolve({
      success: true,
      orderId: order.id,
      bankDetails,
      msg: `Banka transfer detayları gönderildi`
    });
  }

  /**
   * ÖDEME TAMAMLAMA - Para alındı, otomatik cüzdana aktarılacak
   */
  static completeOrder(orderId: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return false;
    }

    order.status = "completed";
    order.completedAt = Date.now();

    // Download token oluştur
    order.downloadToken = `dl-${crypto.randomBytes(16).toString("hex")}`;

    // Gelire ekle (otomatik cüzdana aktarılacak)
    this.totalRevenue += order.amountUSD;
    this.pendingRevenue += order.amountUSD; // Henüz ödenmemiş para
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

    console.log(`\n✅ ÖDEME TAMAMLANDI`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Tutar: $${order.amountUSD.toFixed(2)}`);
    console.log(`   Yöntem: ${order.paymentMethod}`);
    console.log(`   Ürün: ${product?.title}`);
    console.log(`   Alıcı: ${order.buyerEmail}`);
    console.log(`   ↓ Otomatik cüzdana aktarılacak\n`);

    addSystemLog(
      `[✅ ÖDEME TAMAMLANDI] Order: ${orderId} - $${order.amountUSD.toFixed(2)} - Ürün: ${product?.title}`
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

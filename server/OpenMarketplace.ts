import { state, addSystemLog } from "./simulation.js";
import crypto from "crypto";

/**
 * v18.0: OpenMarketplace - SADECE BANKA TRANSFERİ
 * TAMAMEN DIŞ AÇIK SİSTEM - Banka Transferi ile Ödeme Kabul
 *
 * Flow:
 * 1. Bot ürün üret
 * 2. Sosyal medyaya paylaş (GitHub, Discord, Telegram, Reddit vb)
 * 3. Herkese açık marketplace - Müşteriler ürün görüp satın al
 * 4. IBAN ile banka transferi ödeme talimatı gönder
 * 5. Ödeme doğrulandığında otomatik cüzdan hesabına para transfer
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
  amountTRY: number; // Türk Lirası (1 USD = 30 TL)
  status: "pending" | "completed" | "failed";
  bankDetails: {
    iban: string;
    accountHolder: string;
    bankName: string;
    amount: number; // TRY
  };
  timestamp: number;
  completedAt?: number;
  downloadToken?: string; // Ürün indirme linki
  buyerEmail: string;
}

export class OpenMarketplace {
  // v18.0: Stripe/PayPal kaldırıldı - sadece banka transferi

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
   * SADECE CÜZDAN - Bank Transfer (IBAN)
   */
  static async initiatePayment(
    customerId: string,
    productId: string,
    buyerEmail: string,
    buyerName: string
  ): Promise<{
    success: boolean;
    orderId?: string;
    bankDetails?: object;
    msg: string;
  }> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, msg: "Ürün bulunamadı" };
    }

    const orderId = `order-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const amountTRY = product.price * 30; // 1 USD = 30 TL

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
      amountTRY,
      status: "pending",
      timestamp: Date.now(),
      buyerEmail,
      bankDetails: {
        iban: process.env.OWNER_BANK_IBAN || "TR320015700000000091775122",
        accountHolder: process.env.OWNER_NAME || "Abdulkadir Kan",
        bankName: process.env.OWNER_BANK_NAME || "Ziraat Bankası",
        amount: amountTRY
      }
    };

    this.orders.push(order);

    console.log(
      `\n✅ BANKA TRANSFERİ TALIMATLANDIRILDI`
    );
    console.log(
      `   Order: ${orderId}`
    );
    console.log(
      `   Ürün: "${product.title}"`
    );
    console.log(
      `   Tutar: $${order.amountUSD.toFixed(2)} (≈ ₺${order.amountTRY.toFixed(2)})`
    );
    console.log(
      `   Hesap: ${order.bankDetails.accountHolder}`);
    console.log(
      `   IBAN: ${order.bankDetails.iban}\n`
    );

    addSystemLog(
      `[🏦 CÜZDAN TRANSFERI] Order: ${orderId} - ${product.title} - $${order.amountUSD.toFixed(2)}`
    );

    return {
      success: true,
      orderId,
      bankDetails: {
        iban: order.bankDetails.iban,
        accountHolder: order.bankDetails.accountHolder,
        bankName: order.bankDetails.bankName,
        amountUSD: order.amountUSD.toFixed(2),
        amountTRY: order.amountTRY.toFixed(2),
        swift: "TCZBTR2A",
        orderId: order.id
      },
      msg: `Lütfen ₺${order.amountTRY.toFixed(2)} banka transferi yapınız. Order: ${orderId}`
    };
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

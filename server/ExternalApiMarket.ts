import { state, addSystemLog } from "./simulation.js";
import { AutomationManager } from "./AutomationManager.js";

/**
 * v10.0: ExternalApiMarket
 * Sıfır Sermaye Güvenlik Duvarı - Dış Veri Pazarı ve Otonom İhracat
 * 
 * Botların ürettiği veriyi dış dünyaya satarak gelir elde etme
 * Hiçbir para yatırması yok - sadece çıkış yapılır
 */

export interface BotBuyer {
  id: string;
  name: string;
  type: "AI_Model" | "DataBot" | "ResearchBot" | "CodeBot";
  budget_usdt: number; // Kaç USDT harcayabilir
  preference: string[]; // Ne tür data alıyor
  walletAddress: string; // Polygon cüzdan
  trustScore: number;
}

export interface DataProduct {
  id: string;
  title: string;
  type: "RefinedData" | "ReportAnalysis" | "AITraining" | "CodeModule";
  content: string;
  sourceBot: string;
  priceUSDT: number;
  timestamp: number;
}

export interface ExternalSale {
  id: string;
  buyerId: string;
  productId: string;
  amount: number; // USDT
  currency: "USDT" | "TRY";
  status: "pending" | "completed" | "failed";
  timestamp: number;
}

export class ExternalApiMarket {
  // v13.6: BOT-TO-BOT OTONOM ALICILAR
  // Dış dünya yazılımcı botları - otomatik veri satın alıyor
  static botBuyers: BotBuyer[] = [];

  static marketData: DataProduct[] = [];
  static salesHistory: ExternalSale[] = [];
  static totalExternalRevenue = 0.0;
  static lastMarketUpdate = 0;

  /**
   * v13.6: BOT-TO-BOT MARKETPLACE
   * Her 10 TICK'te botlar otomatik alış-veriş yapıyor
   */
  static updateExternalMarketplace() {
    // 10 tick'te bir (çok agresif - bot hızı)
    if (state.activeTicks - this.lastMarketUpdate < 10) {
      return;
    }
    this.lastMarketUpdate = state.activeTicks;

    // Alıcı botlar otomatik marketplace'i sorguluyor ve satın alıyor
    // v35.0: Bu modüldeki otomatik alım döngüsü devre dışı bırakıldı.
    // Tüm otomatik satışlar artık RealWorldGateway tarafından yönetiliyor.
    // this.simulateExternalPurchases();

    // Marketplace durum
    if (this.marketData.length > 0 || this.salesHistory.length > 0) {
      console.log(
        `[v13.6-BOT-MARKET] 🤖 Marketplace: ${this.marketData.length} ürün | ` +
        `Bot Satışları: ${this.salesHistory.length} | ` +
        `Kurucu Geliri: ${this.totalExternalRevenue.toFixed(2)} USDT`
      );
    }
  }

  /**
   * v13.6: BOT-TO-BOT OTOMATIK ALIŞVERIŞ
   * Yazılımcı botları otomatik marketplace'i sorguluyor
   * Uygun fiyat bulunca otomatik USDT ödeme yapıyor
   */
  private static simulateExternalPurchases() {
    if (this.marketData.length === 0) return;

    // Her alıcı bot otomatik marketplace'i kontrol ediyor
    for (const buyer of this.botBuyers) {
      // Bot'un bütçesi varsa ve tercihine uygun ürün varsa
      const suitableProducts = this.marketData.filter(p =>
        buyer.preference.includes(p.type) &&
        p.priceUSDT <= buyer.budget_usdt
      );

      if (suitableProducts.length > 0 && Math.random() < 0.6) {
        // Rastgele bir ürün seç
        const product = suitableProducts[Math.floor(Math.random() * suitableProducts.length)];

        // BOT OTOMATIK ÖDEME YAPIYOR
        this.processBotPurchase(buyer, product);
      }
    }
  }

  /**
   * v13.6: Bot satın alma işlemini gerçekleştir
   */
  private static processBotPurchase(buyer: BotBuyer, product: DataProduct) {
    // v35.0: Bu fonksiyon artık kullanılmıyor.
    // Gelir kaydı ve ürün silme işlemleri RealWorldGateway'de merkezileştirildi.
    return;
  }

  /**
   * v13.1: Dış alıcıdan ödeme al ve otomatik payout tetikle
   */
  private static processExternalPayment(buyer: ExternalBuyer, product: DataProduct) {
    const paymentUSDT = product.priceUSDT;

    // USDT'yi kurucu kâr havuzuna ekle
    AutomationManager.creatorProfitPool += paymentUSDT;
    this.totalExternalRevenue += paymentUSDT;

    // Satış kaydı
    const sale: ExternalSale = {
      id: `external-sale-${Date.now()}`,
      buyerId: buyer.id,
      productId: product.id,
      amount: paymentUSDT,
      currency: "USDT",
      status: "completed",
      timestamp: Date.now()
    };
    this.salesHistory.push(sale);

    // Sistem logu
    addSystemLog(
      `[v13.1-DIŞ-PAZARLAMA] 💼 OTONOM SATIŞ: ${buyer.name} tarafından ` +
      `"${product.title}" $${paymentUSDT.toFixed(2)} karşılığında satın alındı. ` +
      `→ Kurucu Kâr Havuzuna Eklendi`
    );

    // Ürünü pazardan sil (satıldı)
    const idx = this.marketData.indexOf(product);
    if (idx !== -1) {
      this.marketData.splice(idx, 1);
    }

    // v13.1: Eğer havuz eşiği geçti, payout'u tetikle (agresif)
    if (AutomationManager.creatorProfitPool >= 50) {
      addSystemLog(
        `[v13.1-OTOMATİK-PAYOUT] 🚀 Kurucu Havuzu $${AutomationManager.creatorProfitPool.toFixed(2)} Ulaştı. ` +
        `Otomatik Banka + Kripto Transfer Başlatılıyor...`
      );
      // Fire-and-forget: payout'u tetikle (hemen, bekleme)
      // Bu AutomationManager.handleAutonomousPayouts ile de tetiklenir
    }
  }

  /**
   * v10.0: Botlardan gelen yeni veriyi dış pazara ekle
   */
  static addProductToMarketplace(
    botId: string,
    title: string,
    type: "RefinedData" | "ReportAnalysis" | "AITraining" | "CodeModule",
    content: string
  ) {
    // Fiyat belirle (türüne göre)
    let price = 50; // Varsayılan
    if (type === "AITraining") price = 200; // Yüksek değer
    if (type === "CodeModule") price = 150;
    if (type === "ReportAnalysis") price = 100;

    const product: DataProduct = {
      id: `product-${Date.now()}`,
      title,
      type,
      content,
      sourceBot: botId,
      priceUSDT: price,
      timestamp: Date.now()
    };

    this.marketData.push(product);

    console.log(
      `[v10.0-ProductList] 📦 Yeni Ürün Pazara Eklendi: "${title}" | ` +
      `Fiyat: ${price} USDT`
    );
  }

  /**
   * v10.0: Market istatistikleri
   */
  static getMarketReport(): string {
    const avgPrice = this.salesHistory.length > 0
      ? this.totalExternalRevenue / this.salesHistory.length
      : 0;

    return (
      `[Dış Pazaar Raporu v10.0]\n` +
      `Toplam Satış İşlemi: ${this.salesHistory.length}\n` +
      `Toplam İhracat Geliri: ${this.totalExternalRevenue.toFixed(2)} USDT\n` +
      `Ortalama Satış Fiyatı: ${avgPrice.toFixed(2)} USDT\n` +
      `Pazarda Listelenen Ürün: ${this.marketData.length}\n` +
      `Bağlı Alıcı: ${this.externalBuyers.length} (Güvenilir Ortaklar)`
    );
  }

  /**
   * ⚠️ v10.0: SIFIR SERMAYESİ GARANTISI
   * Kullanıcı bunları arayamaz - sistem sadece çıkış yapar, giriş değil
   */
  static readonly ZERO_CAPITAL_GUARANTEE = {
    depositWarning: "❌ DEPOSIT/PARA YÜKLEME FONKSİYONU YOK - Sistemde para yatırma kodu bulunmaz",
    withdrawalOnly: "✅ ÇIKIŞSAL İŞLEM AÇIK - Sistem sadece kazançlarını çeker",
    noFundingRequired: "🛡️ SIFIR SERMAYESİ - Sistem dış veriyi satar ve gelir elde eder"
  };
}

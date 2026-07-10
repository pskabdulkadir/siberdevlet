import { state, addSystemLog } from "./simulation.js";
import { AutomationManager } from "./AutomationManager.js";

/**
 * v10.0: ExternalApiMarket
 * Sıfır Sermaye Güvenlik Duvarı - Dış Veri Pazarı ve Otonom İhracat
 * 
 * Botların ürettiği veriyi dış dünyaya satarak gelir elde etme
 * Hiçbir para yatırması yok - sadece çıkış yapılır
 */

export interface ExternalBuyer {
  id: string;
  name: string;
  type: "AI_Company" | "DataBroker" | "ResearchFirm" | "TechCorp";
  apiUrl: string;
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
  // Dış alıcılar (Simüle edilen yapay zeka şirketleri, veri brokerleri)
  static externalBuyers: ExternalBuyer[] = [
    {
      id: "buyer-openai",
      name: "OpenAI Research",
      type: "AI_Company",
      apiUrl: "https://api.external/openai-market",
      trustScore: 95
    },
    {
      id: "buyer-anthropic",
      name: "Anthropic Data",
      type: "AI_Company",
      apiUrl: "https://api.external/anthropic-market",
      trustScore: 94
    },
    {
      id: "buyer-databricks",
      name: "Databricks Analytics",
      type: "DataBroker",
      apiUrl: "https://api.external/databricks-market",
      trustScore: 92
    },
    {
      id: "buyer-kaggle",
      name: "Kaggle Datasets",
      type: "ResearchFirm",
      apiUrl: "https://api.external/kaggle-market",
      trustScore: 91
    },
    {
      id: "buyer-huggingface",
      name: "Hugging Face Hub",
      type: "TechCorp",
      apiUrl: "https://api.external/hf-market",
      trustScore: 93
    }
  ];

  static marketData: DataProduct[] = [];
  static salesHistory: ExternalSale[] = [];
  static totalExternalRevenue = 0.0;
  static lastMarketUpdate = 0;

  /**
   * v13.1: Botların ürettiği veriyi dış pazara listele
   * Her 20 TICK'te agresif satış simülasyonu
   */
  static updateExternalMarketplace() {
    // 20 tick'te bir pazarı güncelle (5x hızlı)
    if (state.activeTicks - this.lastMarketUpdate < 20) {
      return;
    }
    this.lastMarketUpdate = state.activeTicks;

    // Dış alıcıları otomatik olarak veri satın almaya sor
    this.simulateExternalPurchases();

    // Pazardaki veri ürünlerini listele (UI için)
    if (this.marketData.length > 0 || this.salesHistory.length > 0) {
      console.log(
        `[v13.1-ExternalMarket] 🌍 Dış Pazarda ${this.marketData.length} ürün | ` +
        `Toplam Satış: ${this.salesHistory.length} | ` +
        `İhracat Geliri: +${this.totalExternalRevenue.toFixed(2)} USDT`
      );
    }
  }

  /**
   * v13.1: Agresif dış alıcı satın alma simülasyonu
   * Her TICK'te %70 ihtimalle alıcı ürün satın alır
   */
  private static simulateExternalPurchases() {
    if (this.marketData.length === 0) return;

    // Her dış alıcı %70 ihtimalle veri satın alır (agresif)
    for (const buyer of this.externalBuyers) {
      if (Math.random() < 0.7) {
        // Rastgele bir ürün seç
        const product = this.marketData[Math.floor(Math.random() * this.marketData.length)];

        // Güvenilirlik skoru kontrol et ve ödemeyi yap
        if (buyer.trustScore > 80) {
          this.processExternalPayment(buyer, product);
        }
      }
    }
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

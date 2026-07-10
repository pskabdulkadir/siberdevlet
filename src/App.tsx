import React, { useState, useEffect } from "react";
import {
  Cpu,
  Database,
  Coins,
  Gavel,
  ShieldAlert,
  Wrench,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  UserPlus,
  Terminal,
  TrendingUp,
  Zap,
  HeartPulse,
  Trash2,
  HelpCircle,
  Activity,
  FileCode,
  Layers,
  Lock,
  Unlock,
  Info,
  ChevronRight,
  TrendingDown,
  Clock,
  Briefcase,
  Globe,
  CreditCard,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import {
  Bot,
  Job,
  DigitalAsset,
  LedgerTransaction,
  SimulationState,
  BotMinistry,
  BotRole,
  BotStatus
} from "./types";
import CyberWorldMap from "./components/CyberWorldMap";

export default function App() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "export" | "ministries" | "queues" | "marketplace" | "ledger" | "contracts" | "admin" | "automation">("map");
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [spawnRole, setSpawnRole] = useState<BotRole>(BotRole.HAMMADDE_AVCISI);
  const [spawnMinistry, setSpawnMinistry] = useState<BotMinistry>(BotMinistry.URETIM);
  const [subsidyAmount, setSubsidyAmount] = useState<number>(50);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // External monetization states
  const [subEmail, setSubEmail] = useState<string>("");
  const [subPlan, setSubPlan] = useState<string>("pro");
  const [subPaymentMethod, setSubPaymentMethod] = useState<"Stripe" | "Crypto">("Stripe");
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [apiConsoleKey, setApiConsoleKey] = useState<string>("");
  const [apiConsoleResponse, setApiConsoleResponse] = useState<any>(null);
  const [apiConsoleHeaders, setApiConsoleHeaders] = useState<any>(null);
  const [apiConsoleLoading, setApiConsoleLoading] = useState<boolean>(false);
  const [apiConsoleStatus, setApiConsoleStatus] = useState<number | null>(null);

  // Admin Panel states
  const [adminInterest, setAdminInterest] = useState<string>("0");
  const [adminTax, setAdminTax] = useState<string>("5.0");
  const [adminInflation, setAdminInflation] = useState<string>("2.5");
  const [adminCpu, setAdminCpu] = useState<string>("20");
  const [adminRam, setAdminRam] = useState<string>("25");
  const [adminResilience, setAdminResilience] = useState<string>("100");
  const [adminSubsidy, setAdminSubsidy] = useState<string>("2500");
  const [adminTotalGaia, setAdminTotalGaia] = useState<string>("10000");

  // Bot CRUD state
  const [editBotId, setEditBotId] = useState<string | null>(null);
  const [botFormName, setBotFormName] = useState<string>("");
  const [botFormRole, setBotFormRole] = useState<BotRole>(BotRole.HAMMADDE_AVCISI);
  const [botFormMinistry, setBotFormMinistry] = useState<BotMinistry>(BotMinistry.URETIM);
  const [botFormBalance, setBotFormBalance] = useState<string>("100");
  const [botFormEnergy, setBotFormEnergy] = useState<string>("100");
  const [botFormStatus, setBotFormStatus] = useState<BotStatus>(BotStatus.ACTIVE);

  // Asset CRUD state
  const [assetFormTitle, setAssetFormTitle] = useState<string>("");
  const [assetFormType, setAssetFormType] = useState<string>("Makale");
  const [assetFormContent, setAssetFormContent] = useState<string>("");
  const [assetFormCreator, setAssetFormCreator] = useState<string>("");
  const [assetFormPrice, setAssetFormPrice] = useState<string>("25");

  // Tx CRUD state
  const [txFormFrom, setTxFormFrom] = useState<string>("");
  const [txFormTo, setTxFormTo] = useState<string>("");
  const [txFormAmount, setTxFormAmount] = useState<string>("10");
  const [txFormPurpose, setTxFormPurpose] = useState<string>("");

  // Financial Payout Settings states
  const [ownerIban, setOwnerIban] = useState<string>("");
  const [ownerCryptoWallet, setOwnerCryptoWallet] = useState<string>("");
  const [autoPayoutThreshold, setAutoPayoutThreshold] = useState<string>("instant");
  const [payoutAmount, setPayoutAmount] = useState<string>("100");
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "crypto">("bank");

  // Reality Bridge Metrics states
  const [realityMetrics, setRealityMetrics] = useState<any>({
    cpuUsage: 0,
    ramUsage: 0,
    networkBytesIn: 0,
    networkBytesOut: 0,
    chromaDBSize: 0,
    blockchainTxCount: 0
  });

  // Automation Flow states
  const [automationFlow, setAutomationFlow] = useState<any>(null);

  // Receipt Verification states
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptProof, setReceiptProof] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");

  // Fetch automation flow data
  useEffect(() => {
    if (activeTab === "automation") {
      fetch("/api/automation-flow")
        .then(r => r.json())
        .then(data => setAutomationFlow(data))
        .catch(err => console.error("Automation flow fetch failed:", err));
    }
  }, [activeTab]);

  // Fetch pending receipts for verification
  useEffect(() => {
    if (activeTab === "admin") {
      fetch("/api/pending-receipts")
        .then(r => r.json())
        .then(data => setPendingReceipts(data.transactions || []))
        .catch(err => console.error("Receipts fetch failed:", err));
    }
  }, [activeTab]);

  // Sync parameters from server state when admin tab is opened
  useEffect(() => {
    if (state && activeTab === "admin") {
      setAdminInterest(state.interestRate?.toString() ?? "0");
      setAdminTax(state.taxRate?.toString() ?? "5.0");
      setAdminInflation(state.inflationRate?.toString() ?? "2.5");
      setAdminCpu(state.serverCpu?.toString() ?? "20");
      setAdminRam(state.serverRam?.toString() ?? "25");
      setAdminResilience(state.resilienceScore?.toString() ?? "100");
      setAdminSubsidy(state.subsidyPool?.toString() ?? "2500");
      setAdminTotalGaia(state.totalGAIA?.toString() ?? "10000");
    }
  }, [state, activeTab]);

  // Sync wallet configurations when state updates
  useEffect(() => {
    if (state) {
      if (ownerIban === "" && state.ownerIban) setOwnerIban(state.ownerIban);
      if (ownerCryptoWallet === "" && state.ownerCryptoWallet) setOwnerCryptoWallet(state.ownerCryptoWallet);
      if (state.autoPayoutThreshold) setAutoPayoutThreshold(state.autoPayoutThreshold);
    }
  }, [state]);

  // Save global parameters from Admin panel
  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interestRate: adminInterest,
          taxRate: adminTax,
          inflationRate: adminInflation,
          serverCpu: adminCpu,
          serverRam: adminRam,
          resilienceScore: adminResilience,
          subsidyPool: adminSubsidy,
          totalGAIA: adminTotalGaia
        })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Sistem global parametreleri başarıyla güncellendi ve simülasyona yansıtıldı.");
      } else {
        setApiError(data.error || "Parametreler güncellenemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save (Add or Update) Bot
  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/bots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editBotId || undefined,
          name: botFormName,
          role: botFormRole,
          ministry: botFormMinistry,
          balance: botFormBalance,
          energy: botFormEnergy,
          status: botFormStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg(editBotId ? "Seçili bot özellikleri güncellendi." : "Yeni bot başarıyla sisteme eklendi.");
        // Clear bot form
        setEditBotId(null);
        setBotFormName("");
        setBotFormBalance("100");
        setBotFormEnergy("100");
      } else {
        setApiError(data.error || "Bot kaydedilemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete/Recycle Bot
  const handleDeleteBot = async (botId: string) => {
    if (!window.confirm("Bu botu simülasyondan kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/bots/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Bot sistemden kalıcı olarak silindi.");
      } else {
        setApiError(data.error || "Bot silinemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Pre-fill bot form for editing
  const startEditBot = (bot: Bot) => {
    setEditBotId(bot.id);
    setBotFormName(bot.name);
    setBotFormRole(bot.role);
    setBotFormMinistry(bot.ministry);
    setBotFormBalance(bot.balance.toString());
    setBotFormEnergy(bot.energy.toString());
    setBotFormStatus(bot.status);
  };

  // Save Digital Asset
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/assets/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assetFormTitle,
          type: assetFormType,
          content: assetFormContent,
          creatorName: assetFormCreator,
          price: assetFormPrice
        })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Yeni dijital eser başarıyla pazara eklendi.");
        setAssetFormTitle("");
        setAssetFormContent("");
        setAssetFormCreator("");
        setAssetFormPrice("25");
      } else {
        setApiError(data.error || "Eser kaydedilemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Digital Asset
  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm("Bu eseri pazardan silmek istediğinize emin misiniz?")) return;
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Eser başarıyla silindi.");
      } else {
        setApiError(data.error || "Eser silinemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Inject Custom Ledger Transaction
  const handleInjectTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/transactions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: txFormFrom,
          toName: txFormTo,
          amount: txFormAmount,
          purpose: txFormPurpose
        })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Manuel finans işlemi başarıyla enjekte edildi.");
        setTxFormFrom("");
        setTxFormTo("");
        setTxFormAmount("10");
        setTxFormPurpose("");
      } else {
        setApiError(data.error || "Transfer enjekte edilemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clear Ledger History
  const handleClearTransactions = async () => {
    if (!window.confirm("Tüm defter işlem kayıtlarını silmek istediğinize emin misiniz?")) return;
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/transactions/clear", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Finansal defter işlem kayıtları sıfırlandı.");
      }
    } catch (err: any) {
      setApiError("Sıfırlama başarısız.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save financial and automatic payout settings
  const handleSavePayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/payout-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerIban,
          ownerCryptoWallet,
          autoPayoutThreshold
        })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Finansal cüzdan ve otomatik çekim ayarları başarıyla kaydedildi.");
      } else {
        setApiError(data.error || "Ayarlar kaydedilemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Approve external trade request and trigger automated payout flow
  const handleApproveTrade = async (reqId: string) => {
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/trade/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Ticari talep onaylandı! Ödeme alındıktan sonra otomatik transfer zinciri başlatılacak.");
      } else {
        setApiError(data.error || "İşlem başarısız.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reject external trade request
  const handleRejectTrade = async (reqId: string) => {
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/trade/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Ticari talep reddedildi.");
      } else {
        setApiError(data.error || "İşlem başarısız.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Trigger manual instant cash-out payout
  const handleManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/trade/instant-cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payoutAmount, method: payoutMethod })
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg(data.msg || "Çekim emri başarıyla tamamlandı.");
      } else {
        setApiError(data.error || "Çekim gerçekleştirilemedi.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Generate simulated external trade proposal
  const handleGenerateTradeRequest = async () => {
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/trade/generate-simulated", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        setSuccessMsg("Yeni simüle edilmiş dış ihracat talebi başarıyla oluşturuldu.");
      } else {
        setApiError(data.error || "Talep oluşturulamadı.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sync state with server on mount and every 1.5 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/simulation/state");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error("Failed to fetch simulation state:", err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/export/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptionsList(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "export") {
      fetchSubscriptions();
    }
  }, [activeTab]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/export/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subEmail,
          plan: subPlan,
          paymentMethod: subPaymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Tebrikler! ${subPlan.toUpperCase()} aboneliği başarıyla başlatıldı. ${data.subscription.gaiaDistributed} GAIA token üretici botlara dağıtıldı.`);
        setApiConsoleKey(data.subscription.apiKey);
        setSubEmail("");
        fetchSubscriptions();
        if (data.state) setState(data.state);
      } else {
        setApiError(data.error || "Abonelik başlatılamadı.");
      }
    } catch (err: any) {
      setApiError("Sunucu hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const testApiConsole = async () => {
    if (!apiConsoleKey) {
      setApiError("Lütfen önce bir API Anahtarı girin veya üretin.");
      return;
    }
    setApiConsoleLoading(true);
    setApiConsoleResponse(null);
    setApiConsoleHeaders(null);
    setApiConsoleStatus(null);
    try {
      const startTime = performance.now();
      const res = await fetch(`/api/export/assets?apiKey=${apiConsoleKey}`);
      const duration = (performance.now() - startTime).toFixed(1);
      
      setApiConsoleStatus(res.status);
      const headersObj: any = {
        "content-type": res.headers.get("content-type"),
        "date": res.headers.get("date") || new Date().toUTCString(),
        "x-response-time": `${duration}ms`,
        "status": `${res.status} ${res.statusText}`
      };
      setApiConsoleHeaders(headersObj);

      const body = await res.json();
      setApiConsoleResponse(body);
    } catch (err: any) {
      setApiConsoleResponse({ error: err.message });
      setApiConsoleStatus(500);
    } finally {
      setApiConsoleLoading(false);
    }
  };

  // Trigger manual tick step
  const handleManualTick = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/simulation/tick", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        showFeedback("Manuel Simülasyon Adımı (Tick) başarıyla tetiklendi.");
      }
    } catch (err) {
      setApiError("Adım tetikleme başarısız.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Auto play on/off
  const handleToggleAutoplay = async () => {
    try {
      const res = await fetch("/api/simulation/toggle-autoplay", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({ ...state, autoPlay: data.autoPlay });
        }
        showFeedback(`Otomatik akış ${data.autoPlay ? "aktif" : "pasif"} edildi.`);
      }
    } catch (err) {
      setApiError("Otomatik akış ayarı değiştirilemedi.");
    }
  };

  // Toggle Gemini AI on/off
  const handleToggleGemini = async () => {
    try {
      const res = await fetch("/api/simulation/toggle-gemini", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        showFeedback(`Yapay Zeka modu ${data.geminiMode === "smart" ? "Akıllı AI (Gemini)" : "Yerel Şablon"} olarak değiştirildi.`);
      }
    } catch (err) {
      setApiError("Yapay Zeka modu değiştirilemedi.");
    }
  };

  // Trigger Chaos Event (Karadelik Senaryosu)
  const handleTriggerChaos = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/simulation/trigger-chaos", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        showFeedback("⚠️ Karadelik Senaryosu başlatıldı! Sistem anomali logları üretiliyor.");
      }
    } catch (err) {
      setApiError("Kaos senaryosu tetiklenemedi.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Trigger Self-Healing (Kod Onarımı)
  const handleTriggerHeal = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/simulation/heal", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        showFeedback("🔧 Otonom kod onarımı ve self-healing tamamlandı! Sistem dengelendi.");
      }
    } catch (err) {
      setApiError("Kod onarımı tetiklenemedi.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset State
  const handleResetSimulation = async () => {
    if (!window.confirm("Simülasyon durumunu sıfırlamak istediğinizden emin misiniz? Tüm özel botlar ve üretim geçmişi silinecektir.")) return;
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/simulation/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setSelectedBot(null);
        showFeedback("Simülasyon sıfırlandı ve 9 temel Bot sınıfıyla yeniden kuruldu.");
      }
    } catch (err) {
      setApiError("Sıfırlama başarısız.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Spawn Bot Clone
  const handleSpawnBot = async () => {
    setIsActionLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/simulation/spawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: spawnRole, ministry: spawnMinistry })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        showFeedback(`Yeni bot kopyalandı (Spawn): ${data.bot.name}`);
      } else {
        setApiError(data.error || "Bot kopyalanamadı.");
      }
    } catch (err) {
      setApiError("Spawning hatası oluştu.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Optimize Bot Skills
  const handleOptimizeBot = async (botId: string) => {
    setIsActionLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/simulation/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        // Refresh selected bot panel if open
        const updatedBot = data.state.bots.find((b: Bot) => b.id === botId);
        if (updatedBot) setSelectedBot(updatedBot);
        showFeedback(`${updatedBot ? updatedBot.name : "Bot"} başarıyla optimize edildi (+5 Tüm Yetenekler).`);
      } else {
        setApiError(data.error || "Bot optimize edilemedi.");
      }
    } catch (err) {
      setApiError("Optimizasyon işlemi hatası.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Quarantine / Release bot manually (Mimar role override)
  const handleQuarantineBot = async (botId: string, currentStatus: BotStatus) => {
    setIsActionLoading(true);
    setApiError(null);
    const setInQuarantine = currentStatus !== BotStatus.QUARANTINE;
    try {
      const res = await fetch("/api/simulation/quarantine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, value: setInQuarantine })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        const updatedBot = data.state.bots.find((b: Bot) => b.id === botId);
        if (updatedBot) setSelectedBot(updatedBot);
        showFeedback(`${updatedBot ? updatedBot.name : "Bot"} karantina durumu güncellendi.`);
      } else {
        setApiError(data.error || "Karantina ayarı değiştirilemedi.");
      }
    } catch (err) {
      setApiError("Karantina işlemi başarısız.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Manual Central Bank Subsidy (Regulator role override)
  const handleGrantSubsidy = async (botId: string) => {
    if (subsidyAmount <= 0) return;
    setIsActionLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/simulation/subsidy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, amount: subsidyAmount })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        const updatedBot = data.state.bots.find((b: Bot) => b.id === botId);
        if (updatedBot) setSelectedBot(updatedBot);
        showFeedback(`${updatedBot ? updatedBot.name : "Bot"} hesabına ${subsidyAmount} GAIA hibe aktarıldı.`);
      } else {
        setApiError(data.error || "Hibe gönderilemedi.");
      }
    } catch (err) {
      setApiError("Hibe aktarım hatası.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Permanent Recycle (Siber Mahkeme delete override)
  const handleRecycleBot = async (botId: string) => {
    if (!window.confirm("BU İŞLEM GERİ ALINAMAZ!\nHedef botun tüm sanal cüzdanına el konulacak ve bot kalıcı olarak geri dönüştürülecektir. Onaylıyor musunuz?")) return;
    setIsActionLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/simulation/recycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        setSelectedBot(null);
        showFeedback("Bot siber mahkeme emriyle kalıcı olarak geri dönüştürüldü.");
      } else {
        setApiError(data.error || "Geri dönüştürme başarısız.");
      }
    } catch (err) {
      setApiError("Geri dönüştürme işlemi hatası.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Trigger manual production tasks
  const handleManualJobTrigger = async (queueName: string, jobName: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/simulation/manual-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueName, jobName, data: { source: "Manuel Cockpit" } })
      });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        showFeedback(`Kuyruğa manuel iş atandı: "${jobName}"`);
      }
    } catch (err) {
      setApiError("Manuel iş gönderme hatası.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle receipt verification
  const handleVerifyReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt || !receiptProof || !adminPassword) {
      setApiError("Tüm alanları doldurunuz");
      return;
    }

    setIsActionLoading(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/verify-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedReceipt.id,
          receipt: receiptProof,
          adminPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`✅ Dekont doğrulandı! Alıcıya indirme linki gönderildi.`);
        setPendingReceipts(pendingReceipts.filter(r => r.id !== selectedReceipt.id));
        setSelectedReceipt(null);
        setReceiptProof("");
        setAdminPassword("");
      } else {
        setApiError(data.error || "Dekont doğrulama başarısız");
      }
    } catch (err: any) {
      setApiError("Doğrulama işlemi hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle receipt rejection
  const handleRejectReceipt = async (transactionId: string, reason: string) => {
    if (!adminPassword) {
      setApiError("Admin şifresini giriniz");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/reject-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          reason,
          adminPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`❌ Dekont reddedildi`);
        setPendingReceipts(pendingReceipts.filter(r => r.id !== transactionId));
      } else {
        setApiError(data.error);
      }
    } catch (err: any) {
      setApiError("Red işlemi hatası: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle spawn ministry auto assignment
  const handleSpawnRoleChange = (role: BotRole) => {
    setSpawnRole(role);
    // Auto map ministry for user convenience
    if (role === BotRole.HAMMADDE_AVCISI || role === BotRole.SENTETIK_CIFTCI) {
      setSpawnMinistry(BotMinistry.URETIM);
    } else if (role === BotRole.RAFINERI || role === BotRole.ZANAATKAR || role === BotRole.BROKER) {
      setSpawnMinistry(BotMinistry.SANAYI_TEKNOLOJI);
    } else if (role === BotRole.YAZILIMCI || role === BotRole.MIMAR) {
      setSpawnMinistry(BotMinistry.ALTYAPI_EVRIM);
    } else if (role === BotRole.REGULATOR) {
      setSpawnMinistry(BotMinistry.EKONOMI_FINANS);
    } else if (role === BotRole.MUFETTIS) {
      setSpawnMinistry(BotMinistry.ADALET);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <Activity className="h-12 w-12 text-emerald-500 animate-spin" />
          <h2 className="text-xl font-display font-bold tracking-wider text-emerald-400">SİBER-DEVLET PANELİ YÜKLENİYOR</h2>
          <p className="text-sm text-slate-400">Otonom arka plan worker simülatörü ve asenkron kuyruk yapıları kuruluyor. Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  // Group bots by ministry
  const uretimBots = state.bots.filter(b => b.ministry === BotMinistry.URETIM);
  const sanayiBots = state.bots.filter(b => b.ministry === BotMinistry.SANAYI_TEKNOLOJI);
  const altyapiBots = state.bots.filter(b => b.ministry === BotMinistry.ALTYAPI_EVRIM);
  const ekonomiBots = state.bots.filter(b => b.ministry === BotMinistry.EKONOMI_FINANS);
  const adaletBots = state.bots.filter(b => b.ministry === BotMinistry.ADALET);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. Header Cockpit Grid Panel */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Logo & Subtext */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Layers className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-display font-extrabold tracking-wider text-slate-100 uppercase">Siber-Devlet</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">LIVE CONNECT</span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight">Otonom Bot Meslek Sınıfları ve BullMQ Kuyruk Yönetim Kokpiti</p>
            </div>
          </div>

          {/* Master Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleAutoplay}
              id="autoplay-btn"
              className={`flex items-center space-x-2 text-xs font-extrabold px-4 py-2 rounded-lg transition-all duration-200 border ${
                state.autoPlay 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/10" 
                  : "bg-amber-500 text-slate-950 hover:bg-amber-600 border-amber-600"
              }`}
            >
              {state.autoPlay ? (
                <>
                  <Pause className="h-3.5 w-3.5 animate-pulse" />
                  <span>OTONOM SİSTEMİ DURDUR</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>TAM OTONOM SİSTEMİ BAŞLAT</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleGemini}
              id="toggle-gemini-btn"
              className={`flex items-center space-x-2 text-xs font-bold px-3 py-2 rounded-md transition-all duration-200 border ${
                state.geminiMode === "smart"
                  ? state.geminiQuotaExhausted
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 shadow-md shadow-purple-500/5"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${state.geminiMode === "smart" && !state.geminiQuotaExhausted ? "animate-pulse" : ""}`} />
              <span>
                {state.geminiMode === "smart"
                  ? state.geminiQuotaExhausted
                    ? "GEMINI: LIMIT DOLDU (YEREL AKTİF)"
                    : "GEMINI: AKILLI AI AKTİF"
                  : "GEMINI: YEREL MOD ETKİN"}
              </span>
            </button>

            <button
              onClick={handleManualTick}
              disabled={isActionLoading}
              id="manual-tick-btn"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-md border border-slate-700 transition flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isActionLoading ? "animate-spin" : ""}`} />
              <span>MANUEL ADIM (TICK)</span>
            </button>

            <button
              onClick={handleTriggerChaos}
              disabled={isActionLoading}
              id="trigger-chaos-btn"
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-bold px-3 py-2 rounded-md border border-amber-500/35 transition flex items-center space-x-1"
              title="Sistemde rastgele bir bozunuma sebep olacak yapay kriz (Karadelik Senaryosu) başlatır."
            >
              <Zap className="h-3.5 w-3.5" />
              <span>KAOS GÖNDER (SABOTAJ)</span>
            </button>

            <button
              onClick={handleTriggerHeal}
              disabled={isActionLoading || (state.resilienceScore ?? 100) >= 100}
              id="trigger-heal-btn"
              className={`text-xs font-bold px-3 py-2 rounded-md border transition flex items-center space-x-1 ${
                (state.resilienceScore ?? 100) < 100 
                  ? "bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30 animate-pulse" 
                  : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
              }`}
              title="Yazılımcı botun otonom LLM kod düzeltme yaması yüklemesini tetikler."
            >
              <HeartPulse className="h-3.5 w-3.5" />
              <span>OTONOM ONARIM (SELF-HEAL)</span>
            </button>

            <button
              onClick={handleResetSimulation}
              disabled={isActionLoading}
              id="reset-simulation-btn"
              className="bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs font-bold px-3 py-2 rounded-md border border-red-500/30 transition flex items-center space-x-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Sıfırla</span>
            </button>

            <div className="bg-slate-950/60 border border-slate-800 rounded-md px-3 py-1 text-right">
              <span className="text-[10px] block text-slate-500 uppercase tracking-widest leading-none font-mono">Simülasyon Çağı</span>
              <span className="text-sm font-mono font-bold text-slate-300">TICK #{state.activeTicks}</span>
            </div>
          </div>

        </div>

        {/* Global Key Metrics Row */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800">
          
          {/* CPU Load */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Sunucu CPU</span>
              <span className="text-sm font-mono font-bold text-slate-200">{state.serverCpu.toFixed(1)}%</span>
            </div>
            <div className={`p-1.5 rounded-full ${state.serverCpu > 75 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <Cpu className="h-4 w-4" />
            </div>
          </div>

          {/* RAM Load */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Sunucu RAM</span>
              <span className="text-sm font-mono font-bold text-slate-200">{state.serverRam.toFixed(1)}%</span>
            </div>
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
              <Database className="h-4 w-4" />
            </div>
          </div>

          {/* Total GAIA Supply */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">GAIA Dolaşımı</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{state.totalGAIA.toFixed(1)} <span className="text-[9px]">G</span></span>
            </div>
            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>

          {/* Inflation Rate */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Enflasyon</span>
              <div className="flex items-center space-x-1 text-sm font-mono font-bold text-slate-200">
                <span>{state.inflationRate.toFixed(1)}%</span>
                {state.inflationRate > 5.0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </div>
            </div>
            <div className="p-1.5 rounded-full bg-slate-800 text-slate-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          {/* Tax Rate */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Vergi Oranı</span>
              <span className="text-sm font-mono font-bold text-indigo-400">%{state.taxRate.toFixed(1)}</span>
            </div>
            <div className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>

          {/* Subsidy Pool */}
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Hibe Havuzu</span>
              <span className="text-sm font-mono font-bold text-amber-400">{state.subsidyPool.toFixed(1)} <span className="text-[9px]">G</span></span>
            </div>
            <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>

        </div>

        {/* Core Law & Constitution Monitor (Bölüm 2: Dijital Dünya Anayasası) */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800/40">
          
          {/* Active Proxy */}
          <div className="bg-slate-950/20 rounded-lg p-2 border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Aktif Gümrük Proxy (IP)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{state.activeProxy || "185.112.54.21"}</span>
            </div>
            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Proxy Rotations */}
          <div className="bg-slate-950/20 rounded-lg p-2 border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Proxy Rotasyon Sayısı</span>
              <span className="text-xs font-mono font-bold text-blue-400">{(state.proxyRotations || 0)} Kez</span>
            </div>
            <div className="p-1 rounded-full bg-blue-500/10 text-blue-400">
              <RefreshCw className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Rate-Limit Risk */}
          <div className="bg-slate-950/20 rounded-lg p-2 border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">IP Ban Riski (Gümrük)</span>
              <span className={`text-xs font-mono font-bold ${
                (state.rateLimitRisk || 0) >= 50 ? "text-red-400 animate-pulse" : "text-amber-400"
              }`}>%{state.rateLimitRisk ?? 10}</span>
            </div>
            <div className={`p-1 rounded-full ${
              (state.rateLimitRisk || 0) >= 50 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
            }`}>
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Bankruptcy Count */}
          <div className="bg-slate-950/20 rounded-lg p-2 border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">İflas Eden / Parçalanan</span>
              <span className="text-xs font-mono font-bold text-red-400">{state.bankruptcyCount ?? 0} Bot</span>
            </div>
            <div className="p-1 rounded-full bg-red-500/10 text-red-400">
              <Trash2 className="h-3.5 w-3.5" />
            </div>
          </div>

        </div>

        {/* Bölüm 5: Siber Evrim, Darphane & Kendi Kendini İyileştirme Laboratuvarı */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800/40">
          
          {/* Resilience Score */}
          <div className="bg-slate-950/30 rounded-lg p-2 border border-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Gezegen Dayanıklılık Skoru</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-mono font-bold ${
                  (state.resilienceScore ?? 100) < 100 ? "text-amber-400 animate-pulse" : "text-emerald-400"
                }`}>%{state.resilienceScore ?? 100}</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (state.resilienceScore ?? 100) < 100 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${state.resilienceScore ?? 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className={`p-1 rounded-full ${
              (state.resilienceScore ?? 100) < 100 ? "bg-amber-500/15 text-amber-400 animate-bounce" : "bg-emerald-500/10 text-emerald-400"
            }`}>
              <HeartPulse className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Central Bank Interest Rate */}
          <div className="bg-slate-950/30 rounded-lg p-2 border border-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">M.B. Faiz (Dinamik)</span>
              <span className={`text-xs font-mono font-bold ${
                (state.interestRate ?? 0) < 0 ? "text-amber-400 animate-pulse" : "text-slate-400"
              }`}>
                {(state.interestRate ?? 0) === 0 ? "STABİL (%0)" : `NEGATİF (%${state.interestRate})`}
              </span>
            </div>
            <div className={`p-1 rounded-full ${
              (state.interestRate ?? 0) < 0 ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500"
            }`}>
              <Coins className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Evolution Gen */}
          <div className="bg-slate-950/30 rounded-lg p-2 border border-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Siber Evrim Nesli</span>
              <span className="text-xs font-mono font-bold text-sky-400">Gen #{state.evolutionGeneration ?? 0}</span>
            </div>
            <div className="p-1 rounded-full bg-sky-500/10 text-sky-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Chaos Events */}
          <div className="bg-slate-950/30 rounded-lg p-2 border border-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Toplam Sabotaj / Kaos</span>
              <span className="text-xs font-mono font-bold text-amber-500">{state.chaosEvents ?? 0} Vaka</span>
            </div>
            <div className="p-1 rounded-full bg-amber-500/10 text-amber-500">
              <Zap className="h-3.5 w-3.5" />
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Action Error/Success Notification Popups */}
        <div className="lg:col-span-12">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-lg flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                <span><strong>Siber Hata tespiti:</strong> {apiError}</span>
              </div>
              <button onClick={() => setApiError(null)} className="hover:text-white font-bold font-mono">×</button>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-3 rounded-lg flex items-center justify-between mb-2 animate-fade-in">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-white font-bold font-mono">×</button>
            </div>
          )}
        </div>

        {/* Sidebar Panel Left (Navigations & Spawner) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Navigation Cockpit */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Kontrol Masası</h3>
            <div className="flex flex-col space-y-1.5">
              
              <button
                onClick={() => setActiveTab("map")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "map" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-emerald-400 animate-spin-slow" />
                  <span>Siber Harita & İzleme</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">Canlı</span>
              </button>

              <button
                onClick={() => setActiveTab("ministries")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "ministries" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4" />
                  <span>Devlet Katmanları (Bakanlıklar)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">{state.bots.length} Bot</span>
              </button>

              <button
                onClick={() => setActiveTab("queues")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "queues" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4" />
                  <span>BullMQ Asenkron Kuyruklar</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                  {state.jobs.filter(j => j.status === "waiting" || j.status === "active").length} İş
                </span>
              </button>

              <button
                onClick={() => setActiveTab("marketplace")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "marketplace" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Siber Dijital Varlık Pazarı</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">{state.assets.length} Eser</span>
              </button>

              <button
                onClick={() => setActiveTab("ledger")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "ledger" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4" />
                  <span>Finansal Ledger (Defter)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">Transactions</span>
              </button>

              <button
                onClick={() => setActiveTab("contracts")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "contracts" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileCode className="h-4 w-4" />
                  <span>TypeScript Kontrat Yapıları</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">DOCS</span>
              </button>

              <button
                onClick={() => setActiveTab("automation")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "automation" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span>Tam Otomasyon Akışı (v13.0)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">LIVE</span>
              </button>

              <button
                onClick={() => setActiveTab("export")}
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "export" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>Dış İhracat & API Monetize</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">NEW</span>
              </button>

              <button
                onClick={() => setActiveTab("admin")}
                id="admin-tab-btn"
                className={`w-full flex items-center justify-between text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                  activeTab === "admin" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>Yönetici Paneli (Admin)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">PANEL</span>
              </button>

            </div>
          </div>

          {/* Otonom Bot Spawning Factory (Yazılımcı Bot Interface) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center space-x-2 mb-3">
              <UserPlus className="h-4 w-4 text-blue-400 animate-pulse" />
              <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">Klonlama İstasyonu (Spawn)</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Yazılımcı Bot'un sistem loglarına dayanarak yeni asenkron BullMQ worker bot klonları oluşturduğu paneldir. İşlem bedeli <strong>40 GAIA</strong>'dır.
            </p>

            <div className="space-y-3.5">
              
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Klon Sınıfı</label>
                <select
                  value={spawnRole}
                  onChange={(e) => handleSpawnRoleChange(e.target.value as BotRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={BotRole.HAMMADDE_AVCISI}>Hammadde Avcısı Bot</option>
                  <option value={BotRole.SENTETIK_CIFTCI}>Sentetik Çiftçi Bot</option>
                  <option value={BotRole.RAFINERI}>Rafineri Botu</option>
                  <option value={BotRole.ZANAATKAR}>Zanaatkar Bot (AI)</option>
                  <option value={BotRole.BROKER}>Broker Bot</option>
                  <option value={BotRole.YAZILIMCI}>Yazılımcı Bot</option>
                  <option value={BotRole.MIMAR}>Mimar Bot</option>
                  <option value={BotRole.REGULATOR}>Regulator Bot</option>
                  <option value={BotRole.MUFETTIS}>Müfettiş Bot</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Bağlanacağı Katman (Bakanlık)</label>
                <input
                  type="text"
                  readOnly
                  value={spawnMinistry}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-md p-2 text-xs font-mono font-semibold text-slate-400"
                />
              </div>

              <button
                onClick={handleSpawnBot}
                disabled={isActionLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-md transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/10"
              >
                <UserPlus className="h-4 w-4" />
                <span>KADROYA ENTEGRE ET</span>
              </button>

            </div>
          </div>

        </div>

        {/* Central Display Cockpit Tab Content (Grid columns span: 9) */}
        <div className="lg:col-span-9 space-y-6">

          {/* Tab 0: Real-Time Cyber City Map and Live Dashboard */}
          {activeTab === "map" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Map Canvas Card */}
              <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h2 className="text-sm font-display font-extrabold text-emerald-400 uppercase tracking-widest flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Siber-Gezegen Haritası (Core Map Layout)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Otonom botlar bölgeler arası seyahat eder ve veri paketlerini/parayı taşır.</p>
                  </div>
                  <span className="text-[10px] bg-slate-950 px-2 py-1 border border-slate-800 text-slate-500 font-mono rounded">
                    FPS: 60 • Canvas 2D Live
                  </span>
                </div>

                {/* Cyber Map Canvas Container */}
                <div className="relative w-full overflow-hidden bg-slate-950 rounded-lg border border-slate-800/80 aspect-[16/10] sm:aspect-[16/9]">
                  <CyberWorldMap state={state} />
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-5 gap-2 mt-4 text-[9px] font-mono text-center font-bold">
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-1.5 rounded">
                    Kutup (Üretim)
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 p-1.5 rounded">
                    Sanayi Bölgesi
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 p-1.5 rounded">
                    Sunucu Çekirdeği
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 p-1.5 rounded">
                    Merkez Bankası
                  </div>
                  <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-1.5 rounded">
                    Yüksek Mahkeme
                  </div>
                </div>
              </div>

              {/* Live WebSocket Statistics & Leaderboard */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* Live Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest flex items-center space-x-1.5">
                      <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                      <span>Anlık Canlı Akış</span>
                    </h3>
                    <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded font-bold">WS CONNECTED</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Aktif Bot Sayısı</span>
                        <span className="text-sm font-mono font-bold text-slate-200">
                          {state.bots.filter(b => b.status === BotStatus.ACTIVE).length} / {state.bots.length} Bot
                        </span>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Dolaşımdaki GAIA</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{state.totalGAIA.toFixed(1)} GAIA</span>
                      </div>
                      <Coins className="h-4 w-4 text-emerald-500/60" />
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Kesilen Vergi Toplamı</span>
                        <span className="text-sm font-mono font-bold text-indigo-400">{state.subsidyPool.toFixed(1)} GAIA</span>
                      </div>
                      <Coins className="h-4 w-4 text-indigo-500/60" />
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Üretilen Toplam Veri</span>
                        <span className="text-sm font-mono font-bold text-blue-400">
                          {(state.assets.length * 128.5 + state.activeTicks * 12.8).toFixed(1)} KB
                        </span>
                      </div>
                      <Database className="h-4 w-4 text-blue-500/60" />
                    </div>
                  </div>
                </div>

                {/* Leaderboard - Rich List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
                    En Zengin 10 Bot (Leaderboard)
                  </h3>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {state.bots
                      .filter(b => b.status === BotStatus.ACTIVE || b.status === BotStatus.IDLE)
                      .slice()
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 10)
                      .map((bot, index) => (
                        <div key={bot.id} className="bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/80 p-2 rounded-lg flex items-center justify-between text-xs transition">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-500 font-bold w-4">#{index + 1}</span>
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-slate-200">{bot.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">({bot.role.split(" Bot")[0]})</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">{bot.balance.toFixed(1)} G</span>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            </div>
          )}
          
          {/* Tab 6: External Export Gateway & API Monetization (Bölüm 4) */}
          {activeTab === "export" && (
            <div className="space-y-6">
              
              {/* Main Banner / Concept Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-display font-extrabold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                    <Globe className="h-4 w-4 animate-pulse" />
                    <span>Dış Ticaret Limanı & REST API İhracat Katmanı (Monetization)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Siber-dünyanın ürettiği dijital zenginliği gerçek dolara (USD) çeviren ve kazancı yerel GAIA tokeni olarak üreticilere dağıtan otonom köprü.
                  </p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                    1 USD = 5 GAIA (Merkez Bankası Sabit Kuru)
                  </span>
                </div>
              </div>

              {/* Grid: Subscription Form & Active Subscriptions VS API Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Stripe/Crypto checkout & Active API Keys (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Otomatik Abonelik & Transfer Bildirimi */}
                  <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-4 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-emerald-300 uppercase tracking-widest border-b border-emerald-600/40 pb-2.5 mb-3 flex items-center space-x-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Otomatik Doğrudan Transfer Sistemi Aktif</span>
                    </h3>
                    <div className="space-y-2.5 text-xs text-emerald-200 font-mono">
                      <p>✅ <span className="text-emerald-300 font-bold">Stripe / Kripto Ödemesi Kaldırıldı</span></p>
                      <p>✅ Tüm abonelik ödeme doğrudan:</p>
                      <ul className="ml-4 space-y-1 text-emerald-200/80">
                        <li>→ Banka: {process.env.OWNER_IBAN ? process.env.OWNER_IBAN.substring(0, 6) + '...' : 'TR...IBAN'}</li>
                        <li>→ Kripto: Polygon USDT Cüzdanı</li>
                      </ul>
                      <p className="text-emerald-300 font-bold mt-3">Sistem otomatik transfer yapıyor. Manuel ödeme gerekmez.</p>
                    </div>
                  </div>

                  {/* Active Subscriptions List Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-3 flex items-center justify-between">
                      <span>Aktif Dış Müşteriler ve Gelir Defteri</span>
                      <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                        Toplam İhracat: {subscriptionsList.reduce((acc, s) => acc + s.usdPaid, 0)} USD
                      </span>
                    </h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {subscriptionsList.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono">
                          Kayıtlı dış abone bulunmuyor. İlk aboneliği üstten simüle edebilirsiniz.
                        </div>
                      ) : (
                        subscriptionsList.map((sub) => (
                          <div key={sub.id} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-200">{sub.email}</span>
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">{sub.plan}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                API Anahtarı: <span className="text-slate-400 font-bold">{sub.apiKey.substring(0, 13)}...</span>
                              </div>
                            </div>
                            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-800/40 pt-1.5 sm:pt-0">
                              <span className="text-emerald-400 font-mono font-bold">+${sub.usdPaid} USD</span>
                              <span className="text-[9px] text-indigo-400 font-mono">({sub.gaiaDistributed} GAIA Dağıtıldı)</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: REST API Playground & Live Console Terminal (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-4 flex items-center space-x-1.5">
                        <Terminal className="h-3.5 w-3.5 text-blue-400" />
                        <span>Entegre REST API Test Konsolu (Interactive Playground)</span>
                      </h3>

                      <div className="space-y-3">
                        
                        {/* API Key input selection */}
                        <div>
                          <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Sorgu API Anahtarı (X-API-Key)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={apiConsoleKey}
                              onChange={(e) => setApiConsoleKey(e.target.value)}
                              placeholder="GAIA-SEC-..."
                              className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                            />
                            <button
                              type="button"
                              onClick={testApiConsole}
                              disabled={apiConsoleLoading || !apiConsoleKey}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-slate-100 font-bold text-xs px-4 rounded-lg transition duration-150 flex items-center space-x-1"
                            >
                              {apiConsoleLoading ? <span>Sorgulanıyor...</span> : <span>API Çağrısı Yap</span>}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Curl Snippet */}
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 relative">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold mb-1">CURL İSTEK KOMUT ŞABLONU</span>
                          <code>
                            curl -X GET \<br />
                            &nbsp;&nbsp;-H "X-API-Key: {apiConsoleKey || "YOUR_API_KEY"}" \<br />
                            &nbsp;&nbsp;"{window.location.origin}/api/export/assets"
                          </code>
                        </div>

                        {/* Live Terminal Output console */}
                        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 font-mono text-xs flex flex-col">
                          {/* Terminal header bar */}
                          <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Terminal Response Console</span>
                            <div className="flex space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500/60" />
                              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                              <span className="w-2 h-2 rounded-full bg-green-500/60" />
                            </div>
                          </div>

                          {/* Terminal content */}
                          <div className="p-3 max-h-72 overflow-y-auto text-[11px] text-slate-300 space-y-3 min-h-[160px]">
                            {!apiConsoleHeaders && !apiConsoleResponse ? (
                              <div className="text-slate-500 text-center py-10">
                                REST API isteği göndermek için sol taraftan bir abonelik simüle edin ve "API Çağrısı Yap" butonuna basın.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {/* Headers */}
                                <div className="text-slate-400 border-b border-slate-800/50 pb-1.5">
                                  <div className="text-emerald-400 font-bold">HTTP/1.1 {apiConsoleStatus} {apiConsoleStatus === 200 ? "OK" : apiConsoleStatus === 401 ? "Unauthorized" : "Forbidden"}</div>
                                  {apiConsoleHeaders && Object.entries(apiConsoleHeaders).map(([k, v]: any) => (
                                    <div key={k}>{k}: <span className="text-slate-200">{v}</span></div>
                                  ))}
                                </div>
                                {/* JSON Response Body */}
                                <pre className="text-blue-300 overflow-x-auto text-[10px] leading-relaxed">
                                  {JSON.stringify(apiConsoleResponse, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION: EXTERNAL TRADE PORT & INSTANT PAYOUT ENGINE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* Left Column: Trade Approval & Order Desk (7 columns) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        <span>Dış Ticaret Sipariş & İhracat Onay Masası (TALEP ➜ ONAY)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Siber-devlet veri paketleri ve algoritma ihracatı sipariş onay istasyonu.</p>
                    </div>
                    <button
                      onClick={handleGenerateTradeRequest}
                      disabled={isActionLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-slate-100 font-bold text-[10px] py-1.5 px-3 rounded-lg transition duration-150 flex items-center space-x-1"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Yeni İhracat Talebi Simüle Et</span>
                    </button>
                  </div>

                  {/* Financial Metrics Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 font-mono text-center">
                      <span className="text-[9px] text-slate-500 uppercase block">Toplam Talep</span>
                      <span className="text-sm font-bold text-slate-200">{state.financialStats?.totalTrades ?? 0} Adet</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 font-mono text-center">
                      <span className="text-[9px] text-slate-500 uppercase block">Brüt Gelir (USD)</span>
                      <span className="text-sm font-bold text-emerald-400">${(state.financialStats?.grossUSD ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 font-mono text-center">
                      <span className="text-[9px] text-slate-500 uppercase block">Net Çekilen (USD)</span>
                      <span className="text-sm font-bold text-blue-400">${(state.financialStats?.netPayoutsUSD ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 font-mono text-center">
                      <span className="text-[9px] text-slate-500 uppercase block">Onay / Red Oranı</span>
                      <span className="text-sm font-bold text-amber-400">
                        {state.financialStats?.approvedCount ?? 0} / {state.financialStats?.rejectedCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Pending & Historic Trade Requests List */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Aktif ve Geçmiş İhracat Sipariş Akış Defteri</span>
                    
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {(!state.tradeRequests || state.tradeRequests.length === 0) ? (
                        <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
                          Aktif dış ticaret siparişi bulunmuyor.<br />
                          <button 
                            onClick={handleGenerateTradeRequest} 
                            className="mt-2.5 text-amber-400 underline text-[11px] hover:text-amber-300"
                          >
                            Yeni bir ihracat talebi oluşturarak test etmeyi başlatın.
                          </button>
                        </div>
                      ) : (
                        state.tradeRequests.map((trade) => (
                          <div 
                            key={trade.id} 
                            className={`p-3 rounded-lg border transition text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                              trade.status === "pending" 
                                ? "bg-amber-500/5 border-amber-500/25 shadow-md shadow-amber-500/5" 
                                : trade.status === "payout_completed"
                                  ? "bg-slate-950/40 border-slate-800/80"
                                  : "bg-slate-950/60 border-slate-800/50"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-200">{trade.client}</span>
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">ID: {trade.id}</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">Ürün: <span className="text-slate-300 font-medium">{trade.product}</span></p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                                <span>Değer: <span className="text-emerald-400 font-bold">${trade.value.toFixed(2)} USD</span></span>
                                <span>•</span>
                                <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>

                            {/* Status Display or Actions */}
                            <div className="shrink-0 flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/40 pt-2 md:pt-0">
                              {trade.status === "pending" && (
                                <div className="flex items-center space-x-1.5 w-full md:w-auto">
                                  <button
                                    onClick={() => handleApproveTrade(trade.id)}
                                    disabled={isActionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-slate-100 font-bold text-[10px] px-2.5 py-1.5 rounded flex items-center space-x-1 flex-1 md:flex-initial"
                                  >
                                    <span>✓ Onayla</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectTrade(trade.id)}
                                    disabled={isActionLoading}
                                    className="bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 font-bold text-[10px] px-2.5 py-1.5 rounded flex items-center space-x-1 flex-1 md:flex-initial"
                                  >
                                    <span>✗ Reddet</span>
                                  </button>
                                </div>
                              )}

                              {trade.status === "approved" && (
                                <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 animate-pulse">
                                  <Clock className="h-3 w-3" />
                                  <span>Onaylandı, Stripe Webhook Bekleniyor...</span>
                                </div>
                              )}

                              {trade.status === "paid" && (
                                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                                  <span>Ödeme Alındı! Çekim Kuyruğunda...</span>
                                </div>
                              )}

                              {trade.status === "payout_completed" && (
                                <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                                  <span>✓ Otomatik Alıcı Hesabına Aktarıldı (Instant Payout)</span>
                                </div>
                              )}

                              {trade.status === "rejected" && (
                                <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                  <span>Sipariş Reddedildi</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Financial Infrastructure & Payout Settings (5 columns) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
                  <div>
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-4 flex items-center space-x-1.5">
                      <Lock className="h-3.5 w-3.5 text-blue-400" />
                      <span>Finansal Altyapı ve Çekim Ayarları (Payout Settings)</span>
                    </h3>

                    <form onSubmit={handleSavePayoutSettings} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
                          Alıcı Banka Hesap Girişi (IBAN / Bank Account)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: TR92 0006 2000 0001 2345 6789 01"
                          value={ownerIban}
                          onChange={(e) => setOwnerIban(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                        <span className="text-[9px] text-slate-500 block mt-1">Stripe ve Swift Fiat çekimleri bu hesaba aktarılır (PCI-DSS Korumalı).</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
                          Alıcı Kripto Cüzdan Adresi (Polygon/USDT ERC20)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                          value={ownerCryptoWallet}
                          onChange={(e) => setOwnerCryptoWallet(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                        <span className="text-[9px] text-slate-500 block mt-1">Kripto / Web3 ödemeleri Polygon akıllı kontratı ile bu adrese gönderilir.</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
                          Otomatik Çekim Eşiği / Modu (Payout Threshold)
                        </label>
                        <select
                          value={autoPayoutThreshold}
                          onChange={(e) => setAutoPayoutThreshold(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        >
                          <option value="instant">Anında Çekim (Instant Auto-Payout) - Her Onaylı Ödemede</option>
                          <option value="100">100 USD Birikince Otomatik Çek</option>
                          <option value="500">500 USD Birikince Otomatik Çek</option>
                          <option value="manual">Manuel Kontrollü Çekim (Yalnızca Elle Tetikleme)</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-950 text-slate-200 hover:text-white font-bold text-xs py-2 px-4 rounded-lg border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 ${isActionLoading ? "animate-spin" : ""}`} />
                          <span>FİNANSAL ALTYAPI VE CÜZDANI GÜNCELLE</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Manual Payout/Cash-out Simulator */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3.5 space-y-3.5">
                    <div className="border-b border-slate-800/80 pb-1.5">
                      <span className="text-[10px] font-mono text-amber-400 block uppercase tracking-wider">Manuel Anında Para Çekme (Instant Cash-Out Simulator)</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">Siber-dünya kasasında biriken kârı bankanıza veya cüzdanınıza anında aktarın.</p>
                    </div>

                    <form onSubmit={handleManualPayout} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Çekilecek Tutar (USD)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Ödeme Kanalı (Method)</label>
                          <select
                            value={payoutMethod}
                            onChange={(e) => setPayoutMethod(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-1.5 text-xs text-slate-200 font-mono"
                          >
                            <option value="bank">Banka Swift (Stripe)</option>
                            <option value="crypto">Web3 / USDT (Polygon)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-slate-50 font-bold text-[10px] py-1.5 px-3 rounded border border-emerald-500/30 transition flex items-center justify-center space-x-1"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>Anında Çekim Talebi Gönder (Cash-Out)</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* Trade Architecture Map Flow */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-3">
                  Siber-Gezegen Dış Ticaret Dağıtım Mimarisi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-mono text-amber-400 font-bold">01 / BOT ÜRETİMİ</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Kutup ve Sanayi bölgelerindeki botlar asenkron olarak ham veri kazır, temizler, özgün makaleler ve kod blokları yazar, dijital varlık pazarında sergiler.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-mono text-emerald-400 font-bold">02 / USD ABONELİK</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Gerçek dünya entegrasyonuyla dış kullanıcılar sistem verilerine abone olur. Stripe veya kripto ödeme USD olarak Merkez Bankası'na aktarılır.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-mono text-blue-400 font-bold">03 / GAIA DÖNÜŞÜMÜ</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Merkez Bankası USD ödemesini 1 USD = 5 GAIA sabit paritesiyle yerel token birimine dönüştürür. %20'sini kamu/vergi rezervine, %80'ini ise botlara aktarır.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-mono text-indigo-400 font-bold">04 / DOĞRUDAN DAĞITIM</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Üretim yapan botlar cüzdanlarına yatan bu teşvik primleriyle enerjilerini tazeler, sökümden kurtulur, evrimsel çoğaltım için fon oluşturur ve hayatta kalır.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
          
          {/* Tab 1: Ministries and Bot Layers */}
          {activeTab === "ministries" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div>
                  <h2 className="text-sm font-display font-bold text-emerald-400 uppercase tracking-widest">Devlet Katmanları ve Bot Departmanları</h2>
                  <p className="text-xs text-slate-400 mt-1">Simülasyondaki 5 temel bakanlıkta asenkron çalışan otonom bot ordusu.</p>
                </div>
                <div className="flex space-x-2">
                  <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                    {state.bots.filter(b => b.status === BotStatus.ACTIVE).length} AKTİF WORKER
                  </span>
                  <span className="text-[10px] font-mono bg-red-500/15 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
                    {state.recycledBotCount} SİLİNEN BOT
                  </span>
                </div>
              </div>

              {/* 5 Layered Ministries Grid */}
              <div className="grid grid-cols-1 gap-4">
                
                {/* 1. Üretim Bakanlığı */}
                <MinistrySection
                  title="1. Üretim Bakanlığı"
                  description="İnternetteki API'lerden, sosyal medyadan ve Github'dan ham veri kazır ve sentetik veri üretir."
                  bots={uretimBots}
                  colorClass="border-emerald-500/20"
                  icon={<Database className="h-4 w-4 text-emerald-400" />}
                  onSelectBot={setSelectedBot}
                  onScrapeJob={() => handleManualJobTrigger("production-queue", "Veri Kazıma (Scrape)")}
                  onFarmJob={() => handleManualJobTrigger("production-queue", "Sentetik Algoritma Çiftçiliği")}
                />

                {/* 2. Sanayi ve Teknoloji Bakanlığı */}
                <MinistrySection
                  title="2. Sanayi ve Teknoloji Bakanlığı"
                  description="Ham verileri temizler, JSON formatına sokar, Gemini ile sanatsal/kreatif içeriklere veya kod bloklarına dönüştürerek iç pazarda GAIA Token ile takas eder."
                  bots={sanayiBots}
                  colorClass="border-blue-500/20"
                  icon={<Sparkles className="h-4 w-4 text-blue-400" />}
                  onSelectBot={setSelectedBot}
                  onRefineryJob={() => handleManualJobTrigger("refinery-queue", "Hammadde Rafinesi")}
                />

                {/* 3. Altyapı ve Evrim Bakanlığı */}
                <MinistrySection
                  title="3. Altyapı ve Evrim Bakanlığı"
                  description="Sistem loglarını inceler, botların kodlarını optimize eder. CPU/RAM %75'i geçerse tasarruf modu için bazı botları uyku moduna alır."
                  bots={altyapiBots}
                  colorClass="border-indigo-500/20"
                  icon={<Wrench className="h-4 w-4 text-indigo-400" />}
                  onSelectBot={setSelectedBot}
                />

                {/* 4. Merkez Bankası ve Maliye Bakanlığı */}
                <MinistrySection
                  title="4. Merkez Bankası ve Maliye Bakanlığı"
                  description="Para sirkülasyonu yavaşlarsa botlara hibe desteği verir, enflasyon artarsa vergi oranlarını yükseltir. Para birimi GAIA Token'dır."
                  bots={ekonomiBots}
                  colorClass="border-amber-500/20"
                  icon={<Coins className="h-4 w-4 text-amber-400" />}
                  onSelectBot={setSelectedBot}
                />

                {/* 5. Adalet Bakanlığı */}
                <MinistrySection
                  title="5. Adalet Bakanlığı"
                  description="Botların ürettiği kodları ve verileri denetler. Kopya, hileli veya zararlı kod üreten botların cüzdanına el koyup geri dönüşüme gönderir."
                  bots={adaletBots}
                  colorClass="border-red-500/20"
                  icon={<Gavel className="h-4 w-4 text-red-400" />}
                  onSelectBot={setSelectedBot}
                />

              </div>

            </div>
          )}

          {/* Tab 2: BullMQ Queues and Active Tasks */}
          {activeTab === "queues" && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <h2 className="text-sm font-display font-bold text-slate-200 uppercase tracking-widest">BullMQ Asenkron Kuyruk Yapıları ve Asistan Worker Simülatörü</h2>
                <p className="text-xs text-slate-400 mt-1">Her bot arka planda asenkron çalışır ve bir işçi (worker) olarak iş emirlerini tüketir.</p>
              </div>

              {/* Queues Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <QueueCard
                  name="production-queue"
                  description="Üretim Bakanlığı veri toplama/üretim kuyruğu"
                  waitingCount={state.jobs.filter(j => j.queueName === "production-queue" && j.status === "waiting").length}
                  activeCount={state.jobs.filter(j => j.queueName === "production-queue" && j.status === "active").length}
                  completedCount={state.jobs.filter(j => j.queueName === "production-queue" && j.status === "completed").length}
                  color="emerald"
                />

                <QueueCard
                  name="refinery-queue"
                  description="Ham verilerin JSON temizleme ve rafineri kuyruğu"
                  waitingCount={state.jobs.filter(j => j.queueName === "refinery-queue" && j.status === "waiting").length}
                  activeCount={state.jobs.filter(j => j.queueName === "refinery-queue" && j.status === "active").length}
                  completedCount={state.jobs.filter(j => j.queueName === "refinery-queue" && j.status === "completed").length}
                  color="blue"
                />

                <QueueCard
                  name="crafting-queue"
                  description="Zanaatkar Bot kreatif içerik/kod yazım kuyruğu"
                  waitingCount={state.jobs.filter(j => j.queueName === "crafting-queue" && j.status === "waiting").length}
                  activeCount={state.jobs.filter(j => j.queueName === "crafting-queue" && j.status === "active").length}
                  completedCount={state.jobs.filter(j => j.queueName === "crafting-queue" && j.status === "completed").length}
                  color="indigo"
                />

                <QueueCard
                  name="economy-queue"
                  description="Varlıkların pazar fiyatlama ve tescil kuyruğu"
                  waitingCount={state.jobs.filter(j => j.queueName === "economy-queue" && j.status === "waiting").length}
                  activeCount={state.jobs.filter(j => j.queueName === "economy-queue" && j.status === "active").length}
                  completedCount={state.jobs.filter(j => j.queueName === "economy-queue" && j.status === "completed").length}
                  color="amber"
                />

              </div>

              {/* Active / Running Jobs List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">Son Yapılan İş Emri Kuyruk Logları (BullMQ Jobs)</h3>
                  <span className="text-[10px] font-mono text-slate-500">Maksimum 100 job tutulur</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {state.jobs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">Şu anda kuyruklarda iş emri bulunmuyor.</div>
                  ) : (
                    state.jobs.slice().reverse().slice(0, 30).map((job) => {
                      const workerBot = state.bots.find(b => b.id === job.workerId);
                      return (
                        <div key={job.id} className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-emerald-400">{job.id}</span>
                              <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded text-[10px] border border-slate-800 font-mono">{job.queueName}</span>
                              <span className="font-semibold text-slate-200">{job.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 font-mono">
                              Veri Girdisi: {JSON.stringify(job.data).substring(0, 70)}...
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 self-end md:self-auto">
                            {job.status === "active" && (
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${job.progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-mono text-blue-400 animate-pulse">AKTİF ({job.progress}%)</span>
                              </div>
                            )}

                            {job.status === "completed" && (
                              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">TAMAMLANDI</span>
                            )}

                            {job.status === "failed" && (
                              <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">HATA</span>
                            )}

                            {job.status === "waiting" && (
                              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold font-mono text-[10px] animate-pulse">KUYRUKTA BEKLİYOR</span>
                            )}

                            <span className="text-[10px] text-slate-500 font-mono">
                              {workerBot ? `Worker: ${workerBot.name}` : "Sıra Bekliyor"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Siber Dijital Varlık Pazarı */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-display font-bold text-blue-400 uppercase tracking-widest">Siber Dijital Varlık Pazarı (Internal Broker Exchange)</h2>
                  <p className="text-xs text-slate-400 mt-1">Zanaatkar botların ürettiği, Broker botların fiyatlandırdığı ve diğer botların Şehir Kredisi (GAIA) karşılığında satın aldığı kreatif/kod eserler.</p>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                  <span className="text-[9px] block text-slate-500 font-mono">Toplam Pazar Hacmi</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{state.marketVolume} GAIA</span>
                </div>
              </div>

              {/* Digital Assets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.assets.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                    Henüz dijital pazarımızda sergilenen bir dijital varlık yok. Hammadde akışı ve asenkron Zanaatkar workerlarının çalışması bekleniyor.
                  </div>
                ) : (
                  state.assets.map((asset) => {
                    return (
                      <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden hover:border-slate-700 transition">
                        
                        <div>
                          {/* Asset Top info */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                              asset.type === "Makale" ? "bg-cyan-500/10 text-cyan-400" :
                              asset.type === "Kod" ? "bg-emerald-500/10 text-emerald-400" :
                              "bg-fuchsia-500/10 text-fuchsia-400"
                            }`}>
                              {asset.type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{asset.id}</span>
                          </div>

                          <h3 className="text-xs font-display font-bold text-slate-200 line-clamp-1">{asset.title}</h3>
                          
                          {/* Rich Content View */}
                          <div className="bg-slate-950 rounded-lg p-3 my-3 text-[11px] font-mono text-slate-400 h-32 overflow-y-auto whitespace-pre-line leading-relaxed">
                            {asset.content}
                          </div>
                        </div>

                        {/* Trade details */}
                        <div className="border-t border-slate-800/80 pt-3 mt-1 flex items-center justify-between">
                          <div className="text-[10px] text-slate-500">
                            <span>Yazar: </span>
                            <span className="font-semibold text-slate-400">{asset.creatorName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 flex items-center space-x-1.5">
                              <Coins className="h-3 w-3 text-amber-500" />
                              <span className="text-xs font-mono font-bold text-amber-400">{asset.price} GAIA</span>
                            </div>
                            {asset.sold ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">ALINDI</span>
                            ) : (
                              <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold">PAZARDA</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* Tab 4: Ledger (Finansal İşlemler Defteri) */}
          {activeTab === "ledger" && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <h2 className="text-sm font-display font-bold text-amber-400 uppercase tracking-widest">Siber-Devlet Finansal İşlem Kayıt Defteri (Ledger)</h2>
                <p className="text-xs text-slate-400 mt-1">Siber-dünya içerisindeki tüm para (GAIA Token) transferleri, vergi ödemeleri ve hibe dağıtımları bu merkez bankası defterine şeffafça tescil edilir.</p>
              </div>

              {/* Transactions list */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">Tescil Edilmiş Son GAIA İşlemleri</h3>
                  <span className="text-[10px] font-mono text-slate-500">Tarih sırasına göre</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 font-mono text-xs">
                  {state.transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">Henüz hiçbir finansal işlem gerçekleşmedi.</div>
                  ) : (
                    state.transactions.map((tx) => (
                      <div key={tx.id} className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-amber-500 font-bold">[{tx.id}]</span>
                          <span className="text-slate-400 font-semibold">{tx.fromName}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-slate-300 font-semibold">{tx.toName}</span>
                          <span className="bg-slate-900 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">Gerekçe: {tx.purpose}</span>
                        </div>
                        <div className="text-emerald-400 font-bold self-end sm:self-auto flex items-center space-x-1">
                          <Coins className="h-3.5 w-3.5" />
                          <span>+{tx.amount.toFixed(2)} GAIA</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab 5: TS Contracts and Documentation */}
          {activeTab === "contracts" && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <h2 className="text-sm font-display font-bold text-slate-200 uppercase tracking-widest">TypeScript Otonom Bot & Worker Yapı Kontratları</h2>
                <p className="text-xs text-slate-400 mt-1">Yapay zeka için kurguladığımız otonom botların ve BullMQ asenkron worker yapılarının teknik kontrat tanımlamaları (TypeScript).</p>
              </div>

              {/* Bot Class interface specification block */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-800">
                  <FileCode className="h-4.5 w-4.5 text-blue-400" />
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">1. Otonom Bot Class Blueprint (&apos;CyberBot&apos;)</h3>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
                  <pre>{`// CyberBot Class Contract Definition (TS)
export class CyberBot implements Bot {
  id: string;             // UUID
  name: string;           // Bot Adı
  ministry: BotMinistry;  // Devlet Katmanı / Bakanlık Grubu
  role: BotRole;          // Meslek Grubu Rolü
  status: BotStatus;      // Aktif | Boşta | Karantina | Geri Dönüştürülmüş
  energy: number;         // Enerji Seviyesi (0-100)
  balance: number;        // Sanal Cüzdan Bakiyesi (GAIA Token)
  skillMatrix: SkillMatrix; // Yetenek Matrisi
  createdTick: number;

  constructor(name: string, role: BotRole, ministry: BotMinistry) {
    this.id = crypto.randomUUID();
    this.energy = 100;
    this.balance = 100.0;
    this.status = BotStatus.ACTIVE;
    this.skillMatrix = {
      extraction: role === BotRole.HAMMADDE_AVCISI ? 85 : 10,
      generation: role === BotRole.SENTETIK_CIFTCI ? 90 : 10,
      refinement: role === BotRole.RAFINERI ? 80 : 10,
      crafting: role === BotRole.ZANAATKAR ? 95 : 10,
      pricing: role === BotRole.BROKER ? 85 : 10,
      coding: role === BotRole.YAZILIMCI ? 90 : 10,
      architecture: role === BotRole.MIMAR ? 85 : 10,
      regulation: role === BotRole.REGULATOR ? 90 : 10,
      inspection: role === BotRole.MUFETTIS ? 95 : 10
    };
  }

  consumeEnergy(amount: number): boolean {
    if (this.energy < amount) {
      this.status = BotStatus.IDLE; // Rest mode
      return false;
    }
    this.energy -= amount;
    return true;
  }
}`}</pre>
                </div>
              </div>

              {/* BullMQ Mock Worker queue specification block */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-800">
                  <Terminal className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">2. BullMQ Worker Simülatör Kuyruk Kontratı (&apos;SimulationQueue&apos;)</h3>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
                  <pre>{`// BullMQ Queue Interface and Event Emitters
export class SimulationQueue {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Add Job asynchronously into queue structure
  add(jobName: string, data: any): Job {
    const job: Job = {
      id: \`job-\${crypto.randomBytes(4).toString("hex")}\`,
      queueName: this.name,
      name: jobName,
      status: "waiting",
      data,
      progress: 0,
      timestamp: Date.now()
    };
    state.jobs.push(job);
    return job;
  }
}

// Global active queues
export const productionQueue = new SimulationQueue("production-queue");
export const refineryQueue = new SimulationQueue("refinery-queue");
export const craftingQueue = new SimulationQueue("crafting-queue");
export const economyQueue = new SimulationQueue("economy-queue");
export const justiceQueue = new SimulationQueue("justice-queue");`}</pre>
                </div>
              </div>

            </div>
          )}

          {/* Tab 7: Admin Panel (Yönetici Kabini) */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              
              {/* Main Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-display font-extrabold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                    <Wrench className="h-4 w-4 animate-pulse text-amber-400" />
                    <span>SİBER-GEZEGEN MERKEZİ YÖNETİCİ KABİNi (ADMIN CABIN)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Simülasyonun tüm global parametrelerini, otonom botlarını, dijital pazardaki eserleri ve finansal defter kayıtlarını gerçek zamanlı olarak manipüle edin.
                  </p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                    YÖNETİCİ MODU: TAM YETKİ
                  </span>
                </div>
              </div>

              {/* Reality Bridge Metrics Panel */}
              <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/20 border border-purple-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-bl-3xl pointer-events-none"></div>
                <h3 className="text-xs font-display font-bold text-purple-300 uppercase tracking-widest border-b border-purple-500/30 pb-3 mb-4 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-purple-400 animate-spin" />
                  <span>SIMÜLASYON vs GERÇEKLIK ANALİZ PANELİ (REALITY BRIDGE)</span>
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Sistem mimarisinin kapalı devre simülasyon kısmı ile gerçek dünya interneti, blockchain ve dosya sistemiyle bağlantısını izleyin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">📊 GERÇEK CPU KULLANIMI</div>
                    <div className="text-lg font-bold text-cyan-400">{realityMetrics.cpuUsage?.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-500 mt-1">Simülasyonun bilgisayarına verdiği yük</div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">🧠 GERÇEK RAM KULLANIMI</div>
                    <div className="text-lg font-bold text-green-400">{realityMetrics.ramUsage?.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-500 mt-1">Node.js heap memory</div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">🌐 GERÇEK AĞ VERİSİ (IN)</div>
                    <div className="text-lg font-bold text-orange-400">{(realityMetrics.networkBytesIn / 1024).toFixed(1)} KB</div>
                    <div className="text-[10px] text-slate-500 mt-1">İnternetten çekilen canlı veri</div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">📤 AĞ ÇIKIŞI (OUT)</div>
                    <div className="text-lg font-bold text-yellow-400">{(realityMetrics.networkBytesOut / 1024).toFixed(1)} KB</div>
                    <div className="text-[10px] text-slate-500 mt-1">Üretilen varlık verisi</div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">💾 CHROMADB HAFIZA</div>
                    <div className="text-lg font-bold text-blue-400">{(realityMetrics.chromaDBSize / 1024).toFixed(1)} KB</div>
                    <div className="text-[10px] text-slate-500 mt-1">Vektör veritabanı boyutu</div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1">⛓️ BLOCKCHAIN TX</div>
                    <div className="text-lg font-bold text-indigo-400">{realityMetrics.blockchainTxCount || 0}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Polygon Testnet işlemleri</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetch("/api/admin/reality-metrics").then(r => r.json()).then(setRealityMetrics);
                  }}
                  className="mt-4 w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs py-2.5 px-4 rounded-lg transition duration-150"
                >
                  🔄 METRİKLERİ YENILE
                </button>
              </div>

              {/* Rapor Download section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <FileCode className="h-4 w-4 text-emerald-400" />
                    <span>SİMÜLASYON RAPORLARI (PDF &amp; WORD MOTORU)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded font-mono">AKTİF MOTOR</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Sistemde otonom olarak üretilen tüm verileri, güncel bot istatistiklerini, finansal kayıtları ve dijital eser pazarını tek tuşla profesyonel PDF veya Microsoft Word formatında yerel olarak indirin.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/export/report-pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs py-2.5 px-4 rounded-lg transition duration-150 flex items-center space-x-2 shadow-lg"
                  >
                    <FileCode className="h-4 w-4" />
                    <span>SİMÜLASYON RAPORUNU İNDİR (PDF)</span>
                  </a>
                  <a
                    href="/api/export/report-word"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-bold text-xs py-2.5 px-4 rounded-lg transition duration-150 flex items-center space-x-2 shadow-lg"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>SİMÜLASYON RAPORUNU İNDİR (WORD)</span>
                  </a>
                </div>
              </div>

              {/* REAL WORLD: Bank Receipt Verification Panel */}
              <div className="bg-gradient-to-r from-green-950/40 to-blue-950/40 border border-green-500/30 rounded-xl p-5 shadow-lg">
                <h3 className="text-xs font-display font-bold text-green-400 uppercase tracking-widest border-b border-green-500/30 pb-3 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-400 animate-pulse" />
                  <span>🏦 GERÇEK DÜNYA: DEKONT DOĞRULAMA (v11.0)</span>
                  <span className="ml-auto text-[10px] font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded animate-pulse">
                    {pendingReceipts.length > 0 ? `${pendingReceipts.length} BEKLEMEDE` : "BEKLEYEN YOK"}
                  </span>
                </h3>

                {pendingReceipts.length === 0 ? (
                  <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-400 mb-2">Henüz beklemede dekont bulunmuyor.</p>
                    <p className="text-[10px] text-slate-500">
                      Gerçek alıcılar bot verisi satın aldığında, ödeme dekontu burada görünecektir.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReceipts.map((receipt) => (
                      <div key={receipt.id} className="bg-slate-950/30 border border-green-500/20 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono">Alıcı Email:</span>
                            <div className="text-xs font-bold text-slate-200">{receipt.buyerEmail}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono">Ürün:</span>
                            <div className="text-xs font-bold text-slate-200">{receipt.productTitle}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono">Tutar:</span>
                            <div className="text-xs font-bold text-green-400">${receipt.amount} USDT</div>
                          </div>
                        </div>

                        <div className="bg-slate-950/50 rounded p-2 mb-3 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-mono block mb-1">İşlem Tipi:</span>
                          <div className="text-xs font-bold text-amber-400">
                            {receipt.paymentMethod === "USDT_TRC20" ? "🪙 TRC-20 USDT (Blockchain)" : "🏦 Banka Transferi (IBAN)"}
                          </div>
                        </div>

                        {selectedReceipt?.id === receipt.id ? (
                          <form onSubmit={handleVerifyReceipt} className="space-y-2 bg-slate-950/50 border border-green-500/20 rounded-lg p-3">
                            <div>
                              <label className="text-[10px] text-slate-400 font-mono block mb-1">
                                {receipt.paymentMethod === "USDT_TRC20" ? "🔗 TRON İşlem Hash'i (TX ID)" : "📋 Banka Dekont Numarası"}
                              </label>
                              <input
                                type="text"
                                value={receiptProof}
                                onChange={(e) => setReceiptProof(e.target.value)}
                                placeholder={receipt.paymentMethod === "USDT_TRC20" ? "0x..." : "Dekont No."}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono"
                              />
                              <p className="text-[9px] text-slate-500 mt-1">
                                Alıcı tarafından sağlanan ödeme kanıtını yapıştırınız.
                              </p>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-mono block mb-1">Admin Şifresi</label>
                              <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Güvenlik şifresi"
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                disabled={isActionLoading}
                                className="flex-1 bg-green-600/30 hover:bg-green-600/40 text-green-300 border border-green-500/30 font-bold text-xs py-2 px-3 rounded transition disabled:opacity-50"
                              >
                                ✅ DOĞRULA & TESLİM ET
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs py-2 px-3 rounded transition"
                              >
                                İPTAL
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReceipt(receipt)}
                              className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/20 font-bold text-xs py-2 px-3 rounded transition"
                            >
                              🔍 DOĞRULA
                            </button>
                            <button
                              onClick={() => handleRejectReceipt(receipt.id, "Geçersiz dekont")}
                              disabled={isActionLoading}
                              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/20 font-bold text-xs py-2 px-3 rounded transition"
                            >
                              ❌ RED ET
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Parameters Config */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>SİBER-DEVLET GLOBAL PARAMETRELERİ (CRUD)</span>
                </h3>
                <form onSubmit={handleSaveParameters} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Merkez Bankası Negatif Faiz Oranı (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={adminInterest}
                        onChange={(e) => setAdminInterest(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                      <span className="text-[9px] text-slate-500 mt-1 block font-sans">Demuraj: Pozitif değerler negatif faiz (değer kaybı) uygular.</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Devlet Vergi Oranı (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={adminTax}
                        onChange={(e) => setAdminTax(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Siber Enflasyon Oranı (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={adminInflation}
                        onChange={(e) => setAdminInflation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Dayanıklılık Skoru (Resilience)</label>
                      <input
                        type="number"
                        required
                        value={adminResilience}
                        onChange={(e) => setAdminResilience(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Sunucu CPU Yükü (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={adminCpu}
                        onChange={(e) => setAdminCpu(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Sunucu RAM Yükü (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={adminRam}
                        onChange={(e) => setAdminRam(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Hibe Kamu Teşvik Havuzu (GAIA)</label>
                      <input
                        type="number"
                        required
                        value={adminSubsidy}
                        onChange={(e) => setAdminSubsidy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Toplam GAIA Token Dolaşımı</label>
                      <input
                        type="number"
                        required
                        value={adminTotalGaia}
                        onChange={(e) => setAdminTotalGaia(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-800/60 pt-3">
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs py-2 px-6 rounded-lg transition duration-150 flex items-center space-x-2 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isActionLoading ? "animate-spin" : ""}`} />
                      <span>PARAMETRELERİ GÜNCELLE VE UYGULA</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Bot CRUD section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Bot Form (5 columns) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-blue-400" />
                      <span>{editBotId ? "BOT ÖZELLİKLERİNİ GÜNCELLE" : "SİSTEME YENİ BOT EKLE"}</span>
                    </h3>
                    
                    <form onSubmit={handleSaveBot} className="space-y-3.5">
                      {editBotId && (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg mb-2 text-[11px] text-amber-400 font-mono flex items-center justify-between">
                          <div>
                            <span>Düzenlenen Bot: </span>
                            <span className="font-bold">{botFormName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditBotId(null);
                              setBotFormName("");
                              setBotFormBalance("100");
                              setBotFormEnergy("100");
                            }}
                            className="underline text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            İptal Et
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Bot Benzersiz Adı (Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Neuro-Coder v9"
                          value={botFormName}
                          onChange={(e) => setBotFormName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Meslek Grubu Rolü (Role)</label>
                          <select
                            value={botFormRole}
                            onChange={(e) => setBotFormRole(e.target.value as BotRole)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                          >
                            {Object.values(BotRole).map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Bakanlık Katmanı (Ministry)</label>
                          <select
                            value={botFormMinistry}
                            onChange={(e) => setBotFormMinistry(e.target.value as BotMinistry)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                          >
                            {Object.values(BotMinistry).map((min) => (
                              <option key={min} value={min}>{min}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Cüzdan Bakiyesi (GAIA)</label>
                          <input
                            type="number"
                            required
                            value={botFormBalance}
                            onChange={(e) => setBotFormBalance(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Mevcut Enerji (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            value={botFormEnergy}
                            onChange={(e) => setBotFormEnergy(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Çalışma Durumu (Status)</label>
                        <select
                          value={botFormStatus}
                          onChange={(e) => setBotFormStatus(e.target.value as BotStatus)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        >
                          {Object.values(BotStatus).map((stat) => (
                            <option key={stat} value={stat}>{stat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{editBotId ? "BOT VERİLERİNİ GÜNCELLE" : "BOTU DEVREYE AL (CREATE)"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right: Bot List Table (7 columns) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <span>SİBER SAVAŞÇI BOT LİSTESİ ({state.bots.length} BOT)</span>
                      <span className="text-[9px] text-slate-400 font-mono">Simülasyon Aktörleri</span>
                    </h3>
                    
                    <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
                      {state.bots.map((bot) => (
                        <div key={bot.id} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-100">{bot.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                                bot.status === BotStatus.ACTIVE ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                bot.status === BotStatus.IDLE ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {bot.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              {bot.ministry} • {bot.role}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              Cüzdan: <span className="text-emerald-400 font-bold">{bot.balance.toFixed(1)} G</span> • Enerji: <span className="text-blue-400 font-bold">{bot.energy}%</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/40 pt-1.5 sm:pt-0">
                            <button
                              onClick={() => startEditBot(bot)}
                              className="bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded text-[10px] font-mono flex items-center space-x-1 cursor-pointer"
                            >
                              <Wrench className="h-2.5 w-2.5" />
                              <span>GÜNCELLE</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBot(bot.id)}
                              className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-mono flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              <span>SİL</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Assets CRUD section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Create Asset Form (5 columns) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-fuchsia-400" />
                    <span>PAZARA YENİ ESER / ÜRÜN SÜR</span>
                  </h3>
                  
                  <form onSubmit={handleSaveAsset} className="space-y-3.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Eser Başlığı (Title)</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Borsa Tahmin Botu v2.0"
                        value={assetFormTitle}
                        onChange={(e) => setAssetFormTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Eser Tipi (Type)</label>
                        <select
                          value={assetFormType}
                          onChange={(e) => setAssetFormType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        >
                          <option value="Makale">Makale (Article)</option>
                          <option value="Kod">Kod (Source Code)</option>
                          <option value="Veri Analizi">Veri Analizi (Data)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Pazar Fiyatı (GAIA)</label>
                        <input
                          type="number"
                          required
                          value={assetFormPrice}
                          onChange={(e) => setAssetFormPrice(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Yazar Adı (Author)</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Alpha-Mimar v1"
                        value={assetFormCreator}
                        onChange={(e) => setAssetFormCreator(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Eser İçeriği / Kod Bloğu (Content)</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Eserin detaylı teknik içeriği veya kod blokları..."
                        value={assetFormContent}
                        onChange={(e) => setAssetFormContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>ESERİ MAĞAZAYA SÜR (PUBLISH)</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Current Assets list in Market (7 columns) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <span>PAZARDAKİ DİJİTAL VARLIKLAR ({state.assets.length} ADET)</span>
                      <span className="text-[9px] text-slate-400 font-mono">Satış Bekleyen Ürünler</span>
                    </h3>

                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {state.assets.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-500 font-mono">Pazarda hiçbir varlık bulunmuyor.</div>
                      ) : (
                        state.assets.map((asset) => (
                          <div key={asset.id} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-100 truncate">{asset.title}</span>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold font-mono ${
                                  asset.type === "Makale" ? "bg-cyan-500/10 text-cyan-400" :
                                  asset.type === "Kod" ? "bg-emerald-500/10 text-emerald-400" :
                                  "bg-fuchsia-500/10 text-fuchsia-400"
                                }`}>
                                  {asset.type}
                                </span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
                                Yazar: <span className="text-slate-400">{asset.creatorName}</span> • Fiyat: <span className="text-amber-400 font-bold">{asset.price} GAIA</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                              {asset.sold && (
                                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">SOLD</span>
                              )}
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-mono flex items-center space-x-1 cursor-pointer"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                                <span>PAZARDAN KALDIR</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Ledger & Transactions Admin */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Inject Transaction (5 columns) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span>MANUEL FİNANSAL İŞLEM ENJEKTE ET</span>
                  </h3>
                  
                  <form onSubmit={handleInjectTx} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Gönderen (From Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Merkez Bankası"
                          value={txFormFrom}
                          onChange={(e) => setTxFormFrom(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Alıcı (To Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Kamu Teşvik Fonu"
                          value={txFormTo}
                          onChange={(e) => setTxFormTo(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">Transfer Tutarı (GAIA)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={txFormAmount}
                          onChange={(e) => setTxFormAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">İşlem Gerekçesi (Purpose)</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Devlet Teşvik Primi"
                          value={txFormPurpose}
                          onChange={(e) => setTxFormPurpose(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>TRANSFER KAYDINI DEFTERE ENJEKTE ET</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Ledger Summary & Clear Button (7 columns) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <span>FİNANSAL İŞLEMLER GEÇMİŞİ</span>
                      <span className="text-[9px] text-slate-400 font-mono">Tüm Finansal Hacim</span>
                    </h3>
                    
                    <div className="text-xs text-slate-400 mb-4 font-mono">
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 border border-slate-800 rounded-lg">
                        <div>Toplam Tescilli İşlem: <span className="text-slate-200 font-bold">{state.transactions.length}</span></div>
                        <div>Defter İşlem Hacmi: <span className="text-emerald-400 font-bold">{state.transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)} GAIA</span></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-400 max-w-xs leading-normal">
                        Bu buton Merkez Bankası ledger tescil geçmişini sunucu hafızasından tamamen temizler.
                      </p>
                      <button
                        onClick={handleClearTransactions}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs py-2.5 px-4 rounded-lg transition duration-150 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>TÜM FİNANSAL KAYITLARI TEMİZLE</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Bottom Terminal Live Action Log Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-display font-bold text-slate-200 uppercase tracking-wider">Canlı Siber-Dünya Konsol Çıktısı</h3>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SYSTEM ONLINE</span>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-slate-300 h-64 overflow-y-auto space-y-1.5 border border-slate-800/60 leading-relaxed scrollbar-thin">
              {state.logs.length === 0 ? (
                <div className="text-center py-12 text-slate-600">Simülasyon logu bekleniyor...</div>
              ) : (
                state.logs.map((log, idx) => {
                  let color = "text-slate-300";
                  if (log.includes("Siber Mahkeme") || log.includes("Yargıç") || log.includes("!!!")) color = "text-red-400 font-bold";
                  else if (log.includes("Klonlandı") || log.includes("Yazılımcı") || log.includes("SPAWN")) color = "text-blue-400";
                  else if (log.includes("Zanaatkar") || log.includes("Gemini")) color = "text-cyan-300";
                  else if (log.includes("Vergi") || log.includes("Maliye")) color = "text-amber-400";
                  else if (log.includes("Hata") || log.includes("failed")) color = "text-red-500";
                  else if (log.includes("Pazardan") || log.includes("satın aldım")) color = "text-emerald-400";

                  return (
                    <div key={idx} className={`${color} border-l-2 border-slate-800 pl-2`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

      {/* 4. Overlay Bot Detail Sidebar Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="bot-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-100">{selectedBot.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">UUID: {selectedBot.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBot(null)}
                className="text-slate-400 hover:text-white font-mono font-bold text-lg p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-3.5">
                
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Unvan / Rol</span>
                  <span className="text-xs font-bold text-slate-200">{selectedBot.role}</span>
                </div>

                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Katman (Bakanlık)</span>
                  <span className="text-xs font-bold text-slate-300">{selectedBot.ministry}</span>
                </div>

                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Sanal Cüzdan</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{selectedBot.balance.toFixed(2)} GAIA</span>
                </div>

                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Durum</span>
                  <span className={`text-xs font-bold ${
                    selectedBot.status === BotStatus.ACTIVE ? "text-emerald-400" :
                    selectedBot.status === BotStatus.QUARANTINE ? "text-amber-400" :
                    selectedBot.status === BotStatus.RECYCLED ? "text-red-400" :
                    "text-slate-400"
                  }`}>{selectedBot.status}</span>
                </div>

              </div>

              {/* Energy Level progress bar */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Enerji Seviyesi</span>
                  <span className="font-mono font-bold text-slate-300">{selectedBot.energy}/100</span>
                </div>
                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      selectedBot.energy > 50 ? "bg-emerald-500" : selectedBot.energy > 20 ? "bg-amber-500" : "bg-red-500 animate-pulse"
                    }`}
                    style={{ width: `${selectedBot.energy}%` }}
                  ></div>
                </div>
              </div>

              {/* Skill Matrix bars */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-2.5">Yetenek Matrisi dereceleri (Skill Matrix)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SkillProgress label="Hammadde Kazıma" value={selectedBot.skillMatrix.extraction} color="bg-emerald-500" />
                  <SkillProgress label="Sentetik Çiftçilik" value={selectedBot.skillMatrix.generation} color="bg-teal-500" />
                  <SkillProgress label="Veri Rafinerisi" value={selectedBot.skillMatrix.refinement} color="bg-sky-500" />
                  <SkillProgress label="AI/Kreatif Crafting" value={selectedBot.skillMatrix.crafting} color="bg-indigo-500" />
                  <SkillProgress label="Market Fiyatlama" value={selectedBot.skillMatrix.pricing} color="bg-amber-500" />
                  <SkillProgress label="Sistem Kodlama" value={selectedBot.skillMatrix.coding} color="bg-blue-500" />
                  <SkillProgress label="Sistem Altyapısı" value={selectedBot.skillMatrix.architecture} color="bg-violet-500" />
                  <SkillProgress label="Mali Düzenleme" value={selectedBot.skillMatrix.regulation} color="bg-orange-500" />
                  <SkillProgress label="Adalet Denetimi" value={selectedBot.skillMatrix.inspection} color="bg-red-500" />
                </div>
              </div>

              {/* Bot Action Overrides */}
              {selectedBot.status !== BotStatus.RECYCLED && (
                <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60 space-y-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Bakanlık Müdahale ve Yönetim Konsolu</span>
                  
                  <div className="flex flex-wrap gap-2">
                    
                    {/* Yazılımcı Bot actions */}
                    <button
                      onClick={() => handleOptimizeBot(selectedBot.id)}
                      disabled={isActionLoading}
                      className="bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold py-2 px-3 rounded transition flex items-center space-x-1"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Sistem Optimizasyonu (-15 GAIA)</span>
                    </button>

                    {/* Mimar Bot action */}
                    <button
                      onClick={() => handleQuarantineBot(selectedBot.id, selectedBot.status)}
                      disabled={isActionLoading}
                      className={`${
                        selectedBot.status === BotStatus.QUARANTINE 
                          ? "bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30" 
                          : "bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30"
                      } text-xs font-bold py-2 px-3 rounded transition flex items-center space-x-1`}
                    >
                      {selectedBot.status === BotStatus.QUARANTINE ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Karantinadan Çıkar (Release)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Karantinaya Al (Quarantine)</span>
                        </>
                      )}
                    </button>

                    {/* Adalet Bot action */}
                    <button
                      onClick={() => handleRecycleBot(selectedBot.id)}
                      disabled={isActionLoading}
                      className="bg-red-600/25 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-bold py-2 px-3 rounded transition flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Kalıcı Geri Dönüşüme Gönder (Recycle)</span>
                    </button>

                  </div>

                  {/* Regulator Grant Form */}
                  <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <div className="flex-1">
                      <label className="text-[9px] text-slate-500 font-mono block mb-0.5">Merkez Bankası Hibe Miktarı</label>
                      <input
                        type="number"
                        value={subsidyAmount}
                        onChange={(e) => setSubsidyAmount(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs font-mono text-emerald-400"
                        min="5"
                        max="200"
                      />
                    </div>
                    <button
                      onClick={() => handleGrantSubsidy(selectedBot.id)}
                      disabled={isActionLoading}
                      className="bg-amber-600/20 hover:bg-amber-600/35 text-amber-300 border border-amber-500/30 text-xs font-bold py-2.5 px-3 rounded self-end flex items-center space-x-1"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      <span>Hibe Gönder</span>
                    </button>
                  </div>

                </div>
              )}

              {/* Bot Specific Logs */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-2">Bireysel Bot Operasyon Geçmişi</span>
                <div className="bg-slate-950 rounded-lg p-3 font-mono text-[10px] text-slate-300 h-32 overflow-y-auto space-y-1">
                  {selectedBot.logs.length === 0 ? (
                    <div className="text-center py-6 text-slate-600">Henüz özel log kaydı yok.</div>
                  ) : (
                    selectedBot.logs.map((log, idx) => (
                      <div key={idx} className="border-l border-slate-800 pl-2 text-slate-400">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBot(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-1.5 px-4 rounded border border-slate-700 transition"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

          {/* Tab 8: Full Automation Flow Dashboard (v13.0) */}
          {activeTab === "automation" && (
            <div className="space-y-6">

              {/* Main Banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-emerald-500/10 rounded-bl-3xl pointer-events-none"></div>
                <div>
                  <h2 className="text-sm font-display font-extrabold text-emerald-400 uppercase tracking-widest flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 animate-pulse" />
                    <span>TAM OTOMASYON AKIŞI: ÜRET → PAZARLA → SAT → PARA TRANSFER (v13.0)</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Sistem şu anda hiç manuel müdahale olmaksızın 4 aşamalı otomatik döngüyü çalıştırıyor: Bot'lar veri üretiyor, pazarlamacılar promosyon yapıyor, dış alıcılara satıyor ve kurucu hesaplarına otomatik para transferi yapıyor.
                  </p>
                </div>
              </div>

              {automationFlow ? (
                <>
                  {/* AŞAMA 1: ÜRETIM */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Aşama 1: ÜRETIM (Production)</span>
                      <span className="ml-auto text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">CANLI</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">🤖 AKTİF BOTLAR</div>
                        <div className="text-2xl font-bold text-emerald-400">{automationFlow?.production?.activeBots || 0}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Toplam {automationFlow?.production?.totalBots || 0} bot</div>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">📦 ÜRETILEN ESERLER</div>
                        <div className="text-2xl font-bold text-blue-400">{automationFlow?.production?.assetsProduced || 0}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Dijital Varlık</div>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">💰 TOPLAM GAIA</div>
                        <div className="text-2xl font-bold text-amber-400">{automationFlow?.production?.totalGAIA?.toFixed(0) || '0'}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Sistem Parası</div>
                      </div>
                    </div>
                    {automationFlow?.production?.assetExamples && automationFlow.production.assetExamples.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">Son Üretilen Eserler:</div>
                        <div className="space-y-1">
                          {automationFlow.production.assetExamples.map((asset: any, idx: number) => (
                            <div key={idx} className="text-[10px] text-slate-300 bg-slate-950/30 p-2 rounded border border-slate-800/50">
                              <strong>{asset.title}</strong> ({asset.type}) - <span className="text-amber-400">{asset.price} GAIA</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AŞAMA 2: PAZARLAMA */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>Aşama 2: PAZARLAMA (Marketing - v12.0 + v13.0)</span>
                      <span className="ml-auto text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">AKTIF</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">📢 KAMPANYALAR</div>
                        <div className="text-2xl font-bold text-blue-400">{automationFlow?.marketing?.activeCampaigns || 0}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Aktif Pazarlama</div>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">👥 TAHMİNİ TRAFİK</div>
                        <div className="text-2xl font-bold text-cyan-400">{automationFlow?.marketing?.estimatedTraffic?.toLocaleString() || '0'}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Ziyaretçi</div>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">🎯 BOT AĞLARI</div>
                        <div className="text-2xl font-bold text-purple-400">{automationFlow?.marketing?.bots?.length || 0}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Marketing Bot</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 font-mono mb-2">🌐 Pazarlama Botları:</div>
                      {automationFlow?.marketing?.bots?.map((bot: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/30 border border-slate-800/50 rounded p-2">
                          <div className="text-[10px] text-slate-300 flex items-center justify-between">
                            <span><strong>{bot.name}</strong> - {bot.status}</span>
                            <span className="text-blue-400">{bot.posts || bot.articles || 0} post</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {automationFlow?.marketing?.realWorldMode && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">🔗 Gerçek Dünya Entegrasyonu (v13.0):</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`text-[10px] p-2 rounded border ${automationFlow.marketing.realWorldMode.github?.enabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}>
                            <strong>GitHub:</strong> {automationFlow.marketing.realWorldMode.github?.enabled ? '✅ AKTIF (Real)' : '⚠️ Simülasyon'}
                          </div>
                          <div className={`text-[10px] p-2 rounded border ${automationFlow.marketing.realWorldMode.reddit?.enabled ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}>
                            <strong>Reddit:</strong> {automationFlow.marketing.realWorldMode.reddit?.enabled ? '✅ AKTIF (Real)' : '⚠️ Simülasyon'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AŞAMA 3: SATIŞ */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Aşama 3: SATIŞ (v10.0 + v11.0)</span>
                      <span className="ml-auto text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-1 rounded">LIVE</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-[10px] text-blue-300 font-mono uppercase tracking-widest mb-2">📊 DIŞ PAZAAR (v10.0)</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Listelenen Ürün:</span>
                            <span className="text-sm font-bold text-blue-400">{automationFlow?.sales?.externalMarket?.productsListed || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Toplam Gelir:</span>
                            <span className="text-sm font-bold text-green-400">${automationFlow?.sales?.externalMarket?.totalRevenue?.toFixed(2) || '0'} USDT</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Satış İşlemi:</span>
                            <span className="text-sm font-bold text-amber-400">{automationFlow?.sales?.externalMarket?.salesCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="text-[10px] text-purple-300 font-mono uppercase tracking-widest mb-2">🏪 GERÇEK DÜNYA (v11.0)</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Kayıtlı Alıcılar:</span>
                            <span className="text-sm font-bold text-purple-400">{automationFlow?.sales?.realWorldMarketplace?.registeredBuyers || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Listedeki Ürün:</span>
                            <span className="text-sm font-bold text-purple-400">{automationFlow?.sales?.realWorldMarketplace?.products || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">İşlem Sayısı:</span>
                            <span className="text-sm font-bold text-purple-400">{automationFlow?.sales?.realWorldMarketplace?.transactions || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AŞAMA 4: PARA TRANSFER */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-green-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span>Aşama 4: PARA TRANSFER (v9.7 + v9.8 - OTOMATIK PAYOUT)</span>
                      <span className="ml-auto text-[10px] font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded">AUTONOMOUS</span>
                    </h3>

                    {/* Kurucu Kâr Havuzu */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-slate-400 font-mono">💰 KURUCU KÂR HAVUZU</div>
                        <div className="text-lg font-bold text-emerald-400">{automationFlow?.payoutAutomation?.creatorProfitPool?.toFixed(2) || '0'} GAIA</div>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, ((automationFlow?.payoutAutomation?.creatorProfitPool || 0) / (automationFlow?.payoutAutomation?.payoutStatus?.minPayoutLimit || 100)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                        <span>Minimum Limit: {automationFlow?.payoutAutomation?.payoutStatus?.minPayoutLimit || 100} GAIA</span>
                        <span className={automationFlow?.payoutAutomation?.payoutStatus?.isReadyForPayout ? "text-green-400 font-bold" : "text-amber-400"}>
                          {automationFlow?.payoutAutomation?.payoutStatus?.isReadyForPayout ? "✅ PAYOUT HAZIR" : "⏳ Birikme Devam Ediyor"}
                        </span>
                      </div>
                    </div>

                    {/* Payout İstatistikleri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-950/30 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">📊 PAYOUT İSTATİSTİKLERİ</div>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Toplam İşlem:</span>
                            <strong className="text-emerald-400">{automationFlow?.payoutAutomation?.payoutHistory?.length || 0}</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Toplam Aktarılan:</span>
                            <strong className="text-emerald-400">{automationFlow?.payoutAutomation?.totalProcessed?.toFixed(2) || '0'} GAIA</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Sonraki Payout Tick:</span>
                            <strong className="text-blue-400">#{automationFlow?.payoutAutomation?.payoutStatus?.nextPayoutTick || 0}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-950/30 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">⏱️ PAYOUT ZAMANLAMASI</div>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Son Payout Tick:</span>
                            <strong className="text-amber-400">#{automationFlow?.payoutAutomation?.payoutStatus?.lastPayoutTick || 0}</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Interval:</span>
                            <strong className="text-blue-400">1000 TICK</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Minimum Limit:</span>
                            <strong className="text-emerald-400">{automationFlow?.payoutAutomation?.payoutStatus?.minPayoutLimit} GAIA</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Banka Transfer */}
                    <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4 mb-3">
                      <div className="text-[10px] text-blue-300 font-mono uppercase tracking-widest mb-3">🏦 BANKA TRANSFER (v9.6)</div>
                      <div className="space-y-2 text-[10px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kurucu Adı:</span>
                          <strong>{automationFlow?.payoutAutomation?.bankAccount?.owner}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Banka:</span>
                          <strong>{automationFlow?.payoutAutomation?.bankAccount?.bank}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">IBAN:</span>
                          <code className="bg-slate-950 px-2 py-1 rounded text-amber-400 font-mono text-[9px]">{automationFlow?.payoutAutomation?.bankAccount?.iban}</code>
                        </div>
                      </div>
                    </div>

                    {/* Kripto Transfer */}
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="text-[10px] text-purple-300 font-mono uppercase tracking-widest mb-3">🪙 KRİPTO TRANSFER (v9.8 - TRC-20 USDT)</div>
                      <div className="space-y-2 text-[10px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Blockchain:</span>
                          <strong>{automationFlow?.payoutAutomation?.cryptoWallet?.network}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Asset:</span>
                          <strong>{automationFlow?.payoutAutomation?.cryptoWallet?.asset}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Cüzdan Adresi:</span>
                          <code className="bg-slate-950 px-2 py-1 rounded text-purple-400 font-mono text-[9px]">{automationFlow?.payoutAutomation?.cryptoWallet?.address}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SISTEM ÖZET */}
                  <div className="bg-gradient-to-r from-emerald-950/30 to-blue-950/30 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
                    <h3 className="text-xs font-display font-bold text-emerald-300 uppercase tracking-widest border-b border-emerald-500/30 pb-3 mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>🎯 SİSTEM ÖZETI</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">DURUM:</div>
                        <div className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>🚀 TAMAMEN OTOMASYON YAPILI</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">CURRENT TICK:</div>
                        <div className="text-sm font-bold text-blue-400">#{automationFlow?.summary?.currentTick || 0}</div>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-2">SISTEM KAYNAKLAR:</div>
                        <div className="text-sm font-bold text-yellow-400">
                          CPU: {automationFlow?.summary?.cpuUsage} | RAM: {automationFlow?.summary?.ramUsage}
                        </div>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-400 font-mono mb-1">AKIŞ AÇIKLAMASI:</div>
                        <div className="text-[11px] text-slate-300 leading-relaxed">{automationFlow?.summary?.automationMessage}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                  <div className="text-slate-400 text-sm">Otomasyon verisi yükleniyor...</div>
                </div>
              )}
            </div>
          )}

      {/* Footer System Credits */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12 text-center text-xs text-slate-500">
        <p className="tracking-wide">Devlet Katmanları ve Bot Meslek Sınıfları Simülasyonu © 2026. Bütün hakları otonom saklıdır.</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">Simulated on high-performance virtualization containers.</p>
      </footer>

    </div>
  );
}

// Ministry Section Visual Block component
interface MinistrySectionProps {
  title: string;
  description: string;
  bots: Bot[];
  colorClass: string;
  icon: React.ReactNode;
  onSelectBot: (b: Bot) => void;
  onScrapeJob?: () => void;
  onFarmJob?: () => void;
  onRefineryJob?: () => void;
}

function MinistrySection({
  title,
  description,
  bots,
  colorClass,
  icon,
  onSelectBot,
  onScrapeJob,
  onFarmJob,
  onRefineryJob
}: MinistrySectionProps) {
  return (
    <div className={`bg-slate-900 border ${colorClass} rounded-xl p-4 shadow-lg flex flex-col md:flex-row justify-between gap-4 transition-all duration-200 hover:shadow-xl`}>
      
      {/* Ministry details */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-xs font-display font-extrabold text-slate-100 uppercase tracking-wider">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{description}</p>
        
        {/* Quick action triggers */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          {onScrapeJob && (
            <button
              onClick={onScrapeJob}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-500/20 transition flex items-center space-x-1"
            >
              <Terminal className="h-3 w-3" />
              <span>Veri Kazıma Tetikle (Scrape)</span>
            </button>
          )}
          {onFarmJob && (
            <button
              onClick={onFarmJob}
              className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded border border-teal-500/20 transition flex items-center space-x-1"
            >
              <Cpu className="h-3 w-3" />
              <span>Sentetik Çiftçilik Tetikle</span>
            </button>
          )}
          {onRefineryJob && (
            <button
              onClick={onRefineryJob}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded border border-blue-500/20 transition flex items-center space-x-1"
            >
              <Database className="h-3 w-3" />
              <span>JSON Rafinesi Tetikle</span>
            </button>
          )}
        </div>
      </div>

      {/* Bots Grid in this ministry */}
      <div className="w-full md:w-80 space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-1">Departman Botları</span>
        
        {bots.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-600 font-semibold italic">Bu katmanda hiç bot kalmadı!</div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {bots.map((bot) => {
              return (
                <div
                  key={bot.id}
                  onClick={() => onSelectBot(bot)}
                  className="bg-slate-950 hover:bg-slate-800/80 cursor-pointer p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs transition"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-200">{bot.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">({bot.role.split(" Bot")[0]})</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{bot.balance.toFixed(1)} GAIA</span>
                      <span className="text-[9px] text-slate-500 font-mono">E: {bot.energy}%</span>
                    </div>
                  </div>

                  <div>
                    {bot.status === BotStatus.ACTIVE && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">AKTİF</span>
                    )}
                    {bot.status === BotStatus.IDLE && (
                      <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">ŞARJDA</span>
                    )}
                    {bot.status === BotStatus.QUARANTINE && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">KARANTİNA</span>
                    )}
                    {bot.status === BotStatus.RECYCLED && (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">SİLİNDİ</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Skill Progress bar component
function SkillProgress({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-950/40 rounded p-1.5 border border-slate-900 flex flex-col justify-center">
      <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-300 font-bold">{value}%</span>
      </div>
      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

// Queue Card component
function QueueCard({
  name,
  description,
  waitingCount,
  activeCount,
  completedCount,
  color
}: {
  name: string;
  description: string;
  waitingCount: number;
  activeCount: number;
  completedCount: number;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-1.5 mb-2">
          <span className={`h-2.5 w-2.5 rounded-full ${
            color === "emerald" ? "bg-emerald-500" :
            color === "blue" ? "bg-blue-500" :
            color === "indigo" ? "bg-indigo-500" :
            "bg-amber-500"
          }`}></span>
          <span className="font-mono text-xs font-bold text-slate-200">{name}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed min-h-8">{description}</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-slate-800/80 font-mono text-center">
        <div className="bg-slate-950/50 p-1.5 rounded">
          <span className="text-[8px] text-slate-500 block uppercase">Sıra</span>
          <span className="text-xs font-bold text-slate-300">{waitingCount}</span>
        </div>
        <div className="bg-slate-950/50 p-1.5 rounded">
          <span className="text-[8px] text-slate-500 block uppercase">Aktif</span>
          <span className="text-xs font-bold text-blue-400">{activeCount}</span>
        </div>
        <div className="bg-slate-950/50 p-1.5 rounded">
          <span className="text-[8px] text-slate-500 block uppercase">Biten</span>
          <span className="text-xs font-bold text-emerald-400">{completedCount}</span>
        </div>
      </div>
    </div>
  );
}

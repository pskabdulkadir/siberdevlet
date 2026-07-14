import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, DollarSign, TrendingUp, Bitcoin, CreditCard, Clock } from 'lucide-react';

interface WalletPool {
  totalUSD: number;
  totalTRY: number;
  totalUSDT_Crypto?: number;
  totalTransactions: number;
}

interface Transfer {
  id: string;
  status: string;
  amount: number;
  timestamp: number;
  walletAddress?: string;
}

interface PendingTransaction {
  id: string;
  buyerEmail: string;
  productTitle: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'USDT_POLYGON';
  createdAt: number;
  status: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [sessionId] = useState(() => localStorage.getItem('adminSessionId') || '');
  const [pool, setPool] = useState<WalletPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferMethod, setTransferMethod] = useState<'bank' | 'crypto'>('bank');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);
  const [txProof, setTxProof] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Session kontrol
  useEffect(() => {
    if (!sessionId) {
      navigate('/admin/login');
      return;
    }

    loadDashboard();
    loadPendingTransactions();
    const interval = setInterval(loadDashboard, 5000); // Her 5 saniyede güncelle
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadDashboard = async () => {
    try {
      console.log('[📊 Dashboard] Havuz verisi yükleniyor...');
      const response = await fetch(`/api/admin/wallet-pool?sessionId=${sessionId}`);
      const data = await response.json();

      console.log('[📊 Dashboard] Havuz Response:', data);

      if (data.success) {
        console.log('[📊 Dashboard] Pool ayarlandı:', data.pool);
        setPool(data.pool);
      } else if (response.status === 401) {
        navigate('/admin/login');
      }
    } catch (err: any) {
      console.error('[❌ Dashboard] Yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTransactions = async () => {
    try {
      const response = await fetch(`/api/marketplace/pending-transactions?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setPendingTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Bekleyen işlemler yüklenemedi:', err);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setTransferLoading(true);

    // v31.0: Kripto transferi için cüzdan adresi kontrolü
    if (transferMethod === 'crypto' && !cryptoWalletAddress.trim()) {
      setTransferError('Kripto transferi için cüzdan adresi zorunludur.');
      setTransferLoading(false);
      return;
    }

    try {
      const transferAmount = amount ? parseFloat(amount) : undefined;

      if (transferAmount <= 0) {
        setTransferError('Transfer tutarı 0 dan büyük olmalı');
        setTransferLoading(false);
        return;
      }

      const response = await fetch('/api/admin/manual-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          method: transferMethod,
          details: {
            amount: transferAmount,
            walletAddress: cryptoWalletAddress
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setTransferSuccess(`${transferMethod === 'bank' ? 'Banka' : 'Kripto'} transferi başlatıldı! ID: ${data.transferId}`);
        setCryptoWalletAddress('');
        setAmount('');
        setTimeout(() => {
          loadDashboard();
          setTransferSuccess('');
        }, 2000);
      } else {
        setTransferError(data.error || 'Transfer başarısız');
      }
    } catch (err: any) {
      setTransferError(err.message || 'Hata oluştu');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSessionId');
    navigate('/admin/login');
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !txProof) {
      setVerificationError('Lütfen bir işlem seçin ve ödeme kanıtını girin.');
      return;
    }
    setVerificationError('');
    setTransferLoading(true);

    try {
      const response = await fetch('/api/marketplace/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          proof: txProof,
          adminSessionId: sessionId
        })
      });
      const data = await response.json();
      if (data.success) {
        setTransferSuccess('Ödeme başarıyla doğrulandı ve ürün teslim edildi!');
        setSelectedTx(null);
        setTxProof('');
        loadPendingTransactions(); // Listeyi yenile
        loadDashboard(); // Havuzu yenile
      } else {
        setVerificationError(data.error || 'Doğrulama başarısız.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Bir hata oluştu.');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h1 className="text-3xl font-bold text-white">💰 Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Pool Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="bg-blue-900/20 border border-blue-700 text-blue-300 p-4 rounded-lg">
              ⏳ Havuz verisi yükleniyor...
            </div>
          )}

          {/* Stats Cards */}
          {pool && pool.totalUSD !== undefined ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-400 text-sm">USD Bakiyesi</span>
                </div>
                <p className="text-2xl font-bold text-white">${pool.totalUSD.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-slate-400 text-sm">TRY Bakiyesi</span>
                </div>
                <p className="text-2xl font-bold text-white">₺{pool.totalTRY.toFixed(2)}</p>
              </div>
              {/* v29.0: Kripto Havuzu */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Bitcoin className="w-5 h-5 text-orange-400" />
                  <span className="text-slate-400 text-sm">Kripto Havuzu (USDT)</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${(pool.totalUSDT_Crypto || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <span className="text-slate-400 text-sm">İşlem Sayısı</span>
                <p className="text-2xl font-bold text-white">{pool.totalTransactions}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <span className="text-slate-400 text-sm">Oran</span>
                <p className="text-2xl font-bold text-white">1 USD = ₺30</p>
              </div>
            </div>
          ) : !loading ? (
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 p-4 rounded-lg">
              ⚠️ Havuzda henüz para yok. Satışlar gerçekleştikçe burada gösterilecek.
            </div>
          ) : null}

          {/* Bekleyen Ödemeler (Gerçek Müşteri) */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              Bekleyen Ödeme Onayları
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">Bekleyen ödeme onayı yok.</div>
              ) : (
                pendingTransactions.map(tx => (
                  <div key={tx.id} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTx?.id === tx.id ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'}`} onClick={() => setSelectedTx(tx)}>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-slate-200 text-sm">{tx.productTitle}</div>
                      <div className="text-lg font-bold text-emerald-400">${tx.amount.toFixed(2)}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{tx.buyerEmail}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-1">{tx.paymentMethod === 'USDT_POLYGON' ? 'Kripto (Polygon USDT)' : 'Banka Transferi'}</div>
                  </div>
                ))
              )}
            </div>

            {/* Onay Formu */}
            {selectedTx && (
              <form onSubmit={handleVerifyPayment} className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-white">Onay Formu: {selectedTx.productTitle}</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ödeme Kanıtı (Transaction Hash / Dekont No)
                  </label>
                  <input
                    type="text"
                    value={txProof}
                    onChange={(e) => setTxProof(e.target.value)}
                    placeholder={selectedTx.paymentMethod === 'USDT_POLYGON' ? '0x...' : 'Dekont Numarası'}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {verificationError && (
                  <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
                    {verificationError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={transferLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {transferLoading ? 'Doğrulanıyor...' : '✅ Ödemeyi Doğrula ve Teslim Et'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTx(null)}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Manual Transfer Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              Manuel Para Çekme
            </h2>

            <form onSubmit={handleTransfer} className="space-y-4">
              {/* Transfer Metodu */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Transfer Yöntemi</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTransferMethod('bank')} className={`flex-1 text-xs font-bold py-2 rounded-lg border ${transferMethod === 'bank' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>Banka (IBAN)</button>
                  <button type="button" onClick={() => setTransferMethod('crypto')} className={`flex-1 text-xs font-bold py-2 rounded-lg border ${transferMethod === 'crypto' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>Kripto (USDT)</button>
                </div>
              </div>

              {/* Kripto Cüzdan Adresi (koşullu) */}
              {transferMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hedef Kripto Cüzdanı (Polygon)</label>
                  <input
                    type="text"
                    value={cryptoWalletAddress}
                    onChange={(e) => setCryptoWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Tutar */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Transfer Tutarı (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Tüm havuz için boş bırakın"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {transferError && <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg text-sm">{transferError}</div>}
              {transferSuccess && <div className="bg-green-900/20 border border-green-700 text-green-400 p-3 rounded-lg text-sm">{transferSuccess}</div>}

              <button type="submit" disabled={transferLoading || !pool} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                {transferLoading ? '⏳ Transfer ediliyor...' : '🚀 Transferi Başlat'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

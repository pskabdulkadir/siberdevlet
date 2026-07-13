import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, DollarSign, TrendingUp, Bitcoin } from 'lucide-react';

interface WalletPool {
  totalUSD: number;
  totalTRY: number;
  totalTransactions: number;
}

interface Transfer {
  id: string;
  status: string;
  amount: number;
  timestamp: number;
  walletAddress?: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [sessionId] = useState(() => localStorage.getItem('adminSessionId') || '');
  const [pool, setPool] = useState<WalletPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  // Session kontrol
  useEffect(() => {
    if (!sessionId) {
      navigate('/admin/login');
      return;
    }

    loadDashboard();
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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setTransferLoading(true);

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
          amount: transferAmount
        })
      });

      const data = await response.json();

      if (data.success) {
        setTransferSuccess(`Banka transferi başlatıldı! ID: ${data.transferId}`);
        setWalletAddress('');
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

        </div>

        {/* Manual Transfer Form */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            Manuel Banka Transferi
          </h2>

          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Tutar */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Transfer Tutarı (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Boş bıraksa tüm havuz transfer olur"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {pool && !amount && (
                <p className="text-xs text-blue-400 mt-1">
                  Tüm havuz: ${pool.totalUSD.toFixed(2)} USD
                </p>
              )}
            </div>

            {/* Error */}
            {transferError && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
                {transferError}
              </div>
            )}

            {/* Success */}
            {transferSuccess && (
              <div className="bg-green-900/20 border border-green-700 text-green-400 p-3 rounded-lg text-sm">
                {transferSuccess}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={transferLoading || !pool}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {transferLoading ? '⏳ Transfer ediliyor...' : '🚀 Banka Hesabına Gönder'}
            </button>

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                ℹ️ Havuzda toplanan canlı para, .env dosyasında belirtilen QNB Finansbank IBAN adresine otomatik olarak gönderilecektir.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

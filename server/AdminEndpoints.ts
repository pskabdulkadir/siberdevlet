/**
 * ADMIN PANEL API ENDPOINTS v21.0
 * - Login
 * - Wallet Pool yönetimi
 * - Manual Transfer
 * - Dashboard
 */

import express from "express";
import { AdminPanel } from "./AdminPanel.js";

const router = express.Router();

/**
 * POST /api/admin/login
 * Admin girişi
 */
router.post("/api/admin/login", express.json(), (req, res) => {
  const { email, password } = req.body;

  console.log(`[📧 LOGIN ATTEMPT]`);
  console.log(`   Email: ${email}`);
  console.log(`   Password length: ${password?.length || 0}`);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email ve şifre gerekli"
    });
  }

  const result = AdminPanel.login(email, password);

  console.log(`[📧 LOGIN RESULT] Success: ${result.success}`);

  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json(result);
});

/**
 * GET /api/admin/dashboard
 * Admin dashboard - session kontrolü ile
 */
router.get("/api/admin/dashboard", (req, res) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: "Session ID gerekli"
    });
  }

  const dashboard = AdminPanel.getDashboard(sessionId);
  if (!dashboard) {
    return res.status(401).json({
      success: false,
      error: "Session geçersiz veya süresi dolmuş"
    });
  }

  res.json({
    success: true,
    data: dashboard
  });
});

/**
 * GET /api/admin/wallet-pool
 * Havuz bilgileri
 */
router.get("/api/admin/wallet-pool", (req, res) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId || !AdminPanel.verifySession(sessionId)) {
    return res.status(401).json({
      success: false,
      error: "Session geçersiz"
    });
  }

  const poolStats = AdminPanel.getPoolStats();
  res.json({
    success: true,
    pool: poolStats
  });
});

/**
 * POST /api/admin/transfer/manual
 * Manuel transfer tetikle - havuzdan cüzdana
 */
router.post("/api/admin/transfer/manual", express.json(), (req, res) => {
  const { sessionId, walletAddress, amount } = req.body;

  if (!sessionId || !walletAddress) {
    return res.status(400).json({
      success: false,
      error: "Session ID ve wallet address gerekli"
    });
  }

  const result = AdminPanel.triggerManualTransfer(sessionId, walletAddress, amount);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * GET /api/admin/transfers/history
 * Transfer geçmişi
 */
router.get("/api/admin/transfers/history", (req, res) => {
  const sessionId = req.query.sessionId as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  if (!sessionId || !AdminPanel.verifySession(sessionId)) {
    return res.status(401).json({
      success: false,
      error: "Session geçersiz"
    });
  }

  const history = AdminPanel.getTransferHistory(limit);
  res.json({
    success: true,
    transfers: history
  });
});

/**
 * POST /api/admin/logout
 * Logout (sessionId sil)
 */
router.post("/api/admin/logout", express.json(), (req, res) => {
  // Session'ı silebilmek için AdminPanel'e logout metodu eklemek gerekir
  // Şimdilik basit response dön
  res.json({
    success: true,
    message: "Logout başarılı"
  });
});

export default router;

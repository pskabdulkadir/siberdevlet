import React, { useRef, useEffect } from "react";
import { SimulationState, BotMinistry, BotStatus } from "../types";

interface CyberWorldMapProps {
  state: SimulationState;
}

interface Particle {
  id: string;
  name: string;
  role: string;
  ministry: BotMinistry;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
}

interface LaserBeam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0 to 1
  color: string;
}

const REGION_COORDS = {
  [BotMinistry.URETIM]: { name: "KUTUP BÖLGESİ (ÜRETİM)", x: 200, y: 150, color: "#10b981" },
  [BotMinistry.SANAYI_TEKNOLOJI]: { name: "SANAYİ BÖLGESİ", x: 600, y: 150, color: "#3b82f6" },
  [BotMinistry.ALTYAPI_EVRIM]: { name: "SUNUCU ÇEKİRDEĞİ", x: 400, y: 250, color: "#6366f1" },
  [BotMinistry.EKONOMI_FINANS]: { name: "MERKEZ BANKASI", x: 250, y: 350, color: "#f59e0b" },
  [BotMinistry.ADALET]: { name: "YÜKSEK MAHKEME", x: 550, y: 350, color: "#ef4444" }
};

export default function CyberWorldMap({ state }: CyberWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const prevTransactionsRef = useRef<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Handle canvas resizing to preserve crispness
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track active lasers based on new financial ledger transactions
    const currentTxIds = state.transactions.map(t => t.id);
    const newTxs = state.transactions.filter(t => !prevTransactionsRef.current.includes(t.id));
    prevTransactionsRef.current = currentTxIds;

    newTxs.forEach(tx => {
      // Find source & target bot ministries
      const fromBot = state.bots.find(b => b.id === tx.fromId);
      const toBot = state.bots.find(b => b.id === tx.toId);

      const fromMin = fromBot ? fromBot.ministry : BotMinistry.EKONOMI_FINANS;
      const toMin = toBot ? toBot.ministry : BotMinistry.EKONOMI_FINANS;

      const fromCoord = REGION_COORDS[fromMin] || REGION_COORDS[BotMinistry.ALTYAPI_EVRIM];
      const toCoord = REGION_COORDS[toMin] || REGION_COORDS[BotMinistry.ALTYAPI_EVRIM];

      lasersRef.current.push({
        fromX: fromCoord.x,
        fromY: fromCoord.y,
        toX: toCoord.x,
        toY: toCoord.y,
        progress: 0,
        color: tx.purpose?.includes("Hibe") ? "#fbbf24" : "#10b981"
      });
    });

    // Also look at active job changes to beam to/from queues (Production, refinery, etc.)
    // Add custom transient lasers occasionally for visual candy based on ticking
    if (Math.random() < 0.2 && state.jobs.some(j => j.status === "active")) {
      const randomActiveJob = state.jobs.find(j => j.status === "active");
      if (randomActiveJob) {
        const worker = state.bots.find(b => b.id === randomActiveJob.workerId);
        if (worker) {
          const fromCoord = REGION_COORDS[worker.ministry] || REGION_COORDS[BotMinistry.ALTYAPI_EVRIM];
          const toCoord = REGION_COORDS[BotMinistry.ALTYAPI_EVRIM]; // To Infrastructure core
          lasersRef.current.push({
            fromX: fromCoord.x,
            fromY: fromCoord.y,
            toX: toCoord.x,
            toY: toCoord.y,
            progress: 0,
            color: "#6366f1"
          });
        }
      }
    }

    // Sync state bots with particle systems
    const currentParticles = particlesRef.current;
    const syncedParticles: Particle[] = [];

    state.bots.forEach(bot => {
      if (bot.status === BotStatus.RECYCLED) return;

      const existing = currentParticles.find(p => p.id === bot.id);
      const destCoord = REGION_COORDS[bot.ministry] || REGION_COORDS[BotMinistry.ALTYAPI_EVRIM];

      // Add small offset variance so bots cluster naturally rather than on a single exact point
      const hash = bot.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const offsetX = ((hash % 17) - 8.5) * 4;
      const offsetY = (((hash * 13) % 17) - 8.5) * 4;

      const tx = destCoord.x + offsetX;
      const ty = destCoord.y + offsetY;

      if (existing) {
        existing.tx = tx;
        existing.ty = ty;
        existing.ministry = bot.ministry;
        syncedParticles.push(existing);
      } else {
        // Create new particle near Sunucu Çekirdeği
        syncedParticles.push({
          id: bot.id,
          name: bot.name,
          role: bot.role,
          ministry: bot.ministry,
          x: REGION_COORDS[BotMinistry.ALTYAPI_EVRIM].x,
          y: REGION_COORDS[BotMinistry.ALTYAPI_EVRIM].y,
          tx,
          ty,
          color: REGION_COORDS[bot.ministry]?.color || "#ffffff"
        });
      }
    });

    particlesRef.current = syncedParticles;

    // Canvas Frame Loop
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Tech grid background
      ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Network Highways (Connecting regions)
      ctx.strokeStyle = "rgba(71, 85, 105, 0.15)";
      ctx.lineWidth = 1.5;
      const regions = Object.values(REGION_COORDS);
      for (let i = 0; i < regions.length; i++) {
        for (let j = i + 1; j < regions.length; j++) {
          ctx.beginPath();
          ctx.moveTo(regions[i].x, regions[i].y);
          ctx.lineTo(regions[j].x, regions[j].y);
          ctx.stroke();
        }
      }

      // 3. Render Region Nodes
      Object.entries(REGION_COORDS).forEach(([key, reg]) => {
        // Outer glowing ring
        ctx.beginPath();
        ctx.arc(reg.x, reg.y, 35, 0, 2 * Math.PI);
        ctx.strokeStyle = `${reg.color}15`;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(reg.x, reg.y, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = `${reg.color}30`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center point
        ctx.beginPath();
        ctx.arc(reg.x, reg.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = reg.color;
        ctx.fill();

        // Labeled text
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(reg.name, reg.x, reg.y - 45);

        // Subtext listing active bots in this ministry
        const activeCount = state.bots.filter(b => b.ministry === key && b.status === BotStatus.ACTIVE).length;
        ctx.fillStyle = "#64748b";
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillText(`Aktif: ${activeCount}`, reg.x, reg.y + 40);
      });

      // 4. Update and Draw Laser Beams
      lasersRef.current = lasersRef.current.filter(laser => {
        laser.progress += 0.04; // incremental speed
        if (laser.progress >= 1) return false;

        // Draw laser track
        ctx.beginPath();
        ctx.moveTo(laser.fromX, laser.fromY);
        ctx.lineTo(laser.toX, laser.toY);
        ctx.strokeStyle = `${laser.color}15`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw glowing laser point
        const currentX = laser.fromX + (laser.toX - laser.fromX) * laser.progress;
        const currentY = laser.fromY + (laser.toY - laser.fromY) * laser.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = laser.color;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        return true;
      });

      // v9.5: Draw Treasure Chest Particle Effects
      if (state.particleEffects && state.particleEffects.length > 0) {
        state.particleEffects.forEach(particle => {
          // Calculate pulse effect (3 tick blink)
          const age = state.activeTicks - particle.spawnTick;
          const pulseFactor = Math.sin((age / particle.lifetime) * Math.PI * 4) * 0.5 + 0.5; // 0 to 1 pulse
          const opacity = Math.floor(pulseFactor * 255).toString(16).padStart(2, "0");

          // Draw treasure sparkle/particle squares
          const treasureColor = particle.color === "gold" ? "#fbbf24" : "#4ade80"; // Altın sarısı veya neon yeşili

          // Outer glow (pulsing)
          ctx.beginPath();
          ctx.arc(particle.treasureX, particle.treasureY, 12 * pulseFactor, 0, 2 * Math.PI);
          ctx.fillStyle = `${treasureColor}${opacity}`;
          ctx.shadowColor = treasureColor;
          ctx.shadowBlur = 20 * pulseFactor;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner square (matrix style)
          const size = 6;
          ctx.fillStyle = treasureColor;
          ctx.fillRect(
            particle.treasureX - size * pulseFactor,
            particle.treasureY - size * pulseFactor,
            size * 2 * pulseFactor,
            size * 2 * pulseFactor
          );

          // Inner bright core
          ctx.fillStyle = `${treasureColor}ff`;
          ctx.fillRect(
            particle.treasureX - size * 0.4,
            particle.treasureY - size * 0.4,
            size * 0.8,
            size * 0.8
          );
        });
      }

      // v9.5: Draw Treasure Chests (visible on map)
      if (state.treasures && state.treasures.length > 0) {
        state.treasures.forEach(treasure => {
          if (treasure.discovered) return; // Don't draw discovered treasures

          // Determine treasure color and icon based on type
          let treasureColor = "#fbbf24"; // gold
          let icon = "💎";

          if (treasure.type === "satoshi_block") {
            treasureColor = "#fbbf24"; // Gold
            icon = "🪙";
          } else if (treasure.type === "data_cache") {
            treasureColor = "#4ade80"; // Green
            icon = "💾";
          } else if (treasure.type === "ram_optimize") {
            treasureColor = "#60a5fa"; // Blue
            icon = "⚡";
          }

          // Draw treasure chest marker
          ctx.beginPath();
          ctx.arc(treasure.posX, treasure.posY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = treasureColor;
          ctx.shadowColor = treasureColor;
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw chest outline
          ctx.beginPath();
          ctx.arc(treasure.posX, treasure.posY, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = `${treasureColor}80`;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // 5. Update and Draw Bot Particles
      particlesRef.current.forEach(p => {
        // Move smoothly towards target
        p.x += (p.tx - p.x) * 0.08;
        p.y += (p.ty - p.y) * 0.08;

        // Drifting effect (small float noise)
        const time = Date.now() * 0.003;
        const hashVal = p.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const floatX = Math.sin(time + hashVal) * 1.5;
        const floatY = Math.cos(time + hashVal) * 1.5;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x + floatX, p.y + floatY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw tiny pointer circle
        ctx.beginPath();
        ctx.arc(p.x + floatX, p.y + floatY, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = `${p.color}40`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block bg-slate-950"
      style={{ minHeight: "320px" }}
    />
  );
}

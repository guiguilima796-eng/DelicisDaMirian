// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: "Muitas requisições, tente novamente mais tarde." } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: "Muitas tentativas de login. Aguarde 15 minutos." } });
app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

// ── Static files (uploaded images) ────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",  require("./src/routes/auth"));
app.use("/api/menu",  require("./src/routes/menu"));
app.use("/api/orders", require("./src/routes/orders"));
app.use("/api/store",  require("./src/routes/store"));

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// 404
app.use("*", (_, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🍔 Servidor rodando na porta ${PORT}`));

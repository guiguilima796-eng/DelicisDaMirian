// src/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação necessário." });
  }
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") throw new Error();
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

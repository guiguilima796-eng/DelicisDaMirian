// src/routes/auth.js
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const requireAdmin = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Usuário e senha são obrigatórios." });

    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ error: "Credenciais inválidas." });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, username: admin.username });
  } catch (err) { next(err); }
});

// GET /api/auth/me  (verify token)
router.get("/me", requireAdmin, (req, res) => {
  res.json({ username: req.admin.username, role: req.admin.role });
});

// PATCH /api/auth/password  (change password)
router.patch("/password", requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6)
      return res.status(400).json({ error: "Senha nova deve ter no mínimo 6 caracteres." });

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Senha atual incorreta." });

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: hash } });
    res.json({ message: "Senha alterada com sucesso." });
  } catch (err) { next(err); }
});

module.exports = router;

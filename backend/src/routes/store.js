// src/routes/store.js
const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAdmin = require("../middleware/auth");

// GET /api/store  — public (customers check if open)
router.get("/", async (_, res, next) => {
  try {
    const config = await prisma.storeConfig.findUnique({ where: { id: 1 } });
    res.json(config);
  } catch (err) { next(err); }
});

// PATCH /api/store  — admin only
router.patch("/", requireAdmin, async (req, res, next) => {
  try {
    const ALLOWED = ["storeOpen", "acceptOrders", "deliveryRadius", "deliveryFee", "storeAddress", "storeLat", "storeLng", "storePhone"];
    const data = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] === "boolean") data[key] = req.body[key];
        else if (["deliveryRadius", "deliveryFee", "storeLat", "storeLng"].includes(key)) data[key] = parseFloat(req.body[key]);
        else data[key] = req.body[key];
      }
    }
    if (Object.keys(data).length === 0)
      return res.status(400).json({ error: "Nenhum campo válido para atualizar." });

    const config = await prisma.storeConfig.update({ where: { id: 1 }, data });
    res.json(config);
  } catch (err) { next(err); }
});

module.exports = router;

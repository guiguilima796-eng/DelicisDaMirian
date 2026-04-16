// src/routes/menu.js
const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");
const requireAdmin = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/menu  — public
router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: req.query.all === "true" ? {} : { available: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    });
    res.json(items);
  } catch (err) { next(err); }
});

// GET /api/menu/:id — public
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ error: "Item não encontrado." });
    res.json(item);
  } catch (err) { next(err); }
});

// POST /api/menu  — admin
router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const { name, description, price, category, badge, available, sortOrder } = req.body;

    if (!name || !description || !price || !category)
      return res.status(400).json({ error: "name, description, price e category são obrigatórios." });

    const imageValue = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.image || "🍔");

    const item = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image: imageValue,
        badge: badge?.trim() || null,
        available: available !== "false",
        sortOrder: parseInt(sortOrder) || 0,
      },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PATCH /api/menu/:id  — admin
router.patch("/:id", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Item não encontrado." });

    const { name, description, price, category, badge, available, sortOrder } = req.body;

    // If new file uploaded, delete old file if it was an upload
    let imageValue = existing.image;
    if (req.file) {
      if (existing.image?.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "../../", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageValue = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      // emoji or URL sent as text
      if (existing.image?.startsWith("/uploads/") && req.body.image !== existing.image) {
        const oldPath = path.join(__dirname, "../../", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageValue = req.body.image;
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (price !== undefined) data.price = parseFloat(price);
    if (category !== undefined) data.category = category.trim();
    if (badge !== undefined) data.badge = badge.trim() || null;
    if (available !== undefined) data.available = available === "true" || available === true;
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    data.image = imageValue;

    const updated = await prisma.menuItem.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/menu/:id  — admin
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Item não encontrado." });

    // Delete uploaded image file
    if (existing.image?.startsWith("/uploads/")) {
      const imgPath = path.join(__dirname, "../../", existing.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: "Item removido com sucesso." });
  } catch (err) { next(err); }
});

// PATCH /api/menu/reorder  — admin (bulk sort order update)
router.patch("/bulk/reorder", requireAdmin, async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, sortOrder }, ...]
    if (!Array.isArray(order)) return res.status(400).json({ error: "order deve ser um array." });
    await Promise.all(order.map(({ id, sortOrder }) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder } })
    ));
    res.json({ message: "Ordem atualizada." });
  } catch (err) { next(err); }
});

module.exports = router;

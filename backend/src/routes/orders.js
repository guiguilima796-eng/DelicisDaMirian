// src/routes/orders.js
const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAdmin = require("../middleware/auth");

function genPublicId() {
  return "DM-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// POST /api/orders  — public (customers place orders)
router.post("/", async (req, res, next) => {
  try {
    const { customerName, phone, type, address, complement, note, items } = req.body;

    if (!customerName || !phone || !type || !items?.length)
      return res.status(400).json({ error: "Dados incompletos. Verifique os campos obrigatórios." });
    if (type === "delivery" && !address)
      return res.status(400).json({ error: "Endereço de entrega é obrigatório." });

    // Verify store is accepting orders
    const config = await prisma.storeConfig.findUnique({ where: { id: 1 } });
    if (!config?.storeOpen || !config?.acceptOrders)
      return res.status(403).json({ error: "A loja não está aceitando pedidos no momento." });

    // Validate items against DB and calculate totals
    const menuIds = items.filter(i => i.menuItemId).map(i => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuIds }, available: true },
    });
    const menuMap = Object.fromEntries(menuItems.map(m => [m.id, m]));

    let subtotal = 0;
    const validatedItems = items.map(item => {
      const menuItem = menuMap[item.menuItemId];
      const price = menuItem ? menuItem.price : parseFloat(item.price);
      const name = menuItem ? menuItem.name : item.name;
      subtotal += price * item.quantity;
      return { name, price, quantity: item.quantity, menuItemId: menuItem?.id || null };
    });

    const deliveryFee = type === "delivery" ? (config?.deliveryFee || 5.0) : 0;
    const total = subtotal + deliveryFee;

    let publicId = genPublicId();
    // Ensure uniqueness
    while (await prisma.order.findUnique({ where: { publicId } })) {
      publicId = genPublicId();
    }

    const order = await prisma.order.create({
      data: {
        publicId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        type,
        address: address?.trim() || null,
        complement: complement?.trim() || null,
        note: note?.trim() || null,
        subtotal,
        deliveryFee,
        total,
        items: {
          create: validatedItems,
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (err) { next(err); }
});

// GET /api/orders  — admin
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const { status, date, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      where.createdAt = { gte: d, lt: next };
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total });
  } catch (err) { next(err); }
});

// GET /api/orders/stats  — admin
router.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const todayWhere = { createdAt: { gte: today, lt: tomorrow } };

    const [total, pending, revenue, deliveries] = await Promise.all([
      prisma.order.count({ where: todayWhere }),
      prisma.order.count({ where: { ...todayWhere, status: { in: ["Recebido", "Em preparo"] } } }),
      prisma.order.aggregate({ where: todayWhere, _sum: { total: true } }),
      prisma.order.count({ where: { ...todayWhere, type: "delivery" } }),
    ]);

    res.json({ total, pending, revenue: revenue._sum.total || 0, deliveries });
  } catch (err) { next(err); }
});

// GET /api/orders/:id  — admin
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = isNaN(req.params.id) ? undefined : Number(req.params.id);
    const order = await prisma.order.findFirst({
      where: id ? { id } : { publicId: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
    res.json(order);
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status  — admin
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const VALID_STATUSES = ["Recebido", "Em preparo", "Pronto", "Entregue", "Cancelado"];
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Status inválido. Use: ${VALID_STATUSES.join(", ")}` });

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { items: true },
    });
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;

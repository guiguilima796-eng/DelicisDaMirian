// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Semeando banco de dados...");

  // Admin user
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { username: "mirian" },
    update: {},
    create: { username: "mirian", passwordHash: hash },
  });

  // Store config
  await prisma.storeConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // Menu items
  const items = [
    { name: "X-Burguer da Mirian", description: "Blend 180g grelhado, cheddar derretido, alface americana, tomate e molho especial da casa", price: 22.90, category: "Lanches", image: "🍔", badge: "🏆 Mais pedido", sortOrder: 1 },
    { name: "X-Frango Crispy", description: "Peito de frango empanado e crocante, queijo, alface, tomate e maionese temperada", price: 19.90, category: "Lanches", image: "🥪", sortOrder: 2 },
    { name: "X-Bacon Duplo", description: "Dois blends 150g, bacon artesanal defumado, queijo duplo e molho barbecue", price: 28.90, category: "Lanches", image: "🍔", badge: "⭐ Especial", sortOrder: 3 },
    { name: "Hot Dog Gourmet", description: "Salsicha defumada premium, purê de batata, vinagrete, milho e batata palha", price: 16.90, category: "Lanches", image: "🌭", sortOrder: 4 },
    { name: "Misto Quente Especial", description: "Presunto, mussarela e requeijão cremoso em pão de forma artesanal grelhado", price: 12.90, category: "Lanches", image: "🥪", sortOrder: 5 },
    { name: "Batata Frita Rústica", description: "Porção generosa com sal grosso e ervas finas. Sequinha e crocante do jeitinho certo", price: 18.00, category: "Porções", image: "🍟", badge: "🏆 Mais pedido", sortOrder: 6 },
    { name: "Isca de Frango", description: "Iscas empanadas artesanais com molho de alho e limão siciliano", price: 22.00, category: "Porções", image: "🍗", sortOrder: 7 },
    { name: "Calabresa Acebolada", description: "Calabresa artesanal grelhada na chapa com cebola caramelizada no azeite", price: 24.00, category: "Porções", image: "🌮", sortOrder: 8 },
    { name: "Suco Natural 500ml", description: "Laranja, maracujá, manga, acerola ou melancia — extraído na hora sem conservantes", price: 8.00, category: "Bebidas", image: "🥤", sortOrder: 9 },
    { name: "Refrigerante Lata", description: "Coca-Cola, Guaraná Antarctica, Sprite ou Fanta Uva bem gelados", price: 5.00, category: "Bebidas", image: "🥫", sortOrder: 10 },
    { name: "Vitamina de Banana", description: "Vitamina cremosa feita com banana, leite integral e mel puro da serra", price: 9.00, category: "Bebidas", image: "🍌", sortOrder: 11 },
    { name: "Água Mineral 500ml", description: "Água cristalina com ou sem gás, bem gelada", price: 3.00, category: "Bebidas", image: "💧", sortOrder: 12 },
    { name: "Sorvete 2 Bolas", description: "Chocolate, baunilha, morango ou creme. Com calda e granulado colorido", price: 10.00, category: "Sobremesas", image: "🍦", sortOrder: 13 },
    { name: "Pudim da Mirian", description: "Receita exclusiva da casa, com calda de caramelo artesanal feita no cobre", price: 8.00, category: "Sobremesas", image: "🍮", badge: "✨ Exclusivo", sortOrder: 14 },
    { name: "Brownie com Sorvete", description: "Brownie quentinho de chocolate meio amargo com bola de sorvete de creme", price: 14.00, category: "Sobremesas", image: "🍫", sortOrder: 15 },
  ];

  for (const item of items) {
    await prisma.menuItem.create({ data: item });
  }

  console.log("✅ Banco semeado com sucesso!");
  console.log("👤 Admin: mirian / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

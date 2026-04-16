// src/App.jsx  –  Delícias da Mirian · Frontend Completo
import { useState, useEffect, useRef } from "react";
import { api } from "./api/client";

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, r = d => d * Math.PI / 180;
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const ALL_CATEGORIES = ["Todos", "Lanches", "Porções", "Bebidas", "Sobremesas"];
const EMOJIS = ["🍔","🥪","🌭","🍗","🍕","🥗","🌮","🌯","🍟","🧅","🍳","🥞","🧇","🥓","🍝","🍜","🍛","🍲","🥘","🍦","🍧","🍩","🍪","🎂","🍮","🍭","🍫","🍬","🥤","🧃","🧋","☕","🍵","🥛","💧","🥫","🍺","🍹","🥂","🫙","🥐","🥖","🧁","🍰","🎂"];

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #FDF8F0; color: #1A0E05; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #F5EDE0; } ::-webkit-scrollbar-thumb { background: #C8622A; border-radius: 3px; }

  @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }

  .slide-in{animation:slideIn .35s cubic-bezier(.16,1,.3,1)}
  .slide-up{animation:slideUp .3s ease}
  .fade-in{animation:fadeIn .2s ease}
  .spin{animation:spin .7s linear infinite; display:inline-block}
  .bounce{animation:bounce 2s ease-in-out infinite}

  .menu-card{transition:transform .2s,box-shadow .2s; background:white; border-radius:16px; border:1px solid #F0E0CC; overflow:hidden; display:flex; flex-direction:column;}
  .menu-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(200,98,42,.12)}

  .btn-p{background:#C8622A;color:white;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;transition:all .2s;padding:10px 22px;border-radius:10px;font-size:14px;}
  .btn-p:hover:not(:disabled){background:#A34E1F;transform:translateY(-1px)}
  .btn-p:active:not(:disabled){transform:scale(.97)}
  .btn-p:disabled{background:#C8966A;cursor:not-allowed}

  .btn-g{background:transparent;border:1.5px solid #C8622A;color:#C8622A;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s;padding:10px 22px;border-radius:10px;font-size:14px;}
  .btn-g:hover{background:#FFF0E8}

  .btn-d{background:transparent;border:1.5px solid #B71C1C;color:#B71C1C;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s;padding:7px 14px;border-radius:8px;font-size:12px;}
  .btn-d:hover{background:#FFEBEE}

  .tab{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;padding:8px 18px;border-radius:24px;transition:all .2s;color:#8B6E5A;font-size:14px;white-space:nowrap;}
  .tab.on{background:#C8622A;color:white}
  .tab:hover:not(.on){background:#F5EDE0;color:#1A0E05}

  .qty-btn{width:28px;height:28px;border-radius:50%;border:1.5px solid #C8622A;background:none;color:#C8622A;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-weight:600;line-height:1}
  .qty-btn:hover{background:#C8622A;color:white}

  .overlay{position:fixed;inset:0;background:rgba(26,14,5,.55);z-index:100;backdrop-filter:blur(3px);animation:fadeIn .2s}

  input,textarea,select{font-family:'DM Sans',sans-serif;width:100%;padding:10px 14px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;background:white;color:#1A0E05;outline:none;transition:border-color .2s;}
  input:focus,textarea:focus,select:focus{border-color:#C8622A}

  .toggle{position:relative;width:52px;height:28px;background:#D4BCA8;border-radius:14px;cursor:pointer;transition:background .3s;border:none;outline:none;flex-shrink:0}
  .toggle.on{background:#C8622A}
  .toggle::after{content:'';position:absolute;top:4px;left:4px;width:20px;height:20px;background:white;border-radius:50%;transition:transform .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 1px 3px rgba(0,0,0,.2)}
  .toggle.on::after{transform:translateX(24px)}

  .nav-item{display:flex;align-items:center;gap:10px;padding:12px 16px;color:#A88A76;cursor:pointer;transition:all .2s;border-radius:10px;font-size:14px;font-weight:500;background:none;border:none;font-family:'DM Sans',sans-serif;width:100%;text-align:left}
  .nav-item:hover,.nav-item.on{background:rgba(200,98,42,.15);color:#F4A535}

  .emoji-opt{width:38px;height:38px;border:1.5px solid #E8D5C0;border-radius:8px;background:white;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .emoji-opt:hover,.emoji-opt.on{border-color:#C8622A;background:#FFF0E8}

  .img-tab{padding:7px 18px;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:#8B6E5A;border-bottom:2px solid transparent;transition:all .2s;font-weight:500}
  .img-tab.on{color:#C8622A;border-bottom-color:#C8622A}

  .menu-admin-card{background:#1A0E05;border-radius:14px;border:1px solid #3D1F0D;overflow:hidden;transition:border-color .2s}
  .menu-admin-card:hover{border-color:#6B3020}

  @media(max-width:768px){.hero-h{font-size:32px!important}.mg{grid-template-columns:1fr!important}.adm-layout{flex-direction:column}.adm-side{min-height:auto!important;width:100%!important}}
`;

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("customer");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin_token"));
  const [menu, setMenu] = useState([]);
  const [store, setStore] = useState({ storeOpen: true, acceptOrders: true, deliveryRadius: 2, deliveryFee: 5 });
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    Promise.all([api.getMenu(), api.getStore()])
      .then(([m, s]) => { setMenu(m); setStore(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refresh orders when entering admin
  const loadAdminData = async () => {
    try {
      const [{ orders }, s, st] = await Promise.all([
        api.getOrders({ limit: 100 }),
        api.getStore(),
        api.getOrderStats(),
      ]);
      setOrders(orders);
      setStore(s);
      setStats(st);
    } catch (err) {
      if (err.message.includes("401")) { logout(); }
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdminToken(null);
    setView("customer");
  };

  const handleLogin = async (token) => {
    localStorage.setItem("admin_token", token);
    setAdminToken(token);
    await loadAdminData();
  };

  const updateStoreStatus = async (updates) => {
    const updated = { ...store, ...updates };
    setStore(updated);
    await api.updateStore(updates);
  };

  const updateOrderStatus = async (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await api.updateOrderStatus(id, status);
    const st = await api.getOrderStats();
    setStats(st);
  };

  const onOrderPlaced = (order) => {
    setToast(order);
  };

  const handleMenuSave = async () => {
    const m = await api.getMenu(true);
    setMenu(m);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#1A0E05", color: "#F4A535", fontFamily: "'Playfair Display',serif", fontSize: 20, gap: 12 }}>
      <span className="spin">🍔</span> Carregando...
    </div>
  );

  if (view === "admin") {
    if (!adminToken) return <AdminLogin onLogin={handleLogin} onBack={() => setView("customer")} />;
    return (
      <AdminDashboard
        store={store} updateStoreStatus={updateStoreStatus}
        orders={orders} updateOrderStatus={updateOrderStatus}
        stats={stats} onRefresh={loadAdminData}
        menuItems={menu} onMenuSave={handleMenuSave}
        onBack={() => setView("customer")} onLogout={logout}
      />
    );
  }

  return (
    <>
      <CustomerApp
        menu={menu.filter(i => i.available)}
        store={store}
        onOrderPlaced={onOrderPlaced}
        onAdmin={() => { setView("admin"); if (adminToken) loadAdminData(); }}
      />
      {toast && <OrderToast order={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}

// ── Customer App ──────────────────────────────────────────────────────────────
function CustomerApp({ menu, store, onOrderPlaced, onAdmin }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (item) =>
    setCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  const updateQty = (id, d) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0));

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const isOpen = store.storeOpen && store.acceptOrders;

  const cats = ["Todos", ...new Set(menu.map(i => i.category))];
  const filtered = activeCategory === "Todos" ? menu : menu.filter(i => i.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: "#FDF8F0" }}>
      {/* Header */}
      <header style={{ background: "#1A0E05", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 16px rgba(0,0,0,.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#F4A535,#C8622A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍽</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#F4A535", lineHeight: 1 }}>Delícias da Mirian</div>
              <div style={{ fontSize: 11, color: "#A88A76", letterSpacing: ".08em", marginTop: 2 }}>LANCHONETE & PORÇÕES</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOpen ? "#4CAF50" : "#F44336", boxShadow: isOpen ? "0 0 8px #4CAF50" : "none" }} />
              <span style={{ fontSize: 12, color: isOpen ? "#A5D6A7" : "#EF9A9A", fontWeight: 500 }}>
                {isOpen ? "Aberto · Aceitando pedidos" : "Pedidos pausados"}
              </span>
            </div>
            <button onClick={() => setShowCart(true)} className="btn-p" style={{ padding: "9px 18px", display: "flex", alignItems: "center", gap: 8 }}>
              🛒 {cartCount > 0 && <span style={{ background: "#F4A535", color: "#1A0E05", borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
              Carrinho {cartTotal > 0 && `· R$ ${cartTotal.toFixed(2).replace(".", ",")}`}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#3D1F0D 0%,#6B3020 50%,#C8622A 100%)", padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "radial-gradient(circle at 25% 25%,white 1px,transparent 1px),radial-gradient(circle at 75% 75%,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }} className="bounce">🍔</div>
          <h1 className="hero-h" style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 16 }}>
            Sabor que traz<br /><span style={{ color: "#F4A535" }}>saudade de casa</span>
          </h1>
          <p style={{ color: "#E8C8A8", fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Feito com carinho, na hora, do jeito que você gosta. Entrega até {store.deliveryRadius}km ou retire no local.
          </p>
          <button onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} className="btn-p" style={{ padding: "14px 36px", borderRadius: 32, fontSize: 16 }}>
            Ver Cardápio ↓
          </button>
        </div>
      </section>

      {/* Info strip */}
      <div style={{ background: "#3D1F0D", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {[["🛵", "Entrega até " + store.deliveryRadius + "km", `Taxa R$ ${store.deliveryFee?.toFixed(2).replace(".", ",")}`], ["📍", "Retirada grátis", store.storeAddress || ""], ["📞", "WhatsApp", store.storePhone || ""]].map(([ic, l, s]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
              <span style={{ fontSize: 20 }}>{ic}</span>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{l}</div><div style={{ fontSize: 12, color: "#A88A76" }}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <main id="menu" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: "#1A0E05", marginBottom: 6 }}>Nosso Cardápio</h2>
          <p style={{ color: "#8B6E5A", fontSize: 15 }}>Preparado com ingredientes frescos, sempre na hora do pedido</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
          {cats.map(c => <button key={c} className={`tab ${activeCategory === c ? "on" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>)}
        </div>
        <div className="mg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {filtered.map((item, i) => <MenuCard key={item.id} item={item} onAdd={addToCart} canOrder={isOpen} delay={i * 40} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#8B6E5A" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍽</div>
            <div>Nenhum item disponível nesta categoria</div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "#1A0E05", color: "#8B6E5A", textAlign: "center", padding: "32px 24px", fontSize: 13 }}>
        <div style={{ marginBottom: 8, fontFamily: "'Playfair Display',serif", color: "#F4A535", fontSize: 18 }}>Delícias da Mirian</div>
        <div>{store.storeAddress} · {store.storePhone}</div>
        <div style={{ marginTop: 16, borderTop: "1px solid #3D1F0D", paddingTop: 16 }}>
          <button onClick={onAdmin} style={{ background: "none", border: "none", color: "#4A3020", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans'" }}>⚙ Painel Administrativo</button>
        </div>
      </footer>

      {showCart && <><div className="overlay" onClick={() => setShowCart(false)} /><CartSidebar cart={cart} updateQty={updateQty} total={cartTotal} onClose={() => setShowCart(false)} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} canOrder={isOpen} /></>}
      {showCheckout && <><div className="overlay" onClick={() => setShowCheckout(false)} /><CheckoutModal cart={cart} total={cartTotal} store={store} onClose={() => setShowCheckout(false)} onPlaceOrder={(o) => { onOrderPlaced(o); setCart([]); setShowCheckout(false); }} /></>}
    </div>
  );
}

// ── Menu Card ─────────────────────────────────────────────────────────────────
function MenuCard({ item, onAdd, canOrder, delay }) {
  const [added, setAdded] = useState(false);
  const isUrl = item.image?.startsWith("/") || item.image?.startsWith("http");

  const handle = () => {
    if (!canOrder) return;
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div className="menu-card fade-in" style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}>
      <div style={{ height: 120, background: "linear-gradient(135deg,#FDF0E0,#F5E0C8)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {isUrl
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 52 }}>{item.image}</span>}
        {item.badge && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "#1A0E05", color: "#F4A535", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{item.badge}</div>
        )}
      </div>
      <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: "#C8622A", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{item.category}</div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{item.name}</h3>
        <p style={{ fontSize: 13, color: "#8B6E5A", lineHeight: 1.6, flex: 1 }}>{item.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#C8622A" }}>R$ {item.price.toFixed(2).replace(".", ",")}</span>
          <button onClick={handle} className="btn-p" disabled={!canOrder} style={{ padding: "9px 18px", borderRadius: 24, fontSize: 13 }}>
            {added ? "✓ Adicionado!" : "+ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cart Sidebar ──────────────────────────────────────────────────────────────
function CartSidebar({ cart, updateQty, total, onClose, onCheckout, canOrder }) {
  return (
    <div className="slide-in" style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 400, maxWidth: "100vw", background: "white", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.15)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0E0CC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>🛒 Seu Pedido</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8B6E5A" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#A88A76" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
            <div style={{ fontWeight: 500 }}>Carrinho vazio</div>
          </div>
        ) : cart.map(item => (
          <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F5EDE0" }}>
            <div style={{ width: 48, height: 48, background: "#FDF0E0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
              {item.image?.startsWith("/") || item.image?.startsWith("http")
                ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : item.image}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "#C8622A", fontWeight: 600 }}>R$ {(item.price * item.qty).toFixed(2).replace(".", ",")}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
              <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "20px 24px", borderTop: "1px solid #F0E0CC", background: "#FFFBF5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 17, fontWeight: 700 }}>
          <span style={{ fontFamily: "'Playfair Display',serif" }}>Total</span>
          <span style={{ color: "#C8622A", fontFamily: "'Playfair Display',serif" }}>R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
        <button onClick={onCheckout} className="btn-p" disabled={cart.length === 0 || !canOrder} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15 }}>
          {canOrder ? "Finalizar Pedido →" : "Pedidos pausados"}
        </button>
      </div>
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ cart, total, store, onClose, onPlaceOrder }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("delivery");
  const [form, setForm] = useState({ name: "", phone: "", address: "", complement: "", note: "" });
  const [geoStatus, setGeoStatus] = useState(null);
  const [geoKm, setGeoKm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkGeo = () => {
    setGeoStatus("checking");
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(pos.coords.latitude, pos.coords.longitude, store.storeLat || -6.7674, store.storeLng || -43.015);
        setGeoKm(d.toFixed(2));
        setGeoStatus(d <= (store.deliveryRadius || 2) ? "ok" : "far");
      },
      () => setGeoStatus("error"),
      { timeout: 8000 }
    );
  };

  const deliveryFee = type === "delivery" ? (store.deliveryFee || 5) : 0;
  const grandTotal = total + deliveryFee;

  const confirm = async () => {
    setLoading(true);
    setError("");
    try {
      const order = await api.createOrder({
        customerName: form.name,
        phone: form.phone,
        type,
        address: form.address || null,
        complement: form.complement || null,
        note: form.note || null,
        items: cart.map(c => ({ menuItemId: c.id, name: c.name, price: c.price, quantity: c.qty })),
      });
      onPlaceOrder(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canNext2 = form.name.trim() && form.phone.trim() && (type === "pickup" || form.address.trim());

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 102, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="slide-up" style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #F0E0CC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>Finalizar Pedido</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[1,2,3].map(s => <div key={s} style={{ height: 4, borderRadius: 2, flex: 1, background: s <= step ? "#C8622A" : "#F0E0CC", transition: "background .3s" }} />)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8B6E5A" }}>✕</button>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="fade-in">
              <p style={{ fontWeight: 600, marginBottom: 16, color: "#3D1F0D" }}>Como deseja receber?</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {[["delivery","🛵","Entrega",`Taxa R$ ${deliveryFee.toFixed(2).replace(".",",")} · até ${store.deliveryRadius || 2}km`],["pickup","📍","Retirada","Grátis · no estabelecimento"]].map(([v,ic,l,s]) => (
                  <div key={v} onClick={() => setType(v)} style={{ flex: 1, border: `2px solid ${type === v ? "#C8622A" : "#E8D5C0"}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", background: type === v ? "#FFF8F4" : "white", transition: "all .2s" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{ic}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: type === v ? "#C8622A" : "#1A0E05" }}>{l}</div>
                    <div style={{ fontSize: 12, color: "#8B6E5A", marginTop: 4 }}>{s}</div>
                  </div>
                ))}
              </div>
              {type === "delivery" && (
                <div style={{ background: "#FFF3E0", borderRadius: 12, padding: 16, marginBottom: 16, borderLeft: "3px solid #F4A535" }}>
                  <div style={{ fontSize: 13, color: "#7A4520", fontWeight: 500, marginBottom: 10 }}>📍 Verifique se você está na área de entrega (máx. {store.deliveryRadius || 2}km)</div>
                  {geoStatus === null && <button onClick={checkGeo} className="btn-g" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13 }}>Verificar minha localização</button>}
                  {geoStatus === "checking" && <span style={{ fontSize: 13, color: "#8B6E5A" }}><span className="spin">⟳</span> Verificando...</span>}
                  {geoStatus === "ok" && <div style={{ color: "#2E7D32", fontWeight: 600, fontSize: 13 }}>✓ Você está a {geoKm}km — entrega disponível!</div>}
                  {geoStatus === "far" && <div style={{ color: "#C62828", fontWeight: 600, fontSize: 13 }}>✗ Você está a {geoKm}km — fora do raio. Opte pela retirada.</div>}
                  {geoStatus === "error" && <div style={{ color: "#8B6E5A", fontSize: 13 }}>Informe o endereço e entraremos em contato para confirmar.</div>}
                </div>
              )}
              <button onClick={() => setStep(2)} className="btn-p" style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 15 }}>Continuar →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="fade-in">
              <p style={{ fontWeight: 600, marginBottom: 20, color: "#3D1F0D" }}>Seus dados</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Nome completo *", "name", "text", "Seu nome"], ["WhatsApp *", "phone", "tel", "(89) 9 9999-9999"]].map(([l, f, t, p]) => (
                  <div key={f}><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>{l.toUpperCase()}</label>
                    <input type={t} placeholder={p} value={form[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))} /></div>
                ))}
                {type === "delivery" && (
                  <>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>ENDEREÇO *</label>
                      <input placeholder="Rua, número, bairro" value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>COMPLEMENTO</label>
                      <input placeholder="Apartamento, ponto de referência..." value={form.complement} onChange={e => setForm(prev => ({ ...prev, complement: e.target.value }))} /></div>
                  </>
                )}
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>OBSERVAÇÕES</label>
                  <textarea placeholder="Sem cebola, ponto da carne..." rows={3} value={form.note} onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))} style={{ resize: "none" }} /></div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(1)} className="btn-g" style={{ flex: 1, padding: "12px", borderRadius: 12 }}>← Voltar</button>
                <button onClick={() => setStep(3)} className="btn-p" disabled={!canNext2} style={{ flex: 2, padding: "12px", borderRadius: 12 }}>Revisar →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="fade-in">
              <p style={{ fontWeight: 600, marginBottom: 20, color: "#3D1F0D" }}>Resumo do pedido</p>
              <div style={{ background: "#FFFBF5", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #F0E0CC" }}>
                {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span>{i.qty}x {i.name}</span><span style={{ fontWeight: 600, color: "#C8622A" }}>R$ {(i.price * i.qty).toFixed(2).replace(".", ",")}</span></div>)}
                <div style={{ borderTop: "1px dashed #E8D5C0", marginTop: 12, paddingTop: 12 }}>
                  {type === "delivery" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#8B6E5A", marginBottom: 4 }}><span>Entrega</span><span>R$ {deliveryFee.toFixed(2).replace(".", ",")}</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700 }}>
                    <span style={{ fontFamily: "'Playfair Display',serif" }}>Total</span>
                    <span style={{ color: "#C8622A", fontFamily: "'Playfair Display',serif" }}>R$ {grandTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: "#F5EDE0", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
                <div><strong>{type === "delivery" ? "🛵 Entrega para:" : "📍 Retirada no local"}</strong></div>
                {type === "delivery" && <div style={{ color: "#5A3820", marginTop: 4 }}>{form.address}{form.complement && `, ${form.complement}`}</div>}
                <div style={{ marginTop: 6 }}><strong>Cliente:</strong> {form.name} · {form.phone}</div>
                {form.note && <div style={{ marginTop: 4 }}><strong>Obs:</strong> {form.note}</div>}
              </div>
              <div style={{ background: "#FFF3E0", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, color: "#7A4520" }}>
                💳 <strong>Pagamento na {type === "delivery" ? "entrega" : "retirada"}</strong> — dinheiro, Pix ou cartão
              </div>
              {error && <div style={{ background: "#FFEBEE", borderRadius: 8, padding: "10px 14px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(2)} className="btn-g" style={{ flex: 1, padding: "12px", borderRadius: 12 }}>← Editar</button>
                <button onClick={confirm} className="btn-p" disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 12, fontSize: 15 }}>
                  {loading ? <><span className="spin">⟳</span> Enviando...</> : "✓ Confirmar Pedido"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Order Toast ───────────────────────────────────────────────────────────────
function OrderToast({ order, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 8000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 200 }} className="slide-up">
      <div style={{ background: "#1A0E05", color: "white", borderRadius: 16, padding: "18px 28px", boxShadow: "0 8px 32px rgba(0,0,0,.3)", minWidth: 300, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: "#F4A535", marginBottom: 4 }}>Pedido #{order.publicId} recebido!</div>
        <div style={{ fontSize: 13, color: "#A88A76" }}>Total: R$ {order.total.toFixed(2).replace(".", ",")} · {order.type === "delivery" ? "Entrega" : "Retirada"}</div>
        <div style={{ fontSize: 12, color: "#8B6E5A", marginTop: 4 }}>Entraremos em contato pelo WhatsApp</div>
        <button onClick={onDismiss} style={{ marginTop: 12, background: "none", border: "1px solid #4A3020", color: "#8B6E5A", padding: "6px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'" }}>Fechar</button>
      </div>
    </div>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBack }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!form.username || !form.password) { setError("Preencha usuário e senha."); return; }
    setLoading(true); setError("");
    try {
      const { token } = await api.login(form.username, form.password);
      await onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0705", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="slide-up" style={{ background: "#1A0E05", borderRadius: 24, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,.5)", border: "1px solid #3D1F0D" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#F4A535" }}>Área Administrativa</div>
          <div style={{ color: "#5A3820", fontSize: 13, marginTop: 6 }}>Delícias da Mirian</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>USUÁRIO</label>
            <input placeholder="mirian" value={form.username} onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setError(""); }}
              style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>SENHA</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(""); }}
              onKeyDown={e => e.key === "Enter" && login()}
              style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
        </div>
        {error && <div style={{ background: "rgba(198,40,40,.15)", borderRadius: 8, padding: "10px 14px", color: "#EF9A9A", fontSize: 13, marginTop: 12 }}>⚠ {error}</div>}
        <button onClick={login} className="btn-p" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, marginTop: 20 }}>
          {loading ? <><span className="spin">⟳</span> Entrando...</> : "Entrar no Painel"}
        </button>
        <button onClick={onBack} style={{ width: "100%", marginTop: 16, background: "none", border: "none", color: "#5A3820", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans'" }}>← Voltar ao site</button>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ store, updateStoreStatus, orders, updateOrderStatus, stats, onRefresh, menuItems, onMenuSave, onBack, onLogout }) {
  const [tab, setTab] = useState("overview");

  const navItems = [
    { id: "overview", ic: "📊", label: "Visão Geral" },
    { id: "orders", ic: "📋", label: "Pedidos" },
    { id: "menu", ic: "🍔", label: "Cardápio" },
    { id: "settings", ic: "⚙️", label: "Configurações" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0705", display: "flex" }} className="adm-layout">
      {/* Sidebar */}
      <div className="adm-side" style={{ width: 240, padding: "28px 16px", background: "#1A0E05", flexShrink: 0 }}>
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#F4A535" }}>Delícias da Mirian</div>
          <div style={{ fontSize: 11, color: "#4A3020", marginTop: 2 }}>PAINEL ADMINISTRATIVO</div>
        </div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); if (item.id !== "menu") onRefresh(); }} className={`nav-item ${tab === item.id ? "on" : ""}`}>
            <span style={{ fontSize: 16 }}>{item.ic}</span> {item.label}
          </button>
        ))}
        <div style={{ marginTop: 20, borderTop: "1px solid #2A1205", paddingTop: 20 }}>
          <button onClick={onBack} className="nav-item"><span>↩</span> Ver Site</button>
          <button onClick={onLogout} className="nav-item" style={{ color: "#EF9A9A" }}><span>🚪</span> Sair</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>
        {tab === "overview" && <OverviewTab store={store} updateStoreStatus={updateStoreStatus} orders={orders} updateOrderStatus={updateOrderStatus} stats={stats} />}
        {tab === "orders" && <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} onRefresh={onRefresh} />}
        {tab === "menu" && <MenuManagerTab menuItems={menuItems} onSave={onMenuSave} />}
        {tab === "settings" && <SettingsTab store={store} updateStoreStatus={updateStoreStatus} />}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ store, updateStoreStatus, orders, updateOrderStatus, stats }) {
  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 26, marginBottom: 6 }}>Visão Geral</h2>
      <p style={{ color: "#5A3820", fontSize: 14, marginBottom: 28 }}>Resumo do dia e controles rápidos</p>

      {/* Store controls */}
      <div style={{ background: "#1A0E05", borderRadius: 16, padding: "20px 24px", marginBottom: 24, border: "1px solid #3D1F0D" }}>
        <h3 style={{ color: "#F4A535", fontSize: 15, fontWeight: 600, marginBottom: 20 }}>🎛 Controle da Loja</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[[store.storeOpen, "storeOpen", "Loja Aberta", "Cardápio visível para clientes"], [store.acceptOrders, "acceptOrders", "Aceitar Pedidos", "Pausar em horários de pico"]].map(([val, key, lbl, sub]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#0D0705", borderRadius: 12, border: `1px solid ${val ? "#4A2510" : "#2A1A10"}`, flex: 1, minWidth: 220 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{lbl}</div>
                <div style={{ color: "#5A3820", fontSize: 12, marginTop: 2 }}>{sub}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => updateStoreStatus({ [key]: !val })} className={`toggle ${val ? "on" : ""}`} />
                <div style={{ fontSize: 10, marginTop: 4, color: val ? "#A5D6A7" : "#EF9A9A", fontWeight: 600 }}>{val ? "ON" : "OFF"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[["📦","Pedidos Hoje", stats?.total ?? "—"],["⏳","Pendentes", stats?.pending ?? "—"],["💰","Faturamento", stats ? `R$ ${stats.revenue.toFixed(2).replace(".",",")}` : "—"],["🛵","Entregas", stats?.deliveries ?? "—"]].map(([ic,l,v]) => (
          <div key={l} style={{ background: "#1A0E05", borderRadius: 14, padding: "20px 18px", border: "1px solid #3D1F0D" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{ic}</div>
            <div style={{ color: "#5A3820", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", marginBottom: 4 }}>{l.toUpperCase()}</div>
            <div style={{ color: "#F4A535", fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: "#1A0E05", borderRadius: 16, border: "1px solid #3D1F0D", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #3D1F0D" }}>
          <h3 style={{ color: "white", fontSize: 15, fontWeight: 600 }}>Pedidos Recentes</h3>
        </div>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#3D1F0D" }}>
            <div style={{ fontSize: 40 }}>📭</div><div style={{ color: "#5A3820", marginTop: 8 }}>Nenhum pedido ainda</div>
          </div>
        ) : orders.slice(0, 6).map(o => <OrderRow key={o.id} order={o} onStatus={updateOrderStatus} />)}
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ orders, updateOrderStatus, onRefresh }) {
  const [filter, setFilter] = useState("all");
  const statuses = ["all", "Recebido", "Em preparo", "Pronto", "Entregue", "Cancelado"];
  const labels = { all: "Todos", Recebido: "Recebidos", "Em preparo": "Em Preparo", Pronto: "Prontos", Entregue: "Entregues", Cancelado: "Cancelados" };
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 26 }}>Pedidos</h2>
        <button onClick={onRefresh} className="btn-g" style={{ padding: "8px 16px", fontSize: 13, borderColor: "#4A3020", color: "#A88A76" }}>⟳ Atualizar</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {statuses.map(s => <button key={s} className={`tab ${filter === s ? "on" : ""}`} onClick={() => setFilter(s)} style={{ fontSize: 13 }}>{labels[s]}</button>)}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#3D1F0D" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ color: "#5A3820" }}>Nenhum pedido neste filtro</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(o => <OrderRow key={o.id} order={o} onStatus={updateOrderStatus} expanded />)}
        </div>
      )}
    </div>
  );
}

// ── Order Row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatus, expanded: startExpanded = false }) {
  const [open, setOpen] = useState(startExpanded);
  const [loading, setLoading] = useState(false);
  const nextStatus = { Recebido: "Em preparo", "Em preparo": "Pronto", Pronto: "Entregue" };
  const statusColor = { Recebido: "#FFF3E0:#E65100", "Em preparo": "#FFF3E0:#E65100", Pronto: "#E8F5E9:#2E7D32", Entregue: "#E8EAF6:#3949AB", Cancelado: "#FFEBEE:#C62828" };
  const [bg, fg] = (statusColor[order.status] || "#F5F5F5:#666").split(":");

  const advance = async () => {
    const next = nextStatus[order.status];
    if (!next) return;
    setLoading(true);
    await onStatus(order.id, next);
    setLoading(false);
  };

  return (
    <div style={{ background: "#0D0705", border: "1px solid #2A1A10", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ color: "#F4A535", fontWeight: 700, fontSize: 13 }}>{order.publicId}</span>
            <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{order.status}</span>
            <span style={{ fontSize: 11, color: "#4A3020" }}>{order.type === "delivery" ? "🛵 Entrega" : "📍 Retirada"}</span>
          </div>
          <div style={{ color: "#8B6E5A", fontSize: 13 }}>
            {order.customerName} · {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · <span style={{ color: "#F4A535", fontWeight: 600 }}>R$ {order.total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {nextStatus[order.status] && (
            <button onClick={e => { e.stopPropagation(); advance(); }} className="btn-p" disabled={loading} style={{ padding: "6px 14px", fontSize: 12, whiteSpace: "nowrap" }}>
              {loading ? "..." : `→ ${nextStatus[order.status]}`}
            </button>
          )}
          <span style={{ color: "#3D1F0D", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: "12px 18px 16px", borderTop: "1px solid #1A0E05" }} className="fade-in">
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8B6E5A", padding: "4px 0" }}>
              <span>{item.quantity}x {item.name}</span>
              <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
          {order.address && <div style={{ fontSize: 12, color: "#5A3820", marginTop: 8 }}>📍 {order.address}{order.complement && `, ${order.complement}`}</div>}
          {order.phone && <div style={{ fontSize: 12, color: "#5A3820", marginTop: 4 }}>📱 {order.phone}</div>}
          {order.note && <div style={{ fontSize: 12, color: "#5A3820", marginTop: 4 }}>💬 {order.note}</div>}
          {order.status !== "Cancelado" && order.status !== "Entregue" && (
            <button onClick={() => onStatus(order.id, "Cancelado")} className="btn-d" style={{ marginTop: 12, fontSize: 12 }}>Cancelar pedido</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Menu Manager Tab ──────────────────────────────────────────────────────────
function MenuManagerTab({ menuItems, onSave }) {
  const [items, setItems] = useState(menuItems);
  const [filterCat, setFilterCat] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => { setItems(menuItems); }, [menuItems]);

  const filteredItems = filterCat === "Todos" ? items : items.filter(i => i.category === filterCat);

  const handleToggle = async (item) => {
    setSaving(item.id);
    const fd = new FormData();
    fd.append("available", String(!item.available));
    fd.append("image", item.image);
    try {
      await api.updateMenuItem(item.id, fd);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
      await onSave();
    } catch (err) { alert("Erro: " + err.message); }
    setSaving(null);
  };

  const handleDelete = async (item) => {
    try {
      await api.deleteMenuItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setDeleteTarget(null);
      await onSave();
    } catch (err) { alert("Erro: " + err.message); }
  };

  const handleSaved = async (savedItem, isNew) => {
    if (isNew) setItems(prev => [...prev, savedItem]);
    else setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
    setShowModal(false);
    setEditItem(null);
    await onSave();
  };

  const cats = ["Todos", ...new Set(items.map(i => i.category))];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 26, marginBottom: 4 }}>Cardápio</h2>
          <p style={{ color: "#5A3820", fontSize: 14 }}>{items.length} itens cadastrados · {items.filter(i => i.available).length} disponíveis</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-p" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          + Novo Item
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {cats.map(c => <button key={c} className={`tab ${filterCat === c ? "on" : ""}`} onClick={() => setFilterCat(c)} style={{ fontSize: 13 }}>{c}</button>)}
      </div>

      {/* Items grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {filteredItems.map(item => {
          const isUrl = item.image?.startsWith("/") || item.image?.startsWith("http");
          return (
            <div key={item.id} className="menu-admin-card">
              {/* Image area */}
              <div style={{ height: 100, background: "#0D0705", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {isUrl
                  ? <img src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001"}${item.image}`} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: item.available ? 1 : .5 }} />
                  : <span style={{ fontSize: 44, opacity: item.available ? 1 : .5 }}>{item.image}</span>}
                {!item.available && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#EF9A9A", fontWeight: 700, fontSize: 13, letterSpacing: ".05em" }}>INDISPONÍVEL</span>
                  </div>
                )}
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#C8622A", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>{item.category}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                  </div>
                  <div style={{ color: "#F4A535", fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#5A3820", lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>
                {item.badge && <div style={{ fontSize: 11, color: "#F4A535", marginBottom: 10 }}>{item.badge}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Toggle availability */}
                  <button onClick={() => handleToggle(item)} className={`toggle ${item.available ? "on" : ""}`} disabled={saving === item.id} style={{ opacity: saving === item.id ? .5 : 1 }} title={item.available ? "Desativar" : "Ativar"} />
                  <span style={{ fontSize: 11, color: item.available ? "#A5D6A7" : "#8B6E5A" }}>{item.available ? "Ativo" : "Inativo"}</span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} style={{ background: "none", border: "1px solid #4A3020", color: "#A88A76", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8622A"; e.currentTarget.style.color = "#F4A535"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#4A3020"; e.currentTarget.style.color = "#A88A76"; }}>
                    ✏ Editar
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="btn-d">🗑</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#3D1F0D" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
          <div style={{ color: "#5A3820" }}>Nenhum item nesta categoria</div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="overlay" onClick={() => { setShowModal(false); setEditItem(null); }} />
          <MenuItemModal item={editItem} onSaved={handleSaved} onClose={() => { setShowModal(false); setEditItem(null); }} />
        </>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <>
          <div className="overlay" onClick={() => setDeleteTarget(null)} />
          <div style={{ position: "fixed", inset: 0, zIndex: 102, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div className="slide-up" style={{ background: "#1A0E05", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", border: "1px solid #3D1F0D", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
              <div style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 20, marginBottom: 8 }}>Confirmar exclusão</div>
              <div style={{ color: "#8B6E5A", fontSize: 14, marginBottom: 24 }}>Tem certeza que deseja remover <strong style={{ color: "#F4A535" }}>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setDeleteTarget(null)} className="btn-g" style={{ flex: 1 }}>Cancelar</button>
                <button onClick={() => handleDelete(deleteTarget)} className="btn-d" style={{ flex: 1, padding: "10px", fontSize: 14 }}>🗑 Excluir</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Menu Item Modal ───────────────────────────────────────────────────────────
function MenuItemModal({ item, onSaved, onClose }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    category: item?.category || "Lanches",
    badge: item?.badge || "",
    available: item?.available !== false,
  });
  const [imageMode, setImageMode] = useState("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState(item?.image && !item.image.startsWith("/") ? item.image : "🍔");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image?.startsWith("/") ? `${import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:3001"}${item.image}` : null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setImageMode("file");
  };

  const generateDesc = async () => {
    if (!form.name) { setError("Digite o nome do item primeiro."); return; }
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          messages: [{ role: "user", content: `Crie uma descrição apetitosa e curta (máx 80 palavras) para o item de cardápio: "${form.name}" da categoria ${form.category}. Estilo: lanchonete brasileira, informal e convidativo. Retorne apenas a descrição, sem aspas ou markdown.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setForm(f => ({ ...f, description: text.trim() }));
    } catch { setError("Erro ao gerar descrição com IA."); }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category) {
      setError("Preencha nome, descrição, preço e categoria."); return;
    }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("badge", form.badge.trim());
      fd.append("available", String(form.available));

      if (imageMode === "file" && imageFile) {
        fd.append("image", imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        fd.append("image", imageUrl.trim());
      } else {
        fd.append("image", selectedEmoji);
      }

      const saved = isEdit ? await api.updateMenuItem(item.id, fd) : await api.createMenuItem(fd);
      onSaved(saved, !isEdit);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 102, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div className="slide-up" style={{ background: "#1A0E05", borderRadius: 20, width: "100%", maxWidth: 560, border: "1px solid #3D1F0D", boxShadow: "0 24px 80px rgba(0,0,0,.5)" }}>
        {/* Header */}
        <div style={{ padding: "22px 26px", borderBottom: "1px solid #3D1F0D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", color: "#F4A535", fontSize: 20, fontWeight: 700 }}>
            {isEdit ? "✏ Editar Item" : "+ Novo Item"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5A3820", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Image section */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 10, letterSpacing: ".08em" }}>IMAGEM DO ITEM</label>
            {/* Image mode tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #3D1F0D", marginBottom: 14 }}>
              {[["emoji","🎭 Emoji"],["file","📁 Upload"],["url","🔗 URL"]].map(([m,l]) => (
                <button key={m} onClick={() => setImageMode(m)} className={`img-tab ${imageMode === m ? "on" : ""}`}>{l}</button>
              ))}
            </div>

            {imageMode === "emoji" && (
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                  {EMOJIS.map(e => (
                    <button key={e} className={`emoji-opt ${selectedEmoji === e ? "on" : ""}`} onClick={() => setSelectedEmoji(e)}>{e}</button>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 40 }}>{selectedEmoji}</span>
                  <span style={{ color: "#5A3820", fontSize: 13 }}>Selecionado</span>
                </div>
              </div>
            )}

            {imageMode === "file" && (
              <div>
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed #3D1F0D", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", transition: "border-color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#C8622A"} onMouseLeave={e => e.currentTarget.style.borderColor = "#3D1F0D"}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, objectFit: "cover" }} />
                    : <div><div style={{ fontSize: 32, marginBottom: 8 }}>📷</div><div style={{ color: "#5A3820", fontSize: 13 }}>Clique para selecionar imagem</div><div style={{ color: "#3D1F0D", fontSize: 12, marginTop: 4 }}>JPG, PNG, WEBP até 5MB</div></div>}
                </div>
                <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/*" onChange={handleFile} />
              </div>
            )}

            {imageMode === "url" && (
              <input placeholder="https://exemplo.com/imagem.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} />
            )}
          </div>

          {/* Name + Category row */}
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6, letterSpacing: ".08em" }}>NOME *</label>
              <input placeholder="Ex: X-Burguer da Mirian" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6, letterSpacing: ".08em" }}>CATEGORIA *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }}>
                {["Lanches","Porções","Bebidas","Sobremesas"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description + AI */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", letterSpacing: ".08em" }}>DESCRIÇÃO *</label>
              <button onClick={generateDesc} disabled={aiLoading} style={{ background: "none", border: "1px solid #4A3020", color: aiLoading ? "#5A3820" : "#F4A535", padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {aiLoading ? <><span className="spin">✦</span> Gerando...</> : "✦ Gerar com IA"}
              </button>
            </div>
            <textarea rows={3} placeholder="Descreva o item de forma apetitosa..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white", resize: "none" }} />
          </div>

          {/* Price + Badge */}
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6, letterSpacing: ".08em" }}>PREÇO (R$) *</label>
              <input type="number" step="0.01" min="0" placeholder="22.90" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} />
            </div>
            <div style={{ flex: 1.5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6, letterSpacing: ".08em" }}>BADGE (opcional)</label>
              <input placeholder="🏆 Mais pedido" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} />
            </div>
          </div>

          {/* Available toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#0D0705", borderRadius: 10, border: "1px solid #2A1A10" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>Item disponível no cardápio</div>
              <div style={{ color: "#5A3820", fontSize: 12, marginTop: 2 }}>Desative para ocultar sem excluir</div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, available: !f.available }))} className={`toggle ${form.available ? "on" : ""}`} />
          </div>

          {error && <div style={{ background: "rgba(198,40,40,.15)", borderRadius: 8, padding: "10px 14px", color: "#EF9A9A", fontSize: 13 }}>⚠ {error}</div>}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button onClick={onClose} className="btn-g" style={{ flex: 1 }}>Cancelar</button>
            <button onClick={handleSubmit} className="btn-p" disabled={loading} style={{ flex: 2 }}>
              {loading ? <><span className="spin">⟳</span> Salvando...</> : (isEdit ? "💾 Salvar Alterações" : "✓ Criar Item")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ store, updateStoreStatus }) {
  const [form, setForm] = useState({ deliveryRadius: store.deliveryRadius || 2, deliveryFee: store.deliveryFee || 5, storeAddress: store.storeAddress || "", storePhone: store.storePhone || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateStoreStatus(form);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 26, marginBottom: 28 }}>Configurações</h2>

      <div style={{ background: "#1A0E05", borderRadius: 16, padding: "24px", border: "1px solid #3D1F0D", marginBottom: 20 }}>
        <h3 style={{ color: "#F4A535", fontSize: 15, marginBottom: 20, fontWeight: 600 }}>⏰ Status da Loja</h3>
        {[[store.storeOpen, "storeOpen", "Loja Visível", "Exibe o cardápio para os clientes"], [store.acceptOrders, "acceptOrders", "Aceitar Pedidos", "Habilitar/pausar novos pedidos"]].map(([val, key, lbl, desc], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i === 0 ? "1px solid #3D1F0D" : "none" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div><div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{lbl}</div><div style={{ color: "#5A3820", fontSize: 12, marginTop: 3 }}>{desc}</div></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button onClick={() => updateStoreStatus({ [key]: !val })} className={`toggle ${val ? "on" : ""}`} />
              <span style={{ fontSize: 10, color: val ? "#A5D6A7" : "#EF9A9A", fontWeight: 700 }}>{val ? "ATIVO" : "INATIVO"}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#1A0E05", borderRadius: 16, padding: "24px", border: "1px solid #3D1F0D", marginBottom: 20 }}>
        <h3 style={{ color: "#F4A535", fontSize: 15, marginBottom: 20, fontWeight: 600 }}>🛵 Entrega</h3>
        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>RAIO (KM)</label>
            <input type="number" step="0.5" min="0.5" value={form.deliveryRadius} onChange={e => setForm(f => ({ ...f, deliveryRadius: parseFloat(e.target.value) }))} style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>TAXA (R$)</label>
            <input type="number" step="0.50" min="0" value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: parseFloat(e.target.value) }))} style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>ENDEREÇO DA LOJA</label>
          <input value={form.storeAddress} onChange={e => setForm(f => ({ ...f, storeAddress: e.target.value }))} style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
        <div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#8B6E5A", display: "block", marginBottom: 6 }}>WHATSAPP</label>
          <input value={form.storePhone} onChange={e => setForm(f => ({ ...f, storePhone: e.target.value }))} style={{ background: "#0D0705", border: "1.5px solid #3D1F0D", color: "white" }} /></div>
        <button onClick={save} className="btn-p" disabled={saving} style={{ padding: "12px 28px" }}>
          {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}

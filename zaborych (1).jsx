import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════
// СТРОКИ 3-4: Supabase — вставьте свои ключи
// ═══════════════════════════════════════════════
const SUPABASE_URL = "https://uvgkxuuewduncphngtma.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Z2t4dXVld2R1bmNwaG5ndG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDIxNTYsImV4cCI6MjA5NTQ3ODE1Nn0.OsWgx6kktWXoqrs0CbQhpr3SN0oZE7REaFwfemIPEIQ";

// Универсальный клиент Supabase (без сторонних библиотек)
const db = {
  async get(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async update(table, id, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

const ORANGE = "#FF6B1A";
const ORANGE_DIM = "#CC5210";
const BG = "#0F0F0F";
const CARD = "#1A1A1A";
const CARD2 = "#222222";
const BORDER = "#2E2E2E";
const TEXT = "#F0F0F0";
const MUTED = "#888";
const SUCCESS = "#22C55E";
const WARN = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Unbounded:wght@700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${TEXT};font-family:'Golos Text',sans-serif;font-size:14px;line-height:1.5;min-height:100vh}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:${CARD}}
  ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:2px}
  input,select,textarea{background:${CARD2};border:1px solid ${BORDER};color:${TEXT};padding:8px 12px;border-radius:8px;font-family:'Golos Text',sans-serif;font-size:13px;outline:none;width:100%}
  input:focus,select:focus,textarea:focus{border-color:${ORANGE}}
  input[type=range]{padding:0;background:none;accent-color:${ORANGE}}
  button{cursor:pointer;font-family:'Golos Text',sans-serif;border:none;outline:none}
  select option{background:${CARD}}
`;

const initialPrices = {
  materials: {
    "3D сетка 1.5": { price: 450, unit: "м" },
    "3D сетка 1.8": { price: 520, unit: "м" },
    "Профлист": { price: 380, unit: "м" },
    "Штакетник 1.75": { price: 650, unit: "м" },
    "Штакетник 1.85": { price: 680, unit: "м" },
    "Штакетник 1.90": { price: 710, unit: "м" },
    "Штакетник 2.00": { price: 760, unit: "м" },
    "Труба 60×40": { price: 180, unit: "м" },
    "Труба несущая 60×60": { price: 320, unit: "шт" },
    "Щебень": { price: 2800, unit: "м³" },
    "Саморезы (уп.)": { price: 150, unit: "уп" },
    "Скобы (уп.)": { price: 120, unit: "уп" },
  },
  works: {
    "Монтаж секции": 250,
    "Монтаж столба": 400,
    "Демонтаж (м)": 180,
    "Доставка (км)": 45,
    "Монтаж калитки": 3500,
    "Монтаж ворот": 8000,
    "Автоматика ворот": 15000,
  },
  gates: {
    "Нет": 0,
    "Эконом": 8000,
    "Стандарт": 14000,
    "Премиум": 22000,
  },
  wickets: {
    "Нет": 0,
    "Эконом": 4500,
    "С замком": 7500,
  },
};

const initialWarehouse = [
  { id: 1, name: "3D сетка 1.8", qty: 450, unit: "м", minQty: 100, lastIn: "2025-04-10" },
  { id: 2, name: "Профлист", qty: 280, unit: "м", minQty: 80, lastIn: "2025-04-15" },
  { id: 3, name: "Труба 60×40", qty: 1200, unit: "м", minQty: 200, lastIn: "2025-04-08" },
  { id: 4, name: "Труба несущая 60×60", qty: 85, unit: "шт", minQty: 30, lastIn: "2025-04-12" },
  { id: 5, name: "Щебень", qty: 12, unit: "м³", minQty: 5, lastIn: "2025-04-18" },
  { id: 6, name: "Саморезы (уп.)", qty: 24, unit: "уп", minQty: 10, lastIn: "2025-04-05" },
  { id: 7, name: "Штакетник 1.75", qty: 60, unit: "м", minQty: 50, lastIn: "2025-04-20" },
];

const initialOrders = [
  {
    id: 1, client: "Алексей Морозов", phone: "+7 916 123-45-67", address: "МО, Красногорск, ул. Ленина 12",
    status: "монтаж", fenceType: "3D сетка 1.8", perimeter: 80, gates: "Стандарт", wicket: "С замком",
    demolition: true, delivery: 25, total: 124500, created: "2025-04-22", manager: "Иван П.",
    note: "Участок с уклоном, нужна доп. выемка"
  },
  {
    id: 2, client: "ООО ДачСтрой", phone: "+7 495 000-11-22", address: "МО, Истра, коттедж. пос. Березки",
    status: "расчет", fenceType: "Профлист", perimeter: 220, gates: "Премиум", wicket: "С замком",
    demolition: false, delivery: 55, total: 298000, created: "2025-04-28", manager: "Мария С.",
    note: ""
  },
  {
    id: 3, client: "Светлана Кузнецова", phone: "+7 926 555-00-11", address: "МО, Дмитров, СНТ Ромашка",
    status: "завершено", fenceType: "Штакетник 1.85", perimeter: 56, gates: "Нет", wicket: "Эконом",
    demolition: false, delivery: 40, total: 67800, created: "2025-04-10", manager: "Иван П.",
    note: ""
  },
  {
    id: 4, client: "Дмитрий Власов", phone: "+7 909 333-22-11", address: "МО, Пушкино, ул. Садовая 7",
    status: "замер", fenceType: "3D сетка 1.5", perimeter: 45, gates: "Эконом", wicket: "Нет",
    demolition: false, delivery: 30, total: 52300, created: "2025-05-01", manager: "Мария С.",
    note: "Клиент хочет ворота на пульт"
  },
];

const initialFinances = [
  { id: 1, type: "доход", category: "Оплата заказа", desc: "Кузнецова С.", amount: 67800, date: "2025-04-25" },
  { id: 2, type: "расход", category: "Материалы", desc: "Закупка трубы", amount: 24000, date: "2025-04-20" },
  { id: 3, type: "расход", category: "Зарплата", desc: "Монтажники апрель", amount: 85000, date: "2025-04-30" },
  { id: 4, type: "доход", category: "Аванс", desc: "Морозов А.", amount: 60000, date: "2025-05-02" },
  { id: 5, type: "расход", category: "Доставка", desc: "ТК Деловые Линии", amount: 8500, date: "2025-05-03" },
];

const employees = [
  { id: 1, name: "Иван Петров", role: "менеджер", phone: "+7 916 100-00-01", active: true },
  { id: 2, name: "Мария Семёнова", role: "менеджер", phone: "+7 916 100-00-02", active: true },
  { id: 3, name: "Олег Стрельников", role: "монтажник", phone: "+7 916 100-00-03", active: true },
  { id: 4, name: "Виктор Зайцев", role: "монтажник", phone: "+7 916 100-00-04", active: true },
  { id: 5, name: "Татьяна Крылова", role: "замерщик", phone: "+7 916 100-00-05", active: true },
  { id: 6, name: "Алина Борисова", role: "бухгалтер", phone: "+7 916 100-00-06", active: false },
];

const ROLE_COLORS = { менеджер: INFO, монтажник: ORANGE, замерщик: SUCCESS, бухгалтер: WARN, администратор: "#A855F7" };
const STATUS_COLORS = { замер: INFO, расчет: WARN, монтаж: ORANGE, завершено: SUCCESS };
const STATUS_ICONS = { замер: "📐", расчет: "🧮", монтаж: "🔧", завершено: "✅" };

function calcEstimate(params, prices) {
  const { perimeter, fenceType, gates, wicket, demolition, delivery } = params;
  if (!perimeter || perimeter <= 0) return null;

  const poles = Math.ceil(perimeter / 2.5) + 1;
  const tubes = perimeter * 2;
  const sections = Math.ceil(perimeter / 2.5);
  const gravel = (poles * 0.05).toFixed(2);
  const screws = Math.ceil(sections / 10) + 1;

  const matPrice = prices.materials[fenceType]?.price || 450;
  const matCost = perimeter * matPrice;
  const poleCost = poles * (prices.materials["Труба несущая 60×60"]?.price || 320);
  const tubeCost = tubes * (prices.materials["Труба 60×40"]?.price || 180);
  const gravelCost = parseFloat(gravel) * (prices.materials["Щебень"]?.price || 2800);
  const screwCost = screws * (prices.materials["Саморезы (уп.)"]?.price || 150);

  const workMount = sections * (prices.works["Монтаж секции"] || 250);
  const workPoles = poles * (prices.works["Монтаж столба"] || 400);
  const workDemolition = demolition ? perimeter * (prices.works["Демонтаж (м)"] || 180) : 0;
  const workDelivery = delivery > 0 ? delivery * (prices.works["Доставка (км)"] || 45) : 0;
  const gatesCost = (prices.gates[gates] || 0) + (gates !== "Нет" ? (prices.works["Монтаж ворот"] || 8000) : 0);
  const wicketCost = (prices.wickets[wicket] || 0) + (wicket !== "Нет" ? (prices.works["Монтаж калитки"] || 3500) : 0);

  const materials = matCost + poleCost + tubeCost + gravelCost + screwCost;
  const works = workMount + workPoles + workDemolition + workDelivery;
  const total = materials + works + gatesCost + wicketCost;

  return {
    lines: [
      { name: fenceType, qty: perimeter, unit: "м", price: matPrice, sum: matCost },
      { name: "Труба несущая 60×60", qty: poles, unit: "шт", price: prices.materials["Труба несущая 60×60"]?.price || 320, sum: poleCost },
      { name: "Труба 60×40", qty: tubes, unit: "м", price: prices.materials["Труба 60×40"]?.price || 180, sum: tubeCost },
      { name: "Щебень", qty: parseFloat(gravel), unit: "м³", price: prices.materials["Щебень"]?.price || 2800, sum: gravelCost },
      { name: "Саморезы (уп.)", qty: screws, unit: "уп", price: prices.materials["Саморезы (уп.)"]?.price || 150, sum: screwCost },
      ...(demolition ? [{ name: "Демонтаж", qty: perimeter, unit: "м", price: prices.works["Демонтаж (м)"] || 180, sum: workDemolition }] : []),
      ...(delivery > 0 ? [{ name: "Доставка", qty: delivery, unit: "км", price: prices.works["Доставка (км)"] || 45, sum: workDelivery }] : []),
      { name: "Монтаж секций", qty: sections, unit: "шт", price: prices.works["Монтаж секции"] || 250, sum: workMount },
      { name: "Монтаж столбов", qty: poles, unit: "шт", price: prices.works["Монтаж столба"] || 400, sum: workPoles },
      ...(gates !== "Нет" ? [{ name: `Ворота (${gates}) + монтаж`, qty: 1, unit: "компл.", price: gatesCost, sum: gatesCost }] : []),
      ...(wicket !== "Нет" ? [{ name: `Калитка (${wicket}) + монтаж`, qty: 1, unit: "компл.", price: wicketCost, sum: wicketCost }] : []),
    ],
    totals: { materials, works, gatesCost, wicketCost, total },
    specs: { poles, tubes, sections, gravel, screws, perimeter },
  };
}

function fmt(n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; }

// --- COMPONENTS ---

function Btn({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) {
  const base = {
    borderRadius: 8, fontFamily: "'Golos Text',sans-serif", fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, transition: "all 0.15s", border: "none",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
    padding: size === "sm" ? "5px 10px" : size === "lg" ? "12px 20px" : "8px 14px",
  };
  const variants = {
    primary: { background: ORANGE, color: "#fff" },
    ghost: { background: "transparent", color: MUTED, border: `1px solid ${BORDER}` },
    danger: { background: DANGER + "22", color: DANGER, border: `1px solid ${DANGER}44` },
    success: { background: SUCCESS + "22", color: SUCCESS, border: `1px solid ${SUCCESS}44` },
    outline: { background: "transparent", color: ORANGE, border: `1px solid ${ORANGE}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Badge({ children, color = ORANGE }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: 16, cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.2s",
      ...style,
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = ORANGE + "66")}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = BORDER)}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = ORANGE, icon }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: MUTED, fontSize: 12, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Unbounded',sans-serif" }}>{value}</div>
          {sub && <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 28 }}>{icon}</div>}
      </div>
    </Card>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 16, fontWeight: 700, color: TEXT }}>{children}</h2>
      {action}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", color: MUTED, fontSize: 11, marginBottom: 4 }}>
        {label}{required && <span style={{ color: ORANGE }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose, width = 600 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16,
        width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 14, fontWeight: 700 }}>{title}</h3>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕</Btn>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ---- SCREENS ----

function Dashboard({ orders, finances }) {
  const active = orders.filter(o => o.status !== "завершено").length;
  const done = orders.filter(o => o.status === "завершено").length;
  const monthIncome = finances.filter(f => f.type === "доход").reduce((s, f) => s + f.amount, 0);
  const monthExpense = finances.filter(f => f.type === "расход").reduce((s, f) => s + f.amount, 0);

  const recent = [...orders].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 22, fontWeight: 900, color: ORANGE, lineHeight: 1.1 }}>
          Заборыч
        </div>
        <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Добро пожаловать, Иван 👋</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Активные заявки" value={active} icon="📋" color={ORANGE} />
        <StatCard label="Выполнено" value={done} icon="✅" color={SUCCESS} />
        <StatCard label="Выручка (месяц)" value={fmt(monthIncome)} icon="💰" color={SUCCESS} sub={`Расходы: ${fmt(monthExpense)}`} />
        <StatCard label="Прибыль" value={fmt(monthIncome - monthExpense)} icon="📈" color={monthIncome - monthExpense > 0 ? SUCCESS : DANGER} />
      </div>

      <SectionTitle>Последние заявки</SectionTitle>
      {recent.map(o => (
        <Card key={o.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{o.client}</div>
              <div style={{ color: MUTED, fontSize: 12 }}>{o.fenceType} · {o.perimeter}м · {o.address.split(",")[0]}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge color={STATUS_COLORS[o.status]}>{STATUS_ICONS[o.status]} {o.status}</Badge>
              <div style={{ color: TEXT, fontWeight: 700, marginTop: 4 }}>{fmt(o.total)}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function OrderForm({ order, onSave, onClose, prices }) {
  const [form, setForm] = useState(order || {
    client: "", phone: "", address: "", fenceType: "3D сетка 1.8",
    perimeter: "", gates: "Нет", wicket: "Нет", demolition: false,
    delivery: 0, status: "замер", manager: "Иван П.", note: ""
  });
  const [est, setEst] = useState(null);

  useEffect(() => {
    if (form.perimeter > 0) {
      setEst(calcEstimate({ ...form, perimeter: Number(form.perimeter) }, prices));
    }
  }, [form.perimeter, form.fenceType, form.gates, form.wicket, form.demolition, form.delivery]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Клиент</div>
        <Field label="Имя клиента" required><input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Иван Иванов" /></Field>
        <Field label="Телефон"><input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+7 916 000-00-00" /></Field>
        <Field label="Адрес объекта"><input value={form.address} onChange={e => set("address", e.target.value)} placeholder="МО, Красногорск..." /></Field>
        <Field label="Менеджер">
          <select value={form.manager} onChange={e => set("manager", e.target.value)}>
            <option>Иван П.</option><option>Мария С.</option>
          </select>
        </Field>
        <Field label="Статус">
          <select value={form.status} onChange={e => set("status", e.target.value)}>
            {["замер","расчет","монтаж","завершено"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Примечание"><textarea rows={2} value={form.note} onChange={e => set("note", e.target.value)} /></Field>
      </div>
      <div>
        <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Параметры забора</div>
        <Field label="Периметр (м)" required><input type="number" value={form.perimeter} onChange={e => set("perimeter", e.target.value)} placeholder="100" /></Field>
        <Field label="Тип материала">
          <select value={form.fenceType} onChange={e => set("fenceType", e.target.value)}>
            {Object.keys(prices.materials).filter(k => !k.startsWith("Труб") && k !== "Щебень" && !k.startsWith("Само") && !k.startsWith("Скоб")).map(k => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Ворота">
          <select value={form.gates} onChange={e => set("gates", e.target.value)}>
            {Object.keys(prices.gates).map(k => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Калитка">
          <select value={form.wicket} onChange={e => set("wicket", e.target.value)}>
            {Object.keys(prices.wickets).map(k => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Расстояние доставки (км)"><input type="number" value={form.delivery} onChange={e => set("delivery", Number(e.target.value))} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
          <input type="checkbox" checked={form.demolition} onChange={e => set("demolition", e.target.checked)} style={{ width: "auto", accentColor: ORANGE }} />
          <span style={{ fontSize: 13 }}>Демонтаж старого забора</span>
        </label>

        {est && (
          <div style={{ background: CARD2, borderRadius: 8, padding: 12, border: `1px solid ${ORANGE}44` }}>
            <div style={{ color: MUTED, fontSize: 11, marginBottom: 6 }}>ПРЕДВАРИТЕЛЬНАЯ СМЕТА</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: MUTED }}>Материалы</span><span>{fmt(est.totals.materials)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: MUTED }}>Работы</span><span>{fmt(est.totals.works)}</span>
            </div>
            {est.totals.gatesCost > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: MUTED }}>Ворота</span><span>{fmt(est.totals.gatesCost)}</span>
            </div>}
            {est.totals.wicketCost > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: MUTED }}>Калитка</span><span>{fmt(est.totals.wicketCost)}</span>
            </div>}
            <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 700, color: ORANGE }}>
              <span>ИТОГО</span><span>{fmt(est.totals.total)}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn onClick={() => {
          if (!form.client || !form.perimeter) return alert("Заполните обязательные поля");
          onSave({ ...form, perimeter: Number(form.perimeter), total: est?.totals.total || 0, estimate: est });
        }}>💾 Сохранить</Btn>
      </div>
    </div>
  );
}

function Orders({ orders, setOrders, prices }) {
  const [filter, setFilter] = useState("все");
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const statuses = ["все", "замер", "расчет", "монтаж", "завершено"];
  const filtered = filter === "все" ? orders : orders.filter(o => o.status === filter);

  // ═══════════════════════════════════════════════
  // ЗАМЕНА: сохранение заявки в Supabase
  // ═══════════════════════════════════════════════
  const save = async (data) => {
    const payload = {
      client: data.client, phone: data.phone, address: data.address,
      status: data.status, fence_type: data.fenceType, perimeter: data.perimeter,
      gates: data.gates, wicket: data.wicket, demolition: data.demolition,
      delivery: data.delivery, total: data.total, manager: data.manager,
      note: data.note, estimate: data.estimate
    };
    if (editOrder) {
      await db.update("orders", editOrder.id, payload);
      setOrders(prev => prev.map(o => o.id === editOrder.id ? { ...editOrder, ...data } : o));
    } else {
      const [created] = await db.insert("orders", payload);
      setOrders(prev => [...prev, { ...data, id: created.id, created: created.created_at }]);
    }
    setShowForm(false); setEditOrder(null);
  };

  // ═══════════════════════════════════════════════
  // ЗАМЕНА: удаление заявки из Supabase
  // ═══════════════════════════════════════════════
  const del = async (id) => {
    if (confirm("Удалить заявку?")) {
      await db.delete("orders", id);
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  return (
    <div>
      <SectionTitle action={<Btn onClick={() => { setEditOrder(null); setShowForm(true); }}>+ Новая заявка</Btn>}>
        Заявки
      </SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === s ? ORANGE : BORDER}`,
            background: filter === s ? ORANGE + "22" : "transparent", color: filter === s ? ORANGE : MUTED,
            fontSize: 12, cursor: "pointer", fontFamily: "'Golos Text',sans-serif", fontWeight: filter === s ? 600 : 400,
          }}>{s === "все" ? "Все" : STATUS_ICONS[s] + " " + s}</button>
        ))}
      </div>

      {filtered.map(o => (
        <Card key={o.id} style={{ marginBottom: 8 }} onClick={() => setViewOrder(o)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{o.client}</span>
                <Badge color={STATUS_COLORS[o.status]}>{STATUS_ICONS[o.status]} {o.status}</Badge>
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>{o.phone} · {o.address}</div>
              <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{o.fenceType} · {o.perimeter}м · {o.created}</div>
            </div>
            <div style={{ textAlign: "right", marginLeft: 12 }}>
              <div style={{ fontWeight: 700, color: ORANGE, fontSize: 16 }}>{fmt(o.total)}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setEditOrder(o); setShowForm(true); }}>✏️</Btn>
                <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(o.id); }}>🗑️</Btn>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {filtered.length === 0 && <div style={{ color: MUTED, textAlign: "center", padding: 40 }}>Нет заявок</div>}

      {showForm && (
        <Modal title={editOrder ? "Редактировать заявку" : "Новая заявка"} onClose={() => { setShowForm(false); setEditOrder(null); }} width={900}>
          <OrderForm order={editOrder} onSave={save} onClose={() => { setShowForm(false); setEditOrder(null); }} prices={prices} />
        </Modal>
      )}

      {viewOrder && (
        <Modal title={`Заявка #${viewOrder.id} — ${viewOrder.client}`} onClose={() => setViewOrder(null)} width={700}>
          <OrderDetail order={viewOrder} prices={prices} />
        </Modal>
      )}
    </div>
  );
}

function OrderDetail({ order, prices }) {
  const est = order.estimate || calcEstimate({ ...order }, prices);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ color: MUTED, fontSize: 11, marginBottom: 8 }}>КЛИЕНТ</div>
          {[["Имя", order.client], ["Телефон", order.phone], ["Адрес", order.address], ["Менеджер", order.manager], ["Дата", order.created]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: MUTED, fontSize: 12 }}>{k}</span>
              <span style={{ fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ color: MUTED, fontSize: 11, marginBottom: 8 }}>ПАРАМЕТРЫ</div>
          {[["Тип", order.fenceType], ["Периметр", `${order.perimeter}м`], ["Ворота", order.gates], ["Калитка", order.wicket], ["Демонтаж", order.demolition ? "Да" : "Нет"], ["Доставка", `${order.delivery}км`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: MUTED, fontSize: 12 }}>{k}</span>
              <span style={{ fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {est && (
        <>
          <div style={{ color: MUTED, fontSize: 11, marginBottom: 8 }}>СМЕТА</div>
          <div style={{ background: CARD2, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1E1E1E" }}>
                  {["Наименование", "Кол-во", "Ед.", "Цена", "Сумма"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: MUTED, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {est.lines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "7px 10px", fontSize: 12 }}>{l.name}</td>
                    <td style={{ padding: "7px 10px", fontSize: 12 }}>{l.qty}</td>
                    <td style={{ padding: "7px 10px", fontSize: 12, color: MUTED }}>{l.unit}</td>
                    <td style={{ padding: "7px 10px", fontSize: 12 }}>{fmt(l.price)}</td>
                    <td style={{ padding: "7px 10px", fontSize: 12, fontWeight: 600 }}>{fmt(l.sum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: ORANGE + "22", border: `1px solid ${ORANGE}44`, borderRadius: 8, padding: "10px 20px" }}>
              <span style={{ color: MUTED, fontSize: 12, marginRight: 12 }}>ИТОГО</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: ORANGE }}>{fmt(est.totals.total)}</span>
            </div>
          </div>
        </>
      )}
      {order.note && <div style={{ marginTop: 12, color: MUTED, fontSize: 12 }}>📝 {order.note}</div>}
    </div>
  );
}

function Calculator({ prices }) {
  const [form, setForm] = useState({
    perimeter: 80, fenceType: "3D сетка 1.8",
    gates: "Нет", wicket: "Нет", demolition: false, delivery: 0,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const est = calcEstimate(form, prices);

  return (
    <div>
      <SectionTitle>Калькулятор смет</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Параметры</div>
          <Field label={`Периметр: ${form.perimeter} м`}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min="10" max="500" step="5" value={form.perimeter} onChange={e => set("perimeter", Number(e.target.value))} style={{ flex: 1 }} />
              <input type="number" value={form.perimeter} onChange={e => set("perimeter", Number(e.target.value))} style={{ width: 70 }} />
            </div>
          </Field>
          <Field label="Тип материала">
            <select value={form.fenceType} onChange={e => set("fenceType", e.target.value)}>
              {Object.keys(prices.materials).filter(k => !k.startsWith("Труб") && k !== "Щебень" && !k.startsWith("Само") && !k.startsWith("Скоб")).map(k => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Ворота">
            <select value={form.gates} onChange={e => set("gates", e.target.value)}>
              {Object.keys(prices.gates).map(k => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Калитка">
            <select value={form.wicket} onChange={e => set("wicket", e.target.value)}>
              {Object.keys(prices.wickets).map(k => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label={`Доставка: ${form.delivery} км`}>
            <input type="range" min="0" max="150" step="5" value={form.delivery} onChange={e => set("delivery", Number(e.target.value))} />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.demolition} onChange={e => set("demolition", e.target.checked)} style={{ width: "auto", accentColor: ORANGE }} />
            <span style={{ fontSize: 13 }}>Демонтаж старого забора</span>
          </label>
        </Card>

        <div>
          {est && (
            <>
              <Card style={{ marginBottom: 12 }}>
                <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Спецификация</div>
                {[
                  ["Столбов", est.specs.poles + " шт"],
                  ["Секций", est.specs.sections + " шт"],
                  ["Трубы 40×20", est.specs.tubes + " м"],
                  ["Щебень", est.specs.gravel + " м³"],
                  ["Саморезы", est.specs.screws + " уп"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: MUTED, fontSize: 12 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </Card>

              <Card>
                <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Стоимость</div>
                {[
                  ["Материалы", est.totals.materials, TEXT],
                  ["Работы", est.totals.works, TEXT],
                  ...(est.totals.gatesCost > 0 ? [["Ворота", est.totals.gatesCost, TEXT]] : []),
                  ...(est.totals.wicketCost > 0 ? [["Калитка", est.totals.wicketCost, TEXT]] : []),
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: MUTED, fontSize: 13 }}>{k}</span>
                    <span style={{ fontSize: 13, color: c }}>{fmt(v)}</span>
                  </div>
                ))}
                <div style={{ borderTop: `2px solid ${ORANGE}44`, paddingTop: 10, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Unbounded',sans-serif", fontWeight: 700, fontSize: 14 }}>ИТОГО</span>
                  <span style={{ fontFamily: "'Unbounded',sans-serif", fontWeight: 900, fontSize: 20, color: ORANGE }}>{fmt(est.totals.total)}</span>
                </div>
              </Card>

              <div style={{ marginTop: 12 }}>
                <div style={{ background: CARD2, borderRadius: 8, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#1E1E1E" }}>
                      {["Позиция", "Кол-во", "Ед.", "Сумма"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: MUTED, fontSize: 11, borderBottom: `1px solid ${BORDER}` }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {est.lines.map((l, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td style={{ padding: "5px 8px", fontSize: 11 }}>{l.name}</td>
                          <td style={{ padding: "5px 8px", fontSize: 11 }}>{l.qty}</td>
                          <td style={{ padding: "5px 8px", fontSize: 11, color: MUTED }}>{l.unit}</td>
                          <td style={{ padding: "5px 8px", fontSize: 11, fontWeight: 600 }}>{fmt(l.sum)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Warehouse({ warehouse, setWarehouse }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", qty: "", unit: "м", minQty: "" });

  // ═══════════════════════════════════════════════
  // ЗАМЕНА: добавление позиции склада в Supabase
  // ═══════════════════════════════════════════════
  const add = async () => {
    if (!newItem.name || !newItem.qty) return;
    const payload = { name: newItem.name, qty: Number(newItem.qty), unit: newItem.unit, min_qty: Number(newItem.minQty) };
    const [created] = await db.insert("warehouse", payload);
    setWarehouse(prev => [...prev, { ...newItem, id: created.id, qty: Number(newItem.qty), minQty: Number(newItem.minQty), lastIn: created.last_in }]);
    setNewItem({ name: "", qty: "", unit: "м", minQty: "" });
    setShowAdd(false);
  };

  // ═══════════════════════════════════════════════
  // ЗАМЕНА: изменение остатка склада в Supabase
  // ═══════════════════════════════════════════════
  const adjust = async (id, delta) => {
    const item = warehouse.find(w => w.id === id);
    const newQty = Math.max(0, item.qty + delta);
    await db.update("warehouse", id, { qty: newQty });
    setWarehouse(prev => prev.map(w => w.id === id ? { ...w, qty: newQty } : w));
  };

  const low = warehouse.filter(w => w.qty <= w.minQty);

  return (
    <div>
      <SectionTitle action={<Btn onClick={() => setShowAdd(true)}>+ Добавить</Btn>}>Склад</SectionTitle>

      {low.length > 0 && (
        <Card style={{ marginBottom: 16, borderColor: WARN + "66", background: WARN + "11" }}>
          <div style={{ color: WARN, fontWeight: 600, marginBottom: 8 }}>⚠️ Мало на складе</div>
          {low.map(w => <div key={w.id} style={{ color: MUTED, fontSize: 12 }}>· {w.name}: {w.qty} {w.unit} (мин: {w.minQty})</div>)}
        </Card>
      )}

      {warehouse.map(w => (
        <Card key={w.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{w.name}</div>
              <div style={{ color: MUTED, fontSize: 12 }}>Последнее поступление: {w.lastIn}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn size="sm" variant="ghost" onClick={() => adjust(w.id, -10)}>−10</Btn>
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: w.qty <= w.minQty ? DANGER : w.qty <= w.minQty * 1.5 ? WARN : SUCCESS }}>
                  {w.qty}
                </div>
                <div style={{ color: MUTED, fontSize: 11 }}>{w.unit}</div>
              </div>
              <Btn size="sm" variant="ghost" onClick={() => adjust(w.id, 10)}>+10</Btn>
            </div>
          </div>
          <div style={{ marginTop: 8, background: CARD2, borderRadius: 4, height: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${Math.min(100, (w.qty / (w.minQty * 3)) * 100)}%`,
              background: w.qty <= w.minQty ? DANGER : w.qty <= w.minQty * 1.5 ? WARN : SUCCESS,
              transition: "width 0.3s"
            }} />
          </div>
        </Card>
      ))}

      {showAdd && (
        <Modal title="Добавить материал" onClose={() => setShowAdd(false)} width={400}>
          <Field label="Наименование"><input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} /></Field>
          <Field label="Количество"><input type="number" value={newItem.qty} onChange={e => setNewItem(p => ({ ...p, qty: e.target.value }))} /></Field>
          <Field label="Единица">
            <select value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}>
              {["м", "шт", "м²", "м³", "уп", "кг"].map(u => <option key={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Минимальный остаток"><input type="number" value={newItem.minQty} onChange={e => setNewItem(p => ({ ...p, minQty: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={add}>Добавить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Finances({ finances, setFinances }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newRec, setNewRec] = useState({ type: "доход", category: "Оплата заказа", desc: "", amount: "" });

  const income = finances.filter(f => f.type === "доход").reduce((s, f) => s + f.amount, 0);
  const expense = finances.filter(f => f.type === "расход").reduce((s, f) => s + f.amount, 0);

  // ═══════════════════════════════════════════════
  // ЗАМЕНА: добавление финансовой записи в Supabase
  // ═══════════════════════════════════════════════
  const add = async () => {
    if (!newRec.amount || !newRec.desc) return;
    const payload = { type: newRec.type, category: newRec.category, description: newRec.desc, amount: Number(newRec.amount) };
    const [created] = await db.insert("finances", payload);
    setFinances(prev => [...prev, { ...newRec, id: created.id, amount: Number(newRec.amount), date: created.date }]);
    setNewRec({ type: "доход", category: "Оплата заказа", desc: "", amount: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <SectionTitle action={<Btn onClick={() => setShowAdd(true)}>+ Запись</Btn>}>Финансы</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Доходы" value={fmt(income)} color={SUCCESS} icon="💰" />
        <StatCard label="Расходы" value={fmt(expense)} color={DANGER} icon="💸" />
        <StatCard label="Прибыль" value={fmt(income - expense)} color={income >= expense ? SUCCESS : DANGER} icon="📊" />
      </div>

      {finances.sort((a, b) => new Date(b.date) - new Date(a.date)).map(f => (
        <Card key={f.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <Badge color={f.type === "доход" ? SUCCESS : DANGER}>{f.type === "доход" ? "▲" : "▼"} {f.category}</Badge>
              </div>
              <div style={{ color: MUTED, fontSize: 12 }}>{f.desc} · {f.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: f.type === "доход" ? SUCCESS : DANGER }}>
              {f.type === "доход" ? "+" : "−"}{fmt(f.amount)}
            </div>
          </div>
        </Card>
      ))}

      {showAdd && (
        <Modal title="Новая запись" onClose={() => setShowAdd(false)} width={400}>
          <Field label="Тип">
            <select value={newRec.type} onChange={e => setNewRec(p => ({ ...p, type: e.target.value }))}>
              <option value="доход">Доход</option><option value="расход">Расход</option>
            </select>
          </Field>
          <Field label="Категория">
            <select value={newRec.category} onChange={e => setNewRec(p => ({ ...p, category: e.target.value }))}>
              {["Оплата заказа","Аванс","Материалы","Зарплата","Доставка","Прочее"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Описание"><input value={newRec.desc} onChange={e => setNewRec(p => ({ ...p, desc: e.target.value }))} /></Field>
          <Field label="Сумма (₽)"><input type="number" value={newRec.amount} onChange={e => setNewRec(p => ({ ...p, amount: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={add}>Добавить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PriceList({ prices, setPrices, isAdmin }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (section, key, val) => {
    if (!isAdmin) return alert("Редактирование цен доступно только администратору");
    setEditing({ section, key }); setEditVal(String(val));
  };

  const save = () => {
    const { section, key } = editing;
    setPrices(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (section === "materials") copy.materials[key].price = Number(editVal);
      else copy[section][key] = Number(editVal);
      return copy;
    });
    setEditing(null);
  };

  const sections = [
    { title: "Материалы", key: "materials", render: (k, v) => [k, v.price + " ₽/" + v.unit] },
    { title: "Работы", key: "works", render: (k, v) => [k, v + " ₽"] },
    { title: "Ворота", key: "gates", render: (k, v) => [k, v + " ₽"] },
    { title: "Калитки", key: "wickets", render: (k, v) => [k, v + " ₽"] },
  ];

  return (
    <div>
      <SectionTitle>Прайс-лист {isAdmin && <Badge color={ORANGE}>Админ</Badge>}</SectionTitle>
      {!isAdmin && <Card style={{ marginBottom: 16, borderColor: INFO + "44" }}><span style={{ color: INFO, fontSize: 12 }}>ℹ️ Только просмотр. Изменение цен доступно администратору.</span></Card>}

      {sections.map(sec => (
        <div key={sec.key} style={{ marginBottom: 20 }}>
          <div style={{ color: ORANGE, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{sec.title}</div>
          {Object.entries(prices[sec.key]).map(([k, v]) => {
            const [name, display] = sec.render(k, v);
            const rawVal = sec.key === "materials" ? v.price : v;
            const isEd = editing?.section === sec.key && editing?.key === k;
            return (
              <Card key={k} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isEd ? (
                      <>
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: 90 }} />
                        <Btn size="sm" onClick={save}>✓</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setEditing(null)}>✕</Btn>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 600, color: ORANGE }}>{display}</span>
                        {isAdmin && <Btn size="sm" variant="ghost" onClick={() => startEdit(sec.key, k, rawVal)}>✏️</Btn>}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Employees() {
  return (
    <div>
      <SectionTitle>Сотрудники</SectionTitle>
      {employees.map(e => (
        <Card key={e.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: ROLE_COLORS[e.role] + "33",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ROLE_COLORS[e.role], fontWeight: 700, fontSize: 15,
              }}>{e.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{e.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge color={ROLE_COLORS[e.role]}>{e.role}</Badge>
                  {!e.active && <Badge color={MUTED}>неактивен</Badge>}
                </div>
              </div>
            </div>
            <div style={{ color: MUTED, fontSize: 12 }}>{e.phone}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AIAssistant({ orders, finances, warehouse, prices }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! Я AI-помощник Заборыча 🤖\n\nМогу помочь с расчётами, анализом заявок и рекомендациями. Спросите меня что-нибудь!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const context = `Ты AI-помощник CRM системы "Заборыч" — компания по установке заборов.
Данные системы:
- Заявок всего: ${orders.length}, активных: ${orders.filter(o => o.status !== "завершено").length}
- Общая выручка: ${finances.filter(f => f.type === "доход").reduce((s, f) => s + f.amount, 0)} руб
- Расходы: ${finances.filter(f => f.type === "расход").reduce((s, f) => s + f.amount, 0)} руб
- Склад (позиции с низким остатком): ${warehouse.filter(w => w.qty <= w.minQty).map(w => w.name).join(", ") || "нет"}
- Последние заявки: ${orders.slice(-3).map(o => `${o.client} (${o.status}, ${o.total}₽)`).join("; ")}

Отвечай кратко, по-русски, профессионально. Помогай с расчётами заборов, анализом данных, рекомендациями по бизнесу.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [...history, { role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Ошибка ответа";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Ошибка подключения к AI. Проверьте соединение." }]);
    }
    setLoading(false);
  };

  const suggestions = [
    "Сколько прибыли в этом месяце?",
    "Какие материалы заканчиваются?",
    "Посчитай забор 120м профлист без ворот",
    "Дай советы по оптимизации склада",
  ];

  return (
    <div>
      <SectionTitle>AI Помощник 🤖</SectionTitle>
      <Card style={{ marginBottom: 12, minHeight: 400, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", maxHeight: 350, paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              marginBottom: 12, display: "flex",
              flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8,
            }}>
              <div style={{
                maxWidth: "80%", padding: "8px 12px", borderRadius: 12,
                background: m.role === "user" ? ORANGE : CARD2,
                color: m.role === "user" ? "#fff" : TEXT,
                fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
                borderTopRightRadius: m.role === "user" ? 4 : 12,
                borderTopLeftRadius: m.role === "assistant" ? 4 : 12,
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ padding: "8px 12px", borderRadius: 12, background: CARD2, fontSize: 13, color: MUTED }}>
                ⏳ Думаю...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Спросите что-нибудь..."
              style={{ flex: 1 }}
            />
            <Btn onClick={send} disabled={loading || !input.trim()}>↑</Btn>
          </div>
        </div>
      </Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            background: CARD2, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 11,
            padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontFamily: "'Golos Text',sans-serif"
          }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ---- MAIN APP ----

const NAV = [
  { id: "dashboard", label: "Главная", icon: "🏠" },
  { id: "orders", label: "Заявки", icon: "📋" },
  { id: "calculator", label: "Смета", icon: "🧮" },
  { id: "warehouse", label: "Склад", icon: "📦" },
  { id: "finances", label: "Финансы", icon: "💰" },
  { id: "pricelist", label: "Прайс", icon: "🛒" },
  { id: "employees", label: "Сотрудники", icon: "👥" },
  { id: "ai", label: "AI", icon: "🤖" },
];

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  // ═══════════════════════════════════════════════
  // ЗАМЕНА: пустые массивы вместо initialXxx —
  // данные грузятся из Supabase в useEffect ниже
  // ═══════════════════════════════════════════════
  const [orders, setOrders] = useState([]);
  const [finances, setFinances] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const [prices, setPrices] = useState(initialPrices);
  const [loading, setLoading] = useState(true);
  const isAdmin = true;

  // ═══════════════════════════════════════════════
  // НОВОЕ: загрузка данных из Supabase при старте
  // ═══════════════════════════════════════════════
  useEffect(() => {
    Promise.all([
      db.get("orders"),
      db.get("finances"),
      db.get("warehouse"),
    ]).then(([o, f, w]) => {
      if (Array.isArray(o)) setOrders(o.map(x => ({
        ...x, fenceType: x.fence_type, created: x.created_at
      })));
      if (Array.isArray(f)) setFinances(f.map(x => ({ ...x, desc: x.description })));
      if (Array.isArray(w)) setWarehouse(w.map(x => ({ ...x, minQty: x.min_qty, lastIn: x.last_in })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ═══════════════════════════════════════════════
  // НОВОЕ: экран загрузки пока данные тянутся
  // ═══════════════════════════════════════════════
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: BG, flexDirection: "column", gap: 16 }}>
      <div style={{ color: ORANGE, fontFamily: "'Unbounded',sans-serif", fontSize: 24, fontWeight: 900 }}>⚙ Заборыч</div>
      <div style={{ color: MUTED, fontSize: 13 }}>Загрузка данных...</div>
    </div>
  );

  const screens = {
    dashboard: <Dashboard orders={orders} finances={finances} />,
    orders: <Orders orders={orders} setOrders={setOrders} prices={prices} />,
    calculator: <Calculator prices={prices} />,
    warehouse: <Warehouse warehouse={warehouse} setWarehouse={setWarehouse} />,
    finances: <Finances finances={finances} setFinances={setFinances} />,
    pricelist: <PriceList prices={prices} setPrices={setPrices} isAdmin={isAdmin} />,
    employees: <Employees />,
    ai: <AIAssistant orders={orders} finances={finances} warehouse={warehouse} prices={prices} />,
  };

  const lowStockCount = warehouse.filter(w => w.qty <= w.minQty).length;

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{
          width: 220, background: CARD, borderRight: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 20, fontWeight: 900, color: ORANGE }}>⚙ Заборыч</div>
            <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>CRM система</div>
          </div>
          <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setScreen(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 8, border: "none",
                background: screen === n.id ? ORANGE + "22" : "transparent",
                color: screen === n.id ? ORANGE : MUTED,
                fontFamily: "'Golos Text',sans-serif", fontSize: 13,
                fontWeight: screen === n.id ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s", marginBottom: 2,
                textAlign: "left", position: "relative",
              }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {n.label}
                {n.id === "warehouse" && lowStockCount > 0 && (
                  <span style={{
                    marginLeft: "auto", background: WARN, color: "#000",
                    borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px"
                  }}>{lowStockCount}</span>
                )}
                {n.id === "orders" && (
                  <span style={{
                    marginLeft: "auto", background: ORANGE + "33", color: ORANGE,
                    borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px"
                  }}>{orders.filter(o => o.status !== "завершено").length}</span>
                )}
              </button>
            ))}
          </nav>
          <div style={{ padding: 12, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: ORANGE + "33",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ORANGE, fontWeight: 700, fontSize: 13,
              }}>ИП</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Иван Петров</div>
                <div style={{ fontSize: 10, color: MUTED }}>менеджер</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
            {screens[screen]}
          </div>
        </div>
      </div>
    </>
  );
}

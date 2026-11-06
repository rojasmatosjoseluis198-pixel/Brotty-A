// ===== Brotty — lógica de la app =====
"use strict";
const CLAVE = "brottyapp-v1";

// ---------- Utilidades ----------
const $ = (s) => document.querySelector(s);
const fechaISO = (d) => d.toLocaleDateString("en-CA");
const hoyISO = () => fechaISO(new Date());
const parse = (f) => { const [y, m, d] = f.split("-").map(Number); return new Date(y, m - 1, d); };
const addDias = (f, n) => { const d = parse(f); d.setDate(d.getDate() + n); return fechaISO(d); };
const difDias = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const addMeses = (f, n) => {
  const d = parse(f), dia = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(dia, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return fechaISO(d);
};
const r2 = (n) => Math.round(n * 100) / 100;
const soles = (n) => "S/ " + r2(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const suma = (arr, f = (x) => x) => r2(arr.reduce((s, x) => s + f(x), 0));
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const horaAhora = () => new Date().toTimeString().slice(0, 5);
const fechaBonita = (f, opt = { weekday: "long", day: "numeric", month: "long" }) => parse(f).toLocaleDateString("es-PE", opt);
const fechaCorta = (f) => parse(f).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Categorías ----------
const CATS = {
  ingredientes: { e: "🥕", n: "Ingredientes", antojo: false },
  fuera: { e: "🍜", n: "Comida fuera", antojo: false },
  snacks: { e: "🍪", n: "Snacks", antojo: true },
  univ: { e: "📚", n: "Universidad", antojo: false },
  transporte: { e: "🚌", n: "Transporte", antojo: false },
  salidas: { e: "🎉", n: "Salidas", antojo: true },
  invitar: { e: "🎁", n: "Invitar", antojo: true },
  cuidado: { e: "🧴", n: "Cuidado personal", antojo: false },
  otros: { e: "📦", n: "Otros", antojo: false },
  pagos: { e: "🏠", n: "Pagos", antojo: false, oculta: true },
  subvencion: { e: "🎓", n: "Subvención", ingreso: true },
  cachuelo: { e: "🛠️", n: "Cachuelos", ingreso: true },
  papas: { e: "👪", n: "Plata extra de mis papás", ingreso: true },
  otros_i: { e: "💰", n: "Otros ingresos", ingreso: true },
  ajuste: { e: "⚖️", n: "Ajuste de saldo", oculta: true }
};
const CATS_GASTO = ["ingredientes", "fuera", "snacks", "univ", "transporte", "salidas", "invitar", "cuidado", "otros"];
const CATS_INGRESO = ["subvencion", "cachuelo", "papas", "otros_i"];
let LUGARES = { mercado: "🧺 Mercado", bodega: "🏪 Bodega", univ: "🏫 Universidad", otro: "📍 Otro" };
const ICONOS_PAGO = ["🏠", "🚌", "📱", "🤖", "📚", "💡", "💧", "💳", "🏋️", "🎵", "📦"];
const ING = {
  beca: { n: "subvención", e: "🎓", N: "Beca / subvención" }, mesada: { n: "mesada", e: "💵", N: "Mesada de mis papás" },
  propina: { n: "propina", e: "🪙", N: "Propina de mis papás" }, sueldo: { n: "sueldo", e: "💼", N: "Sueldo" },
  cachuelos: { n: "plata", e: "🛠️", N: "Cachuelos" }
};
const OCUP = { univ: "Universidad", instituto: "Instituto", trabajo: "Trabajo", otro: "Otro" };
const VIV = { familia: "Vivo con mi familia", foraneo: "Soy foráneo (alquilo cuarto)", otro: "Otro" };
const lbl = () => (ING[E.config.ingTipo] || ING.mesada).n;
const prox = (may) => (E.config.ingTipo === "sueldo" ? (may ? "Próximo" : "próximo") : (may ? "Próxima" : "próxima")) + " " + lbl();
const esEstudiante = () => ["univ", "instituto"].includes(E.config.ocupacion);
const diasDe = () => (E.config.ocupacion === "trabajo" ? "trabajo" : "clase");
function etiquetas() {
  const c = E.config, i = ING[c.ingTipo] || ING.mesada;
  CATS.subvencion.n = capital(i.n === "plata" ? "Ingreso principal" : i.n); CATS.subvencion.e = i.e;
  const t = c.ocupacion === "trabajo";
  CATS.univ.n = t ? "Trabajo" : c.ocupacion === "instituto" ? "Instituto" : "Universidad"; CATS.univ.e = t ? "💼" : "📚";
  LUGARES.univ = t ? "🏢 Trabajo" : c.ocupacion === "instituto" ? "🏫 Instituto" : "🏫 Universidad";
}
function proxDefault(desde) {
  const f = E.config.ingFrec;
  return f === "semanal" ? addDias(desde, 7) : f === "quincenal" ? addDias(desde, 15) : addMeses(desde, 1);
}
const DIAS_CORTOS = ["D", "L", "M", "M", "J", "V", "S"];

// ---------- Estado ----------
function estadoNuevo() {
  return {
    v: 1,
    config: {
      setup: false, saldoInicial: 0, fechaInicio: hoyISO(), montoSub: 0, proxSub: "",
      modo: "ciclo", dias: [1, 2, 3, 4, 5], finCiclo: "", pasaje: 0, comidaDias: [], menu: 0, cocina: false,
      nombre: "", ocupacion: "univ", vivienda: "familia", ingTipo: "mesada", ingFrec: "mensual",
      apariencia: { color: "verde", estilos: [], nombreBrotty: "Brotty" }, trajeManual: null,
      comidaSem: 0, comidaSemVac: 0, cumple: "", respaldoPendiente: false, ultimoRespaldo: null
    },
    movs: [], pagos: [], prestamos: [], metas: []
  };
}
let E = cargar();
function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE));
    if (d && d.config && Array.isArray(d.movs)) return Object.assign(estadoNuevo(), d, { config: Object.assign(estadoNuevo().config, d.config) });
  } catch (e) {}
  return estadoNuevo();
}
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(E)); render(); }

// ---------- Cálculo principal ----------
function costoClase(f) {
  const c = E.config;
  if (esEstudiante() && c.modo !== "ciclo") return { pasaje: 0, menu: 0 };
  if (esEstudiante() && c.finCiclo && f > c.finCiclo) return { pasaje: 0, menu: 0 };
  const wd = parse(f).getDay();
  if (!c.dias.includes(wd)) return { pasaje: 0, menu: 0 };
  return { pasaje: +c.pasaje || 0, menu: (c.comidaDias || []).includes(wd) ? (+c.menu || 0) : 0 };
}
function inicioPeriodo(T) {
  const subs = E.movs.filter((m) => m.cat === "subvencion" && m.fecha <= T).map((m) => m.fecha).sort();
  return subs.length ? subs[subs.length - 1] : E.config.fechaInicio;
}
const pagadoP = (p, antesDe) => suma(p.pagos.filter((x) => !antesDe || x.fecha < antesDe), (x) => x.monto);
const pendienteP = (p) => r2(p.monto - pagadoP(p));
const ahorradoMeta = (m) => suma(m.movs, (x) => x.monto);

const comidaSemPresup = () => !E.config.cocina ? 0 : ((esEstudiante() && E.config.modo === "vacaciones" ? +E.config.comidaSemVac : +E.config.comidaSem) || 0);
const lunesDe = (f) => addDias(f, -((parse(f).getDay() + 6) % 7));
const comidaGastada = (f, antesDe) => suma(E.movs.filter((m) => m.cat === "ingredientes" && m.fecha >= lunesDe(f) && m.fecha < antesDe), (m) => m.monto);

// Dinero libre (sin metas) al empezar el día f
function libreAntes(f) {
  let s = +E.config.saldoInicial || 0;
  for (const m of E.movs) if (m.fecha < f) s += m.tipo === "ingreso" ? m.monto : -m.monto;
  for (const p of E.prestamos) {
    const sig = p.tipo === "debo" ? 1 : -1;
    if (p.fecha < f) s += sig * p.monto;
    for (const x of p.pagos) if (x.fecha < f) s -= sig * x.monto;
  }
  for (const m of E.metas) for (const x of m.movs) if (x.fecha < f) s -= x.monto;
  return s;
}

// Calcula un día: cuánto se podía gastar y cuánto se gastó fuera de lo previsto
function calcDia(f, S, sob) {
  const c = E.config;
  let D = difDias(f, S); if (D <= 0) D = 1;
  const movsDia = E.movs.filter((m) => m.fecha === f);
  const ingSub = suma(movsDia.filter((m) => m.tipo === "ingreso" && (m.cat === "subvencion" || m.cat === "ajuste")), (m) => m.monto);
  const ingExtra = suma(movsDia.filter((m) => m.tipo === "ingreso" && m.cat !== "subvencion" && m.cat !== "ajuste"), (m) => m.monto);
  const cobros = suma(E.prestamos.filter((p) => p.tipo === "preste").flatMap((p) => p.pagos.filter((x) => x.fecha === f)), (x) => x.monto);
  const recibido = suma(E.prestamos.filter((p) => p.tipo === "debo" && p.fecha === f), (p) => p.monto);
  const aportes = suma(E.metas.flatMap((m) => m.movs.filter((x) => x.fecha === f)), (x) => x.monto);
  // Lo extra va al sobrante; lo que se aparta a metas sale primero del sobrante
  sob += ingExtra + cobros;
  if (aportes > 0) sob -= Math.min(sob, aportes); else sob -= aportes;
  const base = libreAntes(f) + ingSub + ingExtra + cobros + recibido - aportes;

  // Lo que Brotty aparta hasta la próxima subvención
  const presSem = comidaSemPresup();
  const comidaSemana = Math.max(0, presSem - comidaGastada(f, f));
  const proxLunes = addDias(lunesDe(f), 7);
  const comidaFutura = proxLunes < S ? (presSem / 7) * difDias(proxLunes, S) : 0;
  const resComida = r2(comidaSemana + comidaFutura);
  let resClase = 0, diasClase = 0;
  for (let i = 0; i < D; i++) { const k = costoClase(addDias(f, i)); resClase += k.pasaje + k.menu; if (k.pasaje || k.menu) diasClase++; }
  const pagosRes = E.pagos.filter((p) => (!p.pagadoEl || p.pagadoEl >= f) && !(p.recurrente && p.creadoEl >= f) && p.fecha < S);
  const resPagos = suma(pagosRes, (p) => p.monto);
  const resDeudas = suma(E.prestamos.filter((p) => p.tipo === "debo" && p.fecha < f && p.vence && p.vence < S), (p) => Math.max(0, p.monto - pagadoP(p, f)));
  const reservas = r2(resComida + resClase + resPagos + resDeudas);
  const libreReal = r2(base - sob - reservas);
  const diario = r2(Math.max(0, libreReal / D));

  // Gastos del día que no estaban previstos
  const k = costoClase(f);
  let pc = comidaSemana, pp = k.pasaje, pm = k.menu, noPrev = 0;
  for (const m of movsDia.filter((x) => x.tipo === "gasto").sort((a, b) => a.creado - b.creado)) {
    let p = 0;
    if (m.cat === "pagos" || m.cat === "ajuste") p = m.monto;
    else if (m.cat === "ingredientes") { p = Math.min(m.monto, pc); pc -= p; }
    else if (m.cat === "transporte") { p = Math.min(m.monto, pp); pp -= p; }
    else if (m.cat === "fuera") { p = Math.min(m.monto, pm); pm -= p; }
    noPrev += m.monto - p;
  }
  const prestado = suma(E.prestamos.filter((p) => p.tipo === "preste" && p.fecha === f), (p) => p.monto);
  const deudaPag = suma(E.prestamos.filter((p) => p.tipo === "debo").flatMap((p) => p.pagos.filter((x) => x.fecha === f)), (x) => x.monto);
  noPrev = r2(noPrev + prestado + Math.max(0, deudaPag - resDeudas));
  return { D, base: r2(base), sob: r2(sob), reservas, resComida, resClase, resPagos, resDeudas, diasClase, libreReal, diario, noPrev, hoy: r2(diario - noPrev), sobFin: r2(sob + Math.max(0, diario - noPrev)) };
}

// Recorre el período día por día: lo que no se gasta va al sobrante (no se suma al día siguiente)
function sobranteHasta(fin, S) {
  const P = inicioPeriodo(addDias(fin, -1));
  let f = P > E.config.fechaInicio ? P : E.config.fechaInicio, sob = 0, n = 0;
  while (f < fin && n++ < 200) { sob = calcDia(f, S, sob).sobFin; f = addDias(f, 1); }
  return sob;
}

function calc() {
  const c = E.config, T = hoyISO();
  const S = c.proxSub || addDias(T, 30);
  const subVencida = difDias(T, S) <= 0;
  const P = inicioPeriodo(T);
  const ini = P > c.fechaInicio ? P : c.fechaInicio;
  let f = ini, sob = 0, n = 0;
  while (f < T && n++ < 200) { sob = calcDia(f, S, sob).sobFin; f = addDias(f, 1); }
  const r = calcDia(T, S, sob);

  let saldo = +c.saldoInicial || 0;
  for (const m of E.movs) saldo += m.tipo === "ingreso" ? m.monto : -m.monto;
  for (const p of E.prestamos) saldo += p.tipo === "debo" ? pendienteP(p) : -pendienteP(p);
  const enMetas = suma(E.metas, ahorradoMeta);
  return Object.assign(r, { T, S, P, subVencida, saldo: r2(saldo), enMetas, libre: r2(saldo - enMetas), diarioBase: r.diario, sobrante: r.sob });
}

// ---------- Ánimo de Brotty ----------
let animoTemporal = null, animoHasta = 0;
function animo(k) {
  if (Date.now() < animoHasta) return animoTemporal;
  if (k.diarioBase <= 0 || k.hoy < 0) return "triste";
  if (k.hoy < k.diarioBase * 0.35) return "preocupado";
  return "feliz";
}
function celebrar(ms = 5000) { animoTemporal = "celebrando"; animoHasta = Date.now() + ms; render(); setTimeout(render, ms + 50); }
function esCumple() { const c = E.config.cumple; return c && hoyISO().slice(5) === c; }
function frase(a, traje) {
  if (esCumple()) return "¡Feliz cumple! 🎂";
  const F = {
    feliz: ["S/ ✓", "¡Vamos bien! 🌱", "Tú puedes 💪", traje === "halloween" ? "¿Dulce o ahorro? 🎃" : "Hoy brotamos 🌿", traje === "navidad" ? "Jo jo jo 🎄" : "😊"],
    preocupado: ["¿S/?", "Ojo con los antojos 👀", "Despacito nomás"],
    triste: ["💸", "Mañana se ajusta 🌱", "No pasa nada, seguimos"],
    celebrando: ["¡Yupi! ✨", "¡Bien ahí! 🎉", "¡Plata que brota! 🌿"]
  };
  const l = F[a]; return l[Math.floor(Date.now() / 20000) % l.length];
}

// ---------- Fondos de los cuartos ----------
const FONDOS = {
  bosque: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 300 L0 170 L25 120 L50 170 L70 100 L95 170 L115 130 L140 180 L165 110 L190 185 L400 185 L400 300Z" fill="#0f2419"/><path d="M400 300 L400 150 L375 105 L350 160 L330 95 L305 165 L280 125 L260 190 L0 195 L0 300Z" fill="#0b1c14"/>${[[60, 60], [300, 40], [220, 90], [140, 35], [350, 80], [30, 110]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#d9ff5a"><animate attributeName="opacity" values=".2;1;.2" dur="${2 + i * .6}s" repeatCount="indefinite"/></circle>`).join("")}</svg>`,
  rio: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 300 L0 200 Q100 180 200 205 T400 195 L400 300Z" fill="#0c2230"/><path d="M0 300 L0 235 Q100 215 200 240 T400 230 L400 300Z" fill="#0e2c3d"/><path d="M40 255 q20 -8 40 0 M220 270 q20 -8 40 0 M300 248 q15 -6 30 0" stroke="#2f6f8a" stroke-width="3" fill="none"/></svg>`,
  selva: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 300 C 20 200,60 180,40 120 C 90 160,90 230,70 300Z" fill="#0f2a18"/><path d="M400 300 C 380 210,340 190,360 110 C 310 160,310 230,330 300Z" fill="#0f2a18"/><path d="M120 300 C 140 230,190 220,170 170 C 220 210,210 260,200 300Z" fill="#0b1f12"/><path d="M0 300 L0 260 Q200 230 400 260 L400 300Z" fill="#0b1c14"/></svg>`,
  montania: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><circle cx="300" cy="150" r="40" fill="#ffd23f" opacity=".25"/><path d="M0 300 L0 220 L90 130 L160 200 L240 110 L330 190 L400 150 L400 300Z" fill="#14271d"/><path d="M0 300 L0 250 L120 190 L220 240 L320 200 L400 230 L400 300Z" fill="#0d1c15"/><path d="M240 110 L222 128 L240 124 L256 130Z" fill="#c7e6d4" opacity=".5"/></svg>`,
  huerto: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 300 L0 240 Q200 215 400 240 L400 300Z" fill="#1a1710"/>${[40, 110, 180, 250, 320, 380].map((x, i) => `<g transform="translate(${x} ${238 - (i % 2) * 6})"><path d="M0 0 C 0 -14,2 -22,6 -28" stroke="#2f7a1c" stroke-width="3" fill="none"/><path d="M6 -26 C 12 -34,24 -34,26 -28 C 20 -24,12 -22,6 -26Z" fill="#2fae1d" opacity=".8"/><path d="M4 -20 C -4 -28,-14 -26,-16 -22 C -10 -18,-2 -18,4 -20Z" fill="#259018" opacity=".8"/></g>`).join("")}</svg>`,
  fogata: `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 300 L0 250 Q200 225 400 250 L400 300Z" fill="#14140f"/><g transform="translate(200 238)"><path d="M-30 10 L30 -2 M-30 -2 L30 10" stroke="#5a3a1a" stroke-width="9" stroke-linecap="round"/><path d="M0 -50 C 18 -26,22 -12,0 4 C -22 -12,-18 -26,0 -50Z" fill="#ff7a59" opacity=".8"><animate attributeName="opacity" values=".6;.95;.6" dur="1.2s" repeatCount="indefinite"/></path><path d="M0 -30 C 10 -16,10 -8,0 2 C -10 -8,-10 -16,0 -30Z" fill="#ffd23f"/></g><circle cx="200" cy="215" r="90" fill="#ff7a59" opacity=".06"/></svg>`
};
document.querySelectorAll("[data-fondo]").forEach((el) => (el.innerHTML = FONDOS[el.dataset.fondo]));

// ---------- Navegación entre cuartos ----------
const rooms = $("#rooms"), roomEls = [...document.querySelectorAll(".room")];
let roomIdx = 1;
function irA(i, suave = true) { rooms.scrollTo({ left: i * rooms.clientWidth, behavior: suave ? "smooth" : "auto" }); }
function pintarPuntos() {
  $("#puntos").innerHTML = `<div class="dots">${roomEls.map((_, i) => `<span class="${i === roomIdx ? "on" : ""}"></span>`).join("")}</div><div class="nombre">${roomEls[roomIdx].dataset.room}</div>`;
}
rooms.addEventListener("scroll", () => {
  const i = Math.round(rooms.scrollLeft / rooms.clientWidth);
  if (i !== roomIdx) { roomIdx = i; pintarPuntos(); }
}, { passive: true });
window.addEventListener("resize", () => irA(roomIdx, false));

// ---------- Render ----------
function render() {
  etiquetas();
  const k = calc();
  renderInicio(k); renderMovs(); renderPresup(k); renderStats(); renderMetas(k); renderPagos(k); pintarPuntos();
}

function renderInicio(k) {
  const ap = E.config.apariencia || {}, traje = Brotty.trajeDeHoy(undefined, E.config.trajeManual), a = animo(k);
  const extra = esCumple() ? Brotty.torta : "";
  $("#brotty").innerHTML = Brotty.svg({ animo: esCumple() ? "celebrando" : a, traje, extra, color: ap.color, estilos: ap.estilos || [] });
  $("#saludo").textContent = E.config.nombre ? `Hola, ${E.config.nombre} 👋` : "";
  $("#globo").textContent = frase(esCumple() ? "celebrando" : a, traje);
  const num = $("#hoyNum");
  num.textContent = soles(Math.max(0, k.hoy));
  num.classList.toggle("neg", k.hoy <= 0);
  const total = k.diarioBase;
  $("#hoyBarra").style.width = (total > 0 ? Math.min(100, (k.noPrev / total) * 100) : (k.noPrev > 0 ? 100 : 0)) + "%";
  $("#hoySub").innerHTML = k.hoy < 0
    ? `Hoy te pasaste ${soles(-k.hoy)} · los próximos días se ajustan`
    : `Gastaste hoy ${soles(k.noPrev)} de ${soles(total)}`;
  $("#subLine").innerHTML = (k.sobrante > 0 ? `<span class="gold">Sobrante del período: ${soles(k.sobrante)}</span><br>` : "") + esc(E.config.proxSub
    ? (k.subVencida ? `${prox(1)}: ¿ya llegó?` : `${prox(1)}: ~${k.D} día${k.D === 1 ? "" : "s"} (aprox.)`)
    : "");
  const np = E.prestamos.filter((p) => pendienteP(p) > 0).length;
  $("#nPrest").textContent = np;

  // Avisos
  const av = [];
  if (k.subVencida) av.push(`<div class="card aviso"><b>${ING[E.config.ingTipo]?.e || "💵"} ¿Ya llegó tu ${lbl()}?</b><div class="suave">La fecha aproximada ya pasó.</div>
    <div class="acciones"><button class="btn chico oro" data-act="llegoSub">Sí, llegó</button><button class="btn chico sec" data-act="cambiarFechaSub">Cambiar fecha</button></div></div>`);
  if (k.libreReal < 0) av.push(`<div class="card aviso rojo"><b>⚠️ Tus pagos no alcanzan</b><div class="suave">Hasta tu ${prox()} te faltan <b class="coral">${soles(-k.libreReal)}</b> para cubrir lo apartado (pagos, pasajes y comida). Revisa tus pagos o habla con tiempo.</div></div>`);
  const T = k.T;
  const vencidos = E.prestamos.filter((p) => pendienteP(p) > 0 && p.vence && p.vence <= T);
  for (const p of vencidos.slice(0, 2)) {
    const dias = difDias(p.vence, T);
    const txt = p.tipo === "preste" ? `${esc(p.persona)} te debe ${soles(pendienteP(p))}` : `Le debes ${soles(pendienteP(p))} a ${esc(p.persona)}`;
    av.push(`<div class="chip aviso" data-act="irPrestamos"><div class="ico">🤝</div><div class="t"><b>${txt}</b><span>${dias === 0 ? "Vence hoy" : `Venció hace ${dias} día${dias === 1 ? "" : "s"}`}</span></div></div>`);
  }
  if (E.config.respaldoPendiente) av.push(`<div class="card aviso"><b>💾 Brotty: ¿hacemos respaldo?</b><div class="suave">Llegó tu ${lbl()}, buen momento para guardar una copia.</div>
    <div class="acciones"><button class="btn chico" data-act="respaldo">Hacer respaldo</button><button class="btn chico sec" data-act="omitirRespaldo">Ahora no</button></div></div>`);
  const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (!instalada) av.unshift(`<div class="card aviso"><b>📲 ¡Instálame!</b><div class="suave">Así me tienes en tu pantalla como app y funciono sin internet. En Chrome: toca <b>⋮</b> → <b>Instalar aplicación</b>.</div>${promptInstalar ? `<div class="acciones"><button class="btn chico" data-act="instalar">Instalar ahora</button></div>` : ""}</div>`);
  $("#avisos").innerHTML = av.join("");

  // Chips
  const ch = [];
  const meta = E.metas[0];
  if (meta) {
    const ah = ahorradoMeta(meta), pct = meta.objetivo ? Math.min(100, (ah / meta.objetivo) * 100) : 0;
    ch.push(`<div class="chip" data-act="irMetas"><div class="ico">🏆</div><div class="t"><b>${esc(meta.nombre)}</b><span><span class="gold">${soles(ah)}</span> de ${soles(meta.objetivo)}</span><div class="mini-barra"><i style="width:${pct}%"></i></div></div></div>`);
  }
  const prox = E.pagos.filter((p) => !p.pagadoEl).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (prox) {
    const d = difDias(T, prox.fecha);
    ch.push(`<div class="chip" data-act="irPagos"><div class="ico">${prox.icono || "📌"}</div><div class="t"><b>${esc(prox.nombre)} · ${soles(prox.monto)}</b><span>${d < 0 ? "Venció hace " + -d + " días" : d === 0 ? "Vence hoy" : "Vence el " + fechaCorta(prox.fecha)}</span></div></div>`);
  }
  if (!E.movs.length) ch.push(`<div class="card suave" style="text-align:center">Toca <b class="verde">+</b> para registrar tu primer gasto. Desliza para ver los otros cuartos ↔</div>`);
  $("#chips").innerHTML = ch.join("");
}

// ---- Movimientos ----
let movMes = hoyISO().slice(0, 7);
function renderMovs() {
  const [y, m] = movMes.split("-").map(Number);
  $("#movMesLabel").textContent = capital(new Date(y, m - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" }));
  const lista = E.movs.filter((x) => x.fecha.startsWith(movMes)).sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.hora || "").localeCompare(a.hora || "") || b.creado - a.creado);
  const ing = suma(lista.filter((x) => x.tipo === "ingreso"), (x) => x.monto), gas = suma(lista.filter((x) => x.tipo === "gasto"), (x) => x.monto);
  let html = `<div class="resumen"><div class="card"><small>Ingresos</small><b class="verde">${soles(ing)}</b></div><div class="card"><small>Gastos</small><b class="coral">${soles(gas)}</b></div></div>`;
  if (!lista.length) html += `<div class="vacio">No hay movimientos este mes.</div>`;
  let dia = "";
  for (const x of lista) {
    if (x.fecha !== dia) { dia = x.fecha; html += `<div class="dia">${x.fecha === hoyISO() ? "Hoy" : fechaBonita(x.fecha)}</div>`; }
    const c = CATS[x.cat] || CATS.otros;
    const sub = [x.lugar ? LUGARES[x.lugar].slice(3) : "", x.hora].filter(Boolean).join(" · ");
    html += `<div class="mov" data-act="editarMov" data-id="${x.id}"><div class="ico">${x.icono || c.e}</div>
      <div class="t"><b>${esc(x.nota || c.n)}</b><span>${x.nota ? esc(c.n) + (sub ? " · " : "") : ""}${esc(sub)}</span></div>
      <div class="m ${x.tipo === "ingreso" ? "verde" : "coral"}">${x.tipo === "ingreso" ? "+" : "−"} ${soles(x.monto)}</div></div>`;
  }
  $("#listaMovs").innerHTML = html;
}

// ---- Presupuestos ----
function renderPresup(k) {
  const T = k.T, c = E.config;
  const pres = comidaSemPresup(), gast = comidaGastada(T, addDias(T, 1));
  const pct = pres ? Math.min(100, (gast / pres) * 100) : 0, queda = r2(pres - gast);
  const finSem = addDias(lunesDe(T), 6), diasSem = difDias(T, finSem) + 1;
  let h = `<div class="card sobrante"><div class="fila"><div style="flex:0 0 auto;font-size:34px">✨</div><div><small class="suave">Sobrante del período</small><div class="gold" style="font-size:28px">${soles(k.sobrante)}</div></div></div>
    <div class="suave" style="font-size:13px;margin-top:4px">Lo que no gastas de tu diario se guarda aquí, no se suma al día siguiente. Los ingresos extra también caen aquí.</div>
    ${k.sobrante >= 1 ? `<button class="btn oro full" style="margin-top:10px" data-act="sobranteAMeta">Pasarlo a mi copa 🏆</button>` : ""}</div>`;

  h += `<div class="card"><h3>🥕 Comida esta semana</h3>${pres || c.cocina ? `
    <div class="fila" style="justify-content:space-between"><span style="flex:none"><b>${soles(gast)}</b> de ${soles(pres)}</span><span style="flex:none" class="${queda < 0 ? "coral" : "verde"}">${queda < 0 ? "Te pasaste " + soles(-queda) : "Quedan " + soles(queda)}</span></div>
    <div class="mini-barra" style="height:12px"><i style="width:${pct}%;background:${queda < 0 ? "var(--coral)" : pct > 80 ? "var(--dorado)" : "var(--verde)"}"></i></div>
    <div class="suave" style="font-size:13px;margin-top:6px">${diasSem === 1 ? "Hoy termina la semana" : `Faltan ${diasSem} días para el lunes`}. ${queda < 0 ? "Lo que pasaste sale de tu diario." : "Registra tus compras como 🥕 Ingredientes."}</div>`
    : `<div class="suave">${c.cocina ? "Pon tu presupuesto semanal en 👤 Perfil." : "No compras comida para cocinar. Si cambia, actívalo en 👤 Perfil."}</div>`}</div>`;

  // Pasajes y menú del período
  const gastPas = suma(E.movs.filter((m) => m.cat === "transporte" && m.fecha >= k.P && m.fecha <= T), (m) => m.monto);
  let nPas = 0, nMenu = 0, proxMenu = null;
  for (let i = 0; i < k.D; i++) { const f = addDias(T, i), q = costoClase(f); if (q.pasaje) nPas++; if (q.menu) { nMenu++; if (!proxMenu) proxMenu = f; } }
  h += `<div class="card"><h3>🚌 Pasajes</h3>${(!esEstudiante() || c.modo === "ciclo") && c.pasaje ? `
    <div>Apartados: <b>${soles(nPas * c.pasaje)}</b> <span class="suave">(${nPas} día${nPas === 1 ? "" : "s"} de ${diasDe()} hasta tu ${lbl()})</span></div>
    <div class="suave" style="font-size:13px;margin-top:4px">Gastado este período: ${soles(gastPas)}${esEstudiante() && c.finCiclo ? ` · Clases hasta el ${fechaCorta(c.finCiclo)}` : ""}</div>`
    : `<div class="suave">${esEstudiante() && c.modo === "vacaciones" ? "Estás en modo vacaciones: sin pasajes 🏡" : "Sin pasajes configurados."}</div>`}</div>`;
  if ((!esEstudiante() || c.modo === "ciclo") && c.menu && (c.comidaDias || []).length) h += `<div class="card"><h3>🍜 Comida fuera (${(c.comidaDias || []).map((d) => DIAS_CORTOS[d]).join(", ")})</h3><div>Apartados: <b>${soles(nMenu * c.menu)}</b> <span class="suave">(${nMenu} menú${nMenu === 1 ? "" : "s"})</span></div>
    ${proxMenu ? `<div class="suave" style="font-size:13px;margin-top:4px">Próximo: ${proxMenu === T ? "hoy" : fechaBonita(proxMenu)}</div>` : ""}</div>`;

  // Resumen de lo apartado
  const filas = [["🥕 Comida", k.resComida], ["🚌 Pasajes y 🍜 menús", k.resClase], ["📌 Pagos programados", k.resPagos], ["🙏 Deudas por devolver", k.resDeudas]].filter((x) => x[1] > 0);
  h += `<div class="card"><h3>🛡️ Lo que Brotty aparta por ti</h3><div class="suave" style="font-size:13px;margin-bottom:6px">Hasta tu ${prox()} (~${k.D} días)</div>
    ${filas.map(([n, v]) => `<div class="fila" style="justify-content:space-between;margin:4px 0"><span style="flex:none">${n}</span><b style="flex:none">${soles(v)}</b></div>`).join("") || `<div class="suave">Nada apartado.</div>`}
    <hr style="border:0;border-top:2px solid var(--borde);margin:8px 0"><div class="fila" style="justify-content:space-between"><span style="flex:none">Total apartado</span><b style="flex:none" class="gold">${soles(k.reservas)}</b></div>
    <div class="fila" style="justify-content:space-between;margin-top:4px"><span style="flex:none">Tu diario fijo</span><b style="flex:none" class="verde">${soles(k.diario)}</b></div></div>`;
  $("#presup").innerHTML = h;
}

// ---- Estadísticas ----
let statsModo = "semana", statsOff = 0;
function rangoStats(off) {
  const T = hoyISO();
  if (statsModo === "semana") {
    const wd = (parse(T).getDay() + 6) % 7;
    const ini = addDias(T, -wd + off * 7);
    return { ini, fin: addDias(ini, 7), label: off === 0 ? "Esta semana" : `${fechaCorta(ini)} – ${fechaCorta(addDias(ini, 6))}` };
  }
  const d = parse(T); d.setDate(1); d.setMonth(d.getMonth() + off);
  const ini = fechaISO(d); const fin = addMeses(ini, 1);
  return { ini, fin, label: capital(d.toLocaleDateString("es-PE", { month: "long", year: "numeric" })) };
}
function renderStats() {
  const R = rangoStats(statsOff), Rp = rangoStats(statsOff - 1);
  $("#statsLabel").textContent = R.label;
  document.querySelectorAll("#segStats button").forEach((b) => b.classList.toggle("on", b.dataset.m === statsModo));
  const en = (r) => E.movs.filter((m) => m.fecha >= r.ini && m.fecha < r.fin);
  const L = en(R), Lp = en(Rp);
  const G = L.filter((m) => m.tipo === "gasto"), Gp = Lp.filter((m) => m.tipo === "gasto");
  const ing = suma(L.filter((m) => m.tipo === "ingreso"), (m) => m.monto), gas = suma(G, (m) => m.monto);
  let h = `<div class="resumen"><div class="card"><small>Ingresos</small><b class="verde">${soles(ing)}</b></div><div class="card"><small>Gastos</small><b class="coral">${soles(gas)}</b></div></div>`;

  // Barras por día (semana) o por semana (mes)
  const cols = [];
  if (statsModo === "semana") {
    for (let i = 0; i < 7; i++) { const f = addDias(R.ini, i); cols.push({ l: ["L", "M", "M", "J", "V", "S", "D"][i], v: suma(G.filter((m) => m.fecha === f), (m) => m.monto), hoy: f === hoyISO() }); }
  } else {
    let f = R.ini, n = 1;
    while (f < R.fin) { const f2 = addDias(f, 7) < R.fin ? addDias(f, 7) : R.fin; const ff = f; cols.push({ l: "S" + n++, v: suma(G.filter((m) => m.fecha >= ff && m.fecha < f2), (m) => m.monto) }); f = f2; }
  }
  const mx = Math.max(1, ...cols.map((c) => c.v));
  h += `<div class="card"><h3>Gastos ${statsModo === "semana" ? "por día" : "por semana"}</h3><div class="barras">${cols.map((c) => `<div class="col ${c.hoy ? "hoyc" : ""}"><em>${c.v ? Math.round(c.v) : ""}</em><i style="height:${(c.v / mx) * 100}%"></i><small>${c.l}</small></div>`).join("")}</div></div>`;

  // Por categoría con comparación
  const porCat = {}, porCatP = {};
  G.forEach((m) => (porCat[m.cat] = (porCat[m.cat] || 0) + m.monto));
  Gp.forEach((m) => (porCatP[m.cat] = (porCatP[m.cat] || 0) + m.monto));
  const filas = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const mxc = Math.max(1, ...filas.map((f) => f[1]));
  h += `<div class="card"><h3>¿En qué se fue?</h3>${filas.length ? filas.map(([c, v]) => {
    const d = r2(v - (porCatP[c] || 0));
    const dif = Gp.length ? (d > 0 ? `<span class="dif coral">↑ ${soles(d)}</span>` : d < 0 ? `<span class="dif verde">↓ ${soles(-d)}</span>` : `<span class="dif suave">=</span>`) : "";
    return `<div class="cat"><div class="f"><span>${(CATS[c] || CATS.otros).e} ${(CATS[c] || CATS.otros).n}</span><span><b>${soles(v)}</b> ${dif}</span></div><div class="b"><i style="width:${(v / mxc) * 100}%;background:${CATS[c]?.antojo ? "var(--coral)" : "var(--morado)"}"></i></div></div>`;
  }).join("") + `<div class="suave" style="font-size:12px;margin-top:6px">Flechas: comparado con ${statsModo === "semana" ? "la semana" : "el mes"} anterior.</div>` : `<div class="vacio">Sin gastos en este período.</div>`}</div>`;

  // Hábitos de comida
  const coc = porCat.ingredientes || 0, fue = porCat.fuera || 0, sna = porCat.snacks || 0, tc = coc + fue + sna;
  if (tc > 0) {
    const pc = (v) => (v / tc) * 100;
    const lug = {}; G.filter((m) => ["ingredientes", "fuera", "snacks"].includes(m.cat) && m.lugar).forEach((m) => (lug[m.lugar] = (lug[m.lugar] || 0) + m.monto));
    const topL = Object.entries(lug).sort((a, b) => b[1] - a[1]).slice(0, 3);
    h += `<div class="card"><h3>Tu comida</h3><div class="apilada"><i style="width:${pc(coc)}%;background:var(--verde)"></i><i style="width:${pc(fue)}%;background:var(--dorado)"></i><i style="width:${pc(sna)}%;background:var(--coral)"></i></div>
      <div class="leyenda"><span style="--c:var(--verde)">Cocinaste ${soles(coc)}</span><span style="--c:var(--dorado)">Comiste fuera ${soles(fue)}</span><span style="--c:var(--coral)">Snacks ${soles(sna)}</span></div>
      ${topL.length ? `<div class="suave" style="font-size:13px;margin-top:8px">Dónde: ${topL.map(([l, v]) => `${LUGARES[l]} ${soles(v)}`).join(" · ")}</div>` : ""}</div>`;
  }

  // Necesario vs antojo
  const ant = suma(G.filter((m) => CATS[m.cat]?.antojo), (m) => m.monto);
  if (gas > 0) {
    const menu = +E.config.menu || 13;
    h += `<div class="card"><h3>Necesario vs antojo</h3><div class="apilada"><i style="width:${((gas - ant) / gas) * 100}%;background:var(--morado)"></i><i style="width:${(ant / gas) * 100}%;background:var(--coral)"></i></div>
      <div class="leyenda"><span style="--c:var(--morado)">Necesario ${soles(gas - ant)}</span><span style="--c:var(--coral)">Antojos ${soles(ant)}</span></div>
      ${ant > 0 ? `<div style="margin-top:10px">🌱 Tus antojos equivalen a <b class="gold">${(ant / menu).toFixed(1)} menús</b> o <b class="gold">${(ant / ((+E.config.comidaSem || 70) / 7)).toFixed(1)} días de comida</b> cocinando.</div>` : ""}</div>`;
  }
  $("#stats").innerHTML = h;
}

// ---- Metas ----
function copaSVG(pct) {
  const p = Math.min(1, Math.max(0, pct / 100)), top = 40, bot = 150, y = bot - (bot - top) * p, lleno = p >= 1;
  const ola = `M10 ${y} q 15 -7 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 V 200 H 10 Z`;
  return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8860b"/><stop offset=".35" stop-color="#ffe680"/><stop offset=".6" stop-color="#ffd23f"/><stop offset="1" stop-color="#a87400"/></linearGradient>
      <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dffb0"/><stop offset="1" stop-color="#1fae5c"/></linearGradient>
      <clipPath id="vaso"><path d="M44 36 L156 36 C 156 112,132 152,100 152 C 68 152,44 112,44 36 Z"/></clipPath>
    </defs>
    ${lleno ? `<circle cx="100" cy="95" r="88" fill="#ffd23f" opacity=".12"/>` : ""}
    <path d="M44 52 C 8 50,8 108,56 112" stroke="url(#oro)" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M156 52 C 192 50,192 108,144 112" stroke="url(#oro)" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M44 36 L156 36 C 156 112,132 152,100 152 C 68 152,44 112,44 36 Z" fill="#0f1e18"/>
    <g clip-path="url(#vaso)">
      <path d="${ola}" fill="url(#liq)" opacity=".95"><animateTransform attributeName="transform" type="translate" values="0 0;-30 0;0 0" dur="4s" repeatCount="indefinite"/></path>
      ${p > 0.05 ? `<circle cx="80" cy="140" r="4" fill="#fff" opacity=".6"><animate attributeName="cy" values="148;${y + 6}" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="114" cy="140" r="3" fill="#fff" opacity=".5"><animate attributeName="cy" values="150;${y + 6}" dur="2.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="2.3s" repeatCount="indefinite"/></circle>
      <circle cx="98" cy="140" r="2.5" fill="#fff" opacity=".5"><animate attributeName="cy" values="150;${y + 6}" dur="3.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="3.6s" repeatCount="indefinite"/></circle>` : ""}
    </g>
    <path d="M44 36 L156 36 C 156 112,132 152,100 152 C 68 152,44 112,44 36 Z" fill="none" stroke="url(#oro)" stroke-width="8" stroke-linejoin="round"/>
    <path d="M38 32 L162 32" stroke="url(#oro)" stroke-width="10" stroke-linecap="round"/>
    <path d="M58 48 C 58 92,70 122,86 136" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35"/>
    <path d="M88 152 L112 152 L108 178 L92 178 Z" fill="url(#oro)" stroke="#7a5200" stroke-width="3" stroke-linejoin="round"/>
    <rect x="62" y="176" width="76" height="16" rx="6" fill="url(#oro)" stroke="#7a5200" stroke-width="3"/>
    <rect x="52" y="192" width="96" height="24" rx="8" fill="#3a2a10" stroke="#7a5200" stroke-width="3"/>
    <text x="100" y="209" text-anchor="middle" font-size="14" font-weight="900" fill="#ffd23f" font-family="Nunito,Arial">${Math.round(pct)}%</text>
    <path d="M172 20 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff8c0"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></path>
    <path d="M24 130 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#fff8c0"><animate attributeName="opacity" values=".2;1;.2" dur="2.6s" repeatCount="indefinite"/></path>
    ${lleno ? `<g transform="translate(100 34)"><path d="M0 0 C -2 -14,0 -22,4 -28" stroke="#2a7a14" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M4 -26 C 12 -38,30 -38,34 -30 C 24 -24,14 -22,4 -26 Z" fill="#7dff6a" stroke="#123d0a" stroke-width="3"/><path d="M2 -22 C -8 -32,-22 -30,-24 -24 C -16 -18,-6 -18,2 -22 Z" fill="#5fd64a" stroke="#123d0a" stroke-width="3"/></g>` : ""}
  </svg>`;
}
function mesesSinPedir() {
  const pap = E.movs.filter((m) => m.cat === "papas").map((m) => m.fecha).sort();
  const desde = pap.length ? pap[pap.length - 1] : E.config.fechaInicio;
  const a = parse(desde), b = new Date();
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0));
}
function renderMetas(k) {
  let h = "";
  const m0 = E.metas[0];
  if (m0) {
    const ah = ahorradoMeta(m0), pct = m0.objetivo ? (ah / m0.objetivo) * 100 : 0;
    h += `<div class="copa-wrap">${copaSVG(pct)}<div style="font-weight:900;font-size:18px">${esc(m0.nombre)}</div><div><span class="gold">${soles(ah)}</span> de ${soles(m0.objetivo)}</div></div>`;
  } else {
    h += `<div class="copa-wrap">${copaSVG(0)}</div><div class="vacio">Crea tu primera meta. Brotty te sugerirá cuánto apartar según tus números, sin tocar lo que necesitas.</div>`;
  }
  for (const m of E.metas) {
    const ah = ahorradoMeta(m), pct = m.objetivo ? Math.min(100, (ah / m.objetivo) * 100) : 0;
    h += `<div class="card"><div class="fila" style="justify-content:space-between"><b style="flex:none">🏆 ${esc(m.nombre)}</b><span style="flex:none"><span class="gold">${soles(ah)}</span> / ${soles(m.objetivo)}</span></div>
      <div class="mini-barra"><i style="width:${pct}%"></i></div>
      <div class="fila" style="margin-top:10px"><button class="btn chico oro" data-act="aportar" data-id="${m.id}">+ Apartar</button><button class="btn chico sec" data-act="retirar" data-id="${m.id}">Sacar</button><button class="btn chico sec" data-act="borrarMeta" data-id="${m.id}">Borrar</button></div></div>`;
  }
  h += `<button class="btn full" style="margin-top:12px" data-act="nuevaMeta">+ Nueva meta</button>`;
  const n = mesesSinPedir();
  h += `<div class="card" style="text-align:center"><div style="font-size:30px">👪</div><b>${n} ${n === 1 ? "mes" : "meses"} sin pedir dinero extra</b><div class="suave" style="font-size:13px">Se cuenta desde la última vez que registraste "Plata extra de mis papás".</div></div>`;
  h += `<div class="card suave" style="font-size:13px">Tienes <b class="verde">${soles(k.libre)}</b> libres y <b class="gold">${soles(k.enMetas)}</b> apartados en metas (no cuentan en tu "hoy puedes gastar").</div>`;
  $("#metas").innerHTML = h;
}

// ---- Pagos y préstamos ----
function renderPagos(k) {
  const T = hoyISO();
  const pend = E.pagos.filter((p) => !p.pagadoEl).sort((a, b) => a.fecha.localeCompare(b.fecha));
  let h = `<div class="card"><h3>📌 Pagos programados</h3><div class="suave" style="font-size:13px">Se apartan solos antes de calcular tu diario.</div>`;
  h += pend.length ? pend.map((p) => {
    const d = difDias(T, p.fecha), antes = p.fecha < k.S;
    return `<div class="mov" style="margin-top:8px;cursor:default"><div class="ico">${p.icono || "🏠"}</div><div class="t"><b>${esc(p.nombre)}</b><span>${d < 0 ? `<span class="coral">Venció hace ${-d} días</span>` : d === 0 ? "Vence hoy" : "Vence el " + fechaCorta(p.fecha)}${p.mensual ? " · cada mes" : ""}${antes ? " · apartado" : ""}</span></div>
      <div style="text-align:right"><div class="m">${soles(p.monto)}</div><div class="fila" style="gap:4px;margin-top:4px"><button class="btn chico" data-act="pagar" data-id="${p.id}">Pagar</button><button class="btn chico sec" data-act="editarPago" data-id="${p.id}">✎</button></div></div></div>`;
  }).join("") : `<div class="vacio">Sin pagos programados.</div>`;
  h += `<button class="btn sec full" style="margin-top:10px" data-act="nuevoPago">+ Agregar pago</button></div>`;

  const ps = E.prestamos.slice().sort((a, b) => (a.vence || "9").localeCompare(b.vence || "9"));
  const act = ps.filter((p) => pendienteP(p) > 0), fin = ps.filter((p) => pendienteP(p) <= 0);
  const tarj = (p) => {
    const pe = pendienteP(p), venc = p.vence && p.vence <= T && pe > 0;
    return `<div class="mov" style="cursor:default;margin-top:8px"><div class="ico">${p.tipo === "preste" ? "🫴" : "🙏"}</div><div class="t"><b>${p.tipo === "preste" ? esc(p.persona) + " me debe" : "Le debo a " + esc(p.persona)}</b>
      <span>${soles(p.monto)} · ${fechaCorta(p.fecha)}${p.vence ? ` · ${venc ? '<span class="coral">vence ' + fechaCorta(p.vence) + "</span>" : "vence " + fechaCorta(p.vence)}` : ""}${p.pagos.length ? " · pagado " + soles(pagadoP(p)) : ""}${p.nota ? " · " + esc(p.nota) : ""}</span></div>
      <div style="text-align:right"><div class="m ${p.tipo === "preste" ? "verde" : "coral"}">${pe > 0 ? soles(pe) : "✓"}</div><div class="fila" style="gap:4px;margin-top:4px">${pe > 0 ? `<button class="btn chico" data-act="pagoPrestamo" data-id="${p.id}">Pago</button>` : ""}<button class="btn chico sec" data-act="borrarPrestamo" data-id="${p.id}">✕</button></div></div></div>`;
  };
  const meDeben = suma(act.filter((p) => p.tipo === "preste"), pendienteP), debo = suma(act.filter((p) => p.tipo === "debo"), pendienteP);
  h += `<div class="card"><h3>🤝 Préstamos</h3><div class="resumen" style="margin:6px 0"><div class="card" style="padding:8px 10px"><small>Me deben</small><b class="verde">${soles(meDeben)}</b></div><div class="card" style="padding:8px 10px"><small>Yo debo</small><b class="coral">${soles(debo)}</b></div></div>
    ${act.length ? act.map(tarj).join("") : `<div class="vacio">Nada pendiente 🎉</div>`}
    <button class="btn sec full" style="margin-top:10px" data-act="nuevoPrestamo">+ Registrar préstamo</button>
    ${fin.length ? `<div class="dia">Ya pagados</div>${fin.slice(0, 10).map(tarj).join("")}` : ""}</div>`;
  $("#pagos").innerHTML = h;
}

// ---------- Hoja inferior ----------
const wrap = $("#sheetWrap"), sheet = $("#sheet");
let sheetFijo = false, sheetRender = null;
function abrir(fn, fijo = false) {
  sheetRender = fn; sheetFijo = fijo; fn();
  if (!wrap.classList.contains("abierto")) { wrap.classList.add("abierto"); history.pushState({ hoja: 1 }, ""); }
}
function cerrar(desdeHistorial) {
  if (!wrap.classList.contains("abierto")) return;
  wrap.classList.remove("abierto"); sheetRender = null;
  if (!desdeHistorial && history.state && history.state.hoja) history.back();
}
wrap.addEventListener("click", (e) => { if (e.target === wrap && !sheetFijo) cerrar(); });
window.addEventListener("popstate", () => { if (wrap.classList.contains("abierto")) { if (sheetFijo) history.pushState({ hoja: 1 }, ""); else cerrar(true); } });
const btnCerrar = () => (sheetFijo ? "" : `<button class="cerrar" data-act="cerrar">✕</button>`);

let toastT;
function toast(msg, deshacer) {
  const t = $("#toast");
  t.innerHTML = `<span>${msg}</span>${deshacer ? `<button id="tUndo">Deshacer</button>` : ""}`;
  t.classList.add("ver");
  if (deshacer) $("#tUndo").onclick = () => { deshacer(); t.classList.remove("ver"); };
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("ver"), 3500);
}

// ---------- Registro (gasto / ingreso / préstamo) ----------
let R = null;
function nuevoRegistro(tab = "gasto", extra = {}) {
  R = Object.assign({ tab, cat: null, monto: "", lugar: null, nota: "", fecha: hoyISO(), editId: null, tipoP: "preste", persona: "", vence: "" }, extra);
  abrir(pintarRegistro);
}
function atajos() {
  const cuenta = {};
  E.movs.filter((m) => m.tipo === "gasto" && m.cat !== "pagos").slice(-80).forEach((m) => {
    const k = `${m.cat}|${m.monto}|${m.lugar || ""}`; cuenta[k] = (cuenta[k] || 0) + 1;
  });
  const top = Object.entries(cuenta).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
  const c = E.config;
  if (c.pasaje && !top.some((k) => k.startsWith("transporte|"))) top.push(`transporte|${+c.pasaje}|`);
  if (c.menu && !top.some((k) => k.startsWith("fuera|"))) top.push(`fuera|${+c.menu}|univ`);
  return top.slice(0, 6);
}
function pintarRegistro() {
  const tabs = `<div class="tabs">${[["gasto", "Gasto"], ["ingreso", "Ingreso"], ["prestamo", "Préstamo"]].map(([t, n]) => `<button class="${R.tab === t ? "on" : ""}" data-act="regTab" data-t="${t}" ${R.editId && t !== R.tab ? "disabled" : ""}>${n}</button>`).join("")}</div>`;
  let h = `${btnCerrar()}<h2>${R.editId ? "Editar" : "Registrar"}</h2>${R.editId ? "" : tabs}`;
  if (R.tab === "prestamo") {
    h += `<div class="chips-sel" style="margin-bottom:6px"><button class="${R.tipoP === "preste" ? "on" : ""}" data-act="regTipoP" data-t="preste">🫴 Yo presté</button><button class="${R.tipoP === "debo" ? "on" : ""}" data-act="regTipoP" data-t="debo">🙏 Me prestaron</button></div>
      <label>Persona</label><input type="text" id="rPersona" maxlength="40" placeholder="Ej: Carlos" value="${esc(R.persona)}">
      <div class="monto">${R.monto ? "S/ " + R.monto : "S/ 0"}</div>${teclado()}
      <label>¿Para cuándo debe devolverse? (opcional)</label><input type="date" id="rVence" value="${R.vence}">
      <label>Nota (opcional)</label><input type="text" id="rNota" maxlength="60" value="${esc(R.nota)}">
      <button class="btn full" style="margin-top:14px" data-act="guardarReg">Guardar préstamo</button>`;
  } else if (!R.cat) {
    const lista = R.tab === "gasto" ? CATS_GASTO : CATS_INGRESO;
    if (R.tab === "gasto") {
      const at = atajos();
      if (at.length) h += `<div class="suave" style="font-size:13px;margin-bottom:6px">Atajos (un toque y listo)</div><div class="atajos">${at.map((k) => { const [c, m, l] = k.split("|"); return `<button class="atajo" data-act="atajo" data-k="${k}">${CATS[c].e} ${l ? LUGARES[l].slice(3) + " " : ""}S/ ${(+m).toFixed(2)}</button>`; }).join("")}</div>`;
    }
    h += `<div class="suave" style="font-size:13px;margin-bottom:6px">${R.tab === "gasto" ? "¿Qué compraste?" : "¿De dónde vino?"}</div>
      <div class="grid-cats">${lista.map((c) => `<button class="cat-btn" data-act="regCat" data-c="${c}"><span class="e">${CATS[c].e}</span>${CATS[c].n}</button>`).join("")}</div>`;
  } else {
    const c = CATS[R.cat];
    h += `<div class="cat-elegida"><div class="cat-btn on" style="flex:1;flex-direction:row;justify-content:flex-start;padding:8px 12px"><span class="e" style="font-size:24px">${c.e}</span>${c.n}</div><button class="btn chico sec" data-act="regCambiarCat">Cambiar</button></div>
      <div class="monto">${R.monto ? "S/ " + R.monto : "S/ 0"}</div>`;
    if (R.tab === "gasto") h += `<div class="chips-sel">${Object.entries(LUGARES).map(([k, n]) => `<button class="${R.lugar === k ? "on" : ""}" data-act="regLugar" data-l="${k}">${n}</button>`).join("")}</div>`;
    h += teclado();
    h += `<div class="fila"><div><label>Nota (opcional)</label><input type="text" id="rNota" maxlength="60" placeholder="Ej: pan con palta" value="${esc(R.nota)}"></div>
      <div style="flex:0 0 42%"><label>Fecha</label><input type="date" id="rFecha" value="${R.fecha}"></div></div>
      <button class="btn full" style="margin-top:14px" data-act="guardarReg">${R.editId ? "Guardar cambios" : "Guardar"}</button>
      ${R.editId ? `<button class="btn rojo full" style="margin-top:8px" data-act="borrarMov">Borrar</button>` : ""}`;
  }
  sheet.innerHTML = h;
}
const teclado = () => `<div class="teclado">${["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((t) => `<button data-act="tecla" data-t="${t}">${t}</button>`).join("")}</div>`;
function leerCamposReg() {
  const n = $("#rNota"), f = $("#rFecha"), p = $("#rPersona"), v = $("#rVence");
  if (n) R.nota = n.value; if (f) R.fecha = f.value || hoyISO(); if (p) R.persona = p.value; if (v) R.vence = v.value;
}

// ---------- Acciones ----------
const ACT = {
  cerrar: () => cerrar(),
  irPrestamos: () => irA(5), irPagos: () => irA(5), irMetas: () => irA(4), irPresup: () => irA(2),
  nuevo: () => nuevoRegistro(roomIdx === 5 ? "prestamo" : "gasto"),
  regTab: (d) => { leerCamposReg(); R.tab = d.t; R.cat = null; pintarRegistro(); },
  regTipoP: (d) => { leerCamposReg(); R.tipoP = d.t; pintarRegistro(); },
  regCat: (d) => { R.cat = d.c; pintarRegistro(); },
  regCambiarCat: () => { leerCamposReg(); R.cat = null; pintarRegistro(); },
  regLugar: (d) => { leerCamposReg(); R.lugar = R.lugar === d.l ? null : d.l; pintarRegistro(); },
  tecla: (d) => {
    leerCamposReg();
    let m = R.monto;
    if (d.t === "⌫") m = m.slice(0, -1);
    else if (d.t === ".") { if (!m.includes(".")) m = (m || "0") + "."; }
    else if (!(m.includes(".") && m.split(".")[1].length >= 2) && m.length < 8) m = m === "0" ? d.t : m + d.t;
    R.monto = m; pintarRegistro();
  },
  atajo: (d) => {
    const [cat, monto, lugar] = d.k.split("|");
    const mov = { id: uid(), tipo: "gasto", cat, monto: +monto, lugar: lugar || null, fecha: hoyISO(), hora: horaAhora(), nota: "", creado: Date.now() };
    E.movs.push(mov); guardar(); cerrar(); saltar();
    toast(`${CATS[cat].e} ${soles(+monto)} guardado`, () => { E.movs = E.movs.filter((x) => x.id !== mov.id); guardar(); });
  },
  guardarReg: () => {
    leerCamposReg();
    const monto = r2(parseFloat(R.monto));
    if (!(monto > 0)) return toast("Escribe un monto");
    if (R.tab === "prestamo") {
      if (!R.persona.trim()) return toast("¿Quién? Escribe un nombre");
      E.prestamos.push({ id: uid(), tipo: R.tipoP, persona: R.persona.trim(), monto, fecha: hoyISO(), vence: R.vence || "", nota: R.nota.trim(), pagos: [] });
      guardar(); cerrar(); toast("Préstamo guardado 🤝"); return;
    }
    if (R.editId) {
      const m = E.movs.find((x) => x.id === R.editId);
      Object.assign(m, { cat: R.cat, monto, lugar: R.tab === "gasto" ? R.lugar : null, nota: R.nota.trim(), fecha: R.fecha });
      guardar(); cerrar(); toast("Cambios guardados"); return;
    }
    const mov = { id: uid(), tipo: R.tab, cat: R.cat, monto, lugar: R.tab === "gasto" ? R.lugar : null, fecha: R.fecha, hora: horaAhora(), nota: R.nota.trim(), creado: Date.now() };
    E.movs.push(mov);
    if (mov.cat === "subvencion") { despuesDeSubvencion(); }
    guardar(); cerrar(); saltar();
    if (mov.tipo === "ingreso") celebrar(3500);
    toast(`${CATS[mov.cat].e} ${soles(monto)} guardado`, () => { E.movs = E.movs.filter((x) => x.id !== mov.id); guardar(); });
  },
  editarMov: (d) => {
    const m = E.movs.find((x) => x.id === d.id); if (!m) return;
    if (m.cat === "pagos" || m.cat === "ajuste") {
      return abrir(() => { sheet.innerHTML = `${btnCerrar()}<h2>${esc(m.nota || CATS[m.cat].n)}</h2><p class="suave">${soles(m.monto)} · ${fechaBonita(m.fecha)}</p><button class="btn rojo full" data-act="borrarMovId" data-id="${m.id}">Borrar</button>`; });
    }
    R = { tab: m.tipo, cat: m.cat, monto: String(m.monto), lugar: m.lugar, nota: m.nota || "", fecha: m.fecha, editId: m.id };
    abrir(pintarRegistro);
  },
  borrarMov: () => { if (confirm("¿Borrar este movimiento?")) { E.movs = E.movs.filter((x) => x.id !== R.editId); guardar(); cerrar(); } },
  borrarMovId: (d) => {
    if (!confirm("¿Borrar este movimiento?")) return;
    const m = E.movs.find((x) => x.id === d.id);
    if (m && m.pagoId) { const p = E.pagos.find((x) => x.id === m.pagoId); if (p) p.pagadoEl = null; }
    E.movs = E.movs.filter((x) => x.id !== d.id); guardar(); cerrar();
  },
  movMes: (d) => { const [y, m] = movMes.split("-").map(Number); movMes = fechaISO(new Date(y, m - 1 + +d.d, 1)).slice(0, 7); renderMovs(); },
  statsModo: (d) => { statsModo = d.m; statsOff = 0; renderStats(); },
  statsNav: (d) => { statsOff = Math.min(0, statsOff + +d.d); renderStats(); },
  tocarBrotty: () => {
    const k = calc(), b = $("#brotty");
    b.classList.remove("salto"); void b.offsetWidth; b.classList.add("salto");
    const el = document.createElement("div");
    if (k.hoy > 0) { el.className = "moneda"; el.textContent = "S/"; } else { el.className = "aire"; el.textContent = "💨 aire..."; }
    b.parentElement.appendChild(el); setTimeout(() => el.remove(), 1200);
    if (navigator.vibrate) navigator.vibrate(15);
  },

  // Subvención
  llegoSub: () => abrir(() => {
    const c = E.config;
    sheet.innerHTML = `${btnCerrar()}<h2>${ING[c.ingTipo]?.e || "💵"} ¡Llegó tu ${lbl()}!</h2>
      <label>Monto recibido (S/)</label><input type="number" id="sMonto" inputmode="decimal" value="${c.montoSub || ""}">
      <label>¿Cuándo esperas la siguiente? (aproximado)</label><input type="date" id="sProx" value="${proxDefault(hoyISO())}">
      <button class="btn oro full" style="margin-top:14px" data-act="guardarSub">Registrar</button>`;
  }),
  guardarSub: () => {
    const monto = r2(parseFloat($("#sMonto").value)), prox = $("#sProx").value;
    if (!(monto > 0) || !prox) return toast("Completa monto y fecha");
    const sobAnt = Math.floor(sobranteHasta(hoyISO(), E.config.proxSub || hoyISO()));
    E.movs.push({ id: uid(), tipo: "ingreso", cat: "subvencion", monto, lugar: null, fecha: hoyISO(), hora: horaAhora(), nota: "", creado: Date.now() });
    E.config.proxSub = prox; despuesDeSubvencion(); guardar(); cerrar(); celebrar(); sugerirMeta(sobAnt);
  },
  cambiarFechaSub: () => abrir(() => {
    sheet.innerHTML = `${btnCerrar()}<h2>${prox(1)}</h2><p class="nota">Pon la fecha aproximada; la puedes cambiar cuando quieras.</p>
      <input type="date" id="sProx" value="${addDias(hoyISO(), 3)}"><button class="btn full" style="margin-top:14px" data-act="guardarFechaSub">Guardar</button>`;
  }),
  guardarFechaSub: () => { const v = $("#sProx").value; if (!v) return; E.config.proxSub = v; guardar(); cerrar(); },

  // Pagos programados
  nuevoPago: () => formPago(),
  editarPago: (d) => formPago(E.pagos.find((p) => p.id === d.id)),
  elegirIcono: (d, el) => { document.querySelectorAll("#pIconos button").forEach((b) => b.classList.toggle("on", b === el)); },
  guardarPago: (d) => {
    const icono = $("#pIconos button.on")?.dataset.i || "🏠";
    const nombre = $("#pNombre").value.trim(), monto = r2(parseFloat($("#pMonto").value)), fecha = $("#pFecha").value, mensual = $("#pMensual").checked;
    if (!nombre || !(monto > 0) || !fecha) return toast("Completa nombre, monto y fecha");
    if (d.id) Object.assign(E.pagos.find((p) => p.id === d.id), { nombre, monto, fecha, mensual, icono });
    else E.pagos.push({ id: uid(), nombre, monto, fecha, mensual, icono, pagadoEl: null, creadoEl: hoyISO() });
    guardar(); cerrar();
  },
  borrarPago: (d) => { if (confirm("¿Borrar este pago programado?")) { E.pagos = E.pagos.filter((p) => p.id !== d.id); guardar(); cerrar(); } },
  pagar: (d) => {
    const p = E.pagos.find((x) => x.id === d.id);
    abrir(() => {
      sheet.innerHTML = `${btnCerrar()}<h2>Pagar ${esc(p.nombre)}</h2><label>Monto pagado (S/)</label><input type="number" id="pgMonto" inputmode="decimal" value="${p.monto}">
        <p class="nota">${p.mensual ? "Al pagar, Brotty programa el del próximo mes." : ""}</p><button class="btn full" data-act="confirmarPago" data-id="${p.id}">Confirmar pago</button>`;
    });
  },
  confirmarPago: (d) => {
    const p = E.pagos.find((x) => x.id === d.id), monto = r2(parseFloat($("#pgMonto").value));
    if (!(monto > 0)) return toast("Monto inválido");
    const T = hoyISO();
    E.movs.push({ id: uid(), tipo: "gasto", cat: "pagos", monto, lugar: null, fecha: T, hora: horaAhora(), nota: p.nombre, creado: Date.now(), pagoId: p.id, icono: p.icono });
    p.pagadoEl = T;
    if (p.mensual) E.pagos.push({ id: uid(), nombre: p.nombre, monto: p.monto, fecha: addMeses(p.fecha, 1), mensual: true, icono: p.icono, pagadoEl: null, creadoEl: T, recurrente: true });
    guardar(); cerrar(); toast(`${esc(p.nombre)} pagado ✓`);
  },

  // Préstamos
  nuevoPrestamo: () => nuevoRegistro("prestamo"),
  pagoPrestamo: (d) => {
    const p = E.prestamos.find((x) => x.id === d.id);
    abrir(() => {
      sheet.innerHTML = `${btnCerrar()}<h2>${p.tipo === "preste" ? esc(p.persona) + " me pagó" : "Le pagué a " + esc(p.persona)}</h2>
        <p class="nota">Falta ${soles(pendienteP(p))}.</p><label>Monto (S/)</label><input type="number" id="ppMonto" inputmode="decimal" value="${pendienteP(p)}">
        <button class="btn full" style="margin-top:14px" data-act="guardarPagoPrestamo" data-id="${p.id}">Guardar</button>`;
    });
  },
  guardarPagoPrestamo: (d) => {
    const p = E.prestamos.find((x) => x.id === d.id), monto = Math.min(r2(parseFloat($("#ppMonto").value)), pendienteP(p));
    if (!(monto > 0)) return toast("Monto inválido");
    p.pagos.push({ id: uid(), monto, fecha: hoyISO() }); guardar(); cerrar();
    if (pendienteP(p) <= 0) { toast("¡Préstamo saldado! 🎉"); celebrar(3000); }
  },
  borrarPrestamo: (d) => { if (confirm("¿Borrar este préstamo y sus pagos?")) { E.prestamos = E.prestamos.filter((x) => x.id !== d.id); guardar(); } },

  // Metas
  nuevaMeta: () => abrir(() => {
    sheet.innerHTML = `${btnCerrar()}<h2>🏆 Nueva meta</h2><label>Nombre</label><input type="text" id="mNombre" maxlength="30" placeholder="Ej: Cuarto de enero">
      <label>¿Cuánto necesitas? (S/)</label><input type="number" id="mObj" inputmode="decimal">
      <button class="btn oro full" style="margin-top:14px" data-act="guardarMeta">Crear meta</button>`;
  }),
  guardarMeta: () => {
    const nombre = $("#mNombre").value.trim(), obj = r2(parseFloat($("#mObj").value));
    if (!nombre || !(obj > 0)) return toast("Completa nombre y monto");
    E.metas.push({ id: uid(), nombre, objetivo: obj, movs: [] }); guardar(); cerrar();
  },
  aportar: (d) => formMeta(d.id, 1),
  retirar: (d) => formMeta(d.id, -1),
  guardarAporte: (d) => {
    const m = E.metas.find((x) => x.id === d.id), signo = +d.s, monto = r2(parseFloat($("#aMonto").value));
    if (!(monto > 0)) return toast("Monto inválido");
    const k = calc();
    if (signo > 0 && monto > k.libre) return toast("No tienes tanto libre");
    if (signo < 0 && monto > ahorradoMeta(m)) return toast("No hay tanto en la meta");
    m.movs.push({ fecha: hoyISO(), monto: signo * monto }); guardar(); cerrar();
    if (signo > 0) { celebrar(3500); toast("¡A la copa! 🏆"); }
  },
  borrarMeta: (d) => { if (confirm("¿Borrar la meta? Lo apartado vuelve a tu dinero libre.")) { E.metas = E.metas.filter((x) => x.id !== d.id); guardar(); } },

  // Respaldo y ajustes
  sobranteAMeta: () => { if (!E.metas.length) return ACT.nuevaMeta(); formMeta(E.metas[0].id, 1); },
  instalar: async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; render(); },
  wOpt: (d) => { W[d.k] = d.v; if (d.k === "ingTipo") W.ingFrec = { beca: "mensual", mesada: "mensual", propina: "semanal", cachuelos: "irregular", sueldo: W.ingFrec === "quincenal" ? "quincenal" : "mensual" }[d.v]; wSig(); },
  wAtras: () => { wLeer(); wIr(-1); },
  wSiguiente: () => wSig(),
  wDia: (d, el) => { el.classList.toggle("on"); },
  wColor: (d) => { wLeer(); W.color = d.c; pintarW(); },
  wEstilo: (d) => { wLeer(); W.estilos = W.estilos.includes(d.e) ? W.estilos.filter((x) => x !== d.e) : W.estilos.concat(d.e); pintarW(); },
  pColor: (d, el) => { document.querySelectorAll("#pfColores button").forEach((b) => b.classList.toggle("on", b === el)); previewPerfil(); },
  pEstilo: (d, el) => { el.classList.toggle("on"); previewPerfil(); },
  respaldo: () => hacerRespaldo(),
  omitirRespaldo: () => { E.config.respaldoPendiente = false; guardar(); },
  ajustes: () => abrir(pintarAjustes),
  diaClase: (d, el) => el.classList.toggle("on"),
  guardarAjustes: () => guardarPerfil(),
  ajustarSaldo: () => {
    const real = parseFloat(prompt("¿Cuánto dinero tienes realmente ahora (sin contar metas)? S/"));
    if (isNaN(real)) return;
    const k = calc(), dif = r2(real - k.libre);
    if (!dif) return toast("Ya está cuadrado ✓");
    E.movs.push({ id: uid(), tipo: dif > 0 ? "ingreso" : "gasto", cat: "ajuste", monto: Math.abs(dif), lugar: null, fecha: hoyISO(), hora: horaAhora(), nota: "Ajuste de saldo", creado: Date.now() });
    guardar(); cerrar(); toast("Saldo ajustado ✓");
  },
  restaurar: () => $("#archivoRestaurar").click(),
  importarViejo: () => {
    try {
      const v = JSON.parse(localStorage.getItem("mis-finanzas-v1"));
      const mapa = { Comida: "fuera", Transporte: "transporte", Universidad: "univ", "Casa y servicios": "pagos", "Celular e internet": "pagos", Salud: "cuidado", Ropa: "otros", Entretenimiento: "salidas", Otros: "otros", Trabajo: "otros_i", Cachuelos: "otros_i", Familia: "papas", Beca: "subvencion" };
      let n = 0;
      for (const m of v.movs || []) {
        const cat = mapa[m.cat] || (m.tipo === "ingreso" ? "otros_i" : "otros");
        E.movs.push({ id: uid(), tipo: m.tipo, cat, monto: m.monto, lugar: null, fecha: m.fecha, hora: "", nota: m.nota || "", creado: m.creado || Date.now() }); n++;
      }
      guardar(); cerrar(); toast(`${n} movimientos importados`);
    } catch { toast("No se pudo importar"); }
  },
  borrarTodo: () => {
    if (confirm("¿Borrar TODO? Se perderán movimientos, pagos, préstamos y metas.") && confirm("Última confirmación: no se puede deshacer.")) {
      E = estadoNuevo(); localStorage.removeItem("brottyapp-pagos-sugeridos"); guardar(); cerrar(); setTimeout(bienvenida, 300);
    }
  }
};

function formPago(p) {
  abrir(() => {
    sheet.innerHTML = `${btnCerrar()}<h2>${p ? "Editar pago" : "Nuevo pago programado"}</h2>
      <label>Nombre</label><input type="text" id="pNombre" maxlength="30" placeholder="Ej: Cuarto" value="${esc(p?.nombre || "")}">
      <label>Ícono</label><div class="chips-sel" id="pIconos">${ICONOS_PAGO.map((i) => `<button class="${(p?.icono || "🏠") === i ? "on" : ""}" data-act="elegirIcono" data-i="${i}" style="font-size:20px;padding:6px 9px">${i}</button>`).join("")}</div>
      <label>Monto (S/)</label><input type="number" id="pMonto" inputmode="decimal" value="${p?.monto || ""}">
      <label>Fecha en que vence</label><input type="date" id="pFecha" value="${p?.fecha || ""}">
      <label class="check"><input type="checkbox" id="pMensual" ${p ? (p.mensual ? "checked" : "") : "checked"}> Se repite cada mes</label>
      <button class="btn full" style="margin-top:14px" data-act="guardarPago" data-id="${p?.id || ""}">Guardar</button>
      ${p ? `<button class="btn rojo full" style="margin-top:8px" data-act="borrarPago" data-id="${p.id}">Borrar</button>` : ""}`;
  });
}
function formMeta(id, signo, sugerido) {
  const m = E.metas.find((x) => x.id === id), k = calc();
  const sug = signo > 0 ? Math.floor(sugerido ?? k.sobrante) : 0;
  abrir(() => {
    sheet.innerHTML = `${btnCerrar()}<h2>${signo > 0 ? "Apartar para" : "Sacar de"} ${esc(m.nombre)}</h2>
      ${signo > 0 ? `<p class="nota">${sug > 0 ? `Brotty sugiere <b class="gold">${soles(sug)}</b>: es tu sobrante, lo que no gastaste. Apartarlo no toca tu diario.` : "Aún no tienes sobrante. Si apartas igual, tu diario de los próximos días bajará un poco."}</p>` : `<p class="nota">Hay ${soles(ahorradoMeta(m))} en esta meta. Lo que saques vuelve a tu dinero libre.</p>`}
      <label>Monto (S/)</label><input type="number" id="aMonto" inputmode="decimal" value="${sug || ""}">
      <button class="btn ${signo > 0 ? "oro" : "sec"} full" style="margin-top:14px" data-act="guardarAporte" data-id="${id}" data-s="${signo}">${signo > 0 ? "Apartar" : "Sacar"}</button>`;
  });
}
function despuesDeSubvencion() { E.config.respaldoPendiente = true; }
function sugerirMeta(sobAnt) {
  if (!E.metas.length || !(sobAnt > 0)) return;
  setTimeout(() => { toast(`El período pasado te sobraron ${soles(sobAnt)} 🎉`); formMeta(E.metas[0].id, 1, sobAnt); }, 1200);
}
function saltar() { const b = $("#brotty"); b.classList.remove("salto"); void b.offsetWidth; b.classList.add("salto"); }

const TRAJES_N = { anionuevo: "🎆 Año Nuevo", sanvalentin: "💘 San Valentín", clases: "🎒 Clases", otonio: "🍂 Otoño", mama: "🌸 Día de la Madre", sanjuan: "👒 San Juan", patrias: "🇵🇪 Fiestas Patrias", cumple: "🎉 Cumpleaños", primavera: "🌼 Primavera", morado: "💜 Mes morado", halloween: "🎃 Halloween", navidad: "🎄 Navidad" };
const opciones = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${v}</option>`).join("");
const diasSel = (id, lista, act) => `<div class="dias-sel" id="${id}">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button class="${lista.includes(d) ? "on" : ""}" data-act="${act}" data-d="${d}">${DIAS_CORTOS[d]}</button>`).join("")}</div>`;
const leerDias = (id) => [...document.querySelectorAll(`#${id} button.on`)].map((b) => +b.dataset.d);

function previewPerfil() {
  const color = $("#pfColores button.on")?.dataset.c || "verde", estilos = [...document.querySelectorAll("#pfEstilos button.on")].map((b) => b.dataset.e);
  const el = $("#pfPreview"); if (el) el.innerHTML = Brotty.svg({ color, estilos, traje: Brotty.trajeDeHoy(undefined, E.config.trajeManual) });
}
function pintarAjustes() {
  const c = E.config, ap = c.apariencia || {}, mes = hoyISO().slice(0, 7);
  const trajeSel = c.trajeManual && c.trajeManual.mes === mes ? (c.trajeManual.traje || "ninguno") : "auto";
  const cumple = c.cumple ? `2000-${c.cumple}` : "";
  sheet.innerHTML = `${btnCerrar()}<h2>👤 Perfil</h2>
    <b>🎨 Mi ${esc(ap.nombreBrotty || "Brotty")}</b>
    <div style="width:130px;height:130px;margin:6px auto" id="pfPreview"></div>
    <label>Nombre de tu Brotty</label><input type="text" id="pfNombreB" maxlength="16" value="${esc(ap.nombreBrotty || "Brotty")}">
    <label>Color</label><div class="chips-sel" id="pfColores">${Object.entries(Brotty.COLORES).map(([k, v]) => `<button class="${(ap.color || "verde") === k ? "on" : ""}" data-act="pColor" data-c="${k}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${v.g[1]};margin-right:5px"></span>${v.n}</button>`).join("")}</div>
    <label>Estilo (puedes combinar)</label><div class="chips-sel" id="pfEstilos">${Object.entries(Brotty.ESTILOS).map(([k, v]) => `<button class="${(ap.estilos || []).includes(k) ? "on" : ""}" data-act="pEstilo" data-e="${k}">${v.e} ${v.n}</button>`).join("")}</div>
    <label>Traje de este mes</label><select id="pfTraje"><option value="auto" ${trajeSel === "auto" ? "selected" : ""}>✨ Automático (según el mes)</option><option value="ninguno" ${trajeSel === "ninguno" ? "selected" : ""}>Sin traje</option>${opciones(TRAJES_N, trajeSel)}</select>
    <p class="nota">El traje que elijas dura hasta fin de mes; luego vuelve el del mes que toca.</p>
    <hr><b>🙋 Yo</b>
    <label>Tu nombre</label><input type="text" id="pfNombre" maxlength="20" value="${esc(c.nombre)}">
    <label>¿Estudias o trabajas?</label><select id="pfOcup">${opciones(OCUP, c.ocupacion)}</select>
    <label>¿Dónde vives?</label><select id="pfViv">${opciones(VIV, c.vivienda)}</select>
    <hr><b>💵 Tu ingreso principal</b>
    <label>¿Cómo te llega tu plata?</label><select id="pfIng">${opciones(Object.fromEntries(Object.entries(ING).map(([k, v]) => [k, v.e + " " + v.N])), c.ingTipo)}</select>
    <label>¿Cada cuánto?</label><select id="pfFrec">${opciones({ semanal: "Cada semana", quincenal: "Cada quincena", mensual: "Cada mes", irregular: "Irregular" }, c.ingFrec)}</select>
    <div class="fila"><div><label>Monto (S/)</label><input type="number" id="aSub" inputmode="decimal" value="${c.montoSub || ""}"></div>
      <div><label>Próxima (aprox.)</label><input type="date" id="aProx" value="${c.proxSub}"></div></div>
    <p class="nota">Si no sabes la fecha exacta, pon la más tardía posible.</p>
    <hr><b>📅 Tus días de ${diasDe()}</b>
    ${diasSel("aDias", c.dias, "diaClase")}
    <label>Pasaje por día (S/)</label><input type="number" id="aPasaje" inputmode="decimal" value="${c.pasaje || ""}" placeholder="0 si no gastas">
    <label>¿Qué días comes fuera?</label>${diasSel("aComDias", c.comidaDias || [], "diaClase")}
    <label>¿Cuánto te cuesta comer fuera? (S/)</label><input type="number" id="aMenu" inputmode="decimal" value="${c.menu || ""}" placeholder="Ej: 12">
    ${esEstudiante() ? `<label>Modo</label><select id="aModo"><option value="ciclo" ${c.modo === "ciclo" ? "selected" : ""}>Con clases</option><option value="vacaciones" ${c.modo === "vacaciones" ? "selected" : ""}>Vacaciones</option></select>
    <label>Último día de clases (opcional)</label><input type="date" id="aFin" value="${c.finCiclo}">` : ""}
    <hr><b>🥕 Comida para cocinar</b>
    <label class="check"><input type="checkbox" id="aCocina" ${c.cocina ? "checked" : ""}> Compro mi propia comida para cocinar</label>
    <div class="fila"><div><label>Por semana (S/)</label><input type="number" id="aComida" inputmode="decimal" value="${c.comidaSem || ""}"></div>
      ${esEstudiante() ? `<div><label>En vacaciones (S/)</label><input type="number" id="aComidaVac" inputmode="decimal" value="${c.comidaSemVac || ""}"></div>` : ""}</div>
    <hr><b>🎂 Tu cumpleaños</b><input type="date" id="aCumple" value="${cumple}">
    <button class="btn full" style="margin-top:16px" data-act="guardarAjustes">Guardar perfil</button>
    <hr><b>💾 Tus datos</b><p class="nota">Tus datos viven solo en este celular. Haz respaldo para no perderlos.</p>
    <div class="fila"><button class="btn sec" data-act="respaldo">Hacer respaldo</button><button class="btn sec" data-act="restaurar">Restaurar</button></div>
    <input type="file" id="archivoRestaurar" accept=".json,application/json" hidden>
    <button class="btn sec full" style="margin-top:8px" data-act="ajustarSaldo">⚖️ Corregir mi saldo</button>
    <button class="btn rojo full" style="margin-top:16px" data-act="borrarTodo">Borrar todos los datos</button>
    <p class="nota" style="text-align:center;margin-top:12px">Brotty · ${c.ultimoRespaldo ? "Último respaldo: " + fechaCorta(c.ultimoRespaldo) : "Sin respaldos aún"}</p>`;
  previewPerfil();
  const inp = $("#archivoRestaurar");
  if (inp) inp.onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text()), data = d.datos || d;
      if (!data.config || !Array.isArray(data.movs)) throw 0;
      if (confirm(`El respaldo tiene ${data.movs.length} movimientos. Esto REEMPLAZA tus datos actuales. ¿Continuar?`)) { E = Object.assign(estadoNuevo(), data, { config: Object.assign(estadoNuevo().config, data.config) }); guardar(); cerrar(); toast("Respaldo restaurado ✓"); }
    } catch { toast("Ese archivo no es un respaldo de Brotty"); }
  };
}
function guardarPerfil() {
  const c = E.config, v = (id) => ($(id) ? $(id).value : "");
  const traje = v("#pfTraje"), mes = hoyISO().slice(0, 7);
  Object.assign(c, {
    nombre: v("#pfNombre").trim(), ocupacion: v("#pfOcup"), vivienda: v("#pfViv"), ingTipo: v("#pfIng"), ingFrec: v("#pfFrec"),
    montoSub: +v("#aSub") || 0, proxSub: v("#aProx"), dias: leerDias("aDias"), pasaje: +v("#aPasaje") || 0,
    comidaDias: leerDias("aComDias"), menu: +v("#aMenu") || 0, cocina: $("#aCocina").checked, comidaSem: +v("#aComida") || 0,
    cumple: v("#aCumple") ? v("#aCumple").slice(5) : "",
    apariencia: { color: $("#pfColores button.on")?.dataset.c || "verde", estilos: [...document.querySelectorAll("#pfEstilos button.on")].map((b) => b.dataset.e), nombreBrotty: v("#pfNombreB").trim() || "Brotty" },
    trajeManual: traje === "auto" ? null : { mes, traje: traje === "ninguno" ? null : traje }
  });
  if ($("#aModo")) c.modo = v("#aModo");
  if ($("#aFin")) c.finCiclo = v("#aFin");
  if ($("#aComidaVac")) c.comidaSemVac = +v("#aComidaVac") || 0;
  guardar(); cerrar(); toast("Perfil guardado ✓");
}

// ---------- Bienvenida paso a paso ----------
let W = null, wPaso = 0;
const PAGOS_SUG = [
  { k: "cuarto", n: "Cuarto", i: "🏠", si: () => W.vivienda !== "familia" },
  { k: "casa", n: "Aporte en casa", i: "🏡", si: () => W.vivienda === "familia" },
  { k: "spotify", n: "Spotify", i: "🎵" }, { k: "youtube", n: "YouTube Premium", i: "📺" },
  { k: "celular", n: "Plan del celular", i: "📱" }, { k: "otro", n: "Otro", i: "📦" }
];
const PASOS = [
  { b: () => `¡Hola! Soy Brotty 🌱 Te ayudo a que tu plata te alcance. ¿Cómo te llamo?`,
    h: () => `<input type="text" id="wNombre" maxlength="20" placeholder="Tu nombre" value="${esc(W.nombre)}">`,
    l: () => { W.nombre = $("#wNombre").value.trim(); if (!W.nombre) return "Dime tu nombre 🙂"; } },
  { b: () => `¡Un gusto, ${esc(W.nombre)}! ¿Estudias o trabajas?`, auto: true,
    h: () => opcionesW("ocupacion", { univ: "🎓 Universidad", instituto: "🏫 Instituto", trabajo: "💼 Trabajo", otro: "✨ Otro" }) },
  { b: () => `¿Dónde vives?`, auto: true,
    h: () => opcionesW("vivienda", { familia: "🏡 Con mi familia", foraneo: "🧳 Soy foráneo, alquilo cuarto", otro: "✨ Otro" }) },
  { b: () => `¿Cómo te llega tu plata principalmente?`, auto: true,
    h: () => opcionesW("ingTipo", Object.fromEntries(Object.entries(ING).map(([k, v]) => [k, v.e + " " + v.N]))) + `<p class="nota">Si tienes varias, elige la principal. Las demás las registras como extra y van a tu sobrante.</p>` },
  { si: () => W.ingTipo === "sueldo", b: () => `¿Cada cuánto te pagan?`, auto: true,
    h: () => opcionesW("ingFrec", { quincenal: "Cada quincena", mensual: "Cada mes" }) },
  { b: () => W.ingTipo === "cachuelos" ? `Como tus cachuelos no tienen fecha fija, dime hasta cuándo quieres que te alcance tu plata (por ejemplo, fin de mes).` : `¿Cuánto te llega y cuándo llega ${W.ingTipo === "sueldo" ? "el próximo" : "la próxima"} ${(ING[W.ingTipo] || ING.mesada).n}?`,
    h: () => `${W.ingTipo === "cachuelos" ? "" : `<label>Monto (S/)</label><input type="number" id="wMonto" inputmode="decimal" placeholder="Ej: 300" value="${W.montoSub || ""}">`}
      <label>${W.ingTipo === "cachuelos" ? "Hasta el" : "Próxima (aproximada)"}</label><input type="date" id="wProx" value="${W.proxSub || ""}">
      <p class="nota">Si no sabes exacto, pon la fecha más tardía posible. Mejor que te sobre a que te falte.</p>`,
    l: () => { W.montoSub = +($("#wMonto")?.value || 0); W.proxSub = $("#wProx").value; if (!W.proxSub) return "Elige una fecha"; if (W.proxSub <= hoyISO()) return "La fecha debe ser después de hoy"; } },
  { b: () => `¿Cuánta plata tienes ahora mismo? (efectivo + Yape + cuenta)`,
    h: () => `<input type="number" id="wSaldo" inputmode="decimal" placeholder="Ej: 120" value="${W.saldoInicial || ""}">`,
    l: () => { W.saldoInicial = +$("#wSaldo").value || 0; } },
  { b: () => `¿Qué días vas ${W.ocupacion === "trabajo" ? "a trabajar" : "a clases"}? ¿Cuánto gastas en pasaje ese día?`,
    h: () => `${diasSel("wDias", W.dias, "wDia")}<label>Pasaje por día, ida y vuelta (S/)</label><input type="number" id="wPasaje" inputmode="decimal" placeholder="0 si no gastas" value="${W.pasaje || ""}">`,
    l: () => { W.dias = leerDias("wDias"); W.pasaje = +$("#wPasaje").value || 0; } },
  { b: () => `¿Qué días comes fuera (en ${W.ocupacion === "trabajo" ? "el trabajo" : "la U o el instituto"})? Si nunca, déjalo vacío.`,
    h: () => `${diasSel("wCom", W.comidaDias, "wDia")}<label>¿Cuánto te cuesta? (S/)</label><input type="number" id="wMenu" inputmode="decimal" placeholder="Ej: 12" value="${W.menu || ""}">`,
    l: () => { W.comidaDias = leerDias("wCom"); W.menu = +$("#wMenu").value || 0; if (W.comidaDias.length && !W.menu) return "¿Cuánto te cuesta comer fuera?"; } },
  { b: () => W.vivienda === "familia" ? `¿Te compras tu propia comida para cocinar, o la pone tu familia?` : `¿Cuánto gastas a la semana en comida para cocinar (mercado, bodega)?`,
    h: () => `<label class="check"><input type="checkbox" id="wCocina" ${W.cocina ? "checked" : ""}> Sí, compro mi comida para cocinar</label>
      <label>Por semana (S/)</label><input type="number" id="wComida" inputmode="decimal" placeholder="Ej: 70" value="${W.comidaSem || ""}">`,
    l: () => { W.cocina = $("#wCocina").checked; W.comidaSem = +$("#wComida").value || 0; if (W.cocina && !W.comidaSem) return "¿Cuánto por semana?"; } },
  { b: () => `¿Pagas algo fijo cada mes con tu plata? Pon el monto y el día del mes. Deja vacío lo que no pagas.`,
    h: () => PAGOS_SUG.filter((p) => !p.si || p.si()).map((p) => `<div class="fila" style="margin:6px 0"><div style="flex:1.3"><b>${p.i} ${p.n}</b>${p.k === "otro" ? `<input type="text" id="wPN_otro" placeholder="¿Qué es?" value="${esc(W.pagos.otro?.n || "")}" style="margin-top:4px">` : ""}</div>
      <div><input type="number" id="wPM_${p.k}" inputmode="decimal" placeholder="S/" value="${W.pagos[p.k]?.m || ""}"></div><div style="flex:.7"><input type="number" id="wPD_${p.k}" inputmode="numeric" placeholder="Día" min="1" max="31" value="${W.pagos[p.k]?.d || ""}"></div></div>`).join(""),
    l: () => { for (const p of PAGOS_SUG.filter((p) => !p.si || p.si())) { const m = +$("#wPM_" + p.k).value || 0, d = +$("#wPD_" + p.k).value || 0; W.pagos[p.k] = { m, d, n: p.k === "otro" ? $("#wPN_otro").value.trim() || "Otro" : p.n, i: p.i }; if (m && !(d >= 1 && d <= 31)) return `Pon el día del mes de ${W.pagos[p.k].n}`; } } },
  { si: () => ["univ", "instituto"].includes(W.ocupacion), b: () => `¿Cuándo terminan tus clases? (opcional) Después de esa fecha no aparto pasajes.`,
    h: () => `<input type="date" id="wFin" value="${W.finCiclo || ""}">`, l: () => { W.finCiclo = $("#wFin").value; } },
  { b: () => `¿Cuándo es tu cumpleaños? (opcional) ¡Lo celebramos juntos! 🎂`,
    h: () => `<input type="date" id="wCumple" value="${W.cumple ? "2000-" + W.cumple : ""}">`, l: () => { W.cumple = $("#wCumple").value ? $("#wCumple").value.slice(5) : ""; } },
  { b: () => `¡Último paso! ¿Cómo quieres que me vea? 😊`,
    h: () => `<label>Color</label><div class="chips-sel">${Object.entries(Brotty.COLORES).map(([k, v]) => `<button class="${W.color === k ? "on" : ""}" data-act="wColor" data-c="${k}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${v.g[1]};margin-right:5px"></span>${v.n}</button>`).join("")}</div>
      <label>Estilo (puedes combinar)</label><div class="chips-sel">${Object.entries(Brotty.ESTILOS).map(([k, v]) => `<button class="${W.estilos.includes(k) ? "on" : ""}" data-act="wEstilo" data-e="${k}">${v.e} ${v.n}</button>`).join("")}</div>
      <label>¿Cómo me llamo?</label><input type="text" id="wNombreB" maxlength="16" value="${esc(W.nombreBrotty)}">`,
    l: () => { W.nombreBrotty = $("#wNombreB").value.trim() || "Brotty"; } }
];
function opcionesW(k, obj) { return `<div style="display:grid;gap:8px">${Object.entries(obj).map(([v, n]) => `<button class="btn ${W[k] === v ? "" : "sec"} full" style="text-align:left" data-act="wOpt" data-k="${k}" data-v="${v}">${n}</button>`).join("")}</div>`; }
const pasoValido = (i) => !PASOS[i].si || PASOS[i].si();
function wIr(dir) { let i = wPaso + dir; while (i >= 0 && i < PASOS.length && !pasoValido(i)) i += dir; if (i < 0) return; if (i >= PASOS.length) return terminarW(); wPaso = i; pintarW(); }
function wLeer() { const p = PASOS[wPaso]; return p.l ? p.l() : null; }
function wSig() { const err = wLeer(); if (err) return toast(err); wIr(1); }
function pintarW() {
  const p = PASOS[wPaso], total = PASOS.filter((_, i) => pasoValido(i)).length, n = PASOS.slice(0, wPaso + 1).filter((_, i) => pasoValido(i)).length;
  const ultimo = wPaso === PASOS.length - 1;
  sheet.innerHTML = `<div class="w-cab"><div class="w-brotty">${Brotty.svg({ color: W.color, estilos: W.estilos, traje: Brotty.trajeDeHoy() })}</div><div class="globo w-globo">${p.b()}</div></div>
    <div class="mini-barra" style="margin:10px 0 14px"><i style="width:${(n / total) * 100}%;background:var(--verde)"></i></div>
    ${p.h()}
    <div class="fila" style="margin-top:16px">${wPaso > 0 ? `<button class="btn sec" style="flex:0 0 auto" data-act="wAtras">← Atrás</button>` : ""}${p.auto ? "" : `<button class="btn" data-act="wSiguiente">${ultimo ? "¡Listo, empecemos! 🌱" : "Siguiente →"}</button>`}</div>`;
  const inp = sheet.querySelector("input[type=text],input[type=number]"); if (inp && !p.auto) setTimeout(() => inp.focus(), 50);
}
function terminarW() {
  const c = E.config, T = hoyISO();
  Object.assign(c, {
    setup: true, nombre: W.nombre, ocupacion: W.ocupacion, vivienda: W.vivienda, ingTipo: W.ingTipo, ingFrec: W.ingFrec,
    montoSub: W.montoSub, proxSub: W.proxSub, saldoInicial: r2(W.saldoInicial), fechaInicio: T, dias: W.dias, pasaje: W.pasaje,
    comidaDias: W.comidaDias, menu: W.menu, cocina: W.cocina, comidaSem: W.comidaSem, finCiclo: W.finCiclo || "", cumple: W.cumple,
    modo: "ciclo", apariencia: { color: W.color, estilos: W.estilos, nombreBrotty: W.nombreBrotty }
  });
  for (const p of Object.values(W.pagos)) {
    if (!p.m) continue;
    const d0 = parse(T); let f = new Date(d0.getFullYear(), d0.getMonth(), Math.min(p.d, new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate()));
    if (fechaISO(f) <= T) f = new Date(d0.getFullYear(), d0.getMonth() + 1, Math.min(p.d, new Date(d0.getFullYear(), d0.getMonth() + 2, 0).getDate()));
    E.pagos.push({ id: uid(), nombre: p.n, monto: p.m, fecha: fechaISO(f), mensual: true, icono: p.i, pagadoEl: null, creadoEl: T });
  }
  guardar(); cerrar(); celebrar(4000);
  setTimeout(() => toast(`¡Listo, ${c.nombre}! Hoy puedes gastar ${soles(Math.max(0, calc().hoy))} 🌱`), 500);
}
function bienvenida() {
  W = { nombre: "", ocupacion: "univ", vivienda: "familia", ingTipo: "mesada", ingFrec: "mensual", montoSub: 0, proxSub: "", saldoInicial: 0,
    dias: [1, 2, 3, 4, 5], pasaje: 0, comidaDias: [], menu: 0, cocina: false, comidaSem: 0, pagos: {}, finCiclo: "", cumple: "", color: "verde", estilos: [], nombreBrotty: "Brotty" };
  wPaso = 0; abrir(pintarW, true);
}

async function hacerRespaldo() {
  const nombre = `brotty-respaldo-${hoyISO()}.json`;
  const blob = new Blob([JSON.stringify({ app: "brotty", version: 1, fecha: hoyISO(), datos: E }, null, 1)], { type: "application/json" });
  const marcar = () => { E.config.respaldoPendiente = false; E.config.ultimoRespaldo = hoyISO(); guardar(); toast("Respaldo listo 💾"); };
  try {
    const file = new File([blob], nombre, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Respaldo de Brotty" }); marcar(); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre; a.click(); URL.revokeObjectURL(a.href); marcar();
}


// Clics
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]");
  if (!t || t.disabled) return;
  const f = ACT[t.dataset.act];
  if (f) f(t.dataset, t);
});

// ---------- Arranque ----------
let promptInstalar = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); promptInstalar = e; render(); });
irA(1, false);
render();
if (!E.config.setup) setTimeout(bienvenida, 300);
setInterval(render, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").then((r) => r.update()).catch(() => {}));
}

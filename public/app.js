// ---------------------------------------------------------------
// Datos base (contenido fijo de la guía JCOTRAINER)
// ---------------------------------------------------------------
const ESTRATEGIAS = [
  { n: 1, nombre: "Contacto Técnico Profesional", objetivo: "Acercarse aportando valor técnico inmediato",
    resumen: "Corregir un detalle técnico breve a un alumno que entrena solo, sin invadir.",
    frecuencia: "Diaria", kpi: "Correcciones técnicas / semana", meta: "≥ 5" },
  { n: 2, nombre: "Check-in de Progreso", objetivo: "Detectar necesidades y crear relación",
    resumen: "Preguntar cómo va su entrenamiento y si sigue un plan estructurado.",
    frecuencia: "Diaria", kpi: "Check-ins / semana", meta: "≥ 10" },
  { n: 3, nombre: "Mini-Diagnóstico Gratuito", objetivo: "Mostrar limitaciones y abrir conversación",
    resumen: "Ofrecer una evaluación rápida (2–3 min) de movilidad, postura o técnica.",
    frecuencia: "Semanal", kpi: "Diagnósticos / semana", meta: "≥ 3" },
  { n: 4, nombre: "Cliente con Estancamiento", objetivo: "Ofrecer variación y nueva propuesta",
    resumen: "Detectar constancia sin progreso y ofrecer ajustar o variar el plan.",
    frecuencia: "Semanal", kpi: "Clientes reactivados / mes", meta: "≥ 2" },
  { n: 5, nombre: "Mala Técnica o Riesgo", objetivo: "Proteger y demostrar expertise",
    resumen: "Corregir de forma preventiva un movimiento riesgoso para el alumno.",
    frecuencia: "Diaria", kpi: "Correcciones preventivas / semana", meta: "≥ 5" },
  { n: 6, nombre: "Ayuda Operativa", objetivo: "Crear conexión con gestos cotidianos",
    resumen: "Ayudar a cargar discos, mover barras o ajustar máquinas.",
    frecuencia: "Diaria", kpi: "Gestos de ayuda / semana", meta: "≥ 5" },
  { n: 7, nombre: "Vitrina Profesional", objetivo: "Posicionarse como referente técnico",
    resumen: "Entrenar con técnica impecable y presencia en horarios de máximo flujo.",
    frecuencia: "Diaria", kpi: "Horas en horario peak / semana", meta: "≥ 6" },
  { n: 8, nombre: "Desafío de 1 Semana", objetivo: "Generar experiencia y confianza",
    resumen: "Lanzar un micro-desafío gratuito (técnica, postura, activación, core).",
    frecuencia: "Semanal", kpi: "Desafíos activos / semana", meta: "1" },
  { n: 9, nombre: "Cliente Ansioso o Perdido", objetivo: "Convertirse en su guía de inmediato",
    resumen: "Ofrecer ayuda a quien se ve perdido y armar algo rápido para su sesión.",
    frecuencia: "Diaria", kpi: "Alumnos guiados / semana", meta: "≥ 3" },
  { n: 10, nombre: "Alumno Motivado", objetivo: "Amplificar su energía con estructura",
    resumen: "Detectar energía o motivación alta y proponer un programa personalizado.",
    frecuencia: "Semanal", kpi: "Propuestas / semana", meta: "≥ 2" },
];

const TAREAS = {
  diario: [
    { estrategia: 1, nombre: "Corregir técnica a un alumno que entrena solo", meta: "≥ 1 por turno" },
    { estrategia: 2, nombre: "Hacer check-in de progreso a alumnos conocidos", meta: "≥ 2 por turno" },
    { estrategia: 5, nombre: "Corregir preventivamente una técnica riesgosa", meta: "Cada vez que se detecte" },
    { estrategia: 6, nombre: "Ayudar con gestos operativos (discos, barras, máquinas)", meta: "≥ 3 por turno" },
    { estrategia: 7, nombre: "Entrenar con técnica impecable en horario peak", meta: "1 sesión visible/día" },
    { estrategia: 9, nombre: "Guiar a un alumno que se ve perdido o ansioso", meta: "Cada vez que se detecte" },
  ],
  semanal: [
    { estrategia: 3, nombre: "Ofrecer mini-diagnóstico gratuito a nuevos alumnos", meta: "≥ 3 por semana" },
    { estrategia: 4, nombre: "Detectar cliente estancado y ofrecer variación de plan", meta: "≥ 2 por semana" },
    { estrategia: 8, nombre: "Lanzar o mantener activo el desafío de 1 semana", meta: "1 desafío activo" },
    { estrategia: 10, nombre: "Identificar alumno motivado y ofrecer programa personalizado", meta: "≥ 2 por semana" },
    { estrategia: 0, nombre: "Revisar el cumplimiento de la semana anterior", meta: "1 revisión" },
  ],
  mensual: [
    { estrategia: 0, nombre: "Revisar % de cumplimiento por estrategia y por entrenador", meta: "1 revisión" },
    { estrategia: 0, nombre: "Reunión de equipo: retroalimentación y mejora de estrategias", meta: "1 reunión" },
    { estrategia: 0, nombre: "Actualizar el desafío o mini-diagnóstico según temporada", meta: "1 actualización" },
    { estrategia: 0, nombre: "Analizar conversión real: contactos → clientes captados", meta: "1 informe" },
    { estrategia: 0, nombre: "Definir foco de mejora del mes siguiente", meta: "1 definición" },
  ],
};

const FREQ_LABEL = { diario: "Diaria", semanal: "Semanal", mensual: "Mensual" };

// ---------------------------------------------------------------
// Estado
// ---------------------------------------------------------------
let STATE = null;

async function cargarEstado() {
  const res = await fetch("/api/data");
  STATE = await res.json();
  renderAll();
}

async function enviar(body) {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  STATE = await res.json();
  renderAll();
}

function entrenadorActivo() {
  return localStorage.getItem("jco-entrenador") || (STATE?.entrenadores?.[0] ?? "Entrenador 1");
}

// ---------------------------------------------------------------
// Pestaña Informes: oculta por defecto, solo visible para el coach
// ---------------------------------------------------------------
const FLAG_TAB_VISIBLE = "jco-coach-tab-visible";

function insertarTabInformes() {
  if (document.querySelector('.tab[data-tab="informes"]')) return; // ya insertada
  const tabs = document.getElementById("tabs");
  const btn = document.createElement("button");
  btn.className = "tab";
  btn.dataset.tab = "informes";
  btn.textContent = "Informes";
  tabs.appendChild(btn);
}

function revelarPestanaCoach() {
  localStorage.setItem(FLAG_TAB_VISIBLE, "1");
  insertarTabInformes();
  toast("Pestaña de Informes activada en este dispositivo");
}

// Gatillo 1: ya se activó antes en este dispositivo
if (localStorage.getItem(FLAG_TAB_VISIBLE) === "1") {
  insertarTabInformes();
}

// Gatillo 2: entrar con ?coach=1 en la URL (por ejemplo, desde un link guardado)
if (new URLSearchParams(window.location.search).get("coach") === "1") {
  revelarPestanaCoach();
  history.replaceState(null, "", window.location.pathname);
}

// Gatillo 3: 5 clics seguidos sobre el logo "JCOTRAINER" (para activarla sin URL especial)
let clicsLogo = 0;
let clicsLogoTimer = null;
document.getElementById("brandMark").addEventListener("click", () => {
  clicsLogo += 1;
  clearTimeout(clicsLogoTimer);
  clicsLogoTimer = setTimeout(() => { clicsLogo = 0; }, 1500);
  if (clicsLogo >= 5) {
    clicsLogo = 0;
    revelarPestanaCoach();
  }
});

// ---------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------
document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
  if (btn.dataset.tab === "informes") mostrarEstadoInformes();
});

// ---------------------------------------------------------------
// Render: selector de entrenador
// ---------------------------------------------------------------
function renderSelectorEntrenador() {
  const sel = document.getElementById("entrenadorActivo");
  const actual = entrenadorActivo();
  sel.innerHTML = STATE.entrenadores.map((e) => `<option ${e === actual ? "selected" : ""}>${e}</option>`).join("");
  sel.onchange = () => localStorage.setItem("jco-entrenador", sel.value);
}

// ---------------------------------------------------------------
// Render: Matriz
// ---------------------------------------------------------------
function renderMatriz() {
  const grid = document.getElementById("matrizGrid");
  grid.innerHTML = ESTRATEGIAS.map((e) => {
    const row = STATE.matriz.find((m) => m.n === e.n) || { entrenador: "Todo el equipo", estado: "Pendiente", notas: "" };
    const badgeClass = "badge-" + row.estado.replace(" ", "-");
    return `
    <div class="matriz-card">
      <div class="matriz-num">${String(e.n).padStart(2, "0")}</div>
      <div>
        <div class="matriz-title">${e.nombre}</div>
        <p class="matriz-objetivo">${e.objetivo}</p>
        <p class="matriz-resumen">${e.resumen}</p>
        <div class="matriz-meta-row">
          <span>Frecuencia: <b>${e.frecuencia}</b></span>
          <span>KPI: <b>${e.kpi}</b></span>
          <span>Meta: <b>${e.meta}</b></span>
          <span class="badge ${badgeClass}">${row.estado}</span>
        </div>
        <div class="matriz-controls">
          <select data-n="${e.n}" data-campo="entrenador" class="sel-entrenador">
            ${STATE.entrenadores.concat(["Todo el equipo"]).map((t) => `<option ${t === row.entrenador ? "selected" : ""}>${t}</option>`).join("")}
          </select>
          <select data-n="${e.n}" data-campo="estado" class="sel-estado">
            ${["Pendiente", "Cumplida", "No cumplida"].map((s) => `<option ${s === row.estado ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          <textarea data-n="${e.n}" data-campo="notas" class="txt-notas" placeholder="Notas...">${row.notas || ""}</textarea>
        </div>
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".sel-entrenador, .sel-estado").forEach((el) => {
    el.addEventListener("change", () => {
      enviar({ type: "actualizar-matriz", n: Number(el.dataset.n), campo: el.dataset.campo, valor: el.value });
      toast("Guardado");
    });
  });
  grid.querySelectorAll(".txt-notas").forEach((el) => {
    el.addEventListener("change", () => {
      enviar({ type: "actualizar-matriz", n: Number(el.dataset.n), campo: "notas", valor: el.value });
      toast("Nota guardada");
    });
  });
}

// ---------------------------------------------------------------
// Render: Checklists
// ---------------------------------------------------------------
function contarHoy(estrategia, frecuencia) {
  const hoy = new Date().toISOString().slice(0, 10);
  return STATE.log.filter((r) => r.estrategia === estrategia && r.frecuencia === frecuencia && r.fecha === hoy && r.estado === "Cumplida").length;
}

function nombreEstrategia(n) {
  if (!n) return "General";
  const e = ESTRATEGIAS.find((x) => x.n === n);
  return e ? `${String(n).padStart(2, "0")} · ${e.nombre}` : "General";
}

function renderChecklist(frecuenciaKey, contenedorId) {
  const cont = document.getElementById(contenedorId);
  const tareas = TAREAS[frecuenciaKey];
  cont.innerHTML = tareas.map((t, idx) => {
    const hechas = contarHoy(t.estrategia, FREQ_LABEL[frecuenciaKey]);
    return `
    <div class="task-card">
      <div class="task-info">
        <div class="task-tag">${nombreEstrategia(t.estrategia)}</div>
        <div class="task-name">${t.nombre}</div>
        <div class="task-meta">Meta: ${t.meta}</div>
      </div>
      <div class="task-actions">
        <span class="task-count">${hechas} hoy</span>
        <button class="btn btn-ok" data-freq="${frecuenciaKey}" data-idx="${idx}" data-estado="Cumplida">✓ Cumplida</button>
        <button class="btn btn-no" data-freq="${frecuenciaKey}" data-idx="${idx}" data-estado="No cumplida">✕ No cumplida</button>
      </div>
    </div>`;
  }).join("");

  cont.querySelectorAll("button[data-estado]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = TAREAS[btn.dataset.freq][Number(btn.dataset.idx)];
      const registro = {
        fecha: new Date().toISOString().slice(0, 10),
        frecuencia: FREQ_LABEL[btn.dataset.freq],
        estrategia: t.estrategia,
        tarea: t.nombre,
        entrenador: entrenadorActivo(),
        estado: btn.dataset.estado,
        comentario: "",
      };
      enviar({ type: "agregar-registro", registro });
      toast(btn.dataset.estado === "Cumplida" ? "Marcada como cumplida" : "Marcada como no cumplida");
    });
  });
}

// ---------------------------------------------------------------
// Render: Seguimiento
// ---------------------------------------------------------------
function pct(cumplidas, total) {
  return total === 0 ? 0 : Math.round((cumplidas / total) * 100);
}

function renderRing(label, value) {
  return `<div class="ring-card">
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="24" fill="none" stroke="#3A424B" stroke-width="6"/>
      <circle cx="28" cy="28" r="24" fill="none" stroke="#8BC53F" stroke-width="6"
        stroke-dasharray="${2 * Math.PI * 24}" stroke-dashoffset="${2 * Math.PI * 24 * (1 - value / 100)}"
        stroke-linecap="round" transform="rotate(-90 28 28)"/>
    </svg>
    <div>
      <div class="ring-value">${value}%</div>
      <div class="ring-label">${label}</div>
    </div>
  </div>`;
}

function renderStatCard(label, value) {
  return `<div class="ring-card">
    <div class="ring-value" style="font-size:28px">${value}</div>
    <div class="ring-label">${label}</div>
  </div>`;
}

function renderSeguimiento() {
  const log = STATE.log;
  const totalCumplidas = log.filter((r) => r.estado === "Cumplida").length;
  const total = log.length;

  document.getElementById("ringsRow").innerHTML =
    renderRing("Cumplimiento general", pct(totalCumplidas, total)) +
    renderStatCard("Total registros", total) +
    STATE.entrenadores.map((ent) => {
      const c = log.filter((r) => r.entrenador === ent && r.estado === "Cumplida").length;
      const t = log.filter((r) => r.entrenador === ent).length;
      return renderRing(ent, pct(c, t));
    }).join("");

  // Tabla por estrategia
  const filasEstr = ESTRATEGIAS.map((e) => {
    const rows = log.filter((r) => r.estrategia === e.n);
    const c = rows.filter((r) => r.estado === "Cumplida").length;
    const nc = rows.filter((r) => r.estado === "No cumplida").length;
    const t = rows.length;
    const p = pct(c, t);
    return `<tr>
      <td>${String(e.n).padStart(2, "0")}</td>
      <td>${e.nombre}</td>
      <td>${c}</td>
      <td>${nc}</td>
      <td>${t}</td>
      <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div><span>${p}%</span></div></td>
    </tr>`;
  }).join("");
  document.getElementById("tablaEstrategias").innerHTML = `
    <tr><th>N°</th><th>Estrategia</th><th>Cumplidas</th><th>No cumplidas</th><th>Total</th><th>% Cumplimiento</th></tr>
    ${filasEstr}`;

  // Tabla por entrenador
  const filasEnt = STATE.entrenadores.map((ent) => {
    const rows = log.filter((r) => r.entrenador === ent);
    const c = rows.filter((r) => r.estado === "Cumplida").length;
    const nc = rows.filter((r) => r.estado === "No cumplida").length;
    const t = rows.length;
    const p = pct(c, t);
    return `<tr>
      <td>${ent}</td>
      <td>${c}</td>
      <td>${nc}</td>
      <td>${t}</td>
      <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div><span>${p}%</span></div></td>
    </tr>`;
  }).join("");
  document.getElementById("tablaEntrenadores").innerHTML = `
    <tr><th>Entrenador</th><th>Cumplidas</th><th>No cumplidas</th><th>Total</th><th>% Cumplimiento</th></tr>
    ${filasEnt}`;

  // Log reciente
  const recientes = log.slice(0, 25);
  document.getElementById("tablaLog").innerHTML = `
    <tr><th>Fecha</th><th>Frecuencia</th><th>Estrategia</th><th>Tarea</th><th>Entrenador</th><th>Estado</th><th></th></tr>
    ${recientes.map((r) => `<tr>
      <td>${r.fecha}</td>
      <td>${r.frecuencia}</td>
      <td>${nombreEstrategia(r.estrategia)}</td>
      <td>${r.tarea || ""}</td>
      <td>${r.entrenador}</td>
      <td><span class="badge badge-${r.estado.replace(" ", "-")}">${r.estado}</span></td>
      <td><button class="btn btn-ghost" data-id="${r.id}">Eliminar</button></td>
    </tr>`).join("")}`;

  document.getElementById("tablaLog").querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar este registro?")) {
        enviar({ type: "borrar-registro", id: btn.dataset.id });
        toast("Registro eliminado");
      }
    });
  });
}

// ---------------------------------------------------------------
// Toast
// ---------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

// ---------------------------------------------------------------
// Gestionar entrenadores
// ---------------------------------------------------------------
const modal = document.getElementById("modalEntrenadores");

function abrirModalEntrenadores() {
  renderListaEntrenadoresModal();
  modal.hidden = false;
}
function cerrarModalEntrenadores() {
  modal.hidden = true;
}

function renderListaEntrenadoresModal() {
  const cont = document.getElementById("listaEntrenadoresModal");
  cont.innerHTML = STATE.entrenadores.map((e) => `
    <span class="entrenador-chip">${e}
      <button data-nombre="${e}" title="Quitar" type="button">✕</button>
    </span>`).join("") || `<span style="color:var(--steel);font-size:13px">Aún no hay entrenadores.</span>`;

  cont.querySelectorAll("button[data-nombre]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (STATE.entrenadores.length <= 1) {
        toast("Debe quedar al menos un entrenador");
        return;
      }
      if (!confirm(`¿Quitar a "${btn.dataset.nombre}" del equipo? (su historial de registros no se borra)`)) return;
      const nuevaLista = STATE.entrenadores.filter((e) => e !== btn.dataset.nombre);
      await enviar({ type: "reemplazar", data: { entrenadores: nuevaLista } });
      renderListaEntrenadoresModal();
      toast("Entrenador eliminado del equipo");
    });
  });
}

document.getElementById("btnGestionarEntrenadores").addEventListener("click", abrirModalEntrenadores);
document.getElementById("btnCerrarModal").addEventListener("click", cerrarModalEntrenadores);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModalEntrenadores(); });

document.getElementById("btnAgregarEntrenador").addEventListener("click", agregarEntrenador);
document.getElementById("nuevoEntrenadorInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarEntrenador();
});

async function agregarEntrenador() {
  const input = document.getElementById("nuevoEntrenadorInput");
  const nombre = input.value.trim();
  if (!nombre) return;
  if (STATE.entrenadores.includes(nombre)) {
    toast("Ese entrenador ya existe");
    return;
  }
  const nuevaLista = [...STATE.entrenadores, nombre];
  await enviar({ type: "reemplazar", data: { entrenadores: nuevaLista } });
  input.value = "";
  renderListaEntrenadoresModal();
  toast("Entrenador agregado");
}

// ---------------------------------------------------------------
// Render all
// ---------------------------------------------------------------
function renderAll() {
  renderSelectorEntrenador();
  renderMatriz();
  renderChecklist("diario", "diarioList");
  renderChecklist("semanal", "semanalList");
  renderChecklist("mensual", "mensualList");
  renderSeguimiento();
}

cargarEstado();

// =================================================================
// INFORMES — API de KPIs, comparación, proyección, PDF y email
// =================================================================
let KPIS = null;
let chartComparacion, chartTendencia, chartEstrategiaEnt;

function claveCoachGuardada() {
  return localStorage.getItem("jco-coach-key") || "";
}

function mostrarEstadoInformes() {
  const clave = claveCoachGuardada();
  if (clave) {
    intentarCargarKpis(clave, { silencioso: true });
  } else {
    mostrarCandado();
  }
}

function mostrarCandado(mensajeError) {
  document.getElementById("candadoInformes").hidden = false;
  document.getElementById("informesDesbloqueado").hidden = true;
  const err = document.getElementById("gateError");
  if (mensajeError) {
    err.textContent = mensajeError;
    err.hidden = false;
  } else {
    err.hidden = true;
  }
}

async function intentarCargarKpis(clave, { silencioso = false } = {}) {
  const btn = document.getElementById("btnDesbloquear");
  if (!silencioso) { btn.textContent = "Verificando..."; btn.disabled = true; }
  try {
    const res = await fetch("/api/kpis", { headers: { "x-coach-key": clave } });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("jco-coach-key", clave);
      KPIS = data;
      document.getElementById("candadoInformes").hidden = true;
      document.getElementById("informesDesbloqueado").hidden = false;
      poblarSelectorInforme();
      renderInforme(document.getElementById("selectorInforme").value);
    } else if (data.error === "config-faltante") {
      localStorage.removeItem("jco-coach-key");
      mostrarCandado("Esta sección aún no está configurada por el administrador del tablero (falta definir COACH_ACCESS_KEY en Netlify).");
    } else {
      localStorage.removeItem("jco-coach-key");
      mostrarCandado("Clave incorrecta. Inténtalo de nuevo.");
    }
  } catch (err) {
    mostrarCandado("No se pudo verificar el acceso. Revisa tu conexión e inténtalo de nuevo.");
  } finally {
    if (!silencioso) { btn.textContent = "Desbloquear"; btn.disabled = false; }
  }
}

document.getElementById("btnDesbloquear").addEventListener("click", () => {
  const clave = document.getElementById("claveCoachInput").value.trim();
  if (!clave) return;
  intentarCargarKpis(clave);
});
document.getElementById("claveCoachInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btnDesbloquear").click();
});
document.getElementById("btnCerrarSesionCoach").addEventListener("click", () => {
  localStorage.removeItem("jco-coach-key");
  localStorage.removeItem(FLAG_TAB_VISIBLE);
  document.getElementById("claveCoachInput").value = "";
  mostrarCandado();
  const tabInformes = document.querySelector('.tab[data-tab="informes"]');
  if (tabInformes) tabInformes.remove();
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document.querySelector('.tab[data-tab="instrucciones"]').classList.add("active");
  document.getElementById("panel-instrucciones").classList.add("active");
  toast("Sesión de coach cerrada y pestaña ocultada en este dispositivo");
});

function poblarSelectorInforme() {
  const sel = document.getElementById("selectorInforme");
  const actual = sel.value;
  sel.innerHTML = `<option value="">Equipo completo</option>` +
    KPIS.porEntrenador.map((e) => `<option value="${e.nombre}" ${e.nombre === actual ? "selected" : ""}>${e.nombre}</option>`).join("");
}

document.getElementById("selectorInforme").addEventListener("change", (e) => renderInforme(e.target.value));

function colorPct(p) {
  if (p >= 80) return "#8BC53F";
  if (p >= 50) return "#F2A93B";
  return "#E8564B";
}

function renderInforme(entrenadorSeleccionado) {
  if (!KPIS) return;
  const esEquipo = !entrenadorSeleccionado;
  const ent = esEquipo ? null : KPIS.porEntrenador.find((e) => e.nombre === entrenadorSeleccionado);
  const datosScope = esEquipo ? KPIS.equipo : ent;

  // --- Stats (rings) ---
  document.getElementById("informeStats").innerHTML =
    renderRing(esEquipo ? "Cumplimiento del equipo" : `Cumplimiento de ${ent.nombre}`, datosScope.pct) +
    renderStatCard("Registros totales", datosScope.total) +
    renderStatCard("Proyección próx. semana", datosScope.proyeccion.proyeccionPct + "%") +
    renderStatCard("Tendencia", { alza: "↑ Al alza", baja: "↓ A la baja", estable: "→ Estable", "sin datos": "Sin datos" }[datosScope.proyeccion.tendencia] || "—");

  // --- Ranking (siempre equipo completo) ---
  document.getElementById("tablaRanking").innerHTML = `
    <tr><th>#</th><th>Entrenador</th><th>Registros</th><th>% Cumplimiento</th></tr>
    ${KPIS.ranking.map((r) => `<tr ${r.nombre === entrenadorSeleccionado ? 'style="outline:2px solid #8BC53F;"' : ""}>
      <td>${r.posicion}</td>
      <td>${r.nombre}</td>
      <td>${r.total}</td>
      <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${r.pct}%;background:${colorPct(r.pct)}"></div></div><span>${r.pct}%</span></div></td>
    </tr>`).join("")}`;

  // --- Gráfico comparación entre entrenadores ---
  document.getElementById("tituloComparacion").textContent = "Comparación entre entrenadores";
  const ctxComp = document.getElementById("chartComparacion");
  if (chartComparacion) chartComparacion.destroy();
  chartComparacion = new Chart(ctxComp, {
    type: "bar",
    data: {
      labels: KPIS.porEntrenador.map((e) => e.nombre),
      datasets: [{
        label: "% Cumplimiento",
        data: KPIS.porEntrenador.map((e) => e.pct),
        backgroundColor: KPIS.porEntrenador.map((e) => e.nombre === entrenadorSeleccionado ? "#8BC53F" : "#4A5560"),
        borderRadius: 6,
      }],
    },
    options: chartOptionsBase({ max: 100, suffix: "%" }),
  });

  // --- Gráfico tendencia semanal + proyección ---
  document.getElementById("tituloTendencia").textContent = esEquipo
    ? "Evolución semanal del equipo y proyección"
    : `Evolución semanal de ${ent.nombre} y proyección`;
  const serie = datosScope.serieSemanal;
  const labels = serie.map((s) => s.semana.slice(5));
  const valores = serie.map((s) => s.pct);
  const labelsConProyeccion = [...labels, "Próx. semana"];
  const valoresConProyeccion = [...valores, datosScope.proyeccion.proyeccionPct];
  const ctxTend = document.getElementById("chartTendencia");
  if (chartTendencia) chartTendencia.destroy();
  chartTendencia = new Chart(ctxTend, {
    type: "line",
    data: {
      labels: labelsConProyeccion,
      datasets: [{
        label: "% Cumplimiento",
        data: valoresConProyeccion,
        segment: {
          borderDash: (c) => (c.p1DataIndex === valoresConProyeccion.length - 1 ? [6, 4] : undefined),
        },
        borderColor: "#8BC53F",
        backgroundColor: "rgba(139,197,63,0.15)",
        pointBackgroundColor: (c) => (c.dataIndex === valoresConProyeccion.length - 1 ? "#F2A93B" : "#8BC53F"),
        tension: 0.3,
        fill: true,
      }],
    },
    options: chartOptionsBase({ max: 100, suffix: "%" }),
  });

  // --- Comparación por estrategia (solo si hay entrenador seleccionado) ---
  const bloqueEstrategia = document.getElementById("bloqueEstrategiaEnt");
  const bloqueFeedback = document.getElementById("bloqueFeedback");
  if (esEquipo) {
    bloqueEstrategia.hidden = true;
    bloqueFeedback.hidden = true;
  } else {
    bloqueEstrategia.hidden = false;
    bloqueFeedback.hidden = false;
    const ctxEst = document.getElementById("chartEstrategiaEnt");
    if (chartEstrategiaEnt) chartEstrategiaEnt.destroy();
    chartEstrategiaEnt = new Chart(ctxEst, {
      type: "bar",
      data: {
        labels: ent.porEstrategia.map((e) => String(e.n).padStart(2, "0")),
        datasets: [
          { label: ent.nombre, data: ent.porEstrategia.map((e) => e.pct), backgroundColor: "#8BC53F", borderRadius: 6 },
          { label: "Promedio equipo", data: KPIS.equipo.porEstrategia.map((e) => e.pct), backgroundColor: "#4A5560", borderRadius: 6 },
        ],
      },
      options: chartOptionsBase({ max: 100, suffix: "%", legend: true }),
    });

    document.getElementById("listaFeedback").innerHTML = ent.feedback.map((f) => `<li>${f}</li>`).join("");
  }
}

function chartOptionsBase({ max, suffix, legend = false }) {
  return {
    responsive: true,
    plugins: {
      legend: { display: legend, labels: { color: "#EDEFF2", font: { family: "Inter" } } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.formattedValue}${suffix || ""}` } },
    },
    scales: {
      x: { ticks: { color: "#93A1AC", font: { family: "Inter", size: 11 } }, grid: { color: "#3A424B" } },
      y: { beginAtZero: true, max, ticks: { color: "#93A1AC", font: { family: "Inter", size: 11 } }, grid: { color: "#3A424B" } },
    },
  };
}

// --- Descargar informe en PDF (captura el bloque de reporte) ---
document.getElementById("btnDescargarPdf").addEventListener("click", async () => {
  const btn = document.getElementById("btnDescargarPdf");
  const original = btn.textContent;
  btn.textContent = "Generando...";
  btn.disabled = true;
  try {
    const nodo = document.getElementById("reporteContenido");
    const canvas = await html2canvas(nodo, { backgroundColor: "#1B1F23", scale: 2 });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 40;
    const imgH = (canvas.height * imgW) / canvas.width;
    let restante = imgH;
    let posY = 20;
    let pagina = 0;
    const imgData = canvas.toDataURL("image/png");
    while (restante > 0) {
      if (pagina > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, posY - pagina * (pageH - 40), imgW, imgH);
      restante -= (pageH - 40);
      pagina += 1;
    }
    const sel = document.getElementById("selectorInforme").value;
    const nombreArchivo = sel ? `Informe_${sel.replace(/\s+/g, "_")}.pdf` : "Informe_Equipo_JCOTRAINER.pdf";
    pdf.save(nombreArchivo);
    toast("PDF descargado");
  } catch (err) {
    toast("No se pudo generar el PDF");
    console.error(err);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
});

// --- Enviar informe por correo ---
document.getElementById("btnEnviarCorreo").addEventListener("click", async () => {
  const sel = document.getElementById("selectorInforme").value;
  const destinatario = prompt("¿A qué correo quieres enviar este informe?");
  if (!destinatario) return;
  const btn = document.getElementById("btnEnviarCorreo");
  const original = btn.textContent;
  btn.textContent = "Enviando...";
  btn.disabled = true;
  try {
    const res = await fetch("/api/enviar-informe", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-coach-key": claveCoachGuardada() },
      body: JSON.stringify({ destinatario, entrenador: sel || null }),
    });
    const data = await res.json();
    if (res.ok) {
      toast("Informe enviado a " + destinatario);
    } else if (data.error === "no-autorizado") {
      localStorage.removeItem("jco-coach-key");
      toast("Tu sesión de coach expiró, vuelve a desbloquear la sección");
      mostrarCandado("Vuelve a ingresar la clave de acceso.");
    } else if (data.error === "config-faltante") {
      if (confirm((data.message || "El envío automático no está disponible todavía.") + "\n\n¿Quieres abrir tu app de correo con un borrador del informe en su lugar?")) {
        abrirBorradorCorreo(destinatario, sel);
      }
    } else {
      toast("No se pudo enviar el correo");
      console.error(data);
    }
  } catch (err) {
    toast("No se pudo enviar el correo");
    console.error(err);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
});

function abrirBorradorCorreo(destinatario, entrenadorSeleccionado) {
  const esEquipo = !entrenadorSeleccionado;
  const datos = esEquipo ? KPIS.equipo : KPIS.porEntrenador.find((e) => e.nombre === entrenadorSeleccionado);
  const asunto = esEquipo ? "JCOTRAINER · Informe de equipo" : `JCOTRAINER · Informe de ${entrenadorSeleccionado}`;
  let cuerpo = `Informe generado desde el tablero JCOTRAINER\n\n`;
  cuerpo += `Cumplimiento: ${datos.pct}%\nRegistros totales: ${datos.total}\nProyección próxima semana: ${datos.proyeccion.proyeccionPct}%\n\n`;
  if (!esEquipo) {
    cuerpo += "Feedback:\n" + datos.feedback.map((f) => "- " + f).join("\n") + "\n\n";
  } else {
    cuerpo += "Ranking:\n" + KPIS.ranking.map((r) => `${r.posicion}. ${r.nombre} — ${r.pct}% (${r.total} registros)`).join("\n") + "\n\n";
  }
  cuerpo += "(Adjunta el PDF descargado desde el botón \"Descargar PDF\" si quieres incluir los gráficos.)";
  const link = `mailto:${encodeURIComponent(destinatario)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.location.href = link;
}

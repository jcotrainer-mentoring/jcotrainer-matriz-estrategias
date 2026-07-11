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
// Tabs
// ---------------------------------------------------------------
document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
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

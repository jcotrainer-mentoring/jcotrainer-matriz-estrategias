// Lógica de cálculo de KPIs, compartida entre la función /api/kpis y /api/enviar-informe.

export const NOMBRES_ESTRATEGIA = {
  1: "Contacto Técnico Profesional",
  2: "Check-in de Progreso",
  3: "Mini-Diagnóstico Gratuito",
  4: "Cliente con Estancamiento",
  5: "Mala Técnica o Riesgo",
  6: "Ayuda Operativa",
  7: "Vitrina Profesional",
  8: "Desafío de 1 Semana",
  9: "Cliente Ansioso o Perdido",
  10: "Alumno Motivado",
};

function pct(cumplidas, total) {
  return total === 0 ? 0 : Math.round((cumplidas / total) * 1000) / 10;
}

export const RESULTADOS = ["Sin resultado", "Interés generado", "Cliente convertido"];

function resultadosDe(rows) {
  const cumplidas = rows.filter((r) => r.estado === "Cumplida");
  return {
    sinResultado: cumplidas.filter((r) => (r.resultado || "Sin resultado") === "Sin resultado").length,
    interes: cumplidas.filter((r) => r.resultado === "Interés generado").length,
    conversion: cumplidas.filter((r) => r.resultado === "Cliente convertido").length,
  };
}

export function formatCLP(valor) {
  return "$" + Math.round(valor || 0).toLocaleString("es-CL");
}

function weekStart(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function linreg(points) {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: points[0].y };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  points.forEach((p) => {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x;
  });
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function serieSemanal(rows) {
  const porSemana = {};
  rows.forEach((r) => {
    const w = weekStart(r.fecha);
    if (!porSemana[w]) porSemana[w] = { cumplidas: 0, total: 0 };
    porSemana[w].total += 1;
    if (r.estado === "Cumplida") porSemana[w].cumplidas += 1;
  });
  const semanas = Object.keys(porSemana).sort();
  return semanas.slice(-8).map((w) => ({
    semana: w,
    total: porSemana[w].total,
    cumplidas: porSemana[w].cumplidas,
    pct: pct(porSemana[w].cumplidas, porSemana[w].total),
  }));
}

function proyectar(serie) {
  if (serie.length === 0) return { proyeccionPct: 0, tendencia: "sin datos" };
  const puntos = serie.map((s, i) => ({ x: i, y: s.pct }));
  const { slope, intercept } = linreg(puntos);
  const nextX = puntos.length;
  let proyeccionPct = Math.round(intercept + slope * nextX);
  proyeccionPct = Math.max(0, Math.min(100, proyeccionPct));
  let tendencia = "estable";
  if (slope >= 2) tendencia = "alza";
  else if (slope <= -2) tendencia = "baja";
  return { proyeccionPct, tendencia, pendiente: Math.round(slope * 10) / 10 };
}

function porEstrategiaDe(rows) {
  const out = [];
  for (let n = 1; n <= 10; n++) {
    const rs = rows.filter((r) => r.estrategia === n);
    const cumplidas = rs.filter((r) => r.estado === "Cumplida").length;
    out.push({ n, nombre: NOMBRES_ESTRATEGIA[n], total: rs.length, cumplidas, pct: pct(cumplidas, rs.length) });
  }
  return out;
}

// ---------------------------------------------------------------
// Gamificación: racha de semanas, equilibrio entre estrategias, insignias.
// ---------------------------------------------------------------
const RACHA_UMBRAL_PCT = 60; // % mínimo de cumplimiento en una semana para que cuente en la racha

// Cuenta semanas consecutivas (desde la más reciente hacia atrás) donde el
// entrenador tuvo actividad y su % de cumplimiento alcanzó el umbral.
// Se corta en la primera semana que no cumple o que no tiene registros.
function rachaDe(serie) {
  let racha = 0;
  for (let i = serie.length - 1; i >= 0; i--) {
    const s = serie[i];
    if (s.total > 0 && s.pct >= RACHA_UMBRAL_PCT) racha += 1;
    else break;
  }
  return racha;
}

// Mide qué tan repartidas están las tareas cumplidas entre las 10 estrategias:
// cobertura = en cuántas estrategias distintas tiene al menos 1 cumplida;
// concentracionTop2Pct = qué % del total de cumplidas se concentra en sus 2
// estrategias más usadas (si es muy alto, depende demasiado de pocas).
function equilibrioDe(porEstrategia) {
  const cumplidasPorEstrategia = porEstrategia.map((e) => e.cumplidas);
  const totalCumplidas = cumplidasPorEstrategia.reduce((s, c) => s + c, 0);
  const cobertura = cumplidasPorEstrategia.filter((c) => c > 0).length;
  const top2 = [...cumplidasPorEstrategia].sort((a, b) => b - a).slice(0, 2).reduce((s, c) => s + c, 0);
  const concentracionTop2Pct = totalCumplidas === 0 ? 0 : Math.round((top2 / totalCumplidas) * 100);
  const equilibrado = totalCumplidas >= 10 && cobertura >= 6 && concentracionTop2Pct <= 50;
  return { cobertura, concentracionTop2Pct, equilibrado, totalCumplidas };
}

function insigniasDe({ racha, equilibrio, porEstrategia, resultados, total, esLider }) {
  const insignias = [];

  if (racha >= 10) insignias.push({ id: "racha-10", icono: "🔥", label: "Racha de 10+ semanas" });
  else if (racha >= 6) insignias.push({ id: "racha-6", icono: "🔥", label: "Racha de 6+ semanas" });
  else if (racha >= 3) insignias.push({ id: "racha-3", icono: "🔥", label: "Racha de 3+ semanas" });

  const dominadas = porEstrategia.filter((e) => e.total >= 3 && e.pct >= 80);
  if (dominadas.length >= 3) insignias.push({ id: "dominador", icono: "🎯", label: `${dominadas.length} estrategias dominadas` });
  else if (dominadas.length >= 1) insignias.push({ id: "dominada", icono: "🎯", label: `Estrategia dominada: ${dominadas[0].nombre}` });

  if (equilibrio.equilibrado) insignias.push({ id: "equilibrado", icono: "⚖️", label: "Equipo equilibrado entre estrategias" });

  if (resultados.conversion >= 5) insignias.push({ id: "cerrador", icono: "💎", label: "5+ clientes convertidos" });
  else if (resultados.conversion >= 1) insignias.push({ id: "primera-conversion", icono: "💰", label: "Primera conversión lograda" });

  if (esLider && total >= 5) insignias.push({ id: "lider", icono: "🏆", label: "Líder del equipo esta racha de datos" });

  return insignias;
}

function generarFeedback({ nombre, total, cumplidas, pctEnt, teamPct, porEstrategia, tendencia, proyeccionPct, resultados, valorPorCliente, racha }) {
  const lines = [];
  if (total === 0) {
    lines.push(`${nombre} aún no tiene registros en el tablero. Anímalo(a) a empezar a marcar sus tareas para poder darle seguimiento real.`);
    return lines;
  }
  const diff = pctEnt - teamPct;
  if (diff >= 10) {
    lines.push(`Fortaleza: su cumplimiento (${pctEnt}%) está ${Math.round(diff)} puntos por sobre el promedio del equipo (${teamPct}%). Es un buen momento para reconocerlo.`);
  } else if (diff <= -10) {
    lines.push(`Oportunidad de mejora: su cumplimiento (${pctEnt}%) está ${Math.round(-diff)} puntos bajo el promedio del equipo (${teamPct}%). Vale la pena conversar qué está dificultando aplicar las estrategias.`);
  } else {
    lines.push(`Su cumplimiento (${pctEnt}%) está en línea con el promedio del equipo (${teamPct}%).`);
  }

  const conDatos = porEstrategia.filter((e) => e.total > 0);
  if (conDatos.length) {
    const peor = [...conDatos].sort((a, b) => a.pct - b.pct)[0];
    const mejor = [...conDatos].sort((a, b) => b.pct - a.pct)[0];
    if (peor.pct < 60) lines.push(`Estrategia a reforzar: "${peor.nombre}" con ${peor.pct}% de cumplimiento.`);
    if (mejor.pct >= 80 && mejor.n !== peor.n) lines.push(`Estrategia más sólida: "${mejor.nombre}" con ${mejor.pct}% de cumplimiento.`);
  }

  if (tendencia === "alza") lines.push("Tendencia: su cumplimiento viene subiendo en las últimas semanas — buen momento para reforzar el hábito.");
  else if (tendencia === "baja") lines.push("Tendencia: su cumplimiento viene bajando en las últimas semanas — conviene revisar qué cambió.");
  else if (tendencia !== "sin datos") lines.push("Tendencia: su cumplimiento se ha mantenido estable en las últimas semanas.");

  if (resultados && (resultados.interes > 0 || resultados.conversion > 0)) {
    let linea = `Resultados: ${resultados.interes} interacciones generaron interés y ${resultados.conversion} se convirtieron en clientes nuevos.`;
    if (resultados.conversion > 0 && valorPorCliente > 0) {
      linea += ` Valor estimado aportado: ${formatCLP(resultados.conversion * valorPorCliente)}.`;
    }
    lines.push(linea);
  } else if (resultados && cumplidas > 0) {
    lines.push("Todavía no registra resultados (interés o conversión) en sus tareas cumplidas — vale la pena reforzar el hábito de marcarlos.");
  }

  if (racha >= 3) {
    lines.push(`Racha activa: lleva ${racha} semanas seguidas con al menos ${RACHA_UMBRAL_PCT}% de cumplimiento — buen momento para reconocer la constancia.`);
  }

  lines.push(`Proyección próxima semana: cerca de ${proyeccionPct}% de cumplimiento si continúa el ritmo actual.`);
  return lines;
}

export function computeKpis(state) {
  const log = state.log || [];
  const entrenadores = state.entrenadores || [];
  const valorPorCliente = Number(state.config?.valorPorCliente) || 0;

  const totalEquipo = log.length;
  const cumplidasEquipo = log.filter((r) => r.estado === "Cumplida").length;
  const pctEquipo = pct(cumplidasEquipo, totalEquipo);
  const porEstrategiaEquipo = porEstrategiaDe(log);
  const serieEquipo = serieSemanal(log);
  const proyeccionEquipo = proyectar(serieEquipo);
  const resultadosEquipo = resultadosDe(log);
  const valorEstimadoEquipo = resultadosEquipo.conversion * valorPorCliente;

  const porEntrenador = entrenadores.map((nombre) => {
    const rows = log.filter((r) => r.entrenador === nombre);
    const cumplidas = rows.filter((r) => r.estado === "Cumplida").length;
    const noCumplidas = rows.filter((r) => r.estado === "No cumplida").length;
    const pendientes = rows.filter((r) => r.estado === "Pendiente").length;
    const total = rows.length;
    const pctEnt = pct(cumplidas, total);
    const porEstrategia = porEstrategiaDe(rows);
    const serie = serieSemanal(rows);
    const proyeccion = proyectar(serie);
    const resultados = resultadosDe(rows);
    const valorEstimado = resultados.conversion * valorPorCliente;
    const racha = rachaDe(serie);
    const equilibrio = equilibrioDe(porEstrategia);
    const feedback = generarFeedback({
      nombre, total, cumplidas, pctEnt, teamPct: pctEquipo,
      porEstrategia, tendencia: proyeccion.tendencia, proyeccionPct: proyeccion.proyeccionPct,
      resultados, valorPorCliente, racha,
    });
    return {
      nombre, total, cumplidas, noCumplidas, pendientes, pct: pctEnt,
      porEstrategia, serieSemanal: serie, proyeccion, resultados, valorEstimado,
      racha, equilibrio, feedback,
    };
  });

  const ranking = [...porEntrenador].sort((a, b) => b.pct - a.pct || b.total - a.total);
  const nombreLider = ranking.length && ranking[0].total > 0 ? ranking[0].nombre : null;

  porEntrenador.forEach((ent) => {
    ent.insignias = insigniasDe({
      racha: ent.racha,
      equilibrio: ent.equilibrio,
      porEstrategia: ent.porEstrategia,
      resultados: ent.resultados,
      total: ent.total,
      esLider: ent.nombre === nombreLider,
    });
  });

  return {
    generadoEn: new Date().toISOString(),
    valorPorCliente,
    equipo: {
      total: totalEquipo, cumplidas: cumplidasEquipo, pct: pctEquipo,
      porEstrategia: porEstrategiaEquipo, serieSemanal: serieEquipo, proyeccion: proyeccionEquipo,
      resultados: resultadosEquipo, valorEstimado: valorEstimadoEquipo,
    },
    porEntrenador,
    ranking: ranking.map((r, i) => ({ posicion: i + 1, nombre: r.nombre, pct: r.pct, total: r.total, conversion: r.resultados.conversion, racha: r.racha })),
  };
}

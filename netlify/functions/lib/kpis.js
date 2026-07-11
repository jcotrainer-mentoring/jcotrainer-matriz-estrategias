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

function generarFeedback({ nombre, total, cumplidas, pctEnt, teamPct, porEstrategia, tendencia, proyeccionPct }) {
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

  lines.push(`Proyección próxima semana: cerca de ${proyeccionPct}% de cumplimiento si continúa el ritmo actual.`);
  return lines;
}

export function computeKpis(state) {
  const log = state.log || [];
  const entrenadores = state.entrenadores || [];

  const totalEquipo = log.length;
  const cumplidasEquipo = log.filter((r) => r.estado === "Cumplida").length;
  const pctEquipo = pct(cumplidasEquipo, totalEquipo);
  const porEstrategiaEquipo = porEstrategiaDe(log);
  const serieEquipo = serieSemanal(log);
  const proyeccionEquipo = proyectar(serieEquipo);

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
    const feedback = generarFeedback({
      nombre, total, cumplidas, pctEnt, teamPct: pctEquipo,
      porEstrategia, tendencia: proyeccion.tendencia, proyeccionPct: proyeccion.proyeccionPct,
    });
    return {
      nombre, total, cumplidas, noCumplidas, pendientes, pct: pctEnt,
      porEstrategia, serieSemanal: serie, proyeccion, feedback,
    };
  });

  const ranking = [...porEntrenador].sort((a, b) => b.pct - a.pct || b.total - a.total);

  return {
    generadoEn: new Date().toISOString(),
    equipo: {
      total: totalEquipo, cumplidas: cumplidasEquipo, pct: pctEquipo,
      porEstrategia: porEstrategiaEquipo, serieSemanal: serieEquipo, proyeccion: proyeccionEquipo,
    },
    porEntrenador,
    ranking: ranking.map((r, i) => ({ posicion: i + 1, nombre: r.nombre, pct: r.pct, total: r.total })),
  };
}

import { getStore } from "@netlify/blobs";
import { checkCoachAuth } from "./lib/auth.js";
import { cargarEstadoTenant, normalizeGrupo } from "./lib/tenant.js";
import { computeKpis } from "./lib/kpis.js";
import { cargarRegistro } from "./lib/registry.js";

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-coach-key",
};

function estadoInicial() {
  return { matriz: [], log: [], entrenadores: [], config: { valorPorCliente: 0 }, updatedAt: null };
}

// Un cliente entra en "riesgo" si su tendencia de cumplimiento viene a la
// baja (calculada en computeKpis a partir de las últimas semanas), o si su
// cumplimiento general es muy bajo teniendo ya registros.
function evaluarRiesgo(kpis) {
  const tendenciaBaja = kpis.equipo.proyeccion.tendencia === "baja";
  const cumplimientoBajo = kpis.equipo.total > 0 && kpis.equipo.pct < 40;
  return tendenciaBaja || cumplimientoBajo;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Metodo no soportado" }), { status: 405, headers: HEADERS });
  }

  const auth = checkCoachAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), { status: auth.status, headers: HEADERS });
  }

  const store = getStore("jcotrainer");
  const registro = await cargarRegistro(store);

  const clientes = [];
  for (const c of registro.clientes) {
    const grupo = normalizeGrupo(c.grupo);
    const { data: state } = await cargarEstadoTenant(store, grupo, estadoInicial);
    const kpis = computeKpis(state);
    clientes.push({
      grupo,
      nombreVisible: c.nombreVisible || grupo,
      notas: c.notas || "",
      activo: c.activo !== false,
      creadoEn: c.creadoEn,
      pct: kpis.equipo.pct,
      total: kpis.equipo.total,
      entrenadores: (state.entrenadores || []).length,
      resultados: kpis.equipo.resultados,
      valorEstimado: kpis.equipo.valorEstimado,
      tendencia: kpis.equipo.proyeccion.tendencia,
      proyeccionPct: kpis.equipo.proyeccion.proyeccionPct,
      enRiesgo: evaluarRiesgo(kpis),
    });
  }

  const activos = clientes.filter((c) => c.activo);
  const totales = {
    clientesActivos: activos.length,
    totalRegistros: activos.reduce((s, c) => s + c.total, 0),
    totalConversiones: activos.reduce((s, c) => s + c.resultados.conversion, 0),
    valorEstimadoTotal: activos.reduce((s, c) => s + c.valorEstimado, 0),
    enRiesgo: activos.filter((c) => c.enRiesgo).length,
  };

  return new Response(JSON.stringify({
    generadoEn: new Date().toISOString(),
    clientes,
    totales,
  }), { status: 200, headers: HEADERS });
};

import { getStore } from "@netlify/blobs";
import { computeKpis } from "./lib/kpis.js";
import { checkCoachAuth } from "./lib/auth.js";
import { grupoFromRequest, cargarEstadoTenant } from "./lib/tenant.js";

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-coach-key",
};

function estadoInicial() {
  return { matriz: [], log: [], entrenadores: [], updatedAt: null };
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
  const grupo = grupoFromRequest(req);
  const { data: state } = await cargarEstadoTenant(store, grupo, estadoInicial);
  const kpis = computeKpis(state);

  return new Response(JSON.stringify({ ...kpis, grupo }), { status: 200, headers: HEADERS });
};

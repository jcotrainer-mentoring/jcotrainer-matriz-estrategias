import { getStore } from "@netlify/blobs";
import { grupoFromRequest, keyForGrupo, cargarEstadoTenant } from "./lib/tenant.js";

const ESTRATEGIAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function estadoInicial() {
  return {
    matriz: ESTRATEGIAS.map((n) => ({
      n,
      entrenador: "Todo el equipo",
      estado: "Pendiente",
      notas: "",
    })),
    log: [],
    entrenadores: ["Entrenador 1", "Entrenador 2", "Entrenador 3", "Entrenador 4"],
    config: { valorPorCliente: 0 },
    updatedAt: null,
  };
}

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const store = getStore("jcotrainer");
  const grupo = grupoFromRequest(req);
  const KEY = keyForGrupo(grupo);

  if (req.method === "GET") {
    const { data } = await cargarEstadoTenant(store, grupo, estadoInicial);
    return new Response(JSON.stringify({ ...data, grupo }), { status: 200, headers: HEADERS });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { data: actual } = await cargarEstadoTenant(store, grupo, estadoInicial);

      if (body.type === "reemplazar") {
        const nuevo = { ...actual, ...body.data, updatedAt: new Date().toISOString() };
        await store.setJSON(KEY, nuevo);
        return new Response(JSON.stringify({ ...nuevo, grupo }), { status: 200, headers: HEADERS });
      }

      if (body.type === "actualizar-matriz") {
        const { n, campo, valor } = body;
        actual.matriz = actual.matriz.map((row) =>
          row.n === n ? { ...row, [campo]: valor } : row
        );
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify({ ...actual, grupo }), { status: 200, headers: HEADERS });
      }

      if (body.type === "actualizar-registro") {
        const { id, campo, valor } = body;
        actual.log = actual.log.map((r) =>
          r.id === id ? { ...r, [campo]: valor } : r
        );
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify({ ...actual, grupo }), { status: 200, headers: HEADERS });
      }

      if (body.type === "agregar-registro") {
        const registro = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          ...body.registro,
        };
        actual.log = [registro, ...actual.log].slice(0, 2000);
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify({ ...actual, grupo }), { status: 200, headers: HEADERS });
      }

      if (body.type === "borrar-registro") {
        actual.log = actual.log.filter((r) => r.id !== body.id);
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify({ ...actual, grupo }), { status: 200, headers: HEADERS });
      }

      return new Response(JSON.stringify({ error: "Tipo de operacion no reconocido" }), {
        status: 400,
        headers: HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: HEADERS,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Metodo no soportado" }), {
    status: 405,
    headers: HEADERS,
  });
};

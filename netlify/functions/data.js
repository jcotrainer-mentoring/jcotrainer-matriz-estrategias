import { getStore } from "@netlify/blobs";

const KEY = "estado-jcotrainer";

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

  if (req.method === "GET") {
    let data = await store.get(KEY, { type: "json" });
    if (!data) {
      data = estadoInicial();
      await store.setJSON(KEY, data);
    }
    return new Response(JSON.stringify(data), { status: 200, headers: HEADERS });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const actual = (await store.get(KEY, { type: "json" })) || estadoInicial();

      if (body.type === "reemplazar") {
        const nuevo = { ...actual, ...body.data, updatedAt: new Date().toISOString() };
        await store.setJSON(KEY, nuevo);
        return new Response(JSON.stringify(nuevo), { status: 200, headers: HEADERS });
      }

      if (body.type === "actualizar-matriz") {
        const { n, campo, valor } = body;
        actual.matriz = actual.matriz.map((row) =>
          row.n === n ? { ...row, [campo]: valor } : row
        );
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify(actual), { status: 200, headers: HEADERS });
      }

      if (body.type === "agregar-registro") {
        const registro = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          ...body.registro,
        };
        actual.log = [registro, ...actual.log].slice(0, 2000);
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify(actual), { status: 200, headers: HEADERS });
      }

      if (body.type === "borrar-registro") {
        actual.log = actual.log.filter((r) => r.id !== body.id);
        actual.updatedAt = new Date().toISOString();
        await store.setJSON(KEY, actual);
        return new Response(JSON.stringify(actual), { status: 200, headers: HEADERS });
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

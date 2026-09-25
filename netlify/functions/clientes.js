import { getStore } from "@netlify/blobs";
import { checkCoachAuth } from "./lib/auth.js";
import { normalizeGrupo } from "./lib/tenant.js";
import { cargarRegistro, guardarRegistro } from "./lib/registry.js";

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-coach-key",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const auth = checkCoachAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), { status: auth.status, headers: HEADERS });
  }

  const store = getStore("jcotrainer");

  if (req.method === "GET") {
    const registro = await cargarRegistro(store);
    return new Response(JSON.stringify(registro), { status: 200, headers: HEADERS });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const registro = await cargarRegistro(store);

      if (body.type === "agregar") {
        const grupo = normalizeGrupo(body.grupo);
        if (registro.clientes.some((c) => c.grupo === grupo)) {
          return new Response(JSON.stringify({
            error: "ya-existe",
            message: "Ese identificador ya está registrado en el panel.",
          }), { status: 400, headers: HEADERS });
        }
        registro.clientes.push({
          grupo,
          nombreVisible: (body.nombreVisible || grupo).trim(),
          notas: (body.notas || "").trim(),
          activo: true,
          creadoEn: new Date().toISOString(),
        });
        await guardarRegistro(store, registro);
        return new Response(JSON.stringify(registro), { status: 200, headers: HEADERS });
      }

      if (body.type === "editar") {
        const { grupo, campo, valor } = body;
        registro.clientes = registro.clientes.map((c) =>
          c.grupo === grupo ? { ...c, [campo]: valor } : c
        );
        await guardarRegistro(store, registro);
        return new Response(JSON.stringify(registro), { status: 200, headers: HEADERS });
      }

      if (body.type === "eliminar") {
        registro.clientes = registro.clientes.filter((c) => c.grupo !== body.grupo);
        await guardarRegistro(store, registro);
        return new Response(JSON.stringify(registro), { status: 200, headers: HEADERS });
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

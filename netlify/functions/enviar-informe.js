import { getStore } from "@netlify/blobs";
import { computeKpis } from "./lib/kpis.js";
import { reportHtmlEntrenador, reportHtmlEquipo } from "./lib/reportHtml.js";
import { checkCoachAuth } from "./lib/auth.js";

const KEY = "estado-jcotrainer";

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-coach-key",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Metodo no soportado" }), { status: 405, headers: HEADERS });
  }

  const auth = checkCoachAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), { status: auth.status, headers: HEADERS });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return new Response(JSON.stringify({
      error: "config-faltante",
      message: "El envío de correos no está configurado todavía. Falta definir las variables de entorno RESEND_API_KEY y RESEND_FROM en Netlify (Project configuration → Environment variables).",
    }), { status: 501, headers: HEADERS });
  }

  try {
    const body = await req.json();
    const { destinatario, entrenador } = body;
    if (!destinatario) {
      return new Response(JSON.stringify({ error: "Falta el destinatario" }), { status: 400, headers: HEADERS });
    }

    const store = getStore("jcotrainer");
    const state = (await store.get(KEY, { type: "json" })) || { matriz: [], log: [], entrenadores: [] };
    const kpis = computeKpis(state);

    let html, subject;
    if (entrenador) {
      const ent = kpis.porEntrenador.find((e) => e.nombre === entrenador);
      if (!ent) {
        return new Response(JSON.stringify({ error: "Entrenador no encontrado" }), { status: 404, headers: HEADERS });
      }
      html = reportHtmlEntrenador(ent, kpis.equipo.pct, kpis.generadoEn);
      subject = `JCOTRAINER · Informe de ${entrenador}`;
    } else {
      html = reportHtmlEquipo(kpis);
      subject = "JCOTRAINER · Informe de equipo";
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [destinatario], subject, html }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: "envio-fallido", detail: errText }), { status: 502, headers: HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: HEADERS });
  }
};

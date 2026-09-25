import { formatCLP } from "./kpis.js";

function badgeColor(p) {
  if (p >= 80) return "#3E7D1F";
  if (p >= 50) return "#B36B00";
  return "#B03A2E";
}

function statCard(valor, label) {
  return `<div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
    <div style="font-size:22px;font-weight:bold;">${valor}</div>
    <div style="font-size:12px;color:#5B6770;">${label}</div>
  </div>`;
}

function filaEstrategia(e) {
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;">${String(e.n).padStart(2, "0")} · ${e.nombre}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;text-align:center;">${e.cumplidas}/${e.total}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;text-align:center;color:${badgeColor(e.pct)};font-weight:bold;">${e.pct}%</td>
  </tr>`;
}

export function reportHtmlEntrenador(ent, teamPct, generadoEn) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1B1F23;">
    <div style="background:#1F3864;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0;">
      <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.8;">JCOTRAINER · Informe individual</div>
      <div style="font-size:24px;font-weight:bold;">${ent.nombre}</div>
    </div>
    <div style="border:1px solid #E4E7EB;border-top:none;padding:22px;border-radius:0 0 10px 10px;">
      <p style="font-size:14px;color:#5B6770;">Generado el ${new Date(generadoEn).toLocaleString("es-CL")}</p>
      <div style="display:flex;gap:16px;margin:16px 0;">
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:${badgeColor(ent.pct)};">${ent.pct}%</div>
          <div style="font-size:12px;color:#5B6770;">Cumplimiento general</div>
        </div>
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;">${ent.total}</div>
          <div style="font-size:12px;color:#5B6770;">Registros totales</div>
        </div>
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;">${ent.proyeccion.proyeccionPct}%</div>
          <div style="font-size:12px;color:#5B6770;">Proyección próx. semana</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin:0 0 16px;">
        ${statCard(ent.resultados.interes, "Interés generado")}
        ${statCard(ent.resultados.conversion, "Clientes convertidos")}
        ${statCard(formatCLP(ent.valorEstimado), "Valor estimado generado")}
      </div>

      ${ent.insignias.length ? `
      <h3 style="color:#1F3864;font-size:16px;margin:18px 0 8px;">Insignias</h3>
      <div style="margin-bottom:8px;">
        ${ent.insignias.map((i) => `<span style="display:inline-block;background:#F4F6F8;border-radius:999px;padding:6px 12px;font-size:13px;margin:0 6px 6px 0;">${i.icono} ${i.label}</span>`).join("")}
      </div>` : ""}

      <h3 style="color:#1F3864;font-size:16px;margin:18px 0 8px;">Feedback del mentor (generado a partir de los datos)</h3>
      <ul style="padding-left:18px;font-size:14px;line-height:1.5;">
        ${ent.feedback.map((f) => `<li>${f}</li>`).join("")}
      </ul>

      <h3 style="color:#1F3864;font-size:16px;margin:18px 0 8px;">Cumplimiento por estrategia</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#1F3864;color:#fff;">
          <th style="padding:6px 10px;text-align:left;">Estrategia</th>
          <th style="padding:6px 10px;">Cumplidas</th>
          <th style="padding:6px 10px;">%</th>
        </tr>
        ${ent.porEstrategia.map(filaEstrategia).join("")}
      </table>

      <p style="font-size:12px;color:#93A1AC;margin-top:20px;">JCOTRAINER · Tablero compartido del equipo · informe generado automáticamente desde /api/kpis</p>
    </div>
  </div>`;
}

export function reportHtmlEquipo(kpis) {
  const filasRanking = kpis.ranking.map((r) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;">#${r.posicion}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;">${r.nombre}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;text-align:center;">${r.total}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;text-align:center;color:${badgeColor(r.pct)};font-weight:bold;">${r.pct}%</td>
      <td style="padding:6px 10px;border-bottom:1px solid #E4E7EB;text-align:center;">${r.racha > 0 ? "🔥 " + r.racha : "—"}</td>
    </tr>`).join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1B1F23;">
    <div style="background:#1F3864;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0;">
      <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.8;">JCOTRAINER · Informe de equipo</div>
      <div style="font-size:24px;font-weight:bold;">Resumen general</div>
    </div>
    <div style="border:1px solid #E4E7EB;border-top:none;padding:22px;border-radius:0 0 10px 10px;">
      <p style="font-size:14px;color:#5B6770;">Generado el ${new Date(kpis.generadoEn).toLocaleString("es-CL")}</p>
      <div style="display:flex;gap:16px;margin:16px 0;">
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:${badgeColor(kpis.equipo.pct)};">${kpis.equipo.pct}%</div>
          <div style="font-size:12px;color:#5B6770;">Cumplimiento del equipo</div>
        </div>
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;">${kpis.equipo.total}</div>
          <div style="font-size:12px;color:#5B6770;">Registros totales</div>
        </div>
        <div style="flex:1;background:#F4F6F8;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;">${kpis.equipo.proyeccion.proyeccionPct}%</div>
          <div style="font-size:12px;color:#5B6770;">Proyección próx. semana</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin:0 0 16px;">
        ${statCard(kpis.equipo.resultados.interes, "Interés generado")}
        ${statCard(kpis.equipo.resultados.conversion, "Clientes convertidos")}
        ${statCard(formatCLP(kpis.equipo.valorEstimado), "Valor estimado generado")}
      </div>

      <h3 style="color:#1F3864;font-size:16px;margin:18px 0 8px;">Ranking de entrenadores</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#1F3864;color:#fff;">
          <th style="padding:6px 10px;text-align:left;">#</th>
          <th style="padding:6px 10px;text-align:left;">Entrenador</th>
          <th style="padding:6px 10px;">Registros</th>
          <th style="padding:6px 10px;">% Cumplimiento</th>
          <th style="padding:6px 10px;">Racha</th>
        </tr>
        ${filasRanking}
      </table>

      <p style="font-size:12px;color:#93A1AC;margin-top:20px;">JCOTRAINER · Tablero compartido del equipo · informe generado automáticamente desde /api/kpis</p>
    </div>
  </div>`;
}

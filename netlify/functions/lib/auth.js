// Verificación de acceso para endpoints exclusivos del coach senior.
// La clave se define en Netlify como variable de entorno COACH_ACCESS_KEY
// y se envía desde el navegador en el header "x-coach-key".

export function checkCoachAuth(req) {
  const expected = process.env.COACH_ACCESS_KEY;

  if (!expected) {
    return {
      ok: false,
      status: 503,
      body: {
        error: "config-faltante",
        message: "El acceso del coach aún no está configurado. Define la variable de entorno COACH_ACCESS_KEY en Netlify (Project configuration → Environment variables) y vuelve a desplegar.",
      },
    };
  }

  const provided = req.headers.get("x-coach-key") || "";

  if (provided !== expected) {
    return {
      ok: false,
      status: 401,
      body: { error: "no-autorizado", message: "Clave de acceso incorrecta o ausente." },
    };
  }

  return { ok: true };
}

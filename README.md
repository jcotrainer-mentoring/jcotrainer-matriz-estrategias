# JCOTRAINER — Matriz de Estrategias (app para Netlify)

App web compartida para el equipo de entrenadores: matriz de las 10 estrategias,
checklist diario/semanal/mensual y panel de seguimiento de cumplimiento.
Todo el equipo ve y edita los mismos datos en tiempo real (se guardan en
**Netlify Blobs**, no en el navegador de cada persona).

## Estructura

```
netlify.toml              # configuración de build, funciones y redirects
package.json              # dependencia @netlify/blobs
public/
  index.html               # las 6 secciones (Guía, Matriz, Diario, Semanal, Mensual, Seguimiento)
  style.css
  app.js                    # datos de las 10 estrategias + lógica de la app
netlify/functions/
  data.js                   # API (/api/data) que lee y escribe el estado compartido
```

## Desplegar en Netlify (opción rápida — arrastrar y soltar)

1. Comprime esta carpeta completa en un .zip (o usa el .zip ya generado).
2. Entra a [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**.
3. Arrastra el .zip (o la carpeta) al recuadro.
4. Netlify detecta `netlify.toml`, instala `@netlify/blobs` y publica el sitio y la función automáticamente.
5. Comparte el link que te entrega Netlify (algo como `https://tu-sitio.netlify.app`) con todo el equipo de entrenadores.

> Con "Deploy manually" no hay repositorio conectado, así que para futuras actualizaciones tendrás que volver a arrastrar el .zip. Netlify Blobs (los datos guardados) se mantienen aunque vuelvas a desplegar.

## Desplegar conectando un repositorio (recomendado para poder editar después)

1. Sube esta carpeta a un repositorio de GitHub/GitLab/Bitbucket.
2. En Netlify: **Add new site → Import an existing project** y selecciona el repositorio.
3. Build command: (déjalo vacío — no hay paso de build de frontend).
   Publish directory: `public`.
   Netlify detecta `netlify.toml` y lo configura solo.
4. Deploy site. Listo — cada `git push` vuelve a publicar la app.

## Cómo funciona el guardado compartido

- El archivo `netlify/functions/data.js` es una función serverless de Netlify
  que expone `/api/data` (GET para leer, POST para guardar).
- Usa **Netlify Blobs**, un almacenamiento clave-valor propio de Netlify: no
  necesitas crear cuenta ni API key en ningún servicio externo, funciona solo
  por estar desplegado en Netlify.
- Cualquier entrenador que entre al link ve y modifica el mismo estado.

## Personalizar

- **Nombres de entrenadores**: edita el arreglo `entrenadores` dentro del
  estado inicial en `netlify/functions/data.js` (línea `entrenadores: [...]`).
  Los que ya se hayan usado quedan guardados aunque cambies la lista.
- **Colores y tipografía**: variables al inicio de `public/style.css` (`:root`).
- **Contenido de las estrategias o tareas**: arreglos `ESTRATEGIAS` y `TAREAS`
  en `public/app.js`.

## Desarrollo local (opcional)

Si tienes Node y la Netlify CLI instalados:

```bash
npm install -g netlify-cli
npm install
netlify dev
```

Esto simula Netlify Blobs y las funciones localmente en `http://localhost:8888`.

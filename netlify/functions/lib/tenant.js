// Separación multi-cliente (multi-tenant) de la matriz.
//
// Cada cliente (el portal "Método Premium" o un gimnasio contratado por separado)
// se identifica con un parámetro `?g=` en la URL. Sin ese parámetro, se usa el
// identificador por defecto (DEFAULT_GRUPO), que es donde vivían los datos
// originales del tablero antes de este cambio — por eso el link ya repartido
// sin parámetros sigue funcionando exactamente igual.
//
// Cada grupo guarda su propio estado en una key distinta del blob store, con un
// prefijo (TENANT_PREFIX) que nunca puede coincidir con la key legacy usada
// antes de este cambio, así que no hay riesgo de que un nombre de cliente nuevo
// choque por accidente con los datos históricos.

export const DEFAULT_GRUPO = "metodo-premium";
const LEGACY_KEY = "estado-jcotrainer"; // key única usada por la versión anterior (sin multi-tenant)
const TENANT_PREFIX = "tenant-";

/**
 * Normaliza cualquier valor recibido en `?g=` a un identificador de grupo
 * seguro para usar como parte de una key de almacenamiento: minúsculas,
 * sin acentos, solo [a-z0-9-_], sin guiones repetidos ni en los extremos,
 * máximo 60 caracteres. Un valor vacío o inválido cae en DEFAULT_GRUPO.
 */
export function normalizeGrupo(raw) {
  if (!raw) return DEFAULT_GRUPO;
  let g = String(raw).trim().toLowerCase();
  g = g.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita acentos
  g = g.replace(/[^a-z0-9-_]/g, "-");
  g = g.replace(/-{2,}/g, "-").replace(/^[-_]+|[-_]+$/g, "");
  g = g.slice(0, 60);
  return g || DEFAULT_GRUPO;
}

/** Lee `?g=` de la URL de la request y lo normaliza. */
export function grupoFromRequest(req) {
  const url = new URL(req.url);
  return normalizeGrupo(url.searchParams.get("g"));
}

/** Key de almacenamiento para un grupo ya normalizado. */
export function keyForGrupo(grupo) {
  return TENANT_PREFIX + grupo;
}

/**
 * Carga el estado de un grupo. Si es el grupo por defecto y todavía no tiene
 * datos bajo la key nueva, migra automáticamente los datos que existían bajo
 * la key legacy (una sola vez: a partir de ahí ya quedan bajo la key nueva).
 * Si no hay nada que migrar, inicializa el grupo con `estadoInicial()`.
 */
export async function cargarEstadoTenant(store, grupo, estadoInicial) {
  const key = keyForGrupo(grupo);
  let data = await store.get(key, { type: "json" });
  if (data) return { data, key };

  if (grupo === DEFAULT_GRUPO) {
    const legacy = await store.get(LEGACY_KEY, { type: "json" });
    if (legacy) {
      await store.setJSON(key, legacy);
      return { data: legacy, key };
    }
  }

  const inicial = estadoInicial();
  await store.setJSON(key, inicial);
  return { data: inicial, key };
}

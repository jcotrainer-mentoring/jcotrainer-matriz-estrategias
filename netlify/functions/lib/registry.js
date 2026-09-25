// Registro de clientes del panel maestro.
//
// A diferencia del estado por tenant (que se crea solo al abrir un link ?g=),
// esta lista es explícita: el coach la administra a mano desde la pestaña
// "Clientes". Solo lo que está acá aparece en el panel consolidado — así se
// evita que pruebas o links mal escritos ensucien el resumen.

const REGISTRY_KEY = "registro-clientes";

export async function cargarRegistro(store) {
  const data = await store.get(REGISTRY_KEY, { type: "json" });
  return data || { clientes: [] };
}

export async function guardarRegistro(store, data) {
  await store.setJSON(REGISTRY_KEY, data);
}

/*
  Newsly · Capa de persistencia local
  Encapsula todo el acceso a localStorage: favoritos, noticias creadas
  desde Administración y noticias eliminadas del catálogo base.
*/

const CLAVES = {
  favoritos: "newsly_favoritos_v1",
  personalizadas: "newsly_noticias_personalizadas_v1",
  eliminadas: "newsly_noticias_eliminadas_v1",
};

function leerJSON(clave, valorPorDefecto) {
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return valorPorDefecto;
    const datos = JSON.parse(crudo);
    return datos ?? valorPorDefecto;
  } catch (error) {
    console.warn(`Newsly: datos corruptos en "${clave}", se restablece.`, error);
    return valorPorDefecto;
  }
}

function guardarJSON(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (error) {
    console.error(`Newsly: no se pudo guardar "${clave}".`, error);
  }
}

/* ---------- Favoritos ---------- */

function obtenerFavoritos() {
  const favoritos = leerJSON(CLAVES.favoritos, []);
  return Array.isArray(favoritos) ? [...new Set(favoritos)] : [];
}

function esFavorito(id) {
  return obtenerFavoritos().includes(Number(id));
}

function alternarFavorito(id) {
  const idNum = Number(id);
  const favoritos = obtenerFavoritos();
  const indice = favoritos.indexOf(idNum);
  if (indice >= 0) {
    favoritos.splice(indice, 1);
  } else {
    favoritos.push(idNum);
  }
  guardarJSON(CLAVES.favoritos, favoritos);
  return favoritos.includes(idNum);
}

function eliminarFavorito(id) {
  const favoritos = obtenerFavoritos().filter((f) => f !== Number(id));
  guardarJSON(CLAVES.favoritos, favoritos);
}

function limpiarFavoritos() {
  guardarJSON(CLAVES.favoritos, []);
}

/* ---------- Noticias personalizadas (creadas en Administración) ---------- */

function obtenerNoticiasPersonalizadas() {
  const datos = leerJSON(CLAVES.personalizadas, []);
  return Array.isArray(datos) ? datos : [];
}

function guardarNoticiaPersonalizada(noticia) {
  const noticias = obtenerNoticiasPersonalizadas();
  noticias.unshift(noticia);
  guardarJSON(CLAVES.personalizadas, noticias);
}

function eliminarNoticiaPersonalizada(id) {
  const noticias = obtenerNoticiasPersonalizadas().filter((n) => n.id !== Number(id));
  guardarJSON(CLAVES.personalizadas, noticias);
}

/* ---------- Noticias eliminadas del catálogo base (JSON) ---------- */

function obtenerNoticiasEliminadas() {
  const datos = leerJSON(CLAVES.eliminadas, []);
  return Array.isArray(datos) ? datos : [];
}

function marcarNoticiaEliminada(id) {
  const eliminadas = obtenerNoticiasEliminadas();
  const idNum = Number(id);
  if (!eliminadas.includes(idNum)) {
    eliminadas.push(idNum);
    guardarJSON(CLAVES.eliminadas, eliminadas);
  }
}

function siguienteIdPersonalizado() {
  const personalizadas = obtenerNoticiasPersonalizadas();
  const maximo = personalizadas.reduce((max, n) => Math.max(max, n.id), 1000);
  return maximo + 1;
}

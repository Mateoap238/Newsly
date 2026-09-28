/*
  Newsly · Capa de datos de noticias
  Carga el catálogo base desde data/noticias.json (requiere servidor local,
  ver README) y lo combina con lo almacenado en localStorage.
*/

const CATEGORIAS = ["Tecnología", "Educación", "Turismo", "Negocios"];

const CATEGORIA_CLASE = {
  "Tecnología": "tecnologia",
  "Educación": "educacion",
  "Turismo": "turismo",
  "Negocios": "negocios",
};

let cacheNoticiasBase = null;

async function cargarNoticiasBase() {
  if (cacheNoticiasBase) return cacheNoticiasBase;
  try {
    const respuesta = await fetch("data/noticias.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    cacheNoticiasBase = await respuesta.json();
  } catch (error) {
    console.error("Newsly: no se pudo cargar data/noticias.json. ¿Estás usando un servidor local (Live Server)?", error);
    cacheNoticiasBase = [];
  }
  return cacheNoticiasBase;
}

/**
 * Devuelve el catálogo completo: noticias base (JSON) + creadas en
 * Administración, excluyendo las marcadas como eliminadas.
 */
async function obtenerNoticias() {
  const base = await cargarNoticiasBase();
  const personalizadas = obtenerNoticiasPersonalizadas();
  const eliminadas = obtenerNoticiasEliminadas();

  const combinadas = [...personalizadas, ...base];
  const sinEliminadas = combinadas.filter((n) => !eliminadas.includes(n.id));

  const vistas = new Set();
  return sinEliminadas.filter((n) => {
    if (vistas.has(n.id)) return false;
    vistas.add(n.id);
    return true;
  });
}

async function obtenerNoticiaPorId(id) {
  const noticias = await obtenerNoticias();
  return noticias.find((n) => n.id === Number(id)) || null;
}

function claseCategoria(categoria) {
  return CATEGORIA_CLASE[categoria] || "general";
}

function formatearFecha(fechaISO) {
  try {
    const fecha = new Date(`${fechaISO}T00:00:00`);
    return fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return fechaISO;
  }
}

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

/**
 * Filtra, busca y ordena un arreglo de noticias sin mutar el original.
 * opciones: { texto, categoria, orden }
 */
function filtrarNoticias(noticias, opciones = {}) {
  const { texto = "", categoria = "Todas", orden = "recientes" } = opciones;
  const textoNormalizado = texto.trim().toLowerCase();

  let resultado = noticias.filter((n) => n.estado !== "borrador");

  if (categoria && categoria !== "Todas") {
    resultado = resultado.filter((n) => n.categoria === categoria);
  }

  if (textoNormalizado) {
    resultado = resultado.filter((n) => {
      const campos = [n.titulo, n.descripcion, n.categoria, n.autor];
      return campos.some((campo) => campo?.toLowerCase().includes(textoNormalizado));
    });
  }

  resultado = [...resultado].sort((a, b) => {
    if (orden === "antiguas") return a.fecha.localeCompare(b.fecha);
    if (orden === "titulo") return a.titulo.localeCompare(b.titulo, "es");
    return b.fecha.localeCompare(a.fecha);
  });

  return resultado;
}

function contarPorCategoria(noticias) {
  const conteo = Object.fromEntries(CATEGORIAS.map((c) => [c, 0]));
  noticias.forEach((n) => {
    if (n.estado === "borrador") return;
    if (conteo[n.categoria] !== undefined) conteo[n.categoria] += 1;
  });
  return conteo;
}

/**
 * Genera el marcado HTML de una tarjeta de noticia, reutilizado por
 * Inicio, Listado, Detalle (relacionadas) y Favoritos.
 */
function tarjetaNoticiaHTML(noticia) {
  const favorito = esFavorito(noticia.id);
  return `
    <article class="tarjeta-noticia" data-id="${noticia.id}">
      <a class="tarjeta-noticia__imagen-link" href="detalle.html?id=${noticia.id}">
        <div class="tarjeta-noticia__imagen">
          <img src="${noticia.imagen}" alt="${escaparHTML(noticia.titulo)}" loading="lazy">
          <span class="badge badge--${claseCategoria(noticia.categoria)}">${noticia.categoria}</span>
        </div>
      </a>
      <button
        type="button"
        class="btn-favorito ${favorito ? "es-favorito" : ""}"
        data-fav-id="${noticia.id}"
        aria-pressed="${favorito}"
        aria-label="${favorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
      ><i class="bi bi-star-fill"></i></button>
      <div class="tarjeta-noticia__cuerpo">
        <p class="tarjeta-noticia__meta">
          <span><i class="bi bi-calendar3"></i> ${formatearFecha(noticia.fecha)}</span>
          <span><i class="bi bi-clock"></i> ${noticia.tiempoLectura} min de lectura</span>
        </p>
        <h3 class="tarjeta-noticia__titulo">
          <a href="detalle.html?id=${noticia.id}">${escaparHTML(noticia.titulo)}</a>
        </h3>
        <p class="tarjeta-noticia__resumen">${escaparHTML(noticia.descripcion)}</p>
        <div class="tarjeta-noticia__pie">
          <span class="tarjeta-noticia__autor">
            <span class="avatar-iniciales">${iniciales(noticia.autor)}</span>
            ${escaparHTML(noticia.autor)}
          </span>
          <a class="enlace-ver-mas" href="detalle.html?id=${noticia.id}">Ver más →</a>
        </div>
      </div>
    </article>
  `;
}

function escaparHTML(texto = "") {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

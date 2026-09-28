/*
  Newsly · Panel de Administración (mini CRUD local)
  Lista, busca, filtra, crea y elimina noticias usando localStorage
  como capa de persistencia sobre el catálogo base de data/noticias.json.
*/

const IMAGEN_PLACEHOLDER = "assets/images/placeholder-noticia.jpg";

let todasAdmin = [];
let idPendienteEliminar = null;

function esNoticiaPersonalizada(id) {
  return obtenerNoticiasPersonalizadas().some((n) => n.id === Number(id));
}

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function poblarSelectsCategoria() {
  const opciones = CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join("");
  document.getElementById("adminCategoria").insertAdjacentHTML("beforeend", opciones);
  document.getElementById("adminNuevaCategoria").insertAdjacentHTML("beforeend", opciones);
}

function calcularStats(noticias) {
  const total = noticias.length;
  const publicadas = noticias.filter((n) => n.estado === "publicada").length;
  const borradores = noticias.filter((n) => n.estado === "borrador").length;
  const promedioLectura = total
    ? (noticias.reduce((suma, n) => suma + (n.tiempoLectura || 0), 0) / total).toFixed(1)
    : "0";

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPublicadas").textContent = publicadas;
  document.getElementById("statBorradores").textContent = borradores;
  document.getElementById("statLectura").textContent = `${promedioLectura} min`;
}

function filaAdminHTML(noticia) {
  return `
    <tr data-fila-id="${noticia.id}">
      <td><img class="admin-tabla__miniatura" src="${noticia.imagen}" alt=""></td>
      <td>
        <span class="admin-tabla__titulo">${escaparHTML(noticia.titulo)}</span>
        <p class="admin-tabla__resumen">${escaparHTML(noticia.descripcion.slice(0, 70))}${noticia.descripcion.length > 70 ? "…" : ""}</p>
      </td>
      <td><span class="badge badge--${claseCategoria(noticia.categoria)}">${noticia.categoria}</span></td>
      <td>${escaparHTML(noticia.autor)}</td>
      <td>${formatearFecha(noticia.fecha)}</td>
      <td><span class="estado-pill estado-pill--${noticia.estado}"><i class="bi bi-circle-fill"></i> ${noticia.estado === "publicada" ? "Publicado" : "Borrador"}</span></td>
      <td class="admin-tabla__acciones">
        <button type="button" class="icono-boton icono-boton--peligro" data-eliminar-id="${noticia.id}" aria-label="Eliminar noticia"><i class="bi bi-trash3"></i></button>
      </td>
    </tr>
  `;
}

function noticiasFiltradasAdmin() {
  const texto = document.getElementById("adminBusqueda").value.trim().toLowerCase();
  const categoria = document.getElementById("adminCategoria").value;
  const estado = document.getElementById("adminEstado").value;

  return todasAdmin.filter((n) => {
    if (categoria !== "Todas" && n.categoria !== categoria) return false;
    if (estado !== "Todos" && n.estado !== estado) return false;
    if (texto) {
      const campos = [n.titulo, n.autor, n.categoria, n.descripcion];
      if (!campos.some((c) => c?.toLowerCase().includes(texto))) return false;
    }
    return true;
  });
}

function renderizarTablaAdmin() {
  const filtradas = noticiasFiltradasAdmin();
  const cuerpo = document.getElementById("cuerpoTablaAdmin");
  const info = document.getElementById("adminResultadosInfo");

  if (!filtradas.length) {
    cuerpo.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--color-text-muted)">No hay noticias que coincidan con la búsqueda o los filtros.</td></tr>`;
  } else {
    cuerpo.innerHTML = filtradas.map(filaAdminHTML).join("");
  }
  info.textContent = `Mostrando ${filtradas.length} de ${todasAdmin.length} noticias administradas`;
}

async function recargarDatosAdmin() {
  todasAdmin = [...(await obtenerNoticias())].sort((a, b) => b.fecha.localeCompare(a.fecha));
  calcularStats(todasAdmin);
  renderizarTablaAdmin();
}

const ICONO_MENSAJE_ADMIN = {
  exito: "bi-check-circle-fill",
  error: "bi-exclamation-circle-fill",
};

function mostrarMensajeAdmin(texto, tipo) {
  const mensaje = document.getElementById("mensajeAdmin");
  mensaje.innerHTML = `<i class="bi ${ICONO_MENSAJE_ADMIN[tipo]}"></i> ${texto}`;
  mensaje.className = `mensaje-admin visible mensaje-admin--${tipo}`;
  mensaje.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => mensaje.classList.remove("visible"), 6000);
}

/* ---------- Eliminar (con confirmación) ---------- */

function abrirModalEliminar(id) {
  const noticia = todasAdmin.find((n) => n.id === Number(id));
  if (!noticia) return;
  idPendienteEliminar = noticia.id;
  document.getElementById("modalVistaPrevia").innerHTML = `
    <img src="${noticia.imagen}" alt="">
    <div>
      <strong style="display:block; font-size:var(--fs-sm)">${escaparHTML(noticia.titulo)}</strong>
      <span style="font-size:var(--fs-xs); color:var(--color-text-muted)">${noticia.estado === "publicada" ? "Publicada" : "Borrador"} · ${escaparHTML(noticia.autor)}</span>
    </div>
  `;
  document.getElementById("modalEliminar").classList.add("visible");
}

function cerrarModalEliminar() {
  document.getElementById("modalEliminar").classList.remove("visible");
  idPendienteEliminar = null;
}

async function confirmarEliminacion() {
  if (idPendienteEliminar === null) return;
  if (esNoticiaPersonalizada(idPendienteEliminar)) {
    eliminarNoticiaPersonalizada(idPendienteEliminar);
  } else {
    marcarNoticiaEliminada(idPendienteEliminar);
  }
  cerrarModalEliminar();
  await recargarDatosAdmin();
  mostrarMensajeAdmin("Noticia eliminada del portal correctamente.", "exito");
}

/* ---------- Crear noticia ---------- */

function limpiarErroresFormulario() {
  ["campoAdminTitulo", "campoAdminCategoria", "campoAdminDescripcion", "campoAdminContenido", "campoAdminAutor"].forEach((id) => {
    document.getElementById(id).classList.remove("con-error");
  });
}

function validarFormularioAdmin(datos) {
  let valido = true;
  const marcar = (id, condicionInvalida) => {
    document.getElementById(id).classList.toggle("con-error", condicionInvalida);
    if (condicionInvalida) valido = false;
  };

  marcar("campoAdminTitulo", datos.titulo.length < 10 || datos.titulo.length > 90);
  marcar("campoAdminCategoria", !datos.categoria);
  marcar("campoAdminDescripcion", datos.descripcion.length < 20 || datos.descripcion.length > 220);
  marcar("campoAdminContenido", datos.contenido.join(" ").trim().length < 40);
  marcar("campoAdminAutor", datos.autor.trim().length < 3);

  return valido;
}

async function manejarEnvioFormularioAdmin(evento) {
  evento.preventDefault();
  const estadoSeleccionado = evento.submitter?.dataset.estado || "borrador";

  const datos = {
    titulo: document.getElementById("adminTitulo").value.trim(),
    categoria: document.getElementById("adminNuevaCategoria").value,
    descripcion: document.getElementById("adminDescripcion").value.trim(),
    contenido: document.getElementById("adminContenido").value
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean),
    autor: document.getElementById("adminAutor").value.trim(),
    imagen: document.getElementById("adminImagen").value.trim(),
  };

  limpiarErroresFormulario();
  if (!validarFormularioAdmin(datos)) {
    mostrarMensajeAdmin("Revisa los campos marcados en rojo antes de continuar.", "error");
    return;
  }

  const palabras = datos.contenido.join(" ").split(/\s+/).filter(Boolean).length;

  const nuevaNoticia = {
    id: siguienteIdPersonalizado(),
    titulo: datos.titulo,
    slug: generarSlug(datos.titulo),
    categoria: datos.categoria,
    descripcion: datos.descripcion,
    contenido: datos.contenido,
    imagen: datos.imagen || IMAGEN_PLACEHOLDER,
    autor: datos.autor,
    fecha: new Date().toISOString().slice(0, 10),
    tiempoLectura: Math.max(1, Math.round(palabras / 200)),
    destacada: false,
    estado: estadoSeleccionado,
  };

  guardarNoticiaPersonalizada(nuevaNoticia);
  document.getElementById("formularioAdmin").reset();
  await recargarDatosAdmin();
  mostrarMensajeAdmin(
    estadoSeleccionado === "publicada"
      ? `Noticia publicada con éxito (ID #NW-${nuevaNoticia.id}). Ya es visible en el portal.`
      : `Noticia guardada como borrador (ID #NW-${nuevaNoticia.id}).`,
    "exito"
  );
}

/* ---------- Inicialización ---------- */

document.addEventListener("DOMContentLoaded", async () => {
  poblarSelectsCategoria();
  await recargarDatosAdmin();

  document.getElementById("adminBusqueda").addEventListener("input", renderizarTablaAdmin);
  document.getElementById("adminCategoria").addEventListener("change", renderizarTablaAdmin);
  document.getElementById("adminEstado").addEventListener("change", renderizarTablaAdmin);

  document.getElementById("cuerpoTablaAdmin").addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-eliminar-id]");
    if (boton) abrirModalEliminar(boton.dataset.eliminarId);
  });

  document.getElementById("botonCancelarEliminar").addEventListener("click", cerrarModalEliminar);
  document.getElementById("botonConfirmarEliminar").addEventListener("click", confirmarEliminacion);
  document.getElementById("modalEliminar").addEventListener("click", (evento) => {
    if (evento.target.id === "modalEliminar") cerrarModalEliminar();
  });

  document.getElementById("formularioAdmin").addEventListener("submit", manejarEnvioFormularioAdmin);
});

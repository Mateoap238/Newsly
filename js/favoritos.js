/*
  Newsly · Página Favoritos
  Lista las noticias guardadas en localStorage, permite filtrarlas por
  categoría, eliminarlas individualmente o vaciar toda la lista.
*/

let noticiasBaseFavoritos = [];
let categoriaActivaFavoritos = "Todas";

function noticiasFavoritas() {
  const idsFavoritos = obtenerFavoritos();
  return noticiasBaseFavoritos.filter((n) => idsFavoritos.includes(n.id));
}

function tarjetaFavoritoHTML(noticia) {
  return `
    <article class="tarjeta-noticia" data-id="${noticia.id}">
      <a class="tarjeta-noticia__imagen-link" href="detalle.html?id=${noticia.id}">
        <div class="tarjeta-noticia__imagen">
          <img src="${noticia.imagen}" alt="${escaparHTML(noticia.titulo)}" loading="lazy">
          <span class="badge badge--${claseCategoria(noticia.categoria)}">${noticia.categoria}</span>
        </div>
      </a>
      <button type="button" class="btn-favorito es-favorito" data-fav-id="${noticia.id}" aria-pressed="true" aria-label="Quitar de favoritos"><i class="bi bi-star-fill"></i></button>
      <div class="tarjeta-noticia__cuerpo">
        <p class="tarjeta-noticia__meta">
          <span><i class="bi bi-calendar3"></i> ${formatearFecha(noticia.fecha)}</span>
          <span><i class="bi bi-clock"></i> ${noticia.tiempoLectura} min de lectura</span>
        </p>
        <h3 class="tarjeta-noticia__titulo"><a href="detalle.html?id=${noticia.id}">${escaparHTML(noticia.titulo)}</a></h3>
        <p class="tarjeta-noticia__resumen">${escaparHTML(noticia.descripcion)}</p>
        <div class="tarjeta-noticia__pie">
          <a class="boton boton--primario" href="detalle.html?id=${noticia.id}">Ver noticia <i class="bi bi-arrow-right"></i></a>
          <button type="button" class="enlace-ver-mas" style="background:none;border:none" data-quitar-favorito="${noticia.id}"><i class="bi bi-bookmark-x"></i> Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

function renderizarChips() {
  const favoritas = noticiasFavoritas();
  const conteo = contarPorCategoria(favoritas);
  const contenedor = document.getElementById("chipsCategoriaFavoritos");

  const chips = [
    { categoria: "Todas", etiqueta: `Todas ${favoritas.length}` },
    ...CATEGORIAS.filter((c) => conteo[c] > 0).map((c) => ({ categoria: c, etiqueta: `${c} ${conteo[c]}` })),
  ];

  contenedor.innerHTML = chips.map(({ categoria, etiqueta }) => `
    <button type="button" class="chip ${categoria === categoriaActivaFavoritos ? "activo" : ""}" data-categoria="${categoria}">${etiqueta}</button>
  `).join("");

  contenedor.querySelectorAll(".chip").forEach((boton) => {
    boton.addEventListener("click", () => {
      categoriaActivaFavoritos = boton.dataset.categoria;
      renderizarTodo();
    });
  });
}

function renderizarTodo() {
  const favoritas = noticiasFavoritas();
  const visibles = categoriaActivaFavoritos === "Todas"
    ? favoritas
    : favoritas.filter((n) => n.categoria === categoriaActivaFavoritos);

  document.getElementById("totalFavoritos").textContent = favoritas.length;
  document.getElementById("totalFavoritosEtiqueta").textContent = favoritas.length === 1 ? "noticia" : "noticias";

  const minutos = favoritas.reduce((total, n) => total + (n.tiempoLectura || 0), 0);
  document.getElementById("tiempoEstimado").innerHTML = `<i class="bi bi-clock-history"></i> Tiempo estimado total: ${minutos} min`;

  const rejilla = document.getElementById("rejillaFavoritos");
  const estadoVacio = document.getElementById("estadoVacioFavoritos");
  const panelChips = document.querySelector(".chips-categoria");
  const botonLimpiar = document.getElementById("botonLimpiarLista");

  if (!favoritas.length) {
    rejilla.innerHTML = "";
    estadoVacio.hidden = false;
    panelChips.hidden = true;
    botonLimpiar.hidden = true;
    return;
  }

  estadoVacio.hidden = true;
  panelChips.hidden = false;
  botonLimpiar.hidden = false;
  rejilla.innerHTML = visibles.map(tarjetaFavoritoHTML).join("");
  renderizarChips();
}

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-quitar-favorito]");
  if (!boton) return;
  eliminarFavorito(boton.dataset.quitarFavorito);
  renderizarTodo();
});

document.getElementById("botonLimpiarLista")?.addEventListener("click", () => {
  const confirmado = window.confirm("¿Seguro que deseas eliminar todas las noticias de tu lista de favoritos? Esta acción no se puede deshacer.");
  if (!confirmado) return;
  limpiarFavoritos();
  categoriaActivaFavoritos = "Todas";
  renderizarTodo();
});

document.addEventListener("newsly:favoritos-cambiaron", () => {
  renderizarTodo();
});

document.addEventListener("DOMContentLoaded", async () => {
  noticiasBaseFavoritos = await obtenerNoticias();
  renderizarTodo();
});

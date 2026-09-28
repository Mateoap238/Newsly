/*
  Newsly · Página Noticias (listado general)
  Búsqueda por texto, filtro por categoría, ordenamiento y carga
  progresiva ("Cargar más") a partir del catálogo combinado.
*/

const TAMANO_PAGINA = 6;

let todasLasNoticias = [];
let noticiasFiltradas = [];
let paginaActual = 1;

const estado = {
  texto: "",
  categoria: "Todas",
  orden: "recientes",
};

function leerParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) estado.texto = params.get("q");
  if (params.get("categoria")) estado.categoria = params.get("categoria");
}

function construirChips() {
  const contenedor = document.getElementById("chipsCategoria");
  const conteo = contarPorCategoria(todasLasNoticias);
  const totalPublicadas = Object.values(conteo).reduce((a, b) => a + b, 0);

  const chips = [
    { categoria: "Todas", etiqueta: `Todas ${totalPublicadas}` },
    ...CATEGORIAS.map((c) => ({ categoria: c, etiqueta: `${c} ${conteo[c]}` })),
  ];

  contenedor.innerHTML = chips.map(({ categoria, etiqueta }) => `
    <button type="button" class="chip ${categoria === estado.categoria ? "activo" : ""}" data-categoria="${categoria}">${etiqueta}</button>
  `).join("");

  contenedor.querySelectorAll(".chip").forEach((boton) => {
    boton.addEventListener("click", () => {
      estado.categoria = boton.dataset.categoria;
      paginaActual = 1;
      aplicarFiltros();
    });
  });
}

function aplicarFiltros() {
  noticiasFiltradas = filtrarNoticias(todasLasNoticias, estado);
  document.querySelectorAll("#chipsCategoria .chip").forEach((chip) => {
    chip.classList.toggle("activo", chip.dataset.categoria === estado.categoria);
  });
  renderizarPagina();
}

function renderizarPagina() {
  const rejilla = document.getElementById("rejillaNoticias");
  const estadoVacio = document.getElementById("estadoVacio");
  const botonCargarMas = document.getElementById("botonCargarMas");
  const info = document.getElementById("resultadosInfo");

  if (!noticiasFiltradas.length) {
    rejilla.innerHTML = "";
    estadoVacio.hidden = false;
    botonCargarMas.hidden = true;
    info.textContent = "0 resultados";
    return;
  }

  estadoVacio.hidden = true;
  const visibles = noticiasFiltradas.slice(0, paginaActual * TAMANO_PAGINA);
  rejilla.innerHTML = visibles.map(tarjetaNoticiaHTML).join("");
  info.textContent = `Mostrando ${visibles.length} de ${noticiasFiltradas.length} noticias`;
  botonCargarMas.hidden = visibles.length >= noticiasFiltradas.length;
}

function inicializarControles() {
  const campoTexto = document.getElementById("filtroTexto");
  campoTexto.value = estado.texto;
  campoTexto.addEventListener("input", () => {
    estado.texto = campoTexto.value;
    paginaActual = 1;
    aplicarFiltros();
  });

  const campoOrden = document.getElementById("filtroOrden");
  campoOrden.addEventListener("change", () => {
    estado.orden = campoOrden.value;
    aplicarFiltros();
  });

  document.getElementById("botonCargarMas").addEventListener("click", () => {
    paginaActual += 1;
    renderizarPagina();
  });

  document.getElementById("botonRestablecer").addEventListener("click", () => {
    estado.texto = "";
    estado.categoria = "Todas";
    estado.orden = "recientes";
    campoTexto.value = "";
    campoOrden.value = "recientes";
    paginaActual = 1;
    aplicarFiltros();
  });

  document.addEventListener("newsly:favoritos-cambiaron", () => {
    document.querySelectorAll("#rejillaNoticias [data-fav-id]").forEach((boton) => {
      const id = boton.dataset.favId;
      boton.classList.toggle("es-favorito", esFavorito(id));
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  leerParametrosURL();
  todasLasNoticias = await obtenerNoticias();

  const conteo = contarPorCategoria(todasLasNoticias);
  document.getElementById("statPublicaciones").textContent = Object.values(conteo).reduce((a, b) => a + b, 0);
  document.getElementById("statEspecialidades").textContent = CATEGORIAS.length;

  construirChips();
  inicializarControles();
  aplicarFiltros();
});

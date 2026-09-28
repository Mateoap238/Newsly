/*
  Newsly · Página Inicio
  Genera dinámicamente el hero principal, las categorías destacadas,
  las noticias destacadas y el resumen de últimas noticias.
*/

const ICONO_CATEGORIA = {
  "Tecnología": "💻",
  "Educación": "🎓",
  "Turismo": "🧭",
  "Negocios": "📈",
};

const DESCRIPCION_CATEGORIA = {
  "Tecnología": "Inteligencia artificial, computación cuántica y ciberdefensa.",
  "Educación": "Innovación pedagógica, investigación y campus inteligentes.",
  "Turismo": "Ecoturismo, patrimonio natural y hospitalidad sostenible.",
  "Negocios": "Economía circular, finanzas corporativas y mercados limpios.",
};

function botonFavoritoGrande(noticia) {
  const activo = esFavorito(noticia.id);
  return `
    <button type="button" class="boton boton--fantasma btn-favorito-grande" data-fav-id="${noticia.id}" aria-pressed="${activo}">
      <span class="btn-favorito-grande__icono">${activo ? "★" : "☆"}</span>
      <span class="btn-favorito-grande__texto">${activo ? "Guardado en favoritos" : "Guardar en favoritos"}</span>
    </button>
  `;
}

function actualizarBotonGrande(boton, favorito) {
  boton.querySelector(".btn-favorito-grande__icono").textContent = favorito ? "★" : "☆";
  boton.querySelector(".btn-favorito-grande__texto").textContent = favorito ? "Guardado en favoritos" : "Guardar en favoritos";
}

function renderHero(hero) {
  const contenedor = document.getElementById("heroPrincipal");
  const tituloTicker = document.getElementById("ultimaHoraTitulo");
  if (!hero) {
    contenedor.innerHTML = `<div class="estado-mensaje"><p>Todavía no hay noticias publicadas.</p></div>`;
    return;
  }
  tituloTicker.textContent = hero.titulo;
  contenedor.innerHTML = `
    <figure class="hero-principal__imagen">
      <img src="${hero.imagen}" alt="${escaparHTML(hero.titulo)}">
      <figcaption>
        <span>${hero.categoria}</span>
        <span>Actualizado · ${formatearFecha(hero.fecha)}</span>
      </figcaption>
    </figure>
    <div class="hero-principal__contenido">
      <span class="eyebrow">${hero.categoria} · Tendencia N°1</span>
      <h1>${escaparHTML(hero.titulo)}</h1>
      <p>${escaparHTML(hero.descripcion)}</p>
      <div class="hero-principal__meta">
        <span class="avatar-iniciales">${iniciales(hero.autor)}</span>
        <span>Por ${escaparHTML(hero.autor)} · ${hero.tiempoLectura} min de lectura</span>
      </div>
      <div class="hero-principal__acciones">
        <a class="boton boton--primario" href="detalle.html?id=${hero.id}">Leer noticia completa</a>
        ${botonFavoritoGrande(hero)}
      </div>
    </div>
  `;
}

function renderCategorias(noticias) {
  const conteo = contarPorCategoria(noticias);
  const contenedor = document.getElementById("categoriasGrid");
  contenedor.innerHTML = CATEGORIAS.map((categoria) => `
    <a class="categoria-tarjeta" href="noticias.html?categoria=${encodeURIComponent(categoria)}">
      <span class="categoria-tarjeta__conteo">${conteo[categoria]} artículos</span>
      <span class="categoria-tarjeta__icono">${ICONO_CATEGORIA[categoria]}</span>
      <h3>${categoria}</h3>
      <p>${DESCRIPCION_CATEGORIA[categoria]}</p>
    </a>
  `).join("");
}

function renderDestacadas(noticias) {
  const contenedor = document.getElementById("destacadasGrid");
  if (!noticias.length) {
    contenedor.innerHTML = `<div class="estado-mensaje"><p>No hay más noticias destacadas por ahora.</p></div>`;
    return;
  }
  contenedor.innerHTML = noticias.map(tarjetaNoticiaHTML).join("");
}

function renderUltimas(noticias) {
  const principal = noticias[0];
  const resto = noticias.slice(1, 4);

  const contenedorPrincipal = document.getElementById("noticiaPrincipalLista");
  if (principal) {
    contenedorPrincipal.innerHTML = `
      <span class="eyebrow">${principal.categoria} · Publicado ${formatearFecha(principal.fecha)}</span>
      <h3>${escaparHTML(principal.titulo)}</h3>
      <p>${escaparHTML(principal.descripcion)}</p>
      <a class="enlace-ver-mas" href="detalle.html?id=${principal.id}">Leer análisis completo →</a>
    `;
  } else {
    contenedorPrincipal.innerHTML = `<p>No hay noticias recientes.</p>`;
  }

  const contenedorLista = document.getElementById("listaBreve");
  if (!resto.length) {
    contenedorLista.innerHTML = `<p>No hay más noticias por mostrar.</p>`;
    return;
  }
  contenedorLista.innerHTML = resto.map((n) => `
    <a class="lista-breve__item" href="detalle.html?id=${n.id}">
      <span class="lista-breve__hora">${formatearFecha(n.fecha)}</span>
      <span>
        <span class="lista-breve__categoria">${n.categoria}</span>
        <p class="lista-breve__titulo">${escaparHTML(n.titulo)}</p>
      </span>
    </a>
  `).join("");
}

document.addEventListener("newsly:favoritos-cambiaron", (evento) => {
  document.querySelectorAll(`.btn-favorito-grande[data-fav-id="${evento.detail.id}"]`).forEach((boton) => {
    actualizarBotonGrande(boton, evento.detail.favorito);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const todas = await obtenerNoticias();
  const publicas = todas.filter((n) => n.estado !== "borrador");
  const destacadas = publicas.filter((n) => n.destacada);

  const hero = destacadas.find((n) => n.categoria === "Tecnología") || destacadas[0] || publicas[0];
  renderHero(hero);

  const otrasDestacadas = destacadas.filter((n) => n.id !== hero?.id).slice(0, 3);
  renderDestacadas(otrasDestacadas);

  renderCategorias(publicas);

  const restantes = [...publicas]
    .filter((n) => n.id !== hero?.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  renderUltimas(restantes);
});

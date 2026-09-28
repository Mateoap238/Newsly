/*
  Newsly · Página Detalle de noticia
  Lee el identificador desde la URL (?id=), renderiza el artículo
  completo, gestiona favoritos y muestra noticias relacionadas.
*/

function idDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderizarError() {
  document.getElementById("migas").innerHTML = `<a href="index.html">Inicio</a> / <a href="noticias.html">Noticias</a>`;
  document.getElementById("contenidoDetalle").innerHTML = `
    <div class="estado-mensaje">
      <div class="estado-mensaje__icono"><i class="bi bi-question-circle"></i></div>
      <h1>No encontramos esta noticia</h1>
      <p>Es posible que el enlace sea incorrecto o que la noticia haya sido eliminada del catálogo.</p>
      <a class="boton boton--primario" href="noticias.html">Volver al listado de noticias</a>
    </div>
  `;
}

function renderizarArticulo(noticia) {
  document.getElementById("tituloPagina").textContent = `${noticia.titulo} · Newsly`;

  document.getElementById("migas").innerHTML = `
    <a href="index.html">Inicio</a> / <a href="noticias.html">Noticias</a> / <a href="noticias.html?categoria=${encodeURIComponent(noticia.categoria)}">${noticia.categoria}</a>
  `;

  const favorito = esFavorito(noticia.id);

  document.getElementById("contenidoDetalle").innerHTML = `
    <article class="articulo">
      <div class="articulo__badges">
        <span class="badge badge--${claseCategoria(noticia.categoria)}">${noticia.categoria}</span>
      </div>
      <h1 class="articulo__titulo">${escaparHTML(noticia.titulo)}</h1>
      <p class="articulo__resumen">${escaparHTML(noticia.descripcion)}</p>

      <div class="articulo__meta">
        <div class="articulo__autor">
          <span class="avatar-iniciales">${iniciales(noticia.autor)}</span>
          <div class="articulo__autor-info">
            <strong>${escaparHTML(noticia.autor)}</strong>
            <span>${formatearFecha(noticia.fecha)} · ${noticia.tiempoLectura} min de lectura</span>
          </div>
        </div>
        <div class="articulo__acciones">
          <button type="button" class="boton boton--fantasma btn-favorito-grande" data-fav-id="${noticia.id}" aria-pressed="${favorito}">
            <i class="btn-favorito-grande__icono ${favorito ? "bi bi-star-fill" : "bi bi-star"}"></i>
            <span class="btn-favorito-grande__texto">${favorito ? "Guardado" : "Guardar"}</span>
          </button>
        </div>
      </div>

      <figure class="articulo__imagen">
        <img src="${noticia.imagen}" alt="${escaparHTML(noticia.titulo)}">
      </figure>

      <div class="articulo__cuerpo">
        ${noticia.contenido.map((parrafo) => `<p>${escaparHTML(parrafo)}</p>`).join("")}
      </div>

      <div class="cta-tarjeta" style="margin-top:2rem">
        <h3>¿Tienes una opinión o pista sobre este reportaje?</h3>
        <p>Escribe a la redacción o contacta directamente a nuestros analistas.</p>
        <a class="boton boton--primario" href="contacto.html">Escribir a redacción</a>
      </div>

      <a class="articulo__volver" href="noticias.html">← Volver al listado de noticias</a>
    </article>
  `;
}

async function renderizarRelacionadas(noticia, todas) {
  const relacionadas = todas
    .filter((n) => n.id !== noticia.id && n.categoria === noticia.categoria && n.estado !== "borrador")
    .slice(0, 3);

  const seccion = document.getElementById("seccionRelacionadas");
  if (!relacionadas.length) {
    seccion.hidden = true;
    return;
  }
  seccion.hidden = false;
  document.getElementById("rejillaRelacionadas").innerHTML = relacionadas.map(tarjetaNoticiaHTML).join("");
}

document.addEventListener("newsly:favoritos-cambiaron", (evento) => {
  document.querySelectorAll(`.articulo .btn-favorito-grande[data-fav-id="${evento.detail.id}"]`).forEach((boton) => {
    boton.querySelector(".btn-favorito-grande__icono").className = `btn-favorito-grande__icono bi ${evento.detail.favorito ? "bi-star-fill" : "bi-star"}`;
    boton.querySelector(".btn-favorito-grande__texto").textContent = evento.detail.favorito ? "Guardado" : "Guardar";
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const id = idDesdeURL();
  const todas = await obtenerNoticias();
  const noticia = id ? todas.find((n) => n.id === Number(id)) : null;

  if (!noticia) {
    renderizarError();
    return;
  }

  renderizarArticulo(noticia);
  renderizarRelacionadas(noticia, todas);
});

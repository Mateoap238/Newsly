/*
  Newsly · Comportamiento compartido entre todas las páginas
  Inyecta header/footer, resalta la navegación activa, controla el menú
  móvil, el buscador de cabecera, el newsletter y el botón de favoritos.
*/

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function inyectarParcial(selectorDestino, rutaParcial) {
  const destino = document.querySelector(selectorDestino);
  if (!destino) return;
  try {
    const respuesta = await fetch(rutaParcial);
    destino.innerHTML = await respuesta.text();
  } catch (error) {
    console.error(`Newsly: no se pudo cargar ${rutaParcial}. ¿Hay un servidor local activo?`, error);
  }
}

function marcarNavegacionActiva() {
  const paginaActual = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((enlace) => {
    if (enlace.dataset.nav === paginaActual) {
      enlace.classList.add("activo");
      enlace.setAttribute("aria-current", "page");
    }
  });
}

function inicializarMenuMovil() {
  const boton = document.getElementById("botonMenuMovil");
  const nav = document.getElementById("navegacionPrincipal");
  if (!boton || !nav) return;
  boton.addEventListener("click", () => {
    const abierto = nav.classList.toggle("navegacion--abierta");
    boton.setAttribute("aria-expanded", String(abierto));
  });
  nav.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      nav.classList.remove("navegacion--abierta");
      boton.setAttribute("aria-expanded", "false");
    });
  });
}

function inicializarBuscadorCabecera() {
  const formulario = document.getElementById("buscadorCabecera");
  if (!formulario) return;

  const params = new URLSearchParams(window.location.search);
  const qActual = params.get("q");
  if (qActual) formulario.querySelector('input[name="q"]').value = qActual;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const texto = formulario.querySelector('input[name="q"]').value.trim();
    const destino = new URL("noticias.html", window.location.href);
    if (texto) destino.searchParams.set("q", texto);
    window.location.href = destino.toString();
  });
}

function inicializarFormulariosNewsletter() {
  document.querySelectorAll(".formulario-newsletter").forEach((formulario) => {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const input = formulario.querySelector('input[type="email"]');
      const mensaje = formulario.querySelector(".formulario-newsletter__mensaje");
      if (!REGEX_EMAIL.test(input.value.trim())) {
        mensaje.textContent = "Ingresa un correo electrónico válido.";
        mensaje.classList.add("formulario-newsletter__mensaje--error");
        return;
      }
      mensaje.textContent = "¡Listo! Te suscribiste al newsletter semanal.";
      mensaje.classList.remove("formulario-newsletter__mensaje--error");
      formulario.reset();
    });
  });
}

/**
 * Delega los clics de cualquier botón [data-fav-id] presente en la página
 * (tarjetas generadas dinámicamente incluidas) y sincroniza su estado visual.
 */
function inicializarBotonesFavoritos() {
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-fav-id]");
    if (!boton) return;
    const id = boton.dataset.favId;
    const esFavoritoAhora = alternarFavorito(id);
    actualizarBotonesFavorito(id, esFavoritoAhora);
    document.dispatchEvent(new CustomEvent("newsly:favoritos-cambiaron", { detail: { id: Number(id), favorito: esFavoritoAhora } }));
  });
}

function actualizarBotonesFavorito(id, favorito) {
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach((boton) => {
    boton.classList.toggle("es-favorito", favorito);
    boton.setAttribute("aria-pressed", String(favorito));
    boton.setAttribute("aria-label", favorito ? "Quitar de favoritos" : "Guardar en favoritos");
  });
}

async function inicializarLayoutComun() {
  await Promise.all([
    inyectarParcial("#site-header", "partials/header.html"),
    inyectarParcial("#site-footer", "partials/footer.html"),
  ]);
  marcarNavegacionActiva();
  inicializarMenuMovil();
  inicializarBuscadorCabecera();
  inicializarFormulariosNewsletter();
  document.dispatchEvent(new Event("newsly:layout-listo"));
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarLayoutComun();
  inicializarBotonesFavoritos();
});

/*
  Newsly · Formulario de Contacto
  Validación en el navegador. No se envían datos a ningún servidor:
  el envío se simula localmente, tal como exige el alcance de esta entrega.
*/

const REGEX_EMAIL_CONTACTO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function marcarError(idCampo, tieneError) {
  document.getElementById(idCampo).classList.toggle("con-error", tieneError);
}

function validarFormularioContacto(datos) {
  let valido = true;

  if (datos.nombre.trim().length < 3) {
    marcarError("campoNombre", true);
    valido = false;
  } else {
    marcarError("campoNombre", false);
  }

  if (!REGEX_EMAIL_CONTACTO.test(datos.correo.trim())) {
    marcarError("campoCorreo", true);
    valido = false;
  } else {
    marcarError("campoCorreo", false);
  }

  if (!datos.asunto) {
    marcarError("campoAsunto", true);
    valido = false;
  } else {
    marcarError("campoAsunto", false);
  }

  if (datos.mensaje.trim().length < 20) {
    marcarError("campoMensaje", true);
    valido = false;
  } else {
    marcarError("campoMensaje", false);
  }

  const errorPolitica = document.getElementById("errorPolitica");
  if (!datos.aceptaPolitica) {
    errorPolitica.style.display = "block";
    valido = false;
  } else {
    errorPolitica.style.display = "none";
  }

  return valido;
}

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formularioContacto");
  const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const datos = {
      nombre: formulario.nombre.value,
      correo: formulario.correo.value,
      asunto: formulario.asunto.value,
      mensaje: formulario.mensaje.value,
      aceptaPolitica: formulario.aceptaPolitica.checked,
    };

    const esValido = validarFormularioContacto(datos);

    if (!esValido) {
      mensajeConfirmacion.classList.remove("visible");
      formulario.querySelector(".con-error input, .con-error select, .con-error textarea")?.focus();
      return;
    }

    mensajeConfirmacion.classList.add("visible");
    formulario.reset();
    mensajeConfirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  ["nombre", "correo", "asunto", "mensaje"].forEach((campo) => {
    formulario[campo].addEventListener("input", () => {
      if (formulario[campo].closest(".campo").classList.contains("con-error")) {
        validarFormularioContacto({
          nombre: formulario.nombre.value,
          correo: formulario.correo.value,
          asunto: formulario.asunto.value,
          mensaje: formulario.mensaje.value,
          aceptaPolitica: formulario.aceptaPolitica.checked,
        });
      }
    });
  });
});

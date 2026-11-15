// =========================================
// 1. ESPACIOS PARA ICONOS
// Si una imagen no existe todavía, se muestra un recuadro punteado
// con el nombre del archivo esperado.
// =========================================
document.querySelectorAll(".icono-slot img").forEach((img) => {
  const slot = img.parentElement;
  slot.dataset.archivo = img.getAttribute("src").split("/").pop();
  slot.title = "Falta la imagen: " + img.getAttribute("src");

  const marcarVacio = () => slot.classList.add("vacio");
  if (img.complete && img.naturalWidth === 0) marcarVacio();
  img.addEventListener("error", marcarVacio);
  img.addEventListener("load", () => {
    slot.classList.remove("vacio");
    slot.removeAttribute("title");
  });
});

// =========================================
// 2. MENÚ DEL PERFIL
// =========================================
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");

function toggleMenu(abrir) {
  profileMenu.hidden = !abrir;
  profileBtn.setAttribute("aria-expanded", String(abrir));
}

profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(profileMenu.hidden);
});

document.addEventListener("click", (e) => {
  if (!profileMenu.hidden && !profileMenu.contains(e.target)) toggleMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !profileMenu.hidden) {
    toggleMenu(false);
    profileBtn.focus();
  }
});

// =========================================
// 3. AVISO BREVE (toast)
// =========================================
const toast = document.getElementById("toast");
let temporizadorToast;

function avisar(texto) {
  toast.textContent = texto;
  toast.hidden = false;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => (toast.hidden = true), 2600);
}

// =========================================
// 4. DISPONIBILIDAD
// =========================================
const disponible = document.getElementById("disponible");
const disponibleTexto = document.getElementById("disponibleTexto");

disponible.addEventListener("change", () => {
  disponibleTexto.textContent = disponible.checked ? "Disponible" : "No disponible";
  avisar(disponible.checked
    ? "Ahora recibirás solicitudes nuevas."
    : "No recibirás solicitudes hasta que vuelvas a activarte.");
});

// =========================================
// 5. SOLICITUDES: ACEPTAR O CONTRAOFERTAR
// =========================================
const numNuevas = document.getElementById("numNuevas");
const tagNuevas = document.getElementById("tagNuevas");
const sinSolicitudes = document.getElementById("sinSolicitudes");

function actualizarContador() {
  const pendientes = document.querySelectorAll(".solicitud:not(.respondida)").length;
  numNuevas.textContent = pendientes;
  tagNuevas.textContent = pendientes === 1 ? "1 nueva" : `${pendientes} nuevas`;
  tagNuevas.hidden = pendientes === 0;
  sinSolicitudes.hidden = pendientes > 0 || document.querySelectorAll(".solicitud").length > 0;
}

function marcarRespondida(tarjeta, mensaje) {
  tarjeta.classList.add("respondida");
  const acciones = tarjeta.querySelector(".solicitud-acciones");
  const estado = document.createElement("p");
  estado.className = "estado-aceptada";
  estado.textContent = mensaje;
  acciones.replaceWith(estado);
  actualizarContador();
}

document.querySelectorAll(".solicitud").forEach((tarjeta, indice) => {
  const acciones = tarjeta.querySelector(".solicitud-acciones");
  const monto = tarjeta.querySelector(".precio-monto").textContent;

  // Aceptar el precio ofrecido por el cliente
  tarjeta.querySelector(".btn-aceptar").addEventListener("click", () => {
    tarjeta.classList.add("aceptada");
    marcarRespondida(tarjeta, `✓ Aceptaste ${monto}. Te avisaremos cuando el cliente confirme.`);
    avisar("Solicitud aceptada.");
  });

  // Contraofertar: aparece un campo para escribir el nuevo monto
  tarjeta.querySelector(".btn-contraoferta").addEventListener("click", () => {
    const form = document.createElement("form");
    form.className = "solicitud-acciones";
    form.noValidate = true;
    form.innerHTML = `
      <label class="sr-only" for="monto-${indice}">Tu precio en soles</label>
      <input class="input-monto" id="monto-${indice}" type="number" min="1" step="1" inputmode="numeric" placeholder="Tu precio (S/)">
      <button type="submit" class="btn-sm btn-aceptar">Enviar</button>
    `;
    acciones.replaceWith(form);

    const input = form.querySelector("input");
    input.focus();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const valor = Number(input.value);
      if (!input.value || valor <= 0) {
        input.classList.add("invalido");
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      tarjeta.classList.add("aceptada");
      form.replaceWith(acciones); // para que marcarRespondida encuentre el bloque
      marcarRespondida(tarjeta, `Contraoferta enviada: S/ ${valor}. Esperando respuesta del cliente.`);
      avisar("Contraoferta enviada.");
    });

    input.addEventListener("input", () => {
      input.classList.remove("invalido");
      input.removeAttribute("aria-invalid");
    });
  });
});

actualizarContador();

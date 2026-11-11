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
// 3. OPCIONES DE FECHA Y HORA
// Fechas: los próximos 30 días desde mañana.
// Horas: de 8:00 a. m. a 6:00 p. m.
// =========================================
const selectFecha = document.getElementById("fecha");
const selectHora = document.getElementById("hora");

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function agregarOpcion(select, valor, texto) {
  const opcion = document.createElement("option");
  opcion.value = valor;
  opcion.textContent = texto;
  select.appendChild(opcion);
}

agregarOpcion(selectFecha, "", "Selecciona una fecha");
for (let i = 1; i <= 30; i++) {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const texto = `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  agregarOpcion(selectFecha, valor, texto);
}

agregarOpcion(selectHora, "", "Selecciona una hora");
for (let h = 8; h <= 18; h++) {
  const hora12 = h > 12 ? h - 12 : h;
  const sufijo = h < 12 ? "a. m." : "p. m.";
  agregarOpcion(selectHora, `${String(h).padStart(2, "0")}:00`, `${hora12}:00 ${sufijo}`);
}

// Valores por defecto: mañana a las 10:00 a. m.
selectFecha.selectedIndex = 1;
selectHora.value = "10:00";

// =========================================
// 4. DIRECCIÓN: BOTÓN PARA BORRAR
// =========================================
const inputDireccion = document.getElementById("direccion");
const btnLimpiar = document.getElementById("btnLimpiar");

function actualizarBotonLimpiar() {
  btnLimpiar.hidden = inputDireccion.value.length === 0;
}

btnLimpiar.addEventListener("click", () => {
  inputDireccion.value = "";
  actualizarBotonLimpiar();
  inputDireccion.focus();
});

inputDireccion.addEventListener("input", () => {
  actualizarBotonLimpiar();
  limpiarError(inputDireccion, "errorDireccion");
});

actualizarBotonLimpiar();

// =========================================
// 5. VALIDACIÓN Y BOTÓN SIGUIENTE
// =========================================
function mostrarError(campo, idError, texto) {
  campo.closest(".field").classList.add("invalido");
  campo.setAttribute("aria-invalid", "true");
  document.getElementById(idError).textContent = texto;
}

function limpiarError(campo, idError) {
  campo.closest(".field").classList.remove("invalido");
  campo.removeAttribute("aria-invalid");
  document.getElementById(idError).textContent = "";
}

selectFecha.addEventListener("change", () => limpiarError(selectFecha, "errorFecha"));
selectHora.addEventListener("change", () => limpiarError(selectHora, "errorHora"));

document.getElementById("formFecha").addEventListener("submit", (e) => {
  e.preventDefault();
  let primerError = null;

  const direccion = inputDireccion.value.trim();
  if (direccion === "") {
    mostrarError(inputDireccion, "errorDireccion", "Ingresa la dirección del servicio.");
    primerError = primerError || inputDireccion;
  } else if (direccion.length < 5) {
    mostrarError(inputDireccion, "errorDireccion", "La dirección es muy corta.");
    primerError = primerError || inputDireccion;
  }

  if (!selectFecha.value) {
    mostrarError(selectFecha, "errorFecha", "Selecciona la fecha del servicio.");
    primerError = primerError || selectFecha;
  }

  if (!selectHora.value) {
    mostrarError(selectHora, "errorHora", "Selecciona la hora del servicio.");
    primerError = primerError || selectHora;
  }

  if (primerError) {
    primerError.focus();
    return;
  }

  const datos = {
    direccion,
    fecha: selectFecha.value,
    fechaTexto: selectFecha.options[selectFecha.selectedIndex].text,
    hora: selectHora.value,
    horaTexto: selectHora.options[selectHora.selectedIndex].text,
    referencia: document.getElementById("referencia").value.trim(),
  };

  try {
    localStorage.setItem("casalista-fecha-ubicacion", JSON.stringify(datos));
  } catch (err) {
    // Si el navegador bloquea el almacenamiento, se continúa igual
  }

  window.location.href = "Negociacion.html";
});

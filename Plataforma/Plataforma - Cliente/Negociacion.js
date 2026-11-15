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
// 3. PRECIO QUE OFRECES (botones - y +)
// Sube o baja de 10 en 10, sin salir de los límites.
// =========================================
const PRECIO_RECOMENDADO = 180;
const PASO = 10;
const MINIMO = 20;
const MAXIMO = 2000;
const TEXTO_AYUDA = "Puedes subir o bajar este monto según tu preferencia.";

const btnMenos = document.getElementById("btnMenos");
const btnMas = document.getElementById("btnMas");
const ofertaMonto = document.getElementById("ofertaMonto");
const ofertaResumen = document.getElementById("ofertaResumen");
const ofertaAyuda = document.getElementById("ofertaAyuda");

let precio = PRECIO_RECOMENDADO;

function mostrarPrecio() {
  ofertaMonto.textContent = `S/ ${precio}`;
  ofertaResumen.textContent = `S/ ${precio}`;
  btnMenos.disabled = precio <= MINIMO;
  btnMas.disabled = precio >= MAXIMO;

  if (precio <= MINIMO) {
    ofertaAyuda.textContent = `El monto mínimo es S/ ${MINIMO}.`;
  } else if (precio >= MAXIMO) {
    ofertaAyuda.textContent = `El monto máximo es S/ ${MAXIMO}.`;
  } else {
    ofertaAyuda.textContent = TEXTO_AYUDA;
  }
  ofertaAyuda.classList.toggle("aviso-limite", precio <= MINIMO || precio >= MAXIMO);
}

btnMenos.addEventListener("click", () => {
  precio = Math.max(MINIMO, precio - PASO);
  mostrarPrecio();
});

btnMas.addEventListener("click", () => {
  precio = Math.min(MAXIMO, precio + PASO);
  mostrarPrecio();
});

mostrarPrecio();

// =========================================
// 4. VALIDACIÓN Y ENVÍO
// Debe haber un precio válido y un método de pago elegido.
// =========================================
const form = document.getElementById("formNegociacion");
const metodos = document.querySelector(".metodos");
const errorPago = document.getElementById("errorPago");

metodos.addEventListener("change", () => {
  metodos.classList.remove("invalido");
  errorPago.textContent = "";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const pago = form.querySelector('input[name="pago"]:checked');
  if (!pago) {
    metodos.classList.add("invalido");
    errorPago.textContent = "Elige un método de pago.";
    form.querySelector('input[name="pago"]').focus();
    return;
  }

  if (!Number.isFinite(precio) || precio < MINIMO || precio > MAXIMO) {
    ofertaAyuda.classList.add("aviso-limite");
    return;
  }

  try {
    localStorage.setItem("casalista-negociacion", JSON.stringify({
      precio,
      metodoPago: pago.value,
    }));
  } catch (err) {
    // Si el navegador bloquea el almacenamiento, se continúa igual
  }

  window.location.href = "SolicitudPublicada.html";
});

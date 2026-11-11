// =========================================
// 1. ESPACIOS PARA ICONOS
// Si una imagen no existe todavía, se marca su contenedor como .vacio
// y se muestra un recuadro punteado con el nombre del archivo esperado.
// =========================================
document.querySelectorAll(".icono-slot img").forEach((img) => {
  const slot = img.parentElement;
  const archivo = img.getAttribute("src").split("/").pop();
  slot.dataset.archivo = archivo;
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
// 3. SELECCIÓN DE CATEGORÍA Y TIPO
// =========================================
const categoryCards = document.querySelectorAll(".category-card");
const typeGroups = document.querySelectorAll(".type-grid");

function marcar(card, grupo) {
  grupo.forEach((c) => {
    c.classList.remove("selected");
    c.setAttribute("aria-pressed", "false");
  });
  card.classList.add("selected");
  card.setAttribute("aria-pressed", "true");
}

function seleccionarCategoria(card) {
  marcar(card, categoryCards);
  const categoria = card.dataset.categoria;

  typeGroups.forEach((grupo) => {
    grupo.hidden = grupo.dataset.grupo !== categoria;
  });

  // Al cambiar de categoría se preselecciona el primer tipo visible
  const grupoActivo = document.querySelector(`.type-grid[data-grupo="${categoria}"]`);
  const tarjetas = grupoActivo.querySelectorAll(".type-card");
  const yaSeleccionada = grupoActivo.querySelector(".type-card.selected:not([hidden])");
  const primera = Array.from(tarjetas).find((t) => !t.hidden);
  if (!yaSeleccionada && primera) marcar(primera, tarjetas);
}

categoryCards.forEach((card) => {
  card.addEventListener("click", () => seleccionarCategoria(card));
});

typeGroups.forEach((grupo) => {
  const tarjetas = grupo.querySelectorAll(".type-card");
  tarjetas.forEach((card) => {
    card.addEventListener("click", () => marcar(card, tarjetas));
  });
});

// Estado inicial: Limpieza → Limpieza general
seleccionarCategoria(categoryCards[0]);

// =========================================
// 4. BUSCADOR
// Filtra categorías (por nombre o por sus tipos) y los tipos visibles.
// =========================================
const buscador = document.getElementById("buscador");
const sinResultados = document.getElementById("sinResultados");

const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

buscador.addEventListener("input", () => {
  const q = normalizar(buscador.value);
  let primeraVisible = null;

  categoryCards.forEach((card) => {
    const categoria = card.dataset.categoria;
    const grupo = document.querySelector(`.type-grid[data-grupo="${categoria}"]`);
    const coincideCategoria = normalizar(card.textContent).includes(q);
    let algunTipo = false;

    grupo.querySelectorAll(".type-card").forEach((tipo) => {
      const coincide = !q || coincideCategoria || normalizar(tipo.textContent).includes(q);
      tipo.hidden = !coincide;
      if (coincide) algunTipo = true;
    });

    card.hidden = !(coincideCategoria || algunTipo);
    if (!card.hidden && !primeraVisible) primeraVisible = card;
  });

  sinResultados.hidden = Boolean(primeraVisible);

  const actual = document.querySelector(".category-card.selected");
  if (primeraVisible && (!actual || actual.hidden)) {
    seleccionarCategoria(primeraVisible);
  } else if (actual) {
    // Si el tipo seleccionado quedó oculto, elegir el primer tipo visible
    const grupo = document.querySelector(`.type-grid[data-grupo="${actual.dataset.categoria}"]`);
    const sel = grupo.querySelector(".type-card.selected");
    if (sel && sel.hidden) {
      const primera = Array.from(grupo.querySelectorAll(".type-card")).find((t) => !t.hidden);
      if (primera) marcar(primera, grupo.querySelectorAll(".type-card"));
    }
  }
});

// =========================================
// 5. BOTÓN SIGUIENTE
// Guarda la selección para el paso 2 (Detalles).
// =========================================
document.getElementById("btnSiguiente").addEventListener("click", () => {
  const categoria = document.querySelector(".category-card.selected");
  const tipo = document.querySelector(".type-grid:not([hidden]) .type-card.selected");
  if (!categoria || !tipo) return;

  const seleccion = {
    categoria: categoria.querySelector(".category-title").textContent.trim(),
    tipo: tipo.querySelector(".type-title").textContent.trim(),
  };

  try {
    localStorage.setItem("casalista-servicio", JSON.stringify(seleccion));
  } catch (e) {
    // Si el navegador bloquea el almacenamiento, se continúa igual
  }

  window.location.href = "Detalles.html";
});

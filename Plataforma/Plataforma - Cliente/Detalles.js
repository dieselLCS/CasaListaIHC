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
// 3. DESCRIPCIÓN: CONTADOR DE CARACTERES
// =========================================
const descripcion = document.getElementById("descripcion");
const contador = document.getElementById("contador");
const errorDescripcion = document.getElementById("errorDescripcion");
const MAX_CARACTERES = 500;
const MIN_CARACTERES = 10;

function actualizarContador() {
  const largo = descripcion.value.length;
  contador.textContent = `${largo}/${MAX_CARACTERES}`;
  contador.classList.toggle("limite", largo >= MAX_CARACTERES);
}

descripcion.addEventListener("input", () => {
  actualizarContador();
  descripcion.parentElement.classList.remove("invalido");
  descripcion.removeAttribute("aria-invalid");
  errorDescripcion.textContent = "";
});

// =========================================
// 4. FOTOS DE REFERENCIA
// Máximo 5 fotos, solo JPG o PNG, hasta 10 MB cada una.
// =========================================
const inputFotos = document.getElementById("fotos");
const zonaFotos = document.getElementById("zonaFotos");
const listaFotos = document.getElementById("listaFotos");
const errorFotos = document.getElementById("errorFotos");
const MAX_FOTOS = 5;
const MAX_MB = 10;
const TIPOS_VALIDOS = ["image/jpeg", "image/png"];

let fotos = []; // { archivo, url }

function mostrarErrorFotos(texto) {
  errorFotos.textContent = texto;
  zonaFotos.classList.toggle("invalido", Boolean(texto));
}

function dibujarFotos() {
  listaFotos.innerHTML = "";

  fotos.forEach((foto, indice) => {
    const item = document.createElement("li");
    item.className = "foto-item";

    const img = document.createElement("img");
    img.src = foto.url;
    img.alt = `Foto ${indice + 1}: ${foto.archivo.name}`;

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "foto-quitar";
    quitar.textContent = "×";
    quitar.setAttribute("aria-label", `Quitar foto ${indice + 1}`);
    quitar.addEventListener("click", () => {
      URL.revokeObjectURL(foto.url);
      fotos.splice(indice, 1);
      mostrarErrorFotos("");
      dibujarFotos();
      inputFotos.focus();
    });

    item.append(img, quitar);
    listaFotos.appendChild(item);
  });
}

inputFotos.addEventListener("change", () => {
  const elegidas = Array.from(inputFotos.files);
  const rechazadas = [];

  elegidas.forEach((archivo) => {
    if (!TIPOS_VALIDOS.includes(archivo.type)) {
      rechazadas.push(`"${archivo.name}" no es JPG ni PNG.`);
    } else if (archivo.size > MAX_MB * 1024 * 1024) {
      rechazadas.push(`"${archivo.name}" pesa más de ${MAX_MB} MB.`);
    } else if (fotos.length >= MAX_FOTOS) {
      rechazadas.push(`Solo puedes agregar hasta ${MAX_FOTOS} fotos.`);
    } else {
      fotos.push({ archivo, url: URL.createObjectURL(archivo) });
    }
  });

  // Sin mensajes repetidos (p. ej. "Solo puedes agregar hasta 5 fotos")
  mostrarErrorFotos([...new Set(rechazadas)].join(" "));
  dibujarFotos();

  // Permite volver a elegir el mismo archivo después de quitarlo
  inputFotos.value = "";
});

// =========================================
// 5. VALIDACIÓN Y BOTÓN SIGUIENTE
// La descripción es obligatoria; lo demás es opcional.
// =========================================
document.getElementById("formDetalles").addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = descripcion.value.trim();
  let mensaje = "";

  if (texto === "") {
    mensaje = "Describe lo que necesitas para continuar.";
  } else if (texto.length < MIN_CARACTERES) {
    mensaje = `Cuéntanos un poco más (mínimo ${MIN_CARACTERES} caracteres).`;
  }

  if (mensaje) {
    errorDescripcion.textContent = mensaje;
    descripcion.parentElement.classList.add("invalido");
    descripcion.setAttribute("aria-invalid", "true");
    descripcion.focus();
    return;
  }

  const datos = {
    descripcion: texto,
    notas: document.getElementById("notas").value.trim(),
    cantidadFotos: fotos.length,
  };

  try {
    localStorage.setItem("casalista-detalles", JSON.stringify(datos));
  } catch (err) {
    // Si el navegador bloquea el almacenamiento, se continúa igual
  }

  window.location.href = "FechayUbicacion.html";
});

actualizarContador();

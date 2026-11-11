// =========================================
// VALIDACIÓN DEL CORREO (formulario "Crear cuenta")
// Si el correo es válido, continúa al registro de cliente.
// =========================================
const formCrearCuenta = document.getElementById("FormCrearCuenta");
const entradaEmail = document.getElementById("EntradaEmail");
const errorEmail = document.getElementById("ErrorEmail");

// nombre@dominio.ext  (sin espacios, con @ y un punto después)
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarError(mensaje) {
    errorEmail.textContent = mensaje;
    entradaEmail.setAttribute("aria-invalid", "true");
    entradaEmail.focus();
}

entradaEmail.addEventListener("input", () => {
    errorEmail.textContent = "";
    entradaEmail.removeAttribute("aria-invalid");
});

formCrearCuenta.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const correo = entradaEmail.value.trim();

    if (correo === "") {
        mostrarError("Ingresa tu correo electrónico.");
        return;
    }

    if (!FORMATO_CORREO.test(correo)) {
        mostrarError("Ingresa un correo válido (ej. nombre@correo.com).");
        return;
    }

    window.location.href =
        "../Plataforma/auth/CrearCuentaCliente.html?correo=" + encodeURIComponent(correo);
});

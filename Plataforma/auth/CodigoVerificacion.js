// =========================================
// VALIDACIÓN DEL CÓDIGO DE VERIFICACIÓN
// =========================================
const inputs = Array.from(document.querySelectorAll("#codeInputs input"));
const form = document.getElementById("verificationForm");
const message = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

function mostrarError(texto) {
  message.textContent = texto;
  inputs.forEach((input) => {
    input.setAttribute("aria-invalid", input.value ? "false" : "true");
  });
}

function limpiarError() {
  message.textContent = "";
  inputs.forEach((input) => input.removeAttribute("aria-invalid"));
}

// Cada casilla acepta solo un número y pasa a la siguiente
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(-1);
    if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
    limpiarError();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

// Al enviar: vacío → error, incompleto → error, completo → CuentaVerificada.html
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const codigo = inputs.map((input) => input.value).join("");
  const faltan = inputs.length - codigo.length;

  if (codigo.length === 0) {
    mostrarError("Ingresa el código que enviamos a tu correo.");
    inputs[0].focus();
    return;
  }

  if (faltan > 0) {
    mostrarError(`El código está incompleto. Faltan ${faltan} dígito${faltan === 1 ? "" : "s"}.`);
    inputs.find((input) => !input.value).focus();
    return;
  }

  window.location.href = "CuentaVerificada.html";
});

// Volver a la pantalla anterior (crear cuenta)
backBtn.addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.location.href = "CrearCuentaCliente.html";
  }
});

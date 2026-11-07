const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailField = emailInput.closest(".field");
const passwordField = passwordInput.closest(".field");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formFeedback = document.getElementById("formFeedback");
const togglePassword = document.getElementById("togglePassword");

function showFieldError(field, messageElement, message) {
  field.classList.add("invalid");
  messageElement.textContent = message;
  field.querySelector("input").setAttribute("aria-invalid", "true");
}

function clearFieldError(field, messageElement) {
  field.classList.remove("invalid");
  messageElement.textContent = "";
  field.querySelector("input").removeAttribute("aria-invalid");
}

function validateEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    showFieldError(emailField, emailError, "Este campo está vacío.");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(email)) {
    showFieldError(emailField, emailError, "Ingresa un correo electrónico válido.");
    return false;
  }

  clearFieldError(emailField, emailError);
  return true;
}

function validatePassword() {
  if (!passwordInput.value) {
    showFieldError(passwordField, passwordError, "Este campo está vacío.");
    return false;
  }

  clearFieldError(passwordField, passwordError);
  return true;
}

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

emailInput.addEventListener("input", () => {
  if (emailField.classList.contains("invalid")) validateEmail();
  formFeedback.textContent = "";
});

passwordInput.addEventListener("input", () => {
  if (passwordField.classList.contains("invalid")) validatePassword();
  formFeedback.textContent = "";
});

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
  togglePassword.setAttribute("aria-pressed", String(isHidden));
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const emailIsValid = validateEmail();
  const passwordIsValid = validatePassword();

  if (!emailIsValid || !passwordIsValid) {
    formFeedback.textContent = "Completa correctamente los campos para continuar.";
    return;
  }

  // Solo se validan los campos; luego se navega a la página indicada.
  window.location.href = "../Plataforma - Cliente/Servicio.html";
});

document.getElementById("forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  formFeedback.textContent = "La recuperación de contraseña aún no está habilitada.";
});
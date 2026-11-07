// =========================================================
// CrearCuenta.js
// Validación de los formularios de registro.
// 1) Arriba: funciones comunes (sirven para Cliente y Profesional).
// 2) Abajo: un bloque por cada formulario. Cada bloque solo se
//    ejecuta si su formulario existe en la página abierta.
// =========================================================


// ---------- 1. FUNCIONES COMUNES ----------

// Muestra un error: escribe el texto rojo debajo del campo y pinta el borde de rojo
function mostrarError(idCampo, idError, mensaje) {
    document.getElementById(idError).textContent = mensaje;
    document.getElementById(idCampo).style.borderColor = "#D14343";
}

// Borra el error: quita el texto y devuelve el borde normal (el del CSS)
function limpiarError(idCampo, idError) {
    document.getElementById(idError).textContent = "";
    document.getElementById(idCampo).style.borderColor = "";
}

// Nombres: obligatorio. Devuelve true si está bien y false si hay error
function validarNombres() {
    const nombres = document.getElementById("Nombres").value.trim();
    if (nombres === "") {
        mostrarError("Nombres", "ErrorNombres", "Ingresa tus nombres y apellidos.");
        return false;
    }
    limpiarError("Nombres", "ErrorNombres");
    return true;
}

// Correo: obligatorio y debe tener "@" y "."
function validarCorreo() {
    const correo = document.getElementById("Correo").value.trim();
    if (correo === "") {
        mostrarError("Correo", "ErrorCorreo", "Ingresa tu correo electrónico.");
        return false;
    }
    if (!correo.includes("@") || !correo.includes(".")) {
        mostrarError("Correo", "ErrorCorreo", "Ingresa un correo válido (ej. nombre@correo.com).");
        return false;
    }
    limpiarError("Correo", "ErrorCorreo");
    return true;
}

// Celular: obligatorio, 9 caracteres y que empiece con "9"
function validarCelular() {
    const celular = document.getElementById("Celular").value.trim();
    if (celular === "") {
        mostrarError("Celular", "ErrorCelular", "Ingresa tu número de celular.");
        return false;
    }
    if (celular.length !== 9 || celular[0] !== "9") {
        mostrarError("Celular", "ErrorCelular", "El celular debe tener 9 dígitos y empezar con 9.");
        return false;
    }
    limpiarError("Celular", "ErrorCelular");
    return true;
}

// Contraseña: obligatoria y de mínimo 8 caracteres
function validarContrasena() {
    const contrasena = document.getElementById("Contrasena").value;
    if (contrasena.trim() === "") {
        mostrarError("Contrasena", "ErrorContrasena", "Ingresa una contraseña.");
        return false;
    }
    if (contrasena.length < 8) {
        mostrarError("Contrasena", "ErrorContrasena", "La contraseña debe tener mínimo 8 caracteres.");
        return false;
    }
    limpiarError("Contrasena", "ErrorContrasena");
    return true;
}

// Confirmar contraseña: obligatoria e igual a la contraseña
function validarConfirmacion() {
    const contrasena = document.getElementById("Contrasena").value;
    const confirmar = document.getElementById("ConfirmarContrasena").value;
    if (confirmar.trim() === "") {
        mostrarError("ConfirmarContrasena", "ErrorConfirmarContrasena", "Confirma tu contraseña.");
        return false;
    }
    if (confirmar !== contrasena) {
        mostrarError("ConfirmarContrasena", "ErrorConfirmarContrasena", "Las contraseñas no coinciden.");
        return false;
    }
    limpiarError("ConfirmarContrasena", "ErrorConfirmarContrasena");
    return true;
}

// Términos: la casilla debe estar marcada (solo mostramos el texto rojo)
function validarTerminos() {
    if (!document.getElementById("Terminos").checked) {
        document.getElementById("ErrorTerminos").textContent = "Debes aceptar los Términos y Privacidad.";
        return false;
    }
    document.getElementById("ErrorTerminos").textContent = "";
    return true;
}

// Datos personales (iguales en Cliente y Profesional).
// Llamamos a todas las funciones para que se vean todos los errores a la vez.
function validarDatosPersonales() {
    let todoBien = true;
    if (!validarNombres()) {
        todoBien = false;
    }
    if (!validarCorreo()) {
        todoBien = false;
    }
    if (!validarCelular()) {
        todoBien = false;
    }
    if (!validarContrasena()) {
        todoBien = false;
    }
    if (!validarConfirmacion()) {
        todoBien = false;
    }
    return todoBien;
}

// Ojo de la contraseña: al hacer clic cambia el tipo entre "password" y "text"
function activarOjo(idBoton, idCampo) {
    const boton = document.getElementById(idBoton);
    const campo = document.getElementById(idCampo);
    boton.addEventListener("click", function () {
        if (campo.type === "password") {
            campo.type = "text";
        } else {
            campo.type = "password";
        }
    });
}


// ---------- 2. FORMULARIO DE CLIENTE (CrearCuentaCliente.html) ----------
const formularioCliente = document.getElementById("FormularioCliente");

// Si no estamos en la página de Cliente, getElementById devuelve null y se salta este bloque
if (formularioCliente) {

    // Ojos de las dos contraseñas
    activarOjo("OjoContrasena", "Contrasena");
    activarOjo("OjoConfirmar", "ConfirmarContrasena");

    // El select se ve gris mientras no se elija un distrito, y oscuro cuando ya se eligió
    const distrito = document.getElementById("Distrito");
    distrito.addEventListener("change", function () {
        if (distrito.value === "") {
            distrito.style.color = "#6B7471";
        } else {
            distrito.style.color = "#073E3B";
        }
    });

    // Distrito: debe tener un valor distinto de "" (la dirección es opcional)
    function validarDistrito() {
        if (distrito.value === "") {
            mostrarError("Distrito", "ErrorDistrito", "Elige el distrito donde vives.");
            return false;
        }
        limpiarError("Distrito", "ErrorDistrito");
        return true;
    }

    // Al enviar: revisamos todo y, si no hay errores, mostramos el mensaje de éxito
    formularioCliente.addEventListener("submit", function (event) {
        event.preventDefault();

        const mensajeExito = document.getElementById("MensajeExito");
        mensajeExito.textContent = "";

        let todoBien = true;
        if (!validarDatosPersonales()) {
            todoBien = false;
        }
        if (!validarDistrito()) {
            todoBien = false;
        }
        if (!validarTerminos()) {
            todoBien = false;
        }

        if (todoBien) {
            mensajeExito.textContent = "¡Cuenta creada!";
        }
    });
}


// ---------- 3. FORMULARIO DE PROFESIONAL (CrearCuentaProfesional.html) ----------
// Paso 2: aquí irá el bloque "if (formularioProfesional) { ... }",
// reutilizando validarDatosPersonales(), validarTerminos() y activarOjo().

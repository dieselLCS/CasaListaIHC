const formulario = document.getElementById("FormularioRegistro");
const tarjetasTipo = document.querySelectorAll(".TarjetaTipo");
const selectDistrito = document.getElementById("distrito");

// Selección de tarjetas Usuario/Cliente y Profesional
tarjetasTipo.forEach(function (tarjeta) {
    const radio = tarjeta.querySelector("input");
    radio.addEventListener("change", function () {
        tarjetasTipo.forEach(function (otra) {
            otra.classList.toggle("Seleccionada", otra.querySelector("input").checked);
        });
    });
});

// Mostrar / ocultar contraseña
document.querySelectorAll(".BotonOjo").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const campo = document.getElementById(boton.dataset.objetivo);
        const mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        boton.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    });
});

// Placeholder gris del select mientras no se elija distrito
selectDistrito.addEventListener("change", function () {
    selectDistrito.classList.toggle("SinValor", selectDistrito.value === "");
});

// Solo números en el celular
document.getElementById("celular").addEventListener("input", function (evento) {
    evento.target.value = evento.target.value.replace(/\D/g, "").slice(0, 9);
});

function mostrarError(id, mensaje) {
    const campo = document.getElementById(id);
    const error = document.getElementById("error-" + id);
    error.textContent = mensaje;
    const contenedor = campo.closest(".CampoEntrada");
    if (contenedor) {
        contenedor.classList.toggle("TieneError", mensaje !== "");
    }
    if (mensaje !== "") {
        campo.setAttribute("aria-invalid", "true");
        campo.setAttribute("aria-describedby", error.id);
    } else {
        campo.removeAttribute("aria-invalid");
    }
}

function validar() {
    const nombres = formulario.nombres.value.trim();
    const correo = formulario.correo.value.trim();
    const celular = formulario.celular.value.trim();
    const contrasena = formulario.contrasena.value;
    const confirmar = formulario.confirmarContrasena.value;
    const errores = {};

    if (nombres === "") {
        errores.nombres = "Ingresa tus nombres y apellidos.";
    }

    if (correo === "") {
        errores.correo = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errores.correo = "Ingresa un correo válido (ej. nombre@correo.com).";
    }

    if (celular === "") {
        errores.celular = "Ingresa tu número de celular.";
    } else if (!/^\d{9}$/.test(celular)) {
        errores.celular = "El celular debe tener 9 dígitos.";
    }

    if (contrasena === "") {
        errores.contrasena = "Ingresa una contraseña.";
    }

    if (confirmar === "") {
        errores.confirmarContrasena = "Confirma tu contraseña.";
    } else if (contrasena !== confirmar) {
        errores.confirmarContrasena = "Las contraseñas no coinciden.";
    }

    if (selectDistrito.value === "") {
        errores.distrito = "Elige el distrito donde vives.";
    }

    if (!formulario.terminos.checked) {
        errores.terminos = "Debes aceptar los Términos y Privacidad.";
    }

    ["nombres", "correo", "celular", "contrasena", "confirmarContrasena", "distrito", "terminos"].forEach(function (id) {
        mostrarError(id, errores[id] || "");
    });

    return Object.keys(errores);
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const conError = validar();
    if (conError.length > 0) {
        document.getElementById(conError[0]).focus();
        return;
    }

    // Formulario válido: mensaje de éxito y redirección
    formulario.querySelector(".BotonCrearCuenta").disabled = true;
    document.getElementById("MensajeExito").hidden = false;
    setTimeout(function () {
        window.location.href = "IniciarSesion.html";
    }, 2000);
});

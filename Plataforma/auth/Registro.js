const formulario = document.getElementById("FormularioRegistro");
const tarjetasTipo = document.querySelectorAll(".TarjetaTipo");
const tarjetasServicio = document.querySelectorAll(".TarjetaServicio");
const seccionesPorTipo = document.querySelectorAll("[data-tipo]");
const descripcion = document.getElementById("descripcion");

const TIPOS_ARCHIVO = ["image/jpeg", "image/png"];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

const CAMPOS_COMUNES = ["nombres", "correo", "celular", "contrasena", "confirmarContrasena", "terminos"];
const CAMPOS_CLIENTE = ["distrito"];
const CAMPOS_PROFESIONAL = ["servicios", "zonaTrabajo", "experiencia", "descripcion", "fotoPerfil", "documento"];

// Muestra las secciones del tipo elegido y deshabilita los campos de las ocultas
function actualizarTipo() {
    const tipo = formulario.tipoCuenta.value;

    tarjetasTipo.forEach(function (tarjeta) {
        tarjeta.classList.toggle("Seleccionada", tarjeta.querySelector("input").checked);
    });

    seccionesPorTipo.forEach(function (seccion) {
        const visible = seccion.dataset.tipo === tipo;
        seccion.hidden = !visible;
        seccion.querySelectorAll("input, select, textarea, button").forEach(function (campo) {
            campo.disabled = !visible;
        });
    });

    const ocultos = tipo === "profesional" ? CAMPOS_CLIENTE : CAMPOS_PROFESIONAL;
    ocultos.forEach(function (id) {
        mostrarError(id, "");
    });
}

// Selección de tarjetas Usuario/Cliente y Profesional
tarjetasTipo.forEach(function (tarjeta) {
    tarjeta.querySelector("input").addEventListener("change", actualizarTipo);
});

// Selección de servicios (se pueden marcar varios)
tarjetasServicio.forEach(function (tarjeta) {
    const casilla = tarjeta.querySelector("input");
    casilla.addEventListener("change", function () {
        tarjeta.classList.toggle("Marcada", casilla.checked);
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

// Placeholder gris de los select mientras no se elija una opción
document.querySelectorAll(".CampoEntrada select").forEach(function (select) {
    select.addEventListener("change", function () {
        select.classList.toggle("SinValor", select.value === "");
    });
});

// Solo números en el celular
document.getElementById("celular").addEventListener("input", function (evento) {
    evento.target.value = evento.target.value.replace(/\D/g, "").slice(0, 9);
});

// Contador de la descripción
descripcion.addEventListener("input", function () {
    document.getElementById("contadorDescripcion").textContent = descripcion.value.length + "/300";
});

// Subir foto / documento: el botón abre el input oculto y se muestra el nombre del archivo
document.querySelectorAll(".BotonSubir").forEach(function (boton) {
    const entrada = document.getElementById(boton.dataset.objetivo);
    const detalle = boton.closest(".FilaArchivo").querySelector(".DetalleArchivo");
    const textoInicial = detalle.textContent;

    boton.addEventListener("click", function () {
        entrada.click();
    });
    entrada.addEventListener("change", function () {
        detalle.textContent = entrada.files.length > 0 ? entrada.files[0].name : textoInicial;
    });
});

function mostrarError(id, mensaje) {
    const campo = document.getElementById(id);
    const error = document.getElementById("error-" + id);
    error.textContent = mensaje;
    const contenedor = campo.closest(".CampoEntrada, .FilaArchivo");
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

function validarArchivo(id, nombre) {
    const archivo = document.getElementById(id).files[0];
    if (!archivo) {
        return "Sube tu " + nombre + ".";
    }
    if (!TIPOS_ARCHIVO.includes(archivo.type)) {
        return "El archivo debe ser JPG o PNG.";
    }
    if (archivo.size > TAMANO_MAXIMO) {
        return "El archivo no debe pesar más de 5 MB.";
    }
    return "";
}

function validar() {
    const tipo = formulario.tipoCuenta.value;
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

    if (tipo === "cliente") {
        if (formulario.distrito.value === "") {
            errores.distrito = "Elige el distrito donde vives.";
        }
    } else {
        if (formulario.querySelectorAll('input[name="servicios"]:checked').length === 0) {
            errores.servicios = "Elige al menos un servicio.";
        }
        if (formulario.zonaTrabajo.value === "") {
            errores.zonaTrabajo = "Elige tu distrito o zona de trabajo.";
        }
        if (formulario.experiencia.value === "") {
            errores.experiencia = "Elige tus años de experiencia.";
        }
        if (descripcion.value.trim() === "") {
            errores.descripcion = "Describe brevemente tu servicio.";
        }
        const errorFoto = validarArchivo("fotoPerfil", "foto de perfil");
        if (errorFoto !== "") {
            errores.fotoPerfil = errorFoto;
        }
        const errorDocumento = validarArchivo("documento", "documento de identidad");
        if (errorDocumento !== "") {
            errores.documento = errorDocumento;
        }
    }

    if (!formulario.terminos.checked) {
        errores.terminos = "Debes aceptar los Términos y Privacidad.";
    }

    const campos = CAMPOS_COMUNES.concat(tipo === "cliente" ? CAMPOS_CLIENTE : CAMPOS_PROFESIONAL);
    campos.forEach(function (id) {
        mostrarError(id, errores[id] || "");
    });

    // Mismo orden en que aparecen en pantalla, para enfocar el primero con error
    const orden = Array.from(formulario.querySelectorAll("[id]")).map(function (elemento) {
        return elemento.id;
    });
    return Object.keys(errores).sort(function (a, b) {
        return orden.indexOf(a) - orden.indexOf(b);
    });
}

// Elemento que recibe el foco cuando un campo tiene error
function elementoParaFoco(id) {
    const campo = document.getElementById(id);
    if (campo.tagName === "FIELDSET") {
        return campo.querySelector("input");
    }
    if (campo.type === "file") {
        return campo.closest(".FilaArchivo").querySelector(".BotonSubir");
    }
    return campo;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const conError = validar();
    if (conError.length > 0) {
        elementoParaFoco(conError[0]).focus();
        return;
    }

    // Formulario válido: mensaje de éxito y redirección
    formulario.querySelector(".BotonCrearCuenta").disabled = true;
    document.getElementById("MensajeExito").hidden = false;
    setTimeout(function () {
        window.location.href = "IniciarSesion.html";
    }, 2000);
});

actualizarTipo();

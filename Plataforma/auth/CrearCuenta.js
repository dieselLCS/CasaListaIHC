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

// Correo: obligatorio, sin espacios, con algo antes del "@",
// un "." después del "@" (con al menos un carácter entre ellos) y algo después del "."
function validarCorreo() {
    const correo = document.getElementById("Correo").value.trim();
    if (correo === "") {
        mostrarError("Correo", "ErrorCorreo", "Ingresa tu correo electrónico.");
        return false;
    }
    const posicionArroba = correo.indexOf("@");
    const posicionPunto = correo.lastIndexOf(".");
    const sinEspacios = !correo.includes(" ");
    const arrobaNoAlInicio = posicionArroba > 0;
    const puntoDespuesDeArroba = posicionPunto > posicionArroba + 1;
    const algoDespuesDelPunto = posicionPunto < correo.length - 1;
    if (!sinEspacios || !arrobaNoAlInicio || !puntoDespuesDeArroba || !algoDespuesDelPunto) {
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
    // Recorremos el texto letra por letra: cada carácter debe ser un número
    for (let i = 0; i < celular.length; i++) {
        const caracter = celular[i];
        if (!"0123456789".includes(caracter)) {
            mostrarError("Celular", "ErrorCelular", "El celular solo debe tener números.");
            return false;
        }
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

// Quitar el error apenas se corrige: cuando ocurre el evento ("input" o "change")
// y el campo tiene un error visible, lo volvemos a revisar. Si ya está bien,
// la función de validación llama a limpiarError; si no, actualiza el mensaje.
function quitarErrorAlCorregir(idCampo, idError, evento, validar) {
    document.getElementById(idCampo).addEventListener(evento, function () {
        if (document.getElementById(idError).textContent !== "") {
            validar();
        }
    });
}

// Revisión en vivo de los campos comunes (Datos personales y Términos)
function activarCorreccionComun() {
    quitarErrorAlCorregir("Nombres", "ErrorNombres", "input", validarNombres);
    quitarErrorAlCorregir("Correo", "ErrorCorreo", "input", validarCorreo);
    quitarErrorAlCorregir("Celular", "ErrorCelular", "input", validarCelular);
    quitarErrorAlCorregir("Contrasena", "ErrorContrasena", "input", validarContrasena);
    // Si cambia la contraseña, también puede corregirse el error de "no coinciden"
    quitarErrorAlCorregir("Contrasena", "ErrorConfirmarContrasena", "input", validarConfirmacion);
    quitarErrorAlCorregir("ConfirmarContrasena", "ErrorConfirmarContrasena", "input", validarConfirmacion);
    quitarErrorAlCorregir("Terminos", "ErrorTerminos", "change", validarTerminos);
}

// Select: se ve gris mientras no se elija una opción, y oscuro cuando ya se eligió
function activarColorSelect(idSelect) {
    const select = document.getElementById(idSelect);
    select.addEventListener("change", function () {
        if (select.value === "") {
            select.style.color = "#6B7471";
        } else {
            select.style.color = "#073E3B";
        }
    });
}

// Select obligatorio: debe tener un valor distinto de ""
function validarSelect(idSelect, idError, mensaje) {
    if (document.getElementById(idSelect).value === "") {
        mostrarError(idSelect, idError, mensaje);
        return false;
    }
    limpiarError(idSelect, idError);
    return true;
}

// Cuenta creada (Cliente y Profesional): muestra el mensaje, bloquea el botón
// y, después de 2 segundos, lleva al usuario a la página del código de verificación
function cuentaCreada() {
    // Mostramos el mensaje de éxito debajo del formulario
    document.getElementById("MensajeExito").textContent = "¡Cuenta creada! Te enviamos un código de verificación…";

    // Desactivamos el botón "Crear mi cuenta" para que no se pueda pulsar dos veces
    const boton = document.getElementById("BotonCrearCuenta");
    boton.disabled = true;

    // setTimeout espera 2000 milisegundos (2 segundos) y luego ejecuta la función.
    // CodigoVerificacion.html está en la misma carpeta (auth), por eso basta con su nombre
    setTimeout(function () {
        window.location.href = "CodigoVerificacion.html";
    }, 2000);
}


// ---------- 2. FORMULARIO DE CLIENTE (CrearCuentaCliente.html) ----------
const formularioCliente = document.getElementById("FormularioCliente");

// Si no estamos en la página de Cliente, getElementById devuelve null y se salta este bloque
if (formularioCliente) {

    // Ojos de las dos contraseñas y color del select
    activarOjo("OjoContrasena", "Contrasena");
    activarOjo("OjoConfirmar", "ConfirmarContrasena");
    activarColorSelect("Distrito");

    // Revisión en vivo: el error se quita apenas el usuario corrige el campo
    activarCorreccionComun();
    quitarErrorAlCorregir("Distrito", "ErrorDistrito", "change", function () {
        validarSelect("Distrito", "ErrorDistrito", "Elige el distrito donde vives.");
    });

    // Al enviar: revisamos todo y, si no hay errores, mostramos el mensaje de éxito
    formularioCliente.addEventListener("submit", function (event) {
        event.preventDefault();

        const mensajeExito = document.getElementById("MensajeExito");
        mensajeExito.textContent = "";

        let todoBien = true;
        if (!validarDatosPersonales()) {
            todoBien = false;
        }
        // La dirección es opcional, por eso solo validamos el distrito
        if (!validarSelect("Distrito", "ErrorDistrito", "Elige el distrito donde vives.")) {
            todoBien = false;
        }
        if (!validarTerminos()) {
            todoBien = false;
        }

        // Si todo está bien: mensaje, botón desactivado y redirección (ver cuentaCreada)
        if (todoBien) {
            cuentaCreada();
        }
    });
}


// ---------- 3. FORMULARIO DE PROFESIONAL (CrearCuentaProfesional.html) ----------
const formularioProfesional = document.getElementById("FormularioProfesional");

// Si no estamos en la página de Profesional, se salta este bloque
if (formularioProfesional) {

    // Ojos de las dos contraseñas y color de los dos select
    activarOjo("OjoContrasena", "Contrasena");
    activarOjo("OjoConfirmar", "ConfirmarContrasena");
    activarColorSelect("ZonaTrabajo");
    activarColorSelect("Experiencia");

    // Tarjeta de servicio: al marcar su checkbox se pinta de verde; al desmarcarlo vuelve a blanco
    function activarTarjetaServicio(idCasilla, idTarjeta) {
        const casilla = document.getElementById(idCasilla);
        const tarjeta = document.getElementById(idTarjeta);
        casilla.addEventListener("change", function () {
            if (casilla.checked) {
                tarjeta.style.backgroundColor = "#E6F5F1";
                tarjeta.style.borderColor = "#006D61";
            } else {
                tarjeta.style.backgroundColor = "#FFFFFF";
                tarjeta.style.borderColor = "";
            }
        });
    }
    activarTarjetaServicio("ServicioGasfiteria", "TarjetaGasfiteria");
    activarTarjetaServicio("ServicioLimpieza", "TarjetaLimpieza");

    // Contador de la descripción: se actualiza cada vez que se escribe (evento "input")
    const descripcion = document.getElementById("Descripcion");
    const contador = document.getElementById("ContadorDescripcion");
    descripcion.addEventListener("input", function () {
        contador.textContent = descripcion.value.length + "/300";
    });

    // Al elegir un archivo, cambiamos el texto gris para que se note que ya se subió
    function activarArchivo(idEntrada, idDetalle) {
        const entrada = document.getElementById(idEntrada);
        const detalle = document.getElementById(idDetalle);
        entrada.addEventListener("change", function () {
            if (entrada.value !== "") {
                // value trae C:\fakepath\foto.jpg: partimos el texto por cada \ (en JS se escribe "\\")
                // y .pop() nos da el último pedazo, que es el nombre del archivo
                detalle.textContent = entrada.value.split("\\").pop();
            } else {
                detalle.textContent = "JPG o PNG · Máx. 5 MB";
            }
        });
    }
    activarArchivo("FotoPerfil", "DetalleFoto");
    activarArchivo("Documento", "DetalleDocumento");

    // Servicios: al menos uno marcado. Si no hay ninguno, las dos tarjetas van con borde rojo
    function validarServicios() {
        const gasfiteria = document.getElementById("ServicioGasfiteria").checked;
        const limpieza = document.getElementById("ServicioLimpieza").checked;
        const tarjetaGasfiteria = document.getElementById("TarjetaGasfiteria");
        const tarjetaLimpieza = document.getElementById("TarjetaLimpieza");
        if (!gasfiteria && !limpieza) {
            document.getElementById("ErrorServicios").textContent = "Elige al menos un servicio.";
            tarjetaGasfiteria.style.borderColor = "#D14343";
            tarjetaLimpieza.style.borderColor = "#D14343";
            return false;
        }
        // Quitamos el rojo solo de la tarjeta sin marcar (la marcada ya tiene borde verde)
        document.getElementById("ErrorServicios").textContent = "";
        if (!gasfiteria) {
            tarjetaGasfiteria.style.borderColor = "";
        }
        if (!limpieza) {
            tarjetaLimpieza.style.borderColor = "";
        }
        return true;
    }

    // Descripción: no vacía. El borde rojo va en la caja que la rodea
    function validarDescripcion() {
        if (descripcion.value.trim() === "") {
            mostrarError("CajaDescripcion", "ErrorDescripcion", "Describe brevemente tu servicio.");
            return false;
        }
        limpiarError("CajaDescripcion", "ErrorDescripcion");
        return true;
    }

    // Archivo: debe estar elegido, ser JPG o PNG y pesar máximo 5 MB. El borde rojo va en su fila
    function validarArchivo(idEntrada, idFila, idError, mensaje) {
        const entrada = document.getElementById(idEntrada);
        if (entrada.value === "") {
            mostrarError(idFila, idError, mensaje);
            return false;
        }
        // Pasamos el nombre a minúsculas para aceptar también .JPG, .PNG, etc.
        const nombre = entrada.value.toLowerCase();
        if (!nombre.endsWith(".jpg") && !nombre.endsWith(".jpeg") && !nombre.endsWith(".png")) {
            mostrarError(idFila, idError, "Solo se aceptan archivos JPG o PNG");
            return false;
        }
        // files[0] es el archivo elegido y .size su peso en bytes; 5 * 1024 * 1024 bytes = 5 MB
        if (entrada.files[0].size > 5 * 1024 * 1024) {
            mostrarError(idFila, idError, "El archivo no debe pesar más de 5 MB");
            return false;
        }
        limpiarError(idFila, idError);
        return true;
    }

    // Revisión en vivo: el error se quita apenas el usuario corrige el campo
    activarCorreccionComun();
    quitarErrorAlCorregir("ServicioGasfiteria", "ErrorServicios", "change", validarServicios);
    quitarErrorAlCorregir("ServicioLimpieza", "ErrorServicios", "change", validarServicios);
    quitarErrorAlCorregir("ZonaTrabajo", "ErrorZonaTrabajo", "change", function () {
        validarSelect("ZonaTrabajo", "ErrorZonaTrabajo", "Elige tu distrito o zona de trabajo.");
    });
    quitarErrorAlCorregir("Experiencia", "ErrorExperiencia", "change", function () {
        validarSelect("Experiencia", "ErrorExperiencia", "Elige tus años de experiencia.");
    });
    quitarErrorAlCorregir("Descripcion", "ErrorDescripcion", "input", validarDescripcion);
    quitarErrorAlCorregir("FotoPerfil", "ErrorFotoPerfil", "change", function () {
        validarArchivo("FotoPerfil", "FilaFoto", "ErrorFotoPerfil", "Sube tu foto de perfil.");
    });
    quitarErrorAlCorregir("Documento", "ErrorDocumento", "change", function () {
        validarArchivo("Documento", "FilaDocumento", "ErrorDocumento", "Sube tu documento de identidad.");
    });

    // Al enviar: revisamos todo y, si no hay errores, mostramos el mensaje de éxito
    formularioProfesional.addEventListener("submit", function (event) {
        event.preventDefault();

        const mensajeExito = document.getElementById("MensajeExito");
        mensajeExito.textContent = "";

        let todoBien = true;
        if (!validarDatosPersonales()) {
            todoBien = false;
        }
        if (!validarServicios()) {
            todoBien = false;
        }
        if (!validarSelect("ZonaTrabajo", "ErrorZonaTrabajo", "Elige tu distrito o zona de trabajo.")) {
            todoBien = false;
        }
        if (!validarSelect("Experiencia", "ErrorExperiencia", "Elige tus años de experiencia.")) {
            todoBien = false;
        }
        if (!validarDescripcion()) {
            todoBien = false;
        }
        if (!validarArchivo("FotoPerfil", "FilaFoto", "ErrorFotoPerfil", "Sube tu foto de perfil.")) {
            todoBien = false;
        }
        if (!validarArchivo("Documento", "FilaDocumento", "ErrorDocumento", "Sube tu documento de identidad.")) {
            todoBien = false;
        }
        if (!validarTerminos()) {
            todoBien = false;
        }

        // Si todo está bien: mensaje, botón desactivado y redirección (ver cuentaCreada)
        if (todoBien) {
            cuentaCreada();
        }
    });
}

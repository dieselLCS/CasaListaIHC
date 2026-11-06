const CLAVE_GUARDADO = "CasaListaFechaUbicacion";
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const PRIMERA_HORA = 7 * 60;
const ULTIMA_HORA = 20 * 60;
const INTERVALO_HORAS = 30;
const MINUTOS_ANTICIPACION = 60;
const DIAS_DISPONIBLES = 90;
const HORA_PREDETERMINADA = 10 * 60;
const GRUPOS_HORAS = [
    { nombre: "Mañana", desde: PRIMERA_HORA, hasta: 11 * 60 + 30 },
    { nombre: "Tarde", desde: 12 * 60, hasta: 17 * 60 + 30 },
    { nombre: "Noche", desde: 18 * 60, hasta: ULTIMA_HORA }
];
const BUSQUEDA_LIMA = "&lang=default&lat=-12.09&lon=-77.02&bbox=-77.25,-12.55,-76.65,-11.70";
const TIPOS_DESCARTADOS = ["cycleway", "footway", "path", "steps", "pedestrian", "bus_stop", "platform", "track", "construction"];
const NUMERO_CASA = /\b\d{1,5}\b(?!\s+de\b)/g;
const DETALLE_CASA = /\b(mz|lt|dpto|int)\b\.?\s*[a-z0-9]+/gi;
const REEMPLAZOS_BUSQUEDA = [
    [/\bav(da)?\b\.?/gi, "avenida"],
    [/\bjr\b\.?/gi, "jirón"],
    [/\b(ca|cl)\b\.?/gi, "calle"],
    [/\bp(s)?je\b\.?/gi, "pasaje"],
    [/\bprol\b\.?/gi, "prolongación"],
    [/\burb\b\.?/gi, "urbanización"],
    [DETALLE_CASA, " "]
];
const ICONO_LUGAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

const formulario = document.getElementById("FormularioServicio");
const campoDireccion = document.getElementById("direccion");
const botonLimpiar = document.getElementById("BotonLimpiar");
const listaSugerencias = document.getElementById("Sugerencias");
const mapa = document.getElementById("Mapa");
const marcoMapa = document.getElementById("MarcoMapa");
const avisoMapa = document.getElementById("AvisoMapa");
const abrirGoogleMaps = document.getElementById("AbrirGoogleMaps");
const botonesVista = document.querySelectorAll("[data-vista]");
const tituloDireccion = document.getElementById("TituloDireccion");
const detalleDireccion = document.getElementById("DetalleDireccion");
const botonEditar = document.getElementById("BotonEditar");
const botonFecha = document.getElementById("BotonFecha");
const textoFecha = document.getElementById("TextoFecha");
const calendario = document.getElementById("Calendario");
const tituloMes = document.getElementById("TituloMes");
const diasMes = document.getElementById("DiasMes");
const botonMesAnterior = document.getElementById("MesAnterior");
const botonMesSiguiente = document.getElementById("MesSiguiente");
const botonHora = document.getElementById("BotonHora");
const textoHora = document.getElementById("TextoHora");
const panelHoras = document.getElementById("PanelHoras");
const campoReferencia = document.getElementById("referencia");
const contadorReferencia = document.getElementById("ContadorReferencia");
const llegadaDireccion = document.getElementById("LlegadaDireccion");
const llegadaFecha = document.getElementById("LlegadaFecha");
const llegadaConector = document.getElementById("LlegadaConector");
const llegadaHora = document.getElementById("LlegadaHora");
const botonesPanel = document.querySelectorAll("[data-panel]");

const hoy = inicioDelDia(new Date());
const fechaMinima = horasDisponibles(hoy).length > 0 ? hoy : sumarDias(hoy, 1);
const fechaMaxima = sumarDias(hoy, DIAS_DISPONIBLES);

const estado = {
    direccion: "",
    coordenadas: null,
    busqueda: Promise.resolve(null),
    vista: "mapa",
    fecha: sumarDias(hoy, 1),
    hora: HORA_PREDETERMINADA,
    mesVisible: null,
    fechaEnfocada: null,
    sugerencias: [],
    indiceActivo: -1
};
const selectorDeFecha = {
    contenedor: document.getElementById("SelectorFecha"),
    boton: botonFecha,
    panel: calendario,
    preparar: prepararCalendario
};
const selectorDeHora = {
    contenedor: document.getElementById("SelectorHora"),
    boton: botonHora,
    panel: panelHoras,
    preparar: dibujarHoras
};
const selectores = [selectorDeFecha, selectorDeHora];
let temporizadorSugerencias = null;
let controladorSugerencias = null;
let controladorCoordenadas = null;

function inicioDelDia(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function sumarDias(fecha, dias) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

function mismoDia(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function numeroMes(fecha) {
    return fecha.getFullYear() * 12 + fecha.getMonth();
}

function dosDigitos(numero) {
    return String(numero).padStart(2, "0");
}

function claveFecha(fecha) {
    return fecha.getFullYear() + "-" + dosDigitos(fecha.getMonth() + 1) + "-" + dosDigitos(fecha.getDate());
}

function leerClaveFecha(clave) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clave || "");
    return partes ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])) : null;
}

function formatoFecha(fecha) {
    return DIAS_CORTOS[fecha.getDay()] + ", " + fecha.getDate() + " de " + MESES_CORTOS[fecha.getMonth()] + " " + fecha.getFullYear();
}

function formatoFechaResumen(fecha) {
    return DIAS_LARGOS[fecha.getDay()] + " " + fecha.getDate() + " de " + MESES[fecha.getMonth()].toLowerCase();
}

function formatoFechaLargo(fecha) {
    return formatoFechaResumen(fecha) + " de " + fecha.getFullYear();
}

function formatoHora(minutos) {
    const horas = Math.floor(minutos / 60);
    return (horas % 12 || 12) + ":" + dosDigitos(minutos % 60) + (horas < 12 ? " a. m." : " p. m.");
}

function claveHora(minutos) {
    return dosDigitos(Math.floor(minutos / 60)) + ":" + dosDigitos(minutos % 60);
}

function leerClaveHora(clave) {
    const partes = /^(\d{2}):(\d{2})$/.exec(clave || "");
    return partes ? Number(partes[1]) * 60 + Number(partes[2]) : null;
}

function horasDisponibles(fecha) {
    const horas = [];
    for (let minutos = PRIMERA_HORA; minutos <= ULTIMA_HORA; minutos += INTERVALO_HORAS) {
        horas.push(minutos);
    }
    const ahora = new Date();
    if (!mismoDia(fecha, ahora)) {
        return horas;
    }
    const limite = ahora.getHours() * 60 + ahora.getMinutes() + MINUTOS_ANTICIPACION;
    return horas.filter(function (minutos) {
        return minutos >= limite;
    });
}

function fechaPermitida(fecha) {
    return fecha >= fechaMinima && fecha <= fechaMaxima;
}

function desplazamiento() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function unicos(lista) {
    return lista.filter(function (valor, indice) {
        return valor && lista.indexOf(valor) === indice;
    });
}

function partesDireccion(texto) {
    const partes = texto.split(",").map(function (parte) {
        return parte.trim();
    }).filter(Boolean);
    const titulo = partes.shift() || texto;
    if (!partes.some(function (parte) { return /\blima\b/i.test(parte); })) {
        partes.push("Lima");
    }
    return { titulo: titulo, detalle: partes.join(", ") };
}

function consultaGoogle(texto) {
    let consulta = texto;
    if (!/\blima\b/i.test(consulta)) {
        consulta += ", Lima";
    }
    if (!/\bper[uú]/i.test(consulta)) {
        consulta += ", Perú";
    }
    return consulta;
}

function urlMapa(texto) {
    return "https://maps.google.com/maps?q=" + encodeURIComponent(consultaGoogle(texto)) + "&t=m&z=17&iwloc=&output=embed&hl=es";
}

function urlSatelite(texto) {
    return "https://maps.google.com/maps?q=" + encodeURIComponent(consultaGoogle(texto)) + "&t=k&z=18&iwloc=&output=embed&hl=es";
}

function urlVista3D(coordenadas) {
    return "https://maps.google.com/maps?layer=c&cbll=" + coordenadas.lat + "," + coordenadas.lng + "&cbp=12,0,0,0,0&source=embed&output=svembed&hl=es";
}

function cargarMarco(url) {
    if (marcoMapa.getAttribute("src") === url) {
        mapa.classList.remove("Cargando");
        return;
    }
    mapa.classList.add("Cargando");
    marcoMapa.setAttribute("src", url);
}

function actualizarMapa() {
    const direccion = estado.direccion;
    avisoMapa.hidden = true;
    mapa.classList.toggle("ModoCalle", estado.vista === "3d");
    if (estado.vista === "mapa") {
        cargarMarco(urlMapa(direccion));
        return;
    }
    if (estado.vista === "satelite") {
        cargarMarco(urlSatelite(direccion));
        return;
    }
    mapa.classList.add("Cargando");
    Promise.resolve(estado.coordenadas || estado.busqueda).then(function (coordenadas) {
        if (estado.vista !== "3d" || direccion !== estado.direccion) {
            return;
        }
        avisoMapa.hidden = Boolean(coordenadas);
        cargarMarco(coordenadas ? urlVista3D(coordenadas) : urlSatelite(direccion));
    });
}

function actualizarResumen() {
    const tieneHora = Number.isFinite(estado.hora);
    llegadaDireccion.textContent = partesDireccion(estado.direccion).titulo;
    llegadaFecha.textContent = formatoFechaResumen(estado.fecha);
    llegadaConector.textContent = tieneHora && Math.floor(estado.hora / 60) % 12 === 1 ? "a la" : "a las";
    llegadaHora.textContent = tieneHora ? formatoHora(estado.hora) : "";
}

function guardar() {
    try {
        const tieneHora = Number.isFinite(estado.hora);
        sessionStorage.setItem(CLAVE_GUARDADO, JSON.stringify({
            direccion: estado.direccion,
            coordenadas: estado.coordenadas,
            fecha: claveFecha(estado.fecha),
            fechaTexto: formatoFecha(estado.fecha),
            hora: tieneHora ? claveHora(estado.hora) : "",
            horaTexto: tieneHora ? formatoHora(estado.hora) : "",
            referencia: campoReferencia.value.trim()
        }));
    } catch (error) {
        return;
    }
}

function leerGuardado() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE_GUARDADO)) || {};
    } catch (error) {
        return {};
    }
}

function controlDe(id) {
    return { direccion: campoDireccion, fecha: botonFecha, hora: botonHora }[id];
}

function mostrarError(id, mensaje) {
    const error = document.getElementById("error-" + id);
    const control = controlDe(id);
    error.textContent = mensaje;
    control.classList.add("ConError");
    control.setAttribute("aria-invalid", "true");
    control.setAttribute("aria-describedby", error.id);
}

function limpiarError(id) {
    const control = controlDe(id);
    document.getElementById("error-" + id).textContent = "";
    control.classList.remove("ConError");
    control.removeAttribute("aria-invalid");
    control.removeAttribute("aria-describedby");
}

function normalizarBusqueda(texto) {
    return REEMPLAZOS_BUSQUEDA.reduce(function (resultado, reemplazo) {
        return resultado.replace(reemplazo[0], reemplazo[1]);
    }, texto);
}

function numeroCasa(texto) {
    const numeros = normalizarBusqueda(texto).match(NUMERO_CASA);
    return numeros ? numeros[numeros.length - 1] : "";
}

function textoBusqueda(texto) {
    return normalizarBusqueda(texto).replace(NUMERO_CASA, " ").replace(/\s+/g, " ").replace(/^[\s,]+|[\s,]+$/g, "");
}

function buscarLugares(texto, limite, senal) {
    const consulta = textoBusqueda(texto);
    if (consulta.length < 2) {
        return Promise.resolve([]);
    }
    const url = "https://photon.komoot.io/api/?q=" + encodeURIComponent(consulta) + "&limit=" + limite + BUSQUEDA_LIMA;
    return fetch(url, { signal: senal })
        .then(function (respuesta) {
            return respuesta.ok ? respuesta.json() : { features: [] };
        })
        .then(function (datos) {
            return (datos.features || []).filter(function (lugar) {
                return lugar.properties && !TIPOS_DESCARTADOS.includes(lugar.properties.osm_value);
            }).map(convertirLugar);
        });
}

function convertirLugar(lugar) {
    const datos = lugar.properties || {};
    const calle = [datos.street, datos.housenumber].filter(Boolean).join(" ");
    const distrito = datos.city || datos.district || "Lima";
    const titulo = datos.housenumber && datos.street ? calle : datos.name || calle || datos.locality || datos.district || distrito;
    const detalle = unicos([datos.name !== titulo ? datos.name : "", distrito]).join(", ");
    return {
        titulo: titulo,
        detalle: detalle,
        distrito: distrito,
        esCalle: datos.type === "street",
        lat: lugar.geometry.coordinates[1],
        lng: lugar.geometry.coordinates[0]
    };
}

function textoSugerencia(lugar, escrito) {
    let principal = lugar.titulo;
    const numero = numeroCasa(escrito);
    const detalles = (escrito.match(DETALLE_CASA) || []).join(" ");
    if (lugar.esCalle && numero && !principal.includes(numero)) {
        principal += " " + numero;
    }
    if (detalles) {
        principal += " " + detalles;
    }
    return principal === lugar.distrito ? principal : principal + ", " + lugar.distrito;
}

function buscarCoordenadas(texto) {
    if (controladorCoordenadas) {
        controladorCoordenadas.abort();
    }
    controladorCoordenadas = new AbortController();
    estado.busqueda = buscarLugares(texto, 3, controladorCoordenadas.signal)
        .then(function (lugares) {
            const coordenadas = lugares.length > 0 ? { lat: lugares[0].lat, lng: lugares[0].lng } : null;
            if (texto === estado.direccion) {
                estado.coordenadas = coordenadas;
                guardar();
            }
            return coordenadas;
        })
        .catch(function () {
            return null;
        });
}

function aplicarDireccion(texto, coordenadas) {
    const limpio = texto.replace(/\s+/g, " ").trim();
    if (limpio === "") {
        return false;
    }
    const cambio = limpio !== estado.direccion;
    campoDireccion.value = limpio;
    actualizarBotonLimpiar();
    limpiarError("direccion");
    if (cambio) {
        estado.direccion = limpio;
        estado.coordenadas = null;
    }
    if (coordenadas) {
        if (controladorCoordenadas) {
            controladorCoordenadas.abort();
        }
        estado.coordenadas = coordenadas;
        estado.busqueda = Promise.resolve(coordenadas);
    } else if (cambio) {
        buscarCoordenadas(limpio);
    }
    const partes = partesDireccion(limpio);
    tituloDireccion.textContent = partes.titulo;
    tituloDireccion.title = partes.titulo;
    detalleDireccion.textContent = partes.detalle;
    detalleDireccion.title = partes.detalle;
    abrirGoogleMaps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consultaGoogle(limpio));
    if (cambio || (coordenadas && estado.vista === "3d")) {
        actualizarMapa();
    }
    actualizarResumen();
    guardar();
    return true;
}

function actualizarBotonLimpiar() {
    botonLimpiar.hidden = campoDireccion.value === "";
}

function abrirSugerencias() {
    listaSugerencias.hidden = false;
    campoDireccion.setAttribute("aria-expanded", "true");
}

function cerrarSugerencias() {
    clearTimeout(temporizadorSugerencias);
    if (controladorSugerencias) {
        controladorSugerencias.abort();
    }
    listaSugerencias.hidden = true;
    listaSugerencias.innerHTML = "";
    estado.sugerencias = [];
    estado.indiceActivo = -1;
    campoDireccion.setAttribute("aria-expanded", "false");
    campoDireccion.removeAttribute("aria-activedescendant");
}

function mensajeSugerencias(texto) {
    listaSugerencias.innerHTML = "";
    const mensaje = document.createElement("li");
    mensaje.className = "MensajeSugerencias";
    mensaje.setAttribute("role", "option");
    mensaje.setAttribute("aria-disabled", "true");
    mensaje.textContent = texto;
    listaSugerencias.appendChild(mensaje);
    abrirSugerencias();
}

function mostrarSugerencias(lugares, escrito) {
    const vistos = [];
    estado.sugerencias = lugares.filter(function (lugar) {
        const clave = lugar.titulo + "|" + lugar.distrito;
        if (!lugar.titulo || vistos.includes(clave)) {
            return false;
        }
        vistos.push(clave);
        return true;
    }).slice(0, 5).map(function (lugar) {
        lugar.texto = textoSugerencia(lugar, escrito);
        return lugar;
    });
    estado.indiceActivo = -1;
    campoDireccion.removeAttribute("aria-activedescendant");
    if (estado.sugerencias.length === 0) {
        mensajeSugerencias("No encontramos esa dirección. Presiona Enter para usarla tal como la escribiste.");
        return;
    }
    listaSugerencias.innerHTML = "";
    estado.sugerencias.forEach(function (lugar, indice) {
        const opcion = document.createElement("li");
        opcion.className = "Sugerencia";
        opcion.id = "Sugerencia" + indice;
        opcion.setAttribute("role", "option");
        opcion.setAttribute("aria-selected", "false");
        opcion.innerHTML = ICONO_LUGAR + "<span><strong></strong><small></small></span>";
        opcion.querySelector("strong").textContent = lugar.titulo;
        opcion.querySelector("small").textContent = lugar.detalle;
        opcion.addEventListener("click", function () {
            elegirSugerencia(indice);
        });
        listaSugerencias.appendChild(opcion);
    });
    abrirSugerencias();
}

function cargarSugerencias(escrito) {
    if (controladorSugerencias) {
        controladorSugerencias.abort();
    }
    controladorSugerencias = new AbortController();
    if (listaSugerencias.hidden) {
        mensajeSugerencias("Buscando direcciones…");
    }
    buscarLugares(escrito, 15, controladorSugerencias.signal)
        .then(function (lugares) {
            if (campoDireccion.value.trim() === escrito && document.activeElement === campoDireccion) {
                mostrarSugerencias(lugares, escrito);
            }
        })
        .catch(function (error) {
            if (error.name !== "AbortError") {
                cerrarSugerencias();
            }
        });
}

function activarSugerencia(indice) {
    estado.indiceActivo = indice;
    listaSugerencias.querySelectorAll(".Sugerencia").forEach(function (opcion, posicion) {
        const activa = posicion === indice;
        opcion.classList.toggle("Activa", activa);
        opcion.setAttribute("aria-selected", String(activa));
        if (activa) {
            opcion.scrollIntoView({ block: "nearest" });
        }
    });
    campoDireccion.setAttribute("aria-activedescendant", "Sugerencia" + indice);
}

function elegirSugerencia(indice) {
    const lugar = estado.sugerencias[indice];
    if (!lugar) {
        return;
    }
    cerrarSugerencias();
    aplicarDireccion(lugar.texto, { lat: lugar.lat, lng: lugar.lng });
}

function actualizarHoras() {
    const horas = horasDisponibles(estado.fecha);
    if (!horas.includes(estado.hora)) {
        estado.hora = horas.includes(HORA_PREDETERMINADA) ? HORA_PREDETERMINADA : horas[0];
    }
    textoHora.textContent = Number.isFinite(estado.hora) ? formatoHora(estado.hora) : "Elige una hora";
}

function elegirFecha(fecha) {
    estado.fecha = fecha;
    textoFecha.textContent = formatoFecha(fecha);
    limpiarError("fecha");
    actualizarHoras();
    actualizarResumen();
    guardar();
}

function elegirHora(minutos) {
    estado.hora = minutos;
    textoHora.textContent = formatoHora(minutos);
    limpiarError("hora");
    actualizarResumen();
    guardar();
}

function dibujarHoras() {
    const disponibles = horasDisponibles(estado.fecha);
    panelHoras.innerHTML = "";
    GRUPOS_HORAS.forEach(function (grupo) {
        const titulo = document.createElement("p");
        const lista = document.createElement("div");
        titulo.className = "TituloHoras";
        titulo.textContent = grupo.nombre;
        lista.className = "ListaHoras";
        for (let minutos = grupo.desde; minutos <= grupo.hasta; minutos += INTERVALO_HORAS) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "Hora";
            boton.textContent = formatoHora(minutos);
            boton.dataset.minutos = minutos;
            boton.disabled = !disponibles.includes(minutos);
            boton.setAttribute("aria-pressed", String(minutos === estado.hora));
            boton.tabIndex = minutos === estado.hora ? 0 : -1;
            lista.appendChild(boton);
        }
        panelHoras.append(titulo, lista);
    });
}

function prepararCalendario() {
    estado.fechaEnfocada = estado.fecha;
    estado.mesVisible = new Date(estado.fecha.getFullYear(), estado.fecha.getMonth(), 1);
    dibujarCalendario();
}

function dibujarCalendario() {
    const mes = estado.mesVisible;
    tituloMes.textContent = MESES[mes.getMonth()] + " " + mes.getFullYear();
    botonMesAnterior.disabled = numeroMes(mes) <= numeroMes(fechaMinima);
    botonMesSiguiente.disabled = numeroMes(mes) >= numeroMes(fechaMaxima);
    diasMes.innerHTML = "";
    const espacios = (mes.getDay() + 6) % 7;
    for (let indice = 0; indice < espacios; indice++) {
        diasMes.appendChild(document.createElement("span"));
    }
    const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "Dia";
        boton.textContent = dia;
        boton.dataset.fecha = claveFecha(fecha);
        boton.setAttribute("aria-label", formatoFechaLargo(fecha));
        boton.setAttribute("aria-pressed", String(mismoDia(fecha, estado.fecha)));
        boton.tabIndex = mismoDia(fecha, estado.fechaEnfocada) ? 0 : -1;
        boton.disabled = !fechaPermitida(fecha);
        if (mismoDia(fecha, hoy)) {
            boton.classList.add("Hoy");
            boton.setAttribute("aria-current", "date");
        }
        diasMes.appendChild(boton);
    }
}

function limitarFecha(fecha) {
    if (fecha < fechaMinima) {
        return fechaMinima;
    }
    if (fecha > fechaMaxima) {
        return fechaMaxima;
    }
    return fecha;
}

function enfocarDia(fecha) {
    estado.fechaEnfocada = limitarFecha(fecha);
    estado.mesVisible = new Date(estado.fechaEnfocada.getFullYear(), estado.fechaEnfocada.getMonth(), 1);
    dibujarCalendario();
    diasMes.querySelector('[data-fecha="' + claveFecha(estado.fechaEnfocada) + '"]').focus();
}

function cambiarMes(salto) {
    const mes = new Date(estado.mesVisible.getFullYear(), estado.mesVisible.getMonth() + salto, 1);
    const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    estado.mesVisible = mes;
    estado.fechaEnfocada = limitarFecha(new Date(mes.getFullYear(), mes.getMonth(), Math.min(estado.fechaEnfocada.getDate(), diasDelMes)));
    dibujarCalendario();
}

function abrirSelector(selector) {
    cerrarSelectores();
    selector.preparar();
    selector.panel.hidden = false;
    selector.contenedor.classList.add("Abierto");
    selector.boton.setAttribute("aria-expanded", "true");
    const enfocable = selector.panel.querySelector('[tabindex="0"]:not(:disabled)');
    if (enfocable) {
        enfocable.focus({ preventScroll: true });
    }
    selector.panel.scrollIntoView({ behavior: desplazamiento(), block: "nearest" });
}

function cerrarSelector(selector, devolverFoco) {
    if (selector.panel.hidden) {
        return;
    }
    selector.panel.hidden = true;
    selector.contenedor.classList.remove("Abierto");
    selector.boton.setAttribute("aria-expanded", "false");
    if (devolverFoco) {
        selector.boton.focus();
    }
}

function cerrarSelectores() {
    selectores.forEach(function (selector) {
        cerrarSelector(selector, false);
    });
}

function cerrarPaneles(excepto) {
    botonesPanel.forEach(function (boton) {
        if (boton === excepto) {
            return;
        }
        document.getElementById(boton.dataset.panel).hidden = true;
        boton.setAttribute("aria-expanded", "false");
    });
}

botonesPanel.forEach(function (boton) {
    const panel = document.getElementById(boton.dataset.panel);
    boton.addEventListener("click", function () {
        cerrarPaneles(boton);
        panel.hidden = !panel.hidden;
        boton.setAttribute("aria-expanded", String(!panel.hidden));
    });
});

selectores.forEach(function (selector) {
    selector.boton.addEventListener("click", function () {
        if (selector.panel.hidden) {
            abrirSelector(selector);
        } else {
            cerrarSelector(selector, false);
        }
    });
    selector.contenedor.addEventListener("focusout", function (evento) {
        if (evento.relatedTarget && !selector.contenedor.contains(evento.relatedTarget)) {
            cerrarSelector(selector, false);
        }
    });
});

botonesVista.forEach(function (boton) {
    boton.addEventListener("click", function () {
        estado.vista = boton.dataset.vista;
        botonesVista.forEach(function (otro) {
            otro.setAttribute("aria-pressed", String(otro === boton));
        });
        actualizarMapa();
    });
});

campoDireccion.addEventListener("input", function () {
    actualizarBotonLimpiar();
    limpiarError("direccion");
    clearTimeout(temporizadorSugerencias);
    const escrito = campoDireccion.value.trim();
    if (escrito.length < 3) {
        cerrarSugerencias();
        return;
    }
    temporizadorSugerencias = setTimeout(function () {
        cargarSugerencias(escrito);
    }, 300);
});

campoDireccion.addEventListener("keydown", function (evento) {
    const total = estado.sugerencias.length;
    const abiertas = !listaSugerencias.hidden && total > 0;
    if (evento.key === "ArrowDown" && abiertas) {
        evento.preventDefault();
        activarSugerencia((estado.indiceActivo + 1) % total);
    } else if (evento.key === "ArrowUp" && abiertas) {
        evento.preventDefault();
        activarSugerencia((estado.indiceActivo - 1 + total) % total);
    } else if (evento.key === "Enter") {
        evento.preventDefault();
        if (abiertas && estado.indiceActivo >= 0) {
            elegirSugerencia(estado.indiceActivo);
        } else {
            cerrarSugerencias();
            aplicarDireccion(campoDireccion.value);
        }
    } else if (evento.key === "Escape" && !listaSugerencias.hidden) {
        evento.preventDefault();
        evento.stopPropagation();
        cerrarSugerencias();
    }
});

campoDireccion.addEventListener("blur", function () {
    cerrarSugerencias();
    aplicarDireccion(campoDireccion.value);
});

listaSugerencias.addEventListener("mousedown", function (evento) {
    evento.preventDefault();
});

botonLimpiar.addEventListener("mousedown", function (evento) {
    evento.preventDefault();
});

botonLimpiar.addEventListener("click", function () {
    campoDireccion.value = "";
    actualizarBotonLimpiar();
    cerrarSugerencias();
    campoDireccion.focus();
});

botonEditar.addEventListener("click", function () {
    campoDireccion.focus({ preventScroll: true });
    campoDireccion.select();
    campoDireccion.scrollIntoView({ behavior: desplazamiento(), block: "center" });
});

marcoMapa.addEventListener("load", function () {
    mapa.classList.remove("Cargando");
});

botonMesAnterior.addEventListener("click", function () {
    cambiarMes(-1);
});

botonMesSiguiente.addEventListener("click", function () {
    cambiarMes(1);
});

diasMes.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".Dia");
    if (!boton || boton.disabled) {
        return;
    }
    elegirFecha(leerClaveFecha(boton.dataset.fecha));
    cerrarSelector(selectorDeFecha, true);
});

diasMes.addEventListener("keydown", function (evento) {
    const saltos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const posicion = (estado.fechaEnfocada.getDay() + 6) % 7;
    let destino = null;
    if (evento.key in saltos) {
        destino = sumarDias(estado.fechaEnfocada, saltos[evento.key]);
    } else if (evento.key === "Home") {
        destino = sumarDias(estado.fechaEnfocada, -posicion);
    } else if (evento.key === "End") {
        destino = sumarDias(estado.fechaEnfocada, 6 - posicion);
    } else {
        return;
    }
    evento.preventDefault();
    enfocarDia(destino);
});

panelHoras.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".Hora");
    if (!boton || boton.disabled) {
        return;
    }
    elegirHora(Number(boton.dataset.minutos));
    cerrarSelector(selectorDeHora, true);
});

panelHoras.addEventListener("keydown", function (evento) {
    const columnas = getComputedStyle(panelHoras.querySelector(".ListaHoras")).gridTemplateColumns.split(" ").length;
    const saltos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columnas, ArrowDown: columnas };
    if (!(evento.key in saltos)) {
        return;
    }
    evento.preventDefault();
    const activas = Array.from(panelHoras.querySelectorAll(".Hora:not(:disabled)"));
    const destino = activas.indexOf(document.activeElement) + saltos[evento.key];
    activas[Math.min(activas.length - 1, Math.max(0, destino))].focus();
});

campoReferencia.addEventListener("input", function () {
    contadorReferencia.textContent = campoReferencia.value.length + "/200";
    guardar();
});

document.addEventListener("click", function (evento) {
    if (!evento.target.closest(".Desplegable")) {
        cerrarPaneles();
    }
    if (!evento.target.closest(".Selector")) {
        cerrarSelectores();
    }
});

document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") {
        return;
    }
    const botonAbierto = Array.from(botonesPanel).find(function (boton) {
        return boton.getAttribute("aria-expanded") === "true";
    });
    if (botonAbierto) {
        cerrarPaneles();
        botonAbierto.focus();
    }
    selectores.forEach(function (selector) {
        cerrarSelector(selector, true);
    });
});

document.querySelectorAll(".Desplegable").forEach(function (desplegable) {
    desplegable.addEventListener("focusout", function (evento) {
        if (evento.relatedTarget && !desplegable.contains(evento.relatedTarget)) {
            cerrarPaneles();
        }
    });
});

window.addEventListener("blur", function () {
    cerrarPaneles();
    cerrarSelectores();
});

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    cerrarSugerencias();
    cerrarSelectores();
    let primerError = null;
    if (!aplicarDireccion(campoDireccion.value)) {
        mostrarError("direccion", "Ingresa la dirección donde necesitas el servicio.");
        primerError = campoDireccion;
    }
    if (!fechaPermitida(estado.fecha)) {
        mostrarError("fecha", "Elige una fecha disponible.");
        primerError = primerError || botonFecha;
    }
    if (!horasDisponibles(estado.fecha).includes(estado.hora)) {
        actualizarHoras();
        actualizarResumen();
        mostrarError("hora", "Elige una hora disponible.");
        primerError = primerError || botonHora;
    }
    if (primerError) {
        primerError.focus();
        return;
    }
    guardar();
    window.location.href = "Negociacion.html";
});

function iniciar() {
    const guardado = leerGuardado();
    const fechaGuardada = leerClaveFecha(guardado.fecha);
    const horaGuardada = leerClaveHora(guardado.hora);
    const coordenadas = guardado.coordenadas;
    if (fechaGuardada && fechaPermitida(fechaGuardada)) {
        estado.fecha = fechaGuardada;
    }
    if (horaGuardada !== null) {
        estado.hora = horaGuardada;
    }
    textoFecha.textContent = formatoFecha(estado.fecha);
    actualizarHoras();
    if (typeof guardado.referencia === "string") {
        campoReferencia.value = guardado.referencia;
        contadorReferencia.textContent = guardado.referencia.length + "/200";
    }
    const coordenadasValidas = coordenadas && Number.isFinite(coordenadas.lat) && Number.isFinite(coordenadas.lng);
    aplicarDireccion(guardado.direccion || campoDireccion.value, coordenadasValidas ? coordenadas : null);
}

iniciar();

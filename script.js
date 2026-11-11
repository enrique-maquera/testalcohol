"use strict";

const CLAVE_REGISTROS = "registrosAlcohotest";
const NO_CONTROL = "NO CONTROL DE ALCOHOTEST";
const CONTROL = "CONTROL DE ALCOHOTEST";
const MAX_CONSECUTIVOS = 3;
const DURACION_GIRO = 500;
const DURACION_RESULTADO = 3000;

const ui = {
    boton: document.getElementById("btnLogo"),
    mensaje: document.getElementById("mensajeInicio"),
    resultado: document.getElementById("resultado"),
    modal: document.getElementById("modalReporte"),
    resumen: document.getElementById("resumenReporte"),
    tabla: document.getElementById("tablaReporte"),
    aviso: document.getElementById("mensajeReporte"),
    audios: {
        pase: document.getElementById("audioPase"),
        prueba: document.getElementById("audioPrueba"),
        carga: document.getElementById("audioLoading")
    }
};

let temporizador = null;
let sorteoEnCurso = false;

function leerRegistros() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_REGISTROS) || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error("No se pudieron leer los registros.", error);
        return [];
    }
}

function escribirRegistros(registros) {
    try {
        localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
    } catch (error) {
        console.error("No se pudieron guardar los registros.", error);
    }
}

function fechaLocal(fecha = new Date()) {
    return fecha.toLocaleDateString("es-PE");
}

function contarConsecutivos(resultadoBuscado) {
    const registros = leerRegistros();
    let cantidad = 0;
    for (let i = registros.length - 1; i >= 0; i -= 1) {
        const resultado = registros[i]?.resultado;
        if (resultado === resultadoBuscado) cantidad += 1;
        else if (resultado === CONTROL || resultado === NO_CONTROL) break;
    }
    return cantidad;
}

function permiteIngreso() {
    if (contarConsecutivos(NO_CONTROL) >= MAX_CONSECUTIVOS) return false;
    if (contarConsecutivos(CONTROL) >= MAX_CONSECUTIVOS) return true;
    return Math.random() < 0.63;
}

function registrar(resultado) {
    const ahora = new Date();
    const registros = leerRegistros();
    registros.push({
        resultado,
        fecha: fechaLocal(ahora),
        hora: ahora.toLocaleTimeString("es-PE"),
        tipo: "SORTEO",
        registro: "AUTOMÁTICO"
    });
    escribirRegistros(registros);
}

function detenerAudios() {
    Object.values(ui.audios).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

function reproducir(audio) {
    detenerAudios();
    audio.play().catch(() => console.warn("El dispositivo bloqueó la reproducción del sonido."));
}

function limpiarResultado() {
    document.body.classList.remove("fondo-resultado-verde", "fondo-resultado-rojo");
    ui.resultado.className = "";
    ui.resultado.replaceChildren();
}

function reiniciarPantalla() {
    clearTimeout(temporizador);
    temporizador = null;
    sorteoEnCurso = false;
    detenerAudios();
    limpiarResultado();
    ui.mensaje.hidden = false;
    ui.boton.hidden = false;
    ui.boton.disabled = false;
    ui.boton.classList.remove("girando-vertical");
}

function mostrarResultado(esIngreso) {
    registrar(esIngreso ? NO_CONTROL : CONTROL);
    ui.boton.hidden = true;
    ui.boton.classList.remove("girando-vertical");
    ui.resultado.classList.add("bola-resultado", esIngreso ? "verde" : "rojo", esIngreso ? "bola-verde" : "bola-roja");
    document.body.classList.add(esIngreso ? "fondo-resultado-verde" : "fondo-resultado-rojo");

    if (esIngreso) {
        ui.resultado.textContent = "INGRESE A SEDE";
        reproducir(ui.audios.pase);
    } else {
        ["REALIZAR", "PRUEBA", "ALCOHOTEST"].forEach((texto, indice) => {
            if (indice) ui.resultado.appendChild(document.createElement("br"));
            ui.resultado.appendChild(document.createTextNode(texto));
        });
        reproducir(ui.audios.prueba);
    }
    temporizador = setTimeout(reiniciarPantalla, DURACION_RESULTADO);
}

function iniciarSorteo() {
    if (sorteoEnCurso) return;
    sorteoEnCurso = true;
    clearTimeout(temporizador);
    limpiarResultado();
    ui.mensaje.hidden = true;
    ui.boton.disabled = true;
    reproducir(ui.audios.carga);
    ui.boton.classList.remove("girando-vertical");
    void ui.boton.offsetWidth;
    ui.boton.classList.add("girando-vertical");
    setTimeout(() => mostrarResultado(permiteIngreso()), DURACION_GIRO);
}

function celda(texto, etiqueta = "td") {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = String(texto ?? "");
    return elemento;
}

function renderizarReporte(registros) {
    ui.tabla.replaceChildren();
    if (!registros.length) {
        const aviso = document.createElement("div");
        aviso.className = "sin-registros";
        aviso.textContent = "No hay registros guardados.";
        ui.tabla.appendChild(aviso);
        return;
    }

    const grupos = new Map();
    registros.forEach(registro => {
        const fecha = registro.fecha || "Sin fecha";
        if (!grupos.has(fecha)) grupos.set(fecha, []);
        grupos.get(fecha).push(registro);
    });

    Array.from(grupos.entries()).reverse().forEach(([fecha, lista]) => {
        const seccion = document.createElement("section");
        seccion.className = "grupo-reporte";
        const titulo = document.createElement("h3");
        titulo.textContent = `Fecha ${fecha}`;
        const scroll = document.createElement("div");
        scroll.className = "tabla-scroll";
        const tabla = document.createElement("table");
        const cabecera = document.createElement("thead");
        const filaCabecera = document.createElement("tr");
        ["N°", "Hora", "Registro"].forEach(texto => filaCabecera.appendChild(celda(texto, "th")));
        cabecera.appendChild(filaCabecera);
        const cuerpo = document.createElement("tbody");
        lista.forEach((registro, indice) => {
            const fila = document.createElement("tr");
            if (registro.resultado === CONTROL) fila.className = "fila-control";
            if (registro.resultado === NO_CONTROL) fila.className = "fila-no-control";
            fila.append(celda(indice + 1), celda(registro.hora), celda(registro.resultado));
            cuerpo.appendChild(fila);
        });
        tabla.append(cabecera, cuerpo);
        scroll.appendChild(tabla);
        seccion.append(titulo, scroll);
        ui.tabla.appendChild(seccion);
    });
}

function abrirReporte() {
    const registros = leerRegistros();
    ui.resumen.textContent = `${registros.length} registro(s) guardado(s)`;
    ui.aviso.textContent = "";
    ui.aviso.className = "mensaje-reporte";
    renderizarReporte(registros);
    ui.modal.classList.add("activo");
    ui.modal.setAttribute("aria-hidden", "false");
}

function cerrarReporte() {
    ui.modal.classList.remove("activo");
    ui.modal.setAttribute("aria-hidden", "true");
}

ui.boton.addEventListener("click", iniciarSorteo);
document.getElementById("btnReporte").addEventListener("click", abrirReporte);
document.getElementById("cerrarReporte").addEventListener("click", cerrarReporte);
document.getElementById("cancelarReporte").addEventListener("click", cerrarReporte);
ui.modal.addEventListener("click", evento => {
    if (evento.target === ui.modal) cerrarReporte();
});
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && ui.modal.classList.contains("activo")) cerrarReporte();
});

const personalExtra = JSON.parse(localStorage.getItem("personalExtraAlcohotest") || "[]");
const personalPorDni = new Map([...((window.PERSONAL || [])), ...personalExtra].map(persona => [persona.dni, persona]));
let temporizadorReinicio;
let resultadoPruebaSeleccionado = "";

function reproducirSonido(idAudio) {
    ["audioPase", "audioPrueba"].forEach(id => {
        const audio = document.getElementById(id);
        audio.pause();
        audio.currentTime = 0;
    });
    const audioSeleccionado = document.getElementById(idAudio);
    audioSeleccionado.play().catch(() => {
        console.warn("El dispositivo bloqueó la reproducción del sonido.");
    });
}

function iniciarSorteo() {
    const mensaje = document.getElementById("mensajeInicio");
    const resultado = document.getElementById("resultado");
    const boton = document.getElementById("btnLogo");

    clearTimeout(temporizadorReinicio);
    mensaje.style.display = "none";
    boton.style.display = "none";
    resultado.classList.add("bola-resultado");

    const esVerde = Math.random() < 0.65;
    if (esVerde) {
        resultado.classList.add("verde", "bola-verde");
        resultado.innerHTML = "INGRESE A SEDE";
        reproducirSonido("audioPase");
        temporizadorReinicio = setTimeout(reiniciarPantalla, 1800);
        return;
    }

    resultado.classList.add("rojo", "bola-roja");
    resultado.innerHTML = "REALIZAR<br>PRUEBA<br>ALCOHOTEST";
    reproducirSonido("audioPrueba");
    setTimeout(abrirRegistro, 1200);
}

function abrirRegistro() {
    const modal = document.getElementById("modalRegistro");
    const input = document.getElementById("dniPersonal");
    const camposDni = document.getElementById("camposDni");
    resultadoPruebaSeleccionado = "";
    document.getElementById("formRegistro").reset();
    document.getElementById("mensajeRegistro").textContent = "";
    document.getElementById("datosPersonal").hidden = true;
    ocultarOpcionesDniNoEncontrado();
    document.querySelectorAll(".btn-prueba").forEach(boton => boton.classList.remove("activo"));
    camposDni.hidden = true;
    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => input.blur(), 50);
}

function cerrarRegistro() {
    const modal = document.getElementById("modalRegistro");
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
    reiniciarPantalla();
}

function reiniciarPantalla() {
    const mensaje = document.getElementById("mensajeInicio");
    const resultado = document.getElementById("resultado");
    const boton = document.getElementById("btnLogo");
    resultado.classList.remove("verde", "rojo", "bola-resultado", "bola-verde", "bola-roja");
    resultado.innerHTML = "";
    mensaje.style.display = "block";
    boton.style.display = "block";
}

function guardarRegistro(persona, resultadoPrueba) {
    const ahora = new Date();
    const registro = {
        resultado: `REALIZAR PRUEBA ALCOHOTEST - ${resultadoPrueba}`,
        fecha: ahora.toLocaleDateString("es-PE"),
        hora: ahora.toLocaleTimeString("es-PE"),
        dni: persona.dni,
        nombre: persona.nombre,
        puesto: persona.puesto,
        area: persona.area,
        sede: persona.sede
    };
    const registros = JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]");
    registros.push(registro);
    localStorage.setItem("registrosAlcohotest", JSON.stringify(registros));
}

function buscarRegistroDeHoy(dni) {
    const hoy = new Date().toLocaleDateString("es-PE");
    const registros = JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]");
    return registros.find(registro => registro.dni === dni && registro.fecha === hoy);
}

function guardarRegistroExterno(resultadoPrueba) {
    const ahora = new Date();
    const registros = JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]");
    registros.push({
        resultado: `REALIZAR PRUEBA ALCOHOTEST - ${resultadoPrueba}`,
        fecha: ahora.toLocaleDateString("es-PE"),
        hora: ahora.toLocaleTimeString("es-PE"),
        tipo: "PERSONAL EXTERNO / EXONERACIÓN",
        registro: "FÍSICO"
    });
    localStorage.setItem("registrosAlcohotest", JSON.stringify(registros));
}

function guardarRegistroPropioNoEncontrado(dni, resultadoPrueba) {
    const ahora = new Date();
    const registros = JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]");
    registros.push({
        resultado: `REALIZAR PRUEBA ALCOHOTEST - ${resultadoPrueba}`,
        fecha: ahora.toLocaleDateString("es-PE"),
        hora: ahora.toLocaleTimeString("es-PE"),
        dni: dni,
        nombre: "PERSONAL PROPIO NO ENCONTRADO",
        puesto: "NO REGISTRADO EN BASE",
        area: "NO REGISTRADO",
        sede: "SUCURSAL AREQUIPA KMMP",
        tipo: "PERSONAL PROPIO",
        registro: "DIGITAL - DNI NO ENCONTRADO"
    });
    localStorage.setItem("registrosAlcohotest", JSON.stringify(registros));
}

function ocultarOpcionesDniNoEncontrado() {
    document.getElementById("opcionesDniNoEncontrado").hidden = true;
    document.getElementById("formPersonalNuevo").hidden = true;
}

function mostrarOpcionesDniNoEncontrado() {
    document.getElementById("opcionesDniNoEncontrado").hidden = false;
    document.getElementById("formPersonalNuevo").hidden = true;
}

function guardarPersonalEnLibreria(persona) {
    const personalFiltrado = personalExtra.filter(item => item.dni !== persona.dni);
    personalFiltrado.push(persona);
    localStorage.setItem("personalExtraAlcohotest", JSON.stringify(personalFiltrado));
    personalExtra.length = 0;
    personalExtra.push(...personalFiltrado);
    personalPorDni.set(persona.dni, persona);
}

function esResultadoPositivo(resultadoPrueba) {
    return (resultadoPrueba || "").includes("POSITIVO");
}

function mensajePosteriorRegistro(resultadoPrueba) {
    return esResultadoPositivo(resultadoPrueba)
        ? "Se reporta a Supervision y SSOMA. Dar cumplimiento al ASMA NI 008 FR 004."
        : "Registro guardado correctamente.";
}

function mostrarAlertaPositivo(texto) {
    const alerta = document.getElementById("alertaPositivo");
    document.getElementById("textoAlertaPositivo").textContent = texto;
    alerta.classList.add("activo");
    alerta.setAttribute("aria-hidden", "false");
}

function cerrarAlertaPositivo() {
    const alerta = document.getElementById("alertaPositivo");
    alerta.classList.remove("activo");
    alerta.setAttribute("aria-hidden", "true");
}

function mostrarAlertaNegativo(persona, resultadoPrueba) {
    const alerta = document.getElementById("alertaNegativo");
    document.getElementById("datosAlertaNegativo").innerHTML = `
        <strong>${persona.nombre || persona.tipo || "REGISTRO"}</strong>
        <span>DNI: ${persona.dni || "NO APLICA"}</span>
        <span>${resultadoPrueba}</span>
        <span>${persona.puesto || persona.registro || ""}</span>
        <span>${persona.area || ""}${persona.sede ? " - " + persona.sede : ""}</span>
    `;
    alerta.classList.add("activo");
    alerta.setAttribute("aria-hidden", "false");
}

function cerrarAlertaNegativo() {
    const alerta = document.getElementById("alertaNegativo");
    alerta.classList.remove("activo");
    alerta.setAttribute("aria-hidden", "true");
}

function registrosDeHoy() {
    const hoy = new Date().toLocaleDateString("es-PE");
    return JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]")
        .filter(registro => registro.fecha === hoy);
}

function abrirReporte() {
    const registros = JSON.parse(localStorage.getItem("registrosAlcohotest") || "[]");
    const modal = document.getElementById("modalReporte");
    document.getElementById("resumenReporte").textContent = `${registros.length} registro(s) guardado(s)`;
    document.getElementById("mensajeReporte").textContent = "";
    renderizarTablasReporte(registros);
    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
}

function cerrarReporte() {
    const modal = document.getElementById("modalReporte");
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
}

function renderizarTablasReporte(registros) {
    const contenedor = document.getElementById("tablaReporte");

    if (!registros.length) {
        contenedor.innerHTML = `<div class="sin-registros">No hay registros guardados.</div>`;
        return;
    }

    const registrosPorFecha = registros.reduce((grupos, registro) => {
        const fecha = registro.fecha || "Sin fecha";
        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(registro);
        return grupos;
    }, {});

    contenedor.innerHTML = Object.entries(registrosPorFecha)
        .reverse()
        .map(([fecha, registrosFecha]) => `
            <section class="grupo-reporte">
                <h3>Fecha ${fecha}</h3>
                <div class="tabla-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Hora</th>
                                <th>Resultado</th>
                                <th>DNI</th>
                                <th>Nombre</th>
                                <th>Área</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registrosFecha.map((registro, indice) => {
                                const claseResultado = (registro.resultado || "").includes("POSITIVO") ? "fila-positivo" : (registro.resultado || "").includes("NEGATIVO") ? "fila-negativo" : "";
                                return `
                                <tr class="${claseResultado}">
                                    <td>${indice + 1}</td>
                                    <td>${registro.hora || ""}</td>
                                    <td>${registro.resultado || ""}</td>
                                    <td>${registro.dni || ""}</td>
                                    <td>${registro.nombre || registro.tipo || ""}</td>
                                    <td>${registro.area || ""}</td>
                                    <td>${registro.registro || (registro.dni ? "DIGITAL" : "FISICO")}</td>
                                </tr>
                            `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </section>
        `).join("");
}

function exportarReporteExcel() {
    const registros = registrosDeHoy();
    const mensaje = document.getElementById("mensajeReporte");
    if (!registros.length) {
        mensaje.textContent = "No hay registros para exportar hoy.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    const fecha = new Date();
    const fechaArchivo = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, "0"), String(fecha.getDate()).padStart(2, "0")].join("-");
    const filas = registros.map((registro, indice) => [
        indice + 1,
        registro.resultado || "",
        registro.fecha || "",
        registro.hora || "",
        registro.dni || "",
        registro.nombre || "",
        registro.puesto || "",
        registro.area || "",
        registro.sede || "",
        registro.tipo || (registro.dni ? "PERSONAL DIRECTO" : "PERSONAL EXTERNO / EXONERACIÓN"),
        registro.registro || (registro.dni ? "DIGITAL" : "FÍSICO")
    ]);
    const datos = [
        ["REPORTE DIARIO DE ALCOHOTEST - SUCURSAL AREQUIPA"],
        [`Fecha: ${fecha.toLocaleDateString("es-PE")}`],
        [`Total de registros: ${filas.length}`],
        ["N°", "RESULTADO", "FECHA", "HORA", "DNI", "NOMBRE COMPLETO", "PUESTO", "ÁREA", "SEDE", "TIPO PERSONAL", "TIPO DE REGISTRO"],
        ...filas
    ];

    const hoja = XLSX.utils.aoa_to_sheet(datos);
    hoja["!merges"] = [XLSX.utils.decode_range("A1:K1"), XLSX.utils.decode_range("A2:K2"), XLSX.utils.decode_range("A3:K3")];
    hoja["!autofilter"] = { ref: `A4:K${filas.length + 4}` };
    hoja["!cols"] = [
        { wch: 5 }, { wch: 31 }, { wch: 12 }, { wch: 12 }, { wch: 13 },
        { wch: 40 }, { wch: 38 }, { wch: 34 }, { wch: 22 }, { wch: 31 }, { wch: 20 }
    ];
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Registros del día");
    const nombreArchivo = `Alcohotest_Arequipa_${fechaArchivo}.xlsx`;

    if (window.Android && typeof window.Android.guardarExcel === "function") {
        const base64 = XLSX.write(libro, { bookType: "xlsx", type: "base64" });
        window.Android.guardarExcel(nombreArchivo, base64);
    } else {
        XLSX.writeFile(libro, nombreArchivo);
    }

    mensaje.textContent = `Excel generado: ${nombreArchivo}`;
    mensaje.className = "mensaje-registro exito";
}

document.getElementById("formRegistro").addEventListener("submit", event => {
    event.preventDefault();
    const dni = document.getElementById("dniPersonal").value.replace(/\D/g, "");
    const persona = personalPorDni.get(dni);
    const mensaje = document.getElementById("mensajeRegistro");
    const datos = document.getElementById("datosPersonal");

    if (!resultadoPruebaSeleccionado) {
        mensaje.textContent = "Seleccione resultado negativo o resultado positivo.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    if (!persona) {
        mensaje.textContent = "DNI no encontrado. Puede registrar sus datos o usar ingreso rapido.";
        mensaje.className = "mensaje-registro error";
        datos.hidden = true;
        mostrarOpcionesDniNoEncontrado();
        return;
    }

    ocultarOpcionesDniNoEncontrado();

    const registroAnterior = buscarRegistroDeHoy(persona.dni);
    if (registroAnterior) {
        mensaje.textContent = `Este trabajador ya fue registrado hoy a las ${registroAnterior.hora}.`;
        mensaje.className = "mensaje-registro advertencia";
        datos.innerHTML = `<strong>${persona.nombre}</strong><span>No se generó un registro duplicado.</span>`;
        datos.hidden = false;
        return;
    }

    guardarRegistro(persona, resultadoPruebaSeleccionado);
    mensaje.textContent = mensajePosteriorRegistro(resultadoPruebaSeleccionado);
    mensaje.className = esResultadoPositivo(resultadoPruebaSeleccionado) ? "mensaje-registro advertencia" : "mensaje-registro exito";
    datos.innerHTML = `<strong>${persona.nombre}</strong><span>${persona.puesto}</span><span>${persona.area} · ${persona.sede}</span>`;
    datos.hidden = false;
    if (esResultadoPositivo(resultadoPruebaSeleccionado)) mostrarAlertaPositivo(mensajePosteriorRegistro(resultadoPruebaSeleccionado));
    else mostrarAlertaNegativo(persona, resultadoPruebaSeleccionado);
    setTimeout(cerrarRegistro, 1800);
});

document.getElementById("dniPersonal").addEventListener("input", event => {
    event.target.value = event.target.value.replace(/\D/g, "");
    ocultarOpcionesDniNoEncontrado();
});

document.querySelectorAll(".btn-prueba").forEach(boton => {
    boton.addEventListener("click", () => {
        resultadoPruebaSeleccionado = boton.dataset.resultado;
        document.querySelectorAll(".btn-prueba").forEach(opcion => opcion.classList.remove("activo"));
        boton.classList.add("activo");
        document.getElementById("camposDni").hidden = false;
        const mensaje = document.getElementById("mensajeRegistro");
        if (esResultadoPositivo(resultadoPruebaSeleccionado)) {
            mensaje.textContent = "";
            mensaje.className = "mensaje-registro";
            mostrarAlertaPositivo("El colaborador NO ingresa a Sede.");
        } else {
            mensaje.textContent = "";
            mensaje.className = "mensaje-registro";
        }
        document.getElementById("dniPersonal").focus();
    });
});

document.getElementById("cerrarModal").addEventListener("click", cerrarRegistro);
document.getElementById("cerrarAlertaPositivo").addEventListener("click", cerrarAlertaPositivo);
document.getElementById("cerrarAlertaNegativo").addEventListener("click", cerrarAlertaNegativo);
document.getElementById("btnReporte").addEventListener("click", abrirReporte);
document.getElementById("cerrarReporte").addEventListener("click", cerrarReporte);
document.getElementById("cancelarReporte").addEventListener("click", cerrarReporte);
document.getElementById("btnMostrarRegistroPersonal").addEventListener("click", () => {
    document.getElementById("formPersonalNuevo").hidden = false;
    document.getElementById("nombreNuevo").focus();
});
document.getElementById("btnGuardarPersonalNuevo").addEventListener("click", () => {
    const dni = document.getElementById("dniPersonal").value.replace(/\D/g, "");
    const nombre = document.getElementById("nombreNuevo").value.trim().toUpperCase();
    const puesto = document.getElementById("puestoNuevo").value.trim().toUpperCase() || "NO REGISTRADO";
    const area = document.getElementById("areaNueva").value.trim().toUpperCase() || "NO REGISTRADO";
    const sede = document.getElementById("sedeNueva").value.trim().toUpperCase() || "SUCURSAL AREQUIPA KMMP";
    const mensaje = document.getElementById("mensajeRegistro");
    const datos = document.getElementById("datosPersonal");

    if (!resultadoPruebaSeleccionado) {
        mensaje.textContent = "Seleccione resultado negativo o resultado positivo.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    if (!dni) {
        mensaje.textContent = "Ingrese el DNI o codigo del personal propio.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    if (!nombre) {
        mensaje.textContent = "Ingrese el nombre completo del personal.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    const registroAnterior = buscarRegistroDeHoy(dni);
    if (registroAnterior) {
        mensaje.textContent = `Este DNI ya fue registrado hoy a las ${registroAnterior.hora}.`;
        mensaje.className = "mensaje-registro advertencia";
        datos.innerHTML = "<strong>No se genero un registro duplicado.</strong>";
        datos.hidden = false;
        return;
    }

    const persona = { dni, nombre, puesto, area, sede };
    guardarPersonalEnLibreria(persona);
    guardarRegistro(persona, resultadoPruebaSeleccionado);
    mensaje.textContent = esResultadoPositivo(resultadoPruebaSeleccionado)
        ? mensajePosteriorRegistro(resultadoPruebaSeleccionado)
        : "Datos guardados en la libreria y registro creado.";
    mensaje.className = esResultadoPositivo(resultadoPruebaSeleccionado) ? "mensaje-registro advertencia" : "mensaje-registro exito";
    datos.innerHTML = `<strong>${persona.nombre}</strong><span>${resultadoPruebaSeleccionado}</span><span>${persona.puesto}</span><span>${persona.area} - ${persona.sede}</span>`;
    datos.hidden = false;
    if (esResultadoPositivo(resultadoPruebaSeleccionado)) mostrarAlertaPositivo(mensajePosteriorRegistro(resultadoPruebaSeleccionado));
    else mostrarAlertaNegativo(persona, resultadoPruebaSeleccionado);
    setTimeout(cerrarRegistro, 2200);
});
document.getElementById("btnIngresoRapido").addEventListener("click", () => {
    const dni = document.getElementById("dniPersonal").value.replace(/\D/g, "");
    const mensaje = document.getElementById("mensajeRegistro");
    const datos = document.getElementById("datosPersonal");

    if (!resultadoPruebaSeleccionado) {
        mensaje.textContent = "Seleccione resultado negativo o resultado positivo.";
        mensaje.className = "mensaje-registro error";
        return;
    }

    if (!dni) {
        mensaje.textContent = "Ingrese el DNI o codigo del personal propio.";
        mensaje.className = "mensaje-registro error";
        datos.hidden = true;
        return;
    }

    const registroAnterior = buscarRegistroDeHoy(dni);
    if (registroAnterior) {
        mensaje.textContent = `Este DNI ya fue registrado hoy a las ${registroAnterior.hora}.`;
        mensaje.className = "mensaje-registro advertencia";
        datos.innerHTML = "<strong>No se genero un registro duplicado.</strong>";
        datos.hidden = false;
        return;
    }

    guardarRegistroPropioNoEncontrado(dni, resultadoPruebaSeleccionado);
    mensaje.textContent = esResultadoPositivo(resultadoPruebaSeleccionado)
        ? mensajePosteriorRegistro(resultadoPruebaSeleccionado)
        : "Personal propio registrado manualmente.";
    mensaje.className = esResultadoPositivo(resultadoPruebaSeleccionado) ? "mensaje-registro advertencia" : "mensaje-registro exito";
    datos.innerHTML = `<strong>PERSONAL PROPIO NO ENCONTRADO</strong><span>DNI: ${dni}</span><span>${resultadoPruebaSeleccionado}</span>`;
    datos.hidden = false;
    if (esResultadoPositivo(resultadoPruebaSeleccionado)) mostrarAlertaPositivo(mensajePosteriorRegistro(resultadoPruebaSeleccionado));
    else mostrarAlertaNegativo({
        dni,
        nombre: "PERSONAL PROPIO NO ENCONTRADO",
        puesto: "INGRESO RAPIDO",
        area: "NO REGISTRADO",
        sede: "SUCURSAL AREQUIPA KMMP"
    }, resultadoPruebaSeleccionado);
    setTimeout(cerrarRegistro, 2200);
});
document.getElementById("btnPersonalExterno").addEventListener("click", () => {
    const mensaje = document.getElementById("mensajeRegistro");
    const datos = document.getElementById("datosPersonal");
    if (!resultadoPruebaSeleccionado) {
        mensaje.textContent = "Seleccione resultado negativo o resultado positivo.";
        mensaje.className = "mensaje-registro error";
        return;
    }
    guardarRegistroExterno(resultadoPruebaSeleccionado);
    mensaje.textContent = esResultadoPositivo(resultadoPruebaSeleccionado)
        ? mensajePosteriorRegistro(resultadoPruebaSeleccionado)
        : "Opcion registrada. Complete el registro fisico.";
    mensaje.className = esResultadoPositivo(resultadoPruebaSeleccionado) ? "mensaje-registro advertencia" : "mensaje-registro exito";
    datos.innerHTML = `<strong>PERSONAL EXTERNO / EXONERACION</strong><span>${resultadoPruebaSeleccionado}</span><span>El detalle se registra en el formato fisico.</span>`;
    datos.hidden = false;
    if (esResultadoPositivo(resultadoPruebaSeleccionado)) mostrarAlertaPositivo(mensajePosteriorRegistro(resultadoPruebaSeleccionado));
    else mostrarAlertaNegativo({
        nombre: "PERSONAL EXTERNO / EXONERACION",
        registro: "FORMATO FISICO",
        area: "NO APLICA",
        sede: "SUCURSAL AREQUIPA KMMP"
    }, resultadoPruebaSeleccionado);
    setTimeout(cerrarRegistro, 2200);
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.getElementById("modalRegistro").classList.contains("activo")) cerrarRegistro();
    if (event.key === "Escape" && document.getElementById("modalReporte").classList.contains("activo")) cerrarReporte();
});

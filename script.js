function iniciarSorteo() {
    const mensaje = document.getElementById("mensajeInicio");
    const resultado = document.getElementById("resultado");
    const boton = document.getElementById("btnLogo");

    mensaje.style.display = "none";
    boton.style.display = "none";
    resultado.style.display = "flex";
    resultado.style.justifyContent = "center";
    resultado.style.alignItems = "center";
    resultado.style.borderRadius = "50%";
    resultado.style.color = "white";
    resultado.style.padding = "20px";
    resultado.style.boxShadow = "inset -15px -15px 25px rgba(0, 0, 0, 0.25), inset 10px 10px 20px rgba(255, 255, 255, 0.3), 0 8px 15px rgba(0, 0, 0, 0.25)";

    const esVerde = Math.random() < 0.70;

    if (esVerde) {
    // Bolita más pequeña para el texto corto
    resultado.style.width = "min(178vw, 560px)";
    resultado.style.height = "min(178vw, 560px)";
    resultado.style.fontSize = "clamp(28px, 5vw, 55px)";

    resultado.classList.add("verde");
    resultado.innerHTML = "INGRESE A SEDE";
} else {
    // Bolita más grande para el texto largo
    resultado.style.width = "min(178vw, 560px)";
    resultado.style.height = "min(178vw, 560px)";
    resultado.style.fontSize = "clamp(26px, 4vw, 48px)";

    resultado.classList.add("rojo");
    resultado.innerHTML = "REALIZAR<br>PRUEBA<br>ALCOHOTEST";
}
    setTimeout(() => {
        resultado.classList.remove("verde", "rojo");
        resultado.innerHTML = "";

        resultado.style.width = "";
        resultado.style.height = "";
        resultado.style.display = "";
        resultado.style.justifyContent = "";
        resultado.style.alignItems = "";
        resultado.style.borderRadius = "";
        resultado.style.color = "";
        resultado.style.padding = "";
        resultado.style.boxShadow = "";

        mensaje.style.display = "block";
        boton.style.display = "block";
    }, 1000);
}

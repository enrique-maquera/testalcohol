function iniciarSorteo() {

    const mensaje = document.getElementById("mensajeInicio");
    const resultado = document.getElementById("resultado");
    const boton = document.getElementById("btnLogo");

    mensaje.style.display = "none";
    boton.style.display = "none";

    const esVerde = Math.random() < 0.70;

    if (esVerde) {
        document.body.classList.add("verde");
        resultado.innerHTML = "CONTINÚE";
    } else {
        document.body.classList.add("rojo");
        resultado.innerHTML = "REALIZAR PRUEBA";
    }

    setTimeout(() => {

        document.body.classList.remove("verde", "rojo");

        resultado.innerHTML = "";

        mensaje.style.display = "block";
        boton.style.display = "block";

    }, 1000);
}
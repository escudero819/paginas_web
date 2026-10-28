document.addEventListener('DOMContentLoaded', () => {

    const formReserva = document.getElementById('form-reserva');
    // 1. Evita que la página se recargue al enviar el formulario
    formReserva.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        // 2. nos conectamos con la ruta de reserva y recibimos la respuesta
        try {
            const respuesta = await fetch("/reservar_mesa", {
                method: "POST",
                body: new FormData(formReserva)
            });
            const resultado = await respuesta.json()
            if (!respuesta.ok) {
                throw new Error(
                    resultado.error || "no se pudo guardar la reserva"
                );
            }
            alert(resultado.mensaje);

        } catch (error) {
            alert("Error: " + error.message);
        }
        formReserva.reset(); // Limpiamos el formulario
    });
});
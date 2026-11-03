document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LEER LA URL PARA AUTO-COMPLETAR LA CLASE
    // URLSearchParams analiza los datos que vienen después del "?" en la dirección web
    const parametrosURL = new URLSearchParams(window.location.search);
    const claseDesdeURL = parametrosURL.get('clase'); // Obtiene "Yoga", "Crossfit", etc.

    // Si detectamos que la URL trajo una clase, la seleccionamos en el menú
    if (claseDesdeURL) {
        const selectClase = document.getElementById('clase');
        
        // Buscamos cuál opción del menú (option) coincide con el nombre que vino en la URL
        for (let i = 0; i < selectClase.options.length; i++) {
            if (selectClase.options[i].value === claseDesdeURL) {
                selectClase.selectedIndex = i;
                break;
            }
        }
    }

    // 2. MANEJAR EL ENVÍO DEL FORMULARIO
    const formulario = document.getElementById('formInscripcion');
    
    formulario.addEventListener('submit', async (evento) => {
        // Evitamos que la página parpadee o se recargue al tocar el botón
        evento.preventDefault(); 

        try {
            const respuesta = await fetch("/inscripcion", {
                method: "POST",
                body: new FormData(formulario) // Enviamos todos los datos del formulario
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(resultado.error || "No se pudo procesar la inscripcion")
            }
                alert(resultado.mensaje);
        } catch (error) {
            alert("Hubo un error al enviar la inscripción. Por favor, inténtalo de nuevo.");
        }
        formulario.reset(); // Limpiamos el formulario después de enviarlo
    });
});
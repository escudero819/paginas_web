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
    
    formulario.addEventListener('submit', (evento) => {
        // Evitamos que la página parpadee o se recargue al tocar el botón
        evento.preventDefault(); 

        // Capturamos los datos que el usuario escribió o eligió
        const nombre = document.getElementById('nombre').value;
        const clase = document.getElementById('clase').value;
        const dias = document.getElementById('dias').value;
        const turno = document.getElementById('turno').value;

        // Simulamos un envío exitoso con un mensaje en pantalla
        alert(`¡Inscripción exitosa!\n\nBienvenido/a al equipo, ${nombre}. Hemos registrado tu solicitud para ${clase}, ${dias} por semana en el turno ${turno}. Nos pondremos en contacto contigo pronto.`);
        
        // Vaciamos el formulario para dejarlo limpio
        formulario.reset();
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const selectDestino = document.getElementById('destino');
    const selectMes = document.getElementById('mes');
    const selectSemana = document.getElementById('semana');
    
    let destinosData = []; 
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // 1. Cargar el CSV y llenar destinos
    fetch('/static/data/destinos.csv')
        .then(res => res.text())
        .then(csv => {
            const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
            selectDestino.innerHTML = '<option value="" disabled selected>Seleccioná un destino...</option>';
            
            for (let i = 1; i < lineas.length; i++) {
                const col = lineas[i].split(';');
                if (col.length < 6) continue;

                const destinoObj = {
                    nombre: col[0].trim(),
                    fechaInicio: col[4].trim(), // ej: "21/12"
                    fechaFin: col[5].trim()     // ej: "20/03"
                };
                destinosData.push(destinoObj);
                selectDestino.innerHTML += `<option value="${destinoObj.nombre}">${destinoObj.nombre}</option>`;
            }
        })
        .catch(err => console.error("Error cargando CSV:", err));

    // 2. Al elegir Destino -> Calcular y mostrar los Meses disponibles
    selectDestino.addEventListener('change', (e) => {
        const nombreElegido = e.target.value;
        const destino = destinosData.find(d => d.nombre === nombreElegido);
        
        if (destino) {
            selectMes.innerHTML = '<option value="" disabled selected>Elegí un mes...</option>';
            
            // Extraer el número de mes (Ej: "21/12" -> mes 12)
            const mesIni = parseInt(destino.fechaInicio.split('/')[1]) - 1; // Restamos 1 porque los arrays empiezan en 0
            const mesFin = parseInt(destino.fechaFin.split('/')[1]) - 1;
            
            let mesesDisponibles = [];
            
            // Lógica para saber qué meses agregar (si cruza de año o no)
            if (mesIni <= mesFin) {
                for (let i = mesIni; i <= mesFin; i++) mesesDisponibles.push(nombresMeses[i]);
            } else {
                // Caso Diciembre (11) a Marzo (2)
                for (let i = mesIni; i <= 11; i++) mesesDisponibles.push(nombresMeses[i]);
                for (let i = 0; i <= mesFin; i++) mesesDisponibles.push(nombresMeses[i]);
            }
            
            // Inyectar los meses calculados
            mesesDisponibles.forEach(mes => {
                selectMes.innerHTML += `<option value="${mes}">${mes}</option>`;
            });

            selectMes.disabled = false;
            
            // Resetear y bloquear semanas hasta que elija el mes
            selectSemana.innerHTML = '<option value="" disabled selected>Elegí el mes primero</option>';
            selectSemana.disabled = true;
        }
    });

    // 3. Al elegir Mes -> Mostrar las 4 opciones de Semanas
    selectMes.addEventListener('change', () => {
        selectSemana.innerHTML = `
            <option value="" disabled selected>Elegí la semana...</option>
            <option value="Del 1 al 7">Del 1 al 7</option>
            <option value="Del 8 al 14">Del 8 al 14</option>
            <option value="Del 15 al 21">Del 15 al 21</option>
            <option value="Del 22 al 28">Del 22 al 28</option>
        `;
        selectSemana.disabled = false;
    });

    // 4. Capturar el envío del formulario
    const formViaje = document.getElementById('form-viaje');

    formViaje.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Evita que la página se recargue y borre los datos

        // Recolecta automáticamente todos los campos del formulario que tengan el atributo 'name'
        const formData = new FormData(formViaje);

        try {
            // Enviamos la petición POST al servidor en la ruta /reservar
            const respuesta = await fetch('/reservar', {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                // Muestra la alerta dinámica generada por Python con el precio total
                alert(`¡Gracias!\n\n${resultado.mensaje}\n\nUn asesor VIP se contactará con usted a la brevedad.`);

                // Limpiamos el formulario para que quede como nuevo
                formViaje.reset();

                // Volvemos a bloquear los selectores de mes y semana
                selectMes.innerHTML = '<option value="" disabled selected>Primero elegí un destino</option>';
                selectMes.disabled = true;
                selectSemana.innerHTML = '<option value="" disabled selected>Elegí el mes primero</option>';
                selectSemana.disabled = true;
            } else {
                // Muestra el mensaje de error si el servidor rechaza la reserva (ej. campos vacíos)
                alert("Error en la reserva: " + resultado.error);
            }
        } catch (error) {
            console.error("Error conectando con el servidor:", error);
            alert("Hubo un problema de conexión al procesar la reserva. Intente nuevamente.");
        }
    });
});
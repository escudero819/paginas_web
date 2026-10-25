document.addEventListener('DOMContentLoaded', () => {
    const contenedorDestinos = document.getElementById('contenedor-destinos');
    
    // ESTADO GLOBAL DE LA PÁGINA (1, 2, 3 o 4)
    // Cambiá este número para simular el paso del tiempo y ver cómo cambia el inicio
    const estadoGlobal = "3"; 

    fetch('/static/data/destinos.csv')
        .then(respuesta => {
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo CSV");
            return respuesta.text();
        })
        .then(textoCsv => {
            const lineas = textoCsv.split('\n').filter(linea => linea.trim() !== '');
            
            contenedorDestinos.innerHTML = ''; // Limpiar contenedor
            
            // Recorrer el CSV saltando la primera línea (encabezados)
            for (let i = 1; i < lineas.length; i++) {
                const columnas = lineas[i].split(';');
                if (columnas.length < 7) continue; // Actualizado a 8 para incluir el precio
                
                const nombre = columnas[0].trim();
                const imagen = columnas[1].trim();
                const descripcion = columnas[2].trim();
                const estadoDestino = columnas[3].trim();
                const temporada = columnas[4].trim();
                const fechaInicio = columnas[5].trim();
                const fechaFin = columnas[6].trim();
                
                // Extracción de la octava columna (índice 7)
                const precio = columnas[7] ? columnas[7].trim() : "Consultar";

                if (estadoDestino === estadoGlobal) {
                    const htmlTarjeta = `
                        <article class="tarjeta">
                            <div class="tarjeta-img-wrapper">
                                <img src="/static/${imagen}" alt="Imagen de ${nombre}">
                                <div class="overlay-resenas">
                                    <a href="comentarios.html?destino=${encodeURIComponent(nombre)}" class="btn-resena">Ver Reseñas</a>
                                </div>
                            </div>
                            <div class="tarjeta-info">
                                <h3 class="destinos">${nombre}</h3>
                                <p>${descripcion}</p>
                                
                                <!-- Etiqueta de precio inyectada aquí -->
                                <p style="font-size: 1.3rem; font-weight: bold; color: #1A5276; margin: 15px 0;">
                                    Desde $${precio} <span style="font-size: 0.9rem; font-weight: normal; color: #555;">por pasajero</span>
                                </p>
                                
                                <a href="reserva.html" class="btn-reserva-tarjeta">Reservar Destino</a>
                            </div>
                        </article>
                    `;
                    contenedorDestinos.innerHTML += htmlTarjeta;
                }
            }
        })
        .catch(error => {
            console.error(error);
            contenedorDestinos.innerHTML = '<p style="text-align: center; width: 100%;">No hay destinos disponibles en este momento.</p>';
        });

        // =========================================
        // LÓGICA DEL CONTADOR DE PROMOCIÓN
        // =========================================
        
        // Simular que la oferta termina en 2 días, 14 horas y 30 minutos desde AHORA
        const tiempoOferta = new Date().getTime() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (30 * 60 * 1000);

        const intervaloContador = setInterval(function() {
            const ahora = new Date().getTime();
            const distancia = tiempoOferta - ahora;

            // Cálculos matemáticos para días, horas, minutos y segundos
            const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

            // Inyectar en el HTML (agregando un '0' si es menor a 10 para que quede estético)
            document.getElementById("dias").innerText = dias < 10 ? '0' + dias : dias;
            document.getElementById("horas").innerText = horas < 10 ? '0' + horas : horas;
            document.getElementById("minutos").innerText = minutos < 10 ? '0' + minutos : minutos;
            document.getElementById("segundos").innerText = segundos < 10 ? '0' + segundos : segundos;

            // Si la cuenta regresiva termina
            if (distancia < 0) {
                clearInterval(intervaloContador);
                document.getElementById("contador-promo").innerHTML = "<h3 style='color: #E74C3C;'>¡LA OFERTA HA FINALIZADO!</h3>";
            }
        }, 1000);
});
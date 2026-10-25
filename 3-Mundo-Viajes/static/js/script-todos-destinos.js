document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-todos-destinos');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    let destinosGlobales = []; // Guarda los datos para no recargar el CSV al filtrar

    fetch('/static/data/destinos.csv')
        .then(respuesta => respuesta.text())
        .then(textoCsv => {
            const lineas = textoCsv.split('\n').filter(linea => linea.trim() !== '');
            
            // Procesar CSV a partir de la fila 1 (ignorando encabezados)
            destinosGlobales = lineas.slice(1).map(linea => {
                const col = linea.split(';');
                return {
                    nombre: col[0]?.trim(),
                    imagen: col[1]?.trim(),
                    descripcion: col[2]?.trim(),
                    estado: col[3]?.trim(),
                    temporada: col[4]?.trim().toLowerCase(),
                    fechaInicio: col[5]?.trim(),
                    fechaFin: col[6]?.trim(),
                    precio: col[7] ? col[7].trim() : "Consultar"
                };
            });

            renderizarDestinos('todos'); // Dibuja todos al inicio
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML = '<p>Error al cargar el catálogo de destinos.</p>';
        });

    function renderizarDestinos(filtroTemporada) {
        contenedor.innerHTML = '';
        
        const destinosFiltrados = filtroTemporada === 'todos' 
            ? destinosGlobales 
            : destinosGlobales.filter(d => d.temporada === filtroTemporada);

        if (destinosFiltrados.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; width: 100%;">No hay destinos para esta temporada.</p>';
            return;
        }

        // Renderizado usando forEach
        destinosFiltrados.forEach(d => {
            contenedor.innerHTML += `
                <article class="tarjeta" data-temporada="${d.temporada}">
                    <div class="tarjeta-img-wrapper">
                        <img src="/static/${d.imagen}" alt="Imagen de ${d.nombre}">
                        <div class="overlay-resenas">
                            <a href="comentarios.html?destino=${encodeURIComponent(d.nombre)}" class="btn-resena">Ver Reseñas</a>
                        </div>
                    </div>
                    <div class="tarjeta-info">
                        <h3 class="destinos">${d.nombre}</h3>
                        
                        <span class="fechas-disponibles">${d.fechaInicio} - ${d.fechaFin}</span>
                        <p>${d.descripcion}</p>
                        
                        <p style="font-size: 1.3rem; font-weight: bold; color: #1A5276; margin: 15px 0;">
                            Desde $${d.precio} <span style="font-size: 0.9rem; font-weight: normal; color: #555;">por pasajero</span>
                        </p>
                        
                        <a href="reserva.html" class="btn-reserva-tarjeta">Reservar Destino</a>
                    </div>
                </article>
            `;
        });
    }

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesFiltro.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');
            
            const temporadaSeleccionada = e.target.getAttribute('data-temporada');
            renderizarDestinos(temporadaSeleccionada);
        });
    });
});
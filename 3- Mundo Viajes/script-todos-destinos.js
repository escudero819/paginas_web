document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-todos-destinos');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    let destinosData = []; 

    // Cargar CSV
    fetch('destinos.csv')
        .then(res => res.text())
        .then(csv => {
            const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
            
            for (let i = 1; i < lineas.length; i++) {
                const col = lineas[i].split(';');
                if (col.length < 6) continue;

                destinosData.push({
                    nombre: col[0].trim(),
                    imagen: col[1].trim(),
                    descripcion: col[2].trim(),
                    estado: col[3].trim(),
                    fechaInicio: col[4].trim(),
                    fechaFin: col[5].trim()
                });
            }
            // Iniciar mostrando todos
            renderizarDestinos('todos');
        })
        .catch(err => console.error("Error cargando CSV:", err));

    // Función para renderizar
    function renderizarDestinos(filtro) {
        contenedor.innerHTML = ''; 
        
        const destinosFiltrados = filtro === 'todos' 
            ? destinosData 
            : destinosData.filter(d => d.estado === filtro);

        destinosFiltrados.forEach(destino => {
            const html = `
                <article class="tarjeta">
                    <!-- Envoltorio de imagen con el botón de reseñas -->
                    <div class="tarjeta-img-wrapper">
                        <img src="${destino.imagen}" alt="${destino.nombre}">
                        <div class="overlay-resenas">
                            <a href="comentarios.html?destino=${encodeURIComponent(destino.nombre)}" class="btn-resena">Ver Reseñas</a>
                        </div>
                    </div>
                    
                    <!-- Información de la tarjeta CON la etiqueta de fechas -->
                    <div class="tarjeta-info">
                        <span class="fechas-disponibles">Disponible: ${destino.fechaInicio} al ${destino.fechaFin}</span>
                        <h3 class="destinos">${destino.nombre}</h3>
                        <p>${destino.descripcion}</p>
                    </div>
                </article>
            `
            contenedor.innerHTML += html;
        });
    }

    // Lógica de los botones
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Actualizar estilo visual del botón activo
            botonesFiltro.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');

            // Filtrar contenido
            const temporada = e.target.getAttribute('data-temporada');
            renderizarDestinos(temporada);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-comentarios');
    const titulo = document.getElementById('titulo-destino');

    // Extraer el nombre del destino de la URL (ej: ?destino=Patagonia)
    const parametrosUrl = new URLSearchParams(window.location.search);
    const destinoSeleccionado = parametrosUrl.get('destino');

    // Si alguien entra a comentarios.html directamente sin elegir destino
    if (!destinoSeleccionado) {
        titulo.innerText = "Destino no especificado";
        contenedor.innerHTML = "<p>Por favor, seleccioná un destino desde nuestro catálogo para ver sus reseñas.</p>";
        return;
    }

    // Poner el nombre del destino en el título H1
    titulo.innerText = `Reseñas de ${destinoSeleccionado}`;

    // Cargar el CSV de comentarios
    fetch('comentarios.csv')
        .then(respuesta => respuesta.text())
        .then(csv => {
            const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
            let comentariosEncontrados = 0;
            contenedor.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

            for (let i = 1; i < lineas.length; i++) {
                const col = lineas[i].split(';');
                if (col.length < 4) continue;

                const usuario = col[0].trim();
                const destinoCsv = col[1].trim();
                const comentarioTexto = col[2].trim();
                const estrellas = col[3].trim();

                // Si el destino del CSV coincide con la URL, dibujamos la tarjeta
                if (destinoCsv === destinoSeleccionado) {
                    comentariosEncontrados++;
                    contenedor.innerHTML += `
                        <div class="caja-comentario">
                            <div class="comentario-header">
                                <span class="comentario-usuario">👤 ${usuario}</span>
                                <span>${estrellas}</span>
                            </div>
                            <p style="margin: 0; color: #555; font-style: italic;">"${comentarioTexto}"</p>
                        </div>
                    `;
                }
            }

            // Si el bucle termina y no encontró coincidencias
            if (comentariosEncontrados === 0) {
                contenedor.innerHTML = `<p>Aún no hay reseñas para ${destinoSeleccionado}. ¡Sé el primero en viajar y contarnos tu experiencia!</p>`;
            }
        })
        .catch(err => {
            console.error(err);
            contenedor.innerHTML = "<p>Error al cargar las reseñas.</p>";
        });
});
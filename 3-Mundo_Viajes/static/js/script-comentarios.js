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
    fetch('/static/data/comentarios.csv')
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
    

    // --- NUEVA LÓGICA PARA AGREGAR COMENTARIOS ---
    const btnValidar = document.getElementById('btn-validar-dni');
    const inputDni = document.getElementById('dni-validacion');
    const msjValidacion = document.getElementById('mensaje-validacion');
    const pasoValidacion = document.getElementById('paso-validacion');
    const formComentario = document.getElementById('form-comentario');
    
    // Configurar el input hidden del destino
    document.getElementById('destino-comentario').value = destinoSeleccionado;

    // Lógica temporal para mostrar el formulario (El backend real hace la validación completa)
    // Como no podemos hacer un endpoint solo para validar sin crear una ruta nueva en Flask, 
    // lo enviamos todo junto al intentar publicar.
    
    btnValidar.addEventListener('click', () => {
        const dni = inputDni.value.trim();
        if(dni) {
            document.getElementById('dni-confirmado').value = dni;
            pasoValidacion.style.display = 'none';
            formComentario.style.display = 'block';
        } else {
            msjValidacion.innerText = "Por favor ingresa un DNI.";
            msjValidacion.style.display = 'block';
        }
    });

    formComentario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formComentario);

        try {
            const respuesta = await fetch('/agregar_comentario', {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert(resultado.mensaje);
                location.reload(); // Recarga la página para ver el nuevo comentario
            } else {
                // Si la reserva no es válida o hay error
                alert("Error: " + resultado.error);
                // Volver al paso de validación
                formComentario.style.display = 'none';
                pasoValidacion.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
            alert("Hubo un problema de conexión.");
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // 1. CARGAR OPINIONES DESDE EL CSV
    const contenedorTestimonios = document.getElementById('grid-testimonios');

    fetch('/static/opiniones.csv')
        .then(res => {
            if(!res.ok) throw new Error("No se pudo cargar el CSV");
            return res.text();
        })
        .then(csv => {
            // Limpiamos el mensaje de "Cargando..."
            contenedorTestimonios.innerHTML = '';
            
            const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
            
            // Iteramos desde 1 para saltar los encabezados
            for(let i = 1; i < lineas.length; i++) {
                const columnas = lineas[i].split(';');
                if(columnas.length < 4) continue;

                const nombre = columnas[0].trim();
                const especialidad = columnas[1].trim();
                const claves = columnas[2].trim().split(','); // Separamos las palabras clave
                const contenido = columnas[3].trim().replace(/^"|"$/g, ''); // Quitamos comillas extra

                // Generamos los tags HTML para las palabras clave
                let tagsHtml = '';
                claves.forEach(clave => {
                    tagsHtml += `<span class="tag-blanda" style="margin-right: 8px; font-size: 0.75rem;">${clave.trim()}</span>`;
                });

                // Inyectamos la tarjeta
                contenedorTestimonios.innerHTML += `
                    <article class="card-testimonio">
                        <p class="testimonio-contenido">"${contenido}"</p>
                        <div class="testimonio-autor">
                            <h4>${nombre}</h4>
                            <span>${especialidad}</span>
                            <div class="tags-container">
                                ${tagsHtml}
                            </div>
                        </div>
                    </article>
                `;
            }
        })
        .catch(err => {
            console.error(err);
            contenedorTestimonios.innerHTML = '<p>No hay opiniones disponibles en este momento.</p>';
        });

    // 2. SIMULAR ENVÍO DEL FORMULARIO
    const formOpinion = document.getElementById('form-opinion');
    if(formOpinion) {
        formOpinion.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitamos que recargue la página

            try {
                const respuesta = await fetch("/agregar", {
                    method: "POST",
                    body: new FormData(formOpinion)
                });
                const resultado = await respuesta.json()
                if (!respuesta.ok) {
                    throw new Error(
                        resultado.error || "no se pudo guardar su comentario"
                    );
                }
                alert(resultado.mensaje);

                // Opcional: Recargar los testimonios para ver el nuevo
                location.reload();
            }
            catch (error){
                alert("Error: " + error.message)
            }
            formOpinion.reset(); // Limpiamos el formulario
        });
    }
});
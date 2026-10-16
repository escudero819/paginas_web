document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener qué proyecto queremos cargar (Ej: proyecto.html?id=problema-presion)
    const parametros = new URLSearchParams(window.location.search);
    const proyectoId = parametros.get('id');

    if (!proyectoId) {
        document.getElementById('proyecto-titulo').innerText = "Proyecto no especificado";
        return;
    }

    // 2. Cargar el JSON dinámicamente usando Fetch
    fetch(`jsons/${proyectoId}.json`)
        .then(res => {
            if (!res.ok) throw new Error("No se encontró el archivo JSON");
            return res.json(); // Transformación mágica directa a Objeto JavaScript
        })
        .then(proyecto => {
            // 3. Inyectar datos simples
            document.getElementById('proyecto-titulo').innerText = proyecto.titulo;
            document.getElementById('nombre-proyecto-span').innerText = proyecto.titulo;
            document.getElementById('proyecto-hero').style.backgroundImage = `url('${proyecto.imagenHero}')`;
            document.getElementById('proyecto-desc').innerText = proyecto.descripcion;
            document.getElementById('texto-contribucion').innerText = proyecto.contribucion;

            // 4. Inyectar Listas (Viñetas)
            const ulEquipo = document.getElementById('lista-equipo');
            proyecto.equipo.forEach(persona => {
                ulEquipo.innerHTML += `<li>${persona}</li>`;
            });

            const ulRoles = document.getElementById('lista-roles');
            proyecto.roles.forEach(rol => {
                ulRoles.innerHTML += `<li>${rol}</li>`;
            });

            // 5. Inyectar Galería de Imágenes (Ahora como Carrusel)
            const contenedorGaleria = document.getElementById('proyecto-galeria');
            
            proyecto.galeria.forEach((imgSrc, index) => {
                // A la primera imagen (índice 0) le ponemos la clase 'activo' por defecto
                const esPrimera = index === 0 ? 'activo' : '';
                contenedorGaleria.innerHTML += `<img src="${imgSrc}" class="slide ${esPrimera}" alt="Captura del proyecto">`;
            });

            // 5.1 Iniciar la animación del Carrusel
            const slides = document.querySelectorAll('.slide');
            let slideActual = 0;

            // Solo iniciamos el temporizador si el proyecto tiene más de 1 imagen
            if (slides.length > 1) {
                setInterval(() => {
                    // 1. Le quitamos la clase 'activo' a la imagen actual (se desvanece)
                    slides[slideActual].classList.remove('activo');
                    
                    // 2. Calculamos cuál es la siguiente. 
                    // El operador % (módulo) hace la magia: si hay 3 imágenes (0, 1, 2), al sumar 1 al índice 2, vuelve a dar 0.
                    slideActual = (slideActual + 1) % slides.length;
                    
                    // 3. Le ponemos la clase 'activo' a la nueva imagen (aparece)
                    slides[slideActual].classList.add('activo');
                }, 4000); // Cambia de diapositiva cada 4 segundos (4000 milisegundos)
            }

            // 6. Inyectar Etiquetas (Tags)
            const contenedorHerramientas = document.getElementById('tags-herramientas');
            proyecto.herramientas.forEach(herramienta => {
                contenedorHerramientas.innerHTML += `<span class="tag-herramienta">${herramienta}</span>`;
            });

            const contenedorBlandas = document.getElementById('tags-blandas');
            proyecto.blandas.forEach(blanda => {
                contenedorBlandas.innerHTML += `<span class="tag-blanda">${blanda}</span>`;
            });

        })
        .catch(error => {
            console.error(error);
            document.getElementById('proyecto-titulo').innerText = "Error al cargar el proyecto";
        });
});
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

            // 5. Inyectar Galería de Imágenes
            const contenedorGaleria = document.getElementById('proyecto-galeria');
            proyecto.galeria.forEach(imgSrc => {
                contenedorGaleria.innerHTML += `<img src="${imgSrc}" alt="Captura del proyecto">`;
            });

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
document.addEventListener('DOMContentLoaded', () => {
    const gridFormacion = document.getElementById('grid-formacion');
    const listaTitulos = document.getElementById('lista-titulos');

    // 1. Cargar las 3 etapas de formación (Primaria, Secundaria, Universidad)
    const urlsFormacion = [
        '/static/jsons/primaria.json',
        '/static/jsons/secundaria.json',
        '/static/jsons/universidad.json'
    ];

    Promise.all(urlsFormacion.map(url => fetch(url).then(res => res.json())))
        .then(resultados => {
            resultados.forEach(formacion => {
                gridFormacion.innerHTML += `
                    <article class="card-investigacion">
                        <span class="tag-lenguaje">${formacion.fechas}</span>
                        <h3>${formacion.etapa}</h3>
                        <h4 style="color: var(--color-texto); margin-bottom: 15px;">${formacion.institucion}</h4>
                        <p>${formacion.descripcion}</p>
                    </article>
                `;
            });
        })
        .catch(err => {
            console.error("Error cargando formaciones:", err);
            gridFormacion.innerHTML = '<p>Error al cargar la información académica.</p>';
        });

    // 2. Cargar los títulos obtenidos
    fetch('/static/jsons/titulos.json')
        .then(res => res.json())
        .then(titulos => {
            titulos.forEach(titulo => {
                listaTitulos.innerHTML += `
                    <li class="item-titulo">
                        <div class="titulo-info">
                            <h4>${titulo.nombre}</h4>
                            <p>${titulo.institucion}</p>
                        </div>
                        <div class="titulo-tiempo">${titulo.tiempo}</div>
                    </li>
                `;
            });
        })
        .catch(err => {
            console.error("Error cargando títulos:", err);
            listaTitulos.innerHTML = '<p>Error al cargar los títulos.</p>';
        });
});
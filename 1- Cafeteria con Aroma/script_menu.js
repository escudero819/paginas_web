document.addEventListener('DOMContentLoaded', () => {
    
    // Contenedores
    const secPromos = document.getElementById('sec-promos');
    const secCombos = document.getElementById('sec-combos');
    const secClasicos = document.getElementById('sec-clasicos');
    const secEspecialidad = document.getElementById('sec-especialidad');
    const secPasteleria = document.getElementById('sec-pasteleria');

    fetch('menu.csv')
        .then(respuesta => respuesta.text())
        .then(textoCsv => {
            const lineas = textoCsv.split('\n').filter(linea => linea.trim() !== '');

            for (let i = 1; i < lineas.length; i++) {
                const columnas = lineas[i].split(';');
                if (columnas.length < 8) continue;

                const producto = columnas[0].trim();
                const categoria = columnas[1].trim().toLowerCase();
                const precio = columnas[2].trim();
                const descripcion = columnas[3].trim();
                const pocillo = columnas[4].trim();
                const jarrito = columnas[5].trim();
                const taza = columnas[6].trim();
                const imagen = columnas[7].trim();

                // GENERADOR DE PRECIOS (Unico o por Tamaños)
                let stringPrecios = '';
                if (precio !== '') {
                    stringPrecios = `$${precio}`;
                } else {
                    let tamanios = [];
                    if (pocillo !== '') tamanios.push(`P: $${pocillo}`);
                    if (jarrito !== '') tamanios.push(`J: $${jarrito}`);
                    if (taza !== '') tamanios.push(`T: $${taza}`);
                    stringPrecios = tamanios.join(' | ');
                }

                // SI ES PROMO O COMBO -> GENERAMOS TARJETA CON IMAGEN
                if (categoria === 'promo' || categoria === 'combo') {
                    let badge = categoria === 'promo' ? `<div class="badge-promo">¡Promo!</div>` : '';
                    let htmlTarjeta = `
                        <article class="tarjeta-hover">
                            ${badge}
                            <h3>${producto}</h3>
                            <img src="${imagen}" alt="${producto}">
                            <p>${descripcion}</p>
                            <p class="precio-unico">${stringPrecios}</p>
                        </article>
                    `;
                    
                    if (categoria === 'promo') secPromos.innerHTML += htmlTarjeta;
                    if (categoria === 'combo') secCombos.innerHTML += htmlTarjeta;
                } 
                
                // SI ES CAFÉ O PASTELERÍA -> GENERAMOS TEXTO ELEGANTE
                else {
                    let htmlTexto = `
                        <li class="item-texto">
                            <div class="item-cabecera">
                                <span class="item-nombre">${producto}</span>
                                <span class="item-precios">${stringPrecios}</span>
                            </div>
                            <p class="item-desc">${descripcion}</p>
                        </li>
                    `;

                    if (categoria === 'clasico') secClasicos.innerHTML += htmlTexto;
                    if (categoria === 'especialidad') secEspecialidad.innerHTML += htmlTexto;
                    if (categoria === 'pasteleria') secPasteleria.innerHTML += htmlTexto;
                }
            }
        })
        .catch(error => console.error("Error cargando el menú:", error));
});
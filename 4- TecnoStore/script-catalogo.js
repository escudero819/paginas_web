document.addEventListener('DOMContentLoaded', () => {
    // 1. ELEMENTOS GLOBALES DEL DOM (Aquí solucionamos tu error principal)
    const contenedorSolapas = document.getElementById('contenedor-solapas');
    const contenedorProductos = document.getElementById('contenedor-productos');
    const tituloCategoria = document.getElementById('titulo-categoria');
    const heroCatalogo = document.getElementById('hero-catalogo');
    const botonesCategoria = document.querySelectorAll('.btn-categoria'); // Ahora JS sí sabe qué son

    // ESTADO DE LA APLICACIÓN
    let productosData = []; // Memoria de productos de la categoría actual
    let carritoMemoria = []; // Memoria de tu carrito (no se borra al cambiar de categoría)

    // 2. EXTRAER PARÁMETRO INICIAL (Cuando el usuario viene desde index.html)
    const parametrosUrl = new URLSearchParams(window.location.search);
    const catIdInicial = parametrosUrl.get('cat');

    if (!catIdInicial) {
        tituloCategoria.innerText = "Categoría no encontrada";
        return; 
    }

    // 3. FUNCIÓN MAESTRA: Carga todo lo relacionado a una categoría
    function cargarVistaCategoria(catId) {
        // ¡CRÍTICO! Limpiamos el array viejo para que no se mezclen celulares con licuadoras
        productosData = []; 
        contenedorProductos.innerHTML = '<p style="text-align:center;">Cargando catálogo...</p>';

        // Resaltar el botón correcto en el nav
        botonesCategoria.forEach(b => {
            b.classList.remove('activo');
            if(b.getAttribute('data-categoria') === catId) {
                b.classList.add('activo');
            }
        });

        fetch('categorias.csv')
            .then(res => res.text())
            .then(csv => {
                const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
                let configuracionEncontrada = null;

                for(let i = 1; i < lineas.length; i++) {
                    const columnas = lineas[i].split(';');
                    if (columnas[0].trim() === catId) {
                        configuracionEncontrada = {
                            titulo: columnas[1].trim(),
                            tipos: columnas[2].trim().split(','),
                            imagenHeader: columnas[3] ? columnas[3].trim() : ''
                        };
                        break;
                    }
                }

                if (configuracionEncontrada) {
                    // Actualizamos Título y Fondo
                    tituloCategoria.innerText = configuracionEncontrada.titulo;
                    if (configuracionEncontrada.imagenHeader) {
                        heroCatalogo.style.backgroundImage = `url('${configuracionEncontrada.imagenHeader}')`;
                    }

                    // Reconstruimos las solapas inferiores
                    contenedorSolapas.innerHTML = `<button class="btn-solapa activo" data-tipo="todos">Todos</button>`;
                    configuracionEncontrada.tipos.forEach(tipo => {
                        contenedorSolapas.innerHTML += `<button class="btn-solapa" data-tipo="${tipo}">${tipo}</button>`;
                    });
                    
                    activarFiltros();
                    
                    // Ahora sí, vamos a buscar el CSV de los productos
                    cargarProductosCSV(`${catId}.csv`); 
                } else {
                    tituloCategoria.innerText = "Configuración no encontrada";
                    contenedorProductos.innerHTML = "";
                }
            });
    }

    // 4. CARGAR PRODUCTOS DEL CSV
    function cargarProductosCSV(archivoCSV) {
        fetch(archivoCSV)
            .then(res => res.text())
            .then(csv => {
                const lineas = csv.split('\n').filter(linea => linea.trim() !== '');
                
                for(let i = 1; i < lineas.length; i++) {
                    const col = lineas[i].split(';');
                    if(col.length < 6) continue;

                    productosData.push({
                        tipo: col[0].trim(),
                        nombre: col[1].trim(),
                        imagen: col[2].trim(),
                        descripcion: col[3].trim(),
                        precio: parseFloat(col[4].trim()), // Lo pasamos a número real para matemáticas exactas
                        stock: parseInt(col[5].trim())
                    });
                }
                renderizarProductos('todos');
            })
            .catch(err => {
                contenedorProductos.innerHTML = "<p style='text-align:center;'>No hay productos cargados en esta categoría aún.</p>";
            });
    }

    // 5. DIBUJAR TARJETAS EN PANTALLA
    function renderizarProductos(tipoFiltro) {
        let htmlAcumulado = ''; 
        const filtrados = tipoFiltro === 'todos' ? productosData : productosData.filter(p => p.tipo === tipoFiltro);

        filtrados.forEach(prod => {
            const estadoStock = prod.stock > 0 ? `<span style="color: #10b981; font-size: 0.9rem;">Stock: ${prod.stock}</span>` : `<span style="color: #ef4444; font-size: 0.9rem;">Sin Stock</span>`;
            const disabledBtn = prod.stock > 0 ? '' : 'disabled style="background-color: #555; cursor: not-allowed;"';

            htmlAcumulado += `
                <article class="producto-card">
                    <div class="img-prod-container">
                        <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.style.display='none'">
                    </div>
                    <div class="info-prod-container">
                        <span style="font-size: 0.8rem; color: var(--color-acento); text-transform: uppercase;">${prod.tipo}</span>
                        <h3 style="margin: 5px 0;">${prod.nombre}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-texto-mutado);">${prod.descripcion}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0;">
                            <span class="precio-nuevo">$${prod.precio}</span>
                            ${estadoStock}
                        </div>
                        <button class="btn-comprar btn-agregar-carrito" 
                                data-nombre="${prod.nombre}" 
                                data-precio="${prod.precio}" 
                                ${disabledBtn}>
                            Añadir al carrito
                        </button>
                    </div>
                </article>
            `;
        });

        contenedorProductos.innerHTML = htmlAcumulado;

        // Le enseñamos a los botones "Añadir" a escuchar clics
        const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                const nombreProducto = evento.target.getAttribute('data-nombre');
                const precioProducto = parseFloat(evento.target.getAttribute('data-precio'));
                agregarItemAlCarrito(nombreProducto, precioProducto);
            });
        });
    }

    // ==========================================
    // 6. EVENTO DEL MENÚ DE NAVEGACIÓN SUPERIOR
    // ==========================================
    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const nuevaCat = e.target.getAttribute('data-categoria');
            
            // TRUCO PRO: Cambia la URL visualmente para que si el usuario comparte el link, funcione.
            window.history.pushState({}, '', `catalogo.html?cat=${nuevaCat}`);
            
            // Llamamos a la función maestra para que redibuje toda la pantalla
            cargarVistaCategoria(nuevaCat);
        });
    });

    // ==========================================
    // 7. LÓGICA DEL CARRITO DE COMPRAS
    // ==========================================
    const sidebarCarrito = document.getElementById('carrito-sidebar');
    const btnAbrirCarrito = document.getElementById('btn-abrir-carrito');
    const btnCerrarCarrito = document.getElementById('cerrar-carrito');
    const contenedorItemsCarrito = document.getElementById('carrito-items');
    const textoTotalCarrito = document.getElementById('carrito-total-precio');
    const textoContador = document.getElementById('contador-carrito');

    btnAbrirCarrito.addEventListener('click', () => sidebarCarrito.classList.remove('carrito-oculto'));
    btnCerrarCarrito.addEventListener('click', () => sidebarCarrito.classList.add('carrito-oculto'));

    function agregarItemAlCarrito(nombre, precio) {
        const productoExistente = carritoMemoria.find(item => item.nombre === nombre);

        if (productoExistente) {
            productoExistente.cantidad += 1; 
        } else {
            carritoMemoria.push({ nombre: nombre, precio: precio, cantidad: 1 });
        }
        actualizarVistaCarrito();
        sidebarCarrito.classList.remove('carrito-oculto');
    }

    function actualizarVistaCarrito() {
        if (carritoMemoria.length === 0) {
            contenedorItemsCarrito.innerHTML = '<p style="text-align: center; color: var(--color-texto-mutado);">El carrito está vacío</p>';
            textoTotalCarrito.innerText = '$0.00';
            textoContador.innerText = '0';
            return;
        }

        let htmlCarrito = '';
        let precioTotal = 0;
        let cantidadTotalItems = 0;

        carritoMemoria.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            precioTotal += subtotal;
            cantidadTotalItems += item.cantidad;

            htmlCarrito += `
                <div class="item-carrito">
                    <div>
                        <h4 style="margin: 0; font-size: 1rem;">${item.nombre}</h4>
                        <span style="font-size: 0.8rem; color: var(--color-texto-mutado);">$${item.precio} x ${item.cantidad}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: bold; color: var(--color-texto);">$${subtotal}</span>
                        <button class="btn-eliminar-item" data-nombre="${item.nombre}">X</button>
                    </div>
                </div>
            `;
        });

        contenedorItemsCarrito.innerHTML = htmlCarrito;
        textoTotalCarrito.innerText = `$${precioTotal.toFixed(2)}`;
        textoContador.innerText = cantidadTotalItems;

        const botonesEliminar = document.querySelectorAll('.btn-eliminar-item');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', (evento) => {
                const nombreItem = evento.target.getAttribute('data-nombre');
                eliminarItemDelCarrito(nombreItem);
            });
        });
    }

    function eliminarItemDelCarrito(nombre) {
        const indice = carritoMemoria.findIndex(item => item.nombre === nombre);
        if (indice !== -1) {
            if (carritoMemoria[indice].cantidad > 1) {
                carritoMemoria[indice].cantidad -= 1;
            } else {
                carritoMemoria.splice(indice, 1);
            }
        }
        actualizarVistaCarrito();
    }

    function activarFiltros() {
        const botones = document.querySelectorAll('.btn-solapa');
        botones.forEach(btn => {
            btn.addEventListener('click', (e) => {
                botones.forEach(b => b.classList.remove('activo'));
                e.target.classList.add('activo');
                const tipo = e.target.getAttribute('data-tipo');
                renderizarProductos(tipo);
            });
        });
    }

    // ==========================================
    // ARRANQUE INICIAL DE LA APLICACIÓN
    // ==========================================
    cargarVistaCategoria(catIdInicial);
});
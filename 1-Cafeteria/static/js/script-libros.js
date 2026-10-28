document.addEventListener("DOMContentLoaded", () => {
    let catalogoLibros = []; // Se llenará desde el CSV

    const contenedorLibros = document.getElementById("contenedor-libros");
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const inputLibro = document.getElementById("libro-seleccionado");
    const inputRetiro = document.getElementById("fecha-retiro");
    const inputDevolucionVista = document.getElementById("fecha-devolucion-vista");
    const inputDevolucionOculto = document.getElementById("fecha-devolucion");
    const formPrestamo = document.getElementById("form-prestamo");
    const mensajeDevolucion = document.getElementById("mensaje-devolucion");

    const hoy = new Date().toISOString().split("T")[0];
    inputRetiro.min = hoy;

    // 1. Fetch y parseo del archivo CSV
    async function cargarCatalogo() {
        try {
            const respuesta = await fetch('/static/data/catalogo_libros.csv');
            const textoCsv = await respuesta.text();

            // Dividir por líneas y descartar las vacías
            const lineas = textoCsv.split('\n').filter(linea => linea.trim() !== '');
            const encabezados = lineas[0].split(';');

            // Mapear cada línea a un objeto JSON
            catalogoLibros = lineas.slice(1).map(linea => {
                const valores = linea.split(';');
                let libro = {};
                encabezados.forEach((encabezado, index) => {
                    libro[encabezado.trim()] = valores[index] ? valores[index].trim() : '';
                });
                return libro;
            });

            // Renderizar la vista inicial una vez cargados los datos
            mostrarLibros("Todos");
        } catch (error) {
            console.error("Error al cargar el catálogo CSV:", error);
            contenedorLibros.innerHTML = "<p>Error al cargar el catálogo de libros.</p>";
        }
    }

    // 2. Función de renderizado
    function mostrarLibros(categoriaElegida) {
        contenedorLibros.innerHTML = "";

        const librosFiltrados = categoriaElegida === "Todos"
            ? catalogoLibros
            : catalogoLibros.filter(libro => libro.categoria === categoriaElegida);

        librosFiltrados.forEach(libro => {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta-libro");

            tarjeta.innerHTML = `
                <div class="portada-libro">
                    <span class="badge-categoria">${libro.categoria}</span>
                    <img src="${libro.imagen}" alt="Portada de ${libro.titulo}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="placeholder-portada" style="display: none;">
                        <span class="icono-libro">📖</span>
                        <small>Ruta preparada:<br>${libro.imagen}</small>
                    </div>
                </div>
                <div class="contenido-libro">
                    <h3 class="titulo-libro">${libro.titulo}</h3>
                    <p class="autor-libro">Por <strong>${libro.autor}</strong></p>
                    <p class="sintesis-libro">${libro.sintesis}</p>
                    <blockquote class="inmersivo-libro">${libro.inmersivo}</blockquote>
                    <button type="button" class="btn-seleccionar-libro" data-titulo="${libro.titulo}">
                        Solicitar este libro
                    </button>
                </div>
            `;
            contenedorLibros.appendChild(tarjeta);
        });

        document.querySelectorAll(".btn-seleccionar-libro").forEach(boton => {
            boton.addEventListener("click", (e) => {
                inputLibro.value = e.currentTarget.getAttribute("data-titulo");
                document.getElementById("seccion-prestamo").scrollIntoView({ behavior: "smooth" });
                inputLibro.focus();
            });
        });
    }

    // 3. Filtros
    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", () => {
            botonesFiltro.forEach(b => b.classList.remove("activo"));
            boton.classList.add("activo");
            mostrarLibros(boton.getAttribute("data-categoria"));
        });
    });

    // 4. Fechas
    function calcularDevolucion(fechaRetiroStr) {
        if (!fechaRetiroStr) {
            inputDevolucionVista.value = "";
            inputDevolucionOculto.value = "";
            return null;
        }
        const partes = fechaRetiroStr.split("-");
        const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
        fecha.setDate(fecha.getDate() + 14);

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        const formatoCSV = `${anio}-${mes}-${dia}`;
        const formatoLegible = `${dia}/${mes}/${anio}`;

        inputDevolucionVista.value = `${formatoLegible} (14 días)`;
        inputDevolucionOculto.value = formatoCSV;
        return { formatoCSV, formatoLegible };
    }

    inputRetiro.addEventListener("change", (e) => calcularDevolucion(e.target.value));

    // 5. Envío al servidor
    formPrestamo.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fechas = calcularDevolucion(inputRetiro.value);
        if (!fechas) return;

        try {
            const respuesta = await fetch("/reservar_libro", {
                method: "POST",
                body: new FormData(formPrestamo)
            });
            const resultado = await respuesta.json();

            mensajeDevolucion.style.display = "block";
            if (respuesta.ok) {
                mensajeDevolucion.className = "alerta-prestamo exito";
                mensajeDevolucion.innerHTML = `¡Reserva confirmada! ☕📚<br>Libro: <em>"${inputLibro.value}"</em>.<br>Devolución: <strong>${fechas.formatoLegible}</strong>.`;
                formPrestamo.reset();
                inputDevolucionVista.value = "";
            } else {
                mensajeDevolucion.className = "alerta-prestamo error";
                mensajeDevolucion.textContent = resultado.error || "Error al procesar la reserva.";
            }
        } catch (error) {
            mensajeDevolucion.style.display = "block";
            mensajeDevolucion.className = "alerta-prestamo error";
            mensajeDevolucion.textContent = "Error de conexión con el servidor.";
        }
    });

    // Iniciar la carga de datos
    cargarCatalogo();
});
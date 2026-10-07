const urlClases = 'clases.csv';
const urlPrecios = 'precios.csv';

// Aquí guardaremos la información agrupada del CSV
let infoClases = {};

document.addEventListener('DOMContentLoaded', () => {

    // 1. CARGAR PRECIOS DE PLANES (Mantiene tu función original)
    fetch(urlPrecios)
        .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar precios.csv");
            return res.text();
        })
        .then(textoCsv => {
            const lineas = textoCsv.split('\n').filter(l => l.trim() !== '');
            const dictPrecios = {};
            for (let i = 1; i < lineas.length; i++) {
                const [plan, precio] = lineas[i].split(',');
                if (plan && precio) dictPrecios[plan.trim()] = precio.trim();
            }
            document.querySelectorAll('.plan-card').forEach(tarjeta => {
                const planId = tarjeta.getAttribute('data-plan');
                const elementoPrecio = tarjeta.querySelector('.precio-hover');
                elementoPrecio.textContent = dictPrecios[planId] ? dictPrecios[planId] : 'Consultar precio';
            });
        }).catch(err => console.error(err));

    // 2. CARGAR HORARIOS DE CLASES DESDE CSV
    fetch(urlClases)
        .then(res => res.text())
        .then(textoCsv => {
            const filas = textoCsv.trim().split('\n');
            // Recorremos desde la fila 1 para saltar los encabezados
            for (let i = 1; i < filas.length; i++) {
                const columnas = filas[i].split(';');
                if (columnas.length < 5) continue;
                
                const nombreClase = columnas[0];
                if (!infoClases[nombreClase]) infoClases[nombreClase] = [];
                
                // Agrupamos los datos por clase (ej. "Yoga" guarda mañana y tarde)
                infoClases[nombreClase].push({
                    turno: columnas[1],
                    dias: columnas[2],
                    horario: columnas[3],
                    entrenador: columnas[4]
                });
            }
        }).catch(err => console.error("Error cargando clases.csv:", err));


    // 3. LÓGICA DE LA PANTALLA EMERGENTE (MODAL)
    const modal = document.getElementById('modalClase');
    const btnCerrar = document.querySelector('.cerrar-modal');
    const tituloModal = document.getElementById('modal-titulo');
    const descModal = document.getElementById('modal-descripcion');
    const infoHorarios = document.getElementById('modal-info-horarios');
    const btnInscribirse = document.getElementById('btn-inscribirse-modal');

    // Textos de venta para cada clase
    const descripcionesExtendidas = {
        "musculacion": "Desarrolla tu fuerza máxima y esculpe tu cuerpo. Nuestras instalaciones cuentan con maquinaria de primer nivel y pesas libres adaptadas para hipertrofia y acondicionamiento pesado.",
        "crossfit": "Supera tus límites con entrenamientos funcionales de alta intensidad (WODs). Combina halterofilia, gimnasia y cardio en una comunidad que te motivará a no rendirte.",
        "yoga": "Encuentra el equilibrio perfecto entre cuerpo y mente. Aumenta tu flexibilidad, corrige tu postura y libera todo el estrés acumulado de la semana."
    };

    // Al hacer clic en cualquier tarjeta de clase
    document.querySelectorAll('.tarjeta-hover').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            // Obtenemos qué clase se tocó
            const claseTocada = tarjeta.getAttribute('data-clase');
            
            // Rellenamos título y descripción
            tituloModal.textContent = claseTocada;
            descModal.textContent = descripcionesExtendidas[claseTocada] || "Únete a nuestras increíbles sesiones de entrenamiento.";

            // Inyectamos los horarios desde el CSV
            let htmlHorarios = "";
            if (infoClases[claseTocada]) {
                infoClases[claseTocada].forEach(horario => {
                    htmlHorarios += `<p><strong>${horario.turno} (${horario.entrenador}):</strong> ${horario.dias} de ${horario.horario}</p>`;
                });
            } else {
                htmlHorarios = "<p>Consultar horarios disponibles en recepción.</p>";
            }
            infoHorarios.innerHTML = htmlHorarios;

            // EL TRUCO DE LA URL: Redirigimos al formulario pasando la clase en la dirección
            btnInscribirse.href = `formulario.html?clase=${encodeURIComponent(claseTocada)}`;

            // Mostramos el modal
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('modal-visible'), 10);
        });
    });

    // Cerrar el modal al tocar la X
    btnCerrar.addEventListener('click', () => {
        modal.classList.remove('modal-visible');
        setTimeout(() => modal.style.display = 'none', 300);
    });

    // Cerrar el modal al hacer clic en el fondo oscuro
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('modal-visible');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const formLibros = document.getElementById('form-libros');

    formLibros.addEventListener('submit', function(evento) {
        evento.preventDefault();

        // Obtener los valores del formulario
        const fechaInput = document.getElementById('fecha').value;

        // Se agrega 'T00:00:00' para evitar desfases de zona horaria al crear la fecha
        const fechaRetiro = new Date(fechaInput + 'T00:00:00');
        
        // Calcular la fecha de devolución (14 días después)
        const fechaDevolucion = new Date(fechaRetiro);
        fechaDevolucion.setDate(fechaDevolucion.getDate() + 14);

        // Formatear las fechas a formato local (DD/MM/YYYY)
        const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const stringRetiro = fechaRetiro.toLocaleDateString('es-AR', opcionesFecha);
        const stringDevolucion = fechaDevolucion.toLocaleDateString('es-AR', opcionesFecha);

        // Mostrar el mensaje de aviso
        alert(`Tenés desde el ${stringRetiro} hasta el ${stringDevolucion} para retirar y leer el libro.\n\nEn el último día debes devolver el libro o avisar que lo tienes en buen estado y posesión.`);

        // Limpiar el formulario después de confirmar
        this.reset();
    });
});
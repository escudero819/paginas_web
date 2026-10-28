document.addEventListener('DOMContentLoaded', () => {

    const formConsulta = document.getElementById('form-contacto');
    
    formConsulta.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que recargue la página
        try {
            const respuesta = await fetch('/agregar_consulta', {
                method: 'POST',
                body: new FormData(formConsulta)
            });
            const resultado = await respuesta.json()
            if (!respuesta.ok) {
                throw new Error(
                    resultado.error || 'No se pudo enviar tu consulta'
                );
            }
            alert(resultado.mensaje);
        } catch (error) {
            alert('Error:', error);
        }
        formConsulta.reset(); // Limpiamos el formulario
    });
});
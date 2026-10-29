document.addEventListener('DOMContentLoaded', () => {
    const carritoData = JSON.parse(localStorage.getItem('checkoutCarrito')) || [];
    const totalData = localStorage.getItem('checkoutTotal') || 0;
    const reciboElement = document.getElementById('recibo-texto');
    const formCheckout = document.getElementById('form-checkout');

    if (carritoData.length === 0) {
        reciboElement.innerText = "No hay productos pendientes de pago.";
        return;
    }

    // Generar el texto plano del recibo
    let textoRecibo = "====================================\n";
    textoRecibo += "         T I C K E T   T E C H N O S T O R E\n";
    textoRecibo += "====================================\n\n";
    textoRecibo += `Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
    textoRecibo += "CANT.  DESCRIPCION                 SUBTOTAL\n";
    textoRecibo += "------------------------------------\n";
    
    carritoData.forEach(item => {
        const subtotal = (item.precio * item.cantidad).toFixed(2);
        textoRecibo += `${item.cantidad.toString().padEnd(6)} ${item.nombre.substring(0, 25).padEnd(27)} $${subtotal}\n`;
    });
    
    textoRecibo += "------------------------------------\n";
    textoRecibo += `TOTAL A PAGAR:                      $${parseFloat(totalData).toFixed(2)}\n`;
    textoRecibo += "====================================\n";
    textoRecibo += "¡Gracias por su compra!\n";

    // Mostrar en pantalla
    reciboElement.innerText = textoRecibo;

    // Procesar el formulario
    formCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('checkout-nombre').value;
        const email = document.getElementById('checkout-email').value;
        const telefono = document.getElementById('checkout-telefono').value;

        // 1. Descargar el recibo localmente
        const reciboFinal = `DATOS DEL CLIENTE:\nNombre: ${nombre}\nEmail: ${email}\nTel: ${telefono}\n\n${textoRecibo}`;
        descargarRecibo(reciboFinal, nombre);

        // 2. Enviar datos al servidor
        try {
            const respuesta = await fetch("/procesar_checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre,
                    email: email,
                    telefono: telefono,
                    compras: carritoData,
                    total: totalData
                })
            });

            const resultado = await respuesta.json();
            if (respuesta.ok) {
                alert(resultado.mensaje);
                localStorage.removeItem('checkoutCarrito');
                localStorage.removeItem('checkoutTotal');
                window.location.href = "index.html"; // Volver al inicio
            } else {
                throw new Error(resultado.error);
            }
        } catch (error) {
            alert("Error al procesar la compra: " + error.message);
        }
    });

    // Función para crear y descargar el archivo .txt
    function descargarRecibo(texto, nombreCliente) {
        const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreArchivo = `Recibo_TechnoStore_${nombreCliente.replace(/\s+/g, '_')}.txt`;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
});
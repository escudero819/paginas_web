from flask import Flask, render_template, request, jsonify
import csv
import os

app = Flask(__name__)
# Ubicación del archivo CSV
CARPETA = os.path.dirname(os.path.abspath(__file__))
ARCHIVO_CSV = os.path.join(CARPETA, "productos.csv")
# Columnas del archivo CSV
CAMPOS = ["id", "nombre", "precio", "stock"]

@app.route("/")

def inicio():
    return render_template("index.html")

@app.route("/agregar", methods=["POST"])
def agregar_producto():
    # 1. Recibir los datos enviados por el formulario
    nombre = request.form.get("nombre", "").strip()
    precio = request.form.get("precio", "").strip()
    stock = request.form.get("stock", "").strip()

    # 2. Validar los datos
    if not nombre:
        return jsonify({
        "error": "El nombre es obligatorio."
        }), 400

    try:
        precio = float(precio)
        stock = int(stock)

        if precio < 0 or stock < 0:
            raise ValueError

    except ValueError:
        return jsonify({
        "error": "Ingresá un precio y un stock válidos."
        }), 400

    # 3. Verificar si el archivo existe y contiene datos
    tiene_datos = (
        os.path.exists(ARCHIVO_CSV)
        and os.path.getsize(ARCHIVO_CSV) > 0
    )

    # 4. Calcular el siguiente ID disponible
    siguiente_id = 1
    if tiene_datos:
        with open(ARCHIVO_CSV, "r", newline="", encoding="utf-8-sig") as archivo:
            lector = csv.DictReader(archivo)
            ids = []

            for fila in lector:
                try:
                    ids.append(int(fila["id"]))
                except (ValueError, TypeError, KeyError):
                    continue

            if ids:
                siguiente_id = max(ids) + 1

    # 5. Abrir el CSV en modo agregar
    with open(ARCHIVO_CSV, "a", newline="", encoding="utf-8") as archivo:

        escritor = csv.DictWriter(archivo, fieldnames=CAMPOS)
        # Crear el encabezado solo si el archivo está vacío
        if not tiene_datos:

            escritor.writeheader()
        # 6. Agregar el nuevo producto
        escritor.writerow(
            {
            "id": siguiente_id,
            "nombre": nombre,
            "precio": f"{precio:.2f}",
            "stock": stock
            }
        )
    # 7. Informar que se guardó el producto
    return jsonify({
        "mensaje": f"Producto agregado correctamente. ID: {siguiente_id}"
    })

if __name__ == "__main__":
    app.run(debug=True)

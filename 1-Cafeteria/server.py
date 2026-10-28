from flask import Flask, render_template, request, jsonify
import os, csv

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))

Reservas_Mesas = os.path.join(Carpeta, "static", "data", "reservas_mesas.csv")
CAMPOS_MESAS = ["nombre", "fecha", "personas"]

Reservas_Libros = os.path.join(Carpeta, "static", "data", "reservas_libros.csv")
CAMPOS_LIBROS = ["nombre", "libro", "retiro", "devolucion"]

Consultas = os.path.join(Carpeta, "static", "data", "consultas.csv")
CAMPOS_CONSULTAS = ["nombre", "email", "mensaje"]

# Rutas de la aplicación

@server.route("/")
def inicio():
    return render_template("index.html")

@server.route("/index.html")
def index():
    return render_template("index.html")

@server.route("/contacto.html")
def contacto():
    return render_template("contacto.html")

@server.route("/libros.html")
def libros():
    return render_template("libros.html")

@server.route("/menu.html")
def menu():
    return render_template("menu.html")


# Rutas de funciones 

# Agregar reserva de mesa

@server.route("/reservar_mesa", methods=["POST"])
def reservar_mesa():
    nombre = request.form.get("nombre", "").strip()
    fecha = request.form.get("fecha", "").strip()
    personas = request.form.get("personas", "").strip()

    if not nombre or not fecha or not personas:
        return jsonify({"error": "todos los campos son obligatorios"}), 400

    # Verificamos la exiostencia y contenido de mesas
    tiene_datos = os.path.exists(Reservas_Mesas) and os.path.getsize(Reservas_Mesas) > 0

    # escribimos el archivo CSV
    with open(Reservas_Mesas, "a", newline="", encoding="utf-8") as archivo:
        escritor = csv.DictWriter(archivo, fieldnames=CAMPOS_MESAS)
        if not tiene_datos:
            escritor.writeheader()

        escritor.writerow({
            "nombre": nombre,
            "fecha": fecha,
            "personas": personas
        })

    return jsonify({"mensaje": "reserva de mesa agregada correctamente"}), 201

# Agregar reserva de libro 
@server.route("/reservar_libro", methods=["POST"])
def reservar_libro():
    nombre = request.form.get("nombre", "").strip()
    libro = request.form.get("libro", "").strip()
    retiro = request.form.get("retiro", "").strip()
    devolucion = request.form.get("devolucion", "").strip()

    if not nombre or not libro or not retiro or not devolucion:
        return jsonify({"error": "todos los campos son obligatorios"}), 400

    # Verificamos la exiostencia y contenido de libros
    tiene_datos = os.path.exists(Reservas_Libros) and os.path.getsize(Reservas_Libros) > 0

    # escribimos el archivo CSV
    with open(Reservas_Libros, "a", newline="", encoding="utf-8") as archivo:
        escritor = csv.DictWriter(archivo, fieldnames=CAMPOS_LIBROS)
        if not tiene_datos:
            escritor.writeheader()

        escritor.writerow({
            "nombre": nombre,
            "libro": libro,
            "retiro": retiro,
            "devolucion": devolucion
        })

    return jsonify({"mensaje": "reserva de libro agregada correctamente"}), 201


@server.route("/agregar_consulta", methods=["POST"])
def agregar_consulta():
    nombre = request.form.get("nombre", "").strip()
    email = request.form.get("email", "").strip()
    mensaje = request.form.get("mensaje", "").strip()

    if not nombre or not email or not mensaje:
        return jsonify({"error": "todos los campos son obligatorios"}), 400

    # Verificamos la exiostencia y contenido de consultas
    tiene_datos = os.path.exists(Consultas) and os.path.getsize(Consultas) > 0

    # escribimos el archivo CSV
    with open(Consultas, "a", newline="", encoding="utf-8") as archivo:
        escritor = csv.DictWriter(archivo, fieldnames=CAMPOS_CONSULTAS)
        if not tiene_datos:
            escritor.writeheader()

        escritor.writerow({
            "nombre": nombre,
            "email": email,
            "mensaje": mensaje
        })

    return jsonify({"mensaje": "¡Gracias por contactarte con Café con Aroma! Recibimos tu mensaje y te responderemos a la brevedad."}), 201



if __name__ == "__main__":
    server.run(debug=True)
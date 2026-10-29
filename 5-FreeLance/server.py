from flask import Flask, render_template, request, jsonify
import csv 
import os

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = os.path.join(Carpeta, "static/opiniones.csv")

CAMPOS = ["nombre", "especialidad", "claves", "contenido"]

@server.route("/")

def inicio():
    return render_template("index.html")

@server.route("/index.html")
def index():
    return render_template("index.html")

@server.route("/proyecto.html")
def proyecto():
    return render_template("proyecto.html")

@server.route("/formacion.html")
def formacion():
    return render_template("formacion.html")

@server.route("/agregar", methods=["POST"])
def agregar_registro():
    # Datos recibidos del formulario
    nombre = request.form.get("nombre", "").strip()
    especialidad = request.form.get("especialidad", "").strip()
    clave1 = request.form.get("clave1", "").strip()
    clave2 = request.form.get("clave2", "").strip()
    clave3 = request.form.get("clave3", "").strip()
    descripcion = request.form.get("descripcion", "").strip()

    if not nombre:
        return jsonify({
            "error": "El nombre es obligatorio"
        }), 400

    if not clave1:
        return jsonify({
            "error": "al menos una palabra clave para el registro"
        }), 400

    if not descripcion:
        return jsonify({
            "error": "la descripcion es obligatoria"
        }), 400

    # Construimos el string de claves, ignorando las vacías
    claves_list = [c for c in [clave1, clave2, clave3] if c]
    claves = ",".join(claves_list)

    #vemos si el archivo existe y si tiene contenido
    tiene_datos = (os.path.exists(ARCHIVO) and os.path.getsize(ARCHIVO) > 0)

    # NUEVO: Verificamos si el archivo necesita un salto de línea forzado
    necesita_salto = False
    if tiene_datos:
        with open(ARCHIVO, "rb") as f:
            f.seek(-1, os.SEEK_END) # Vamos al último byte del archivo
            if f.read() != b'\n':   # Si no es un salto de línea...
                necesita_salto = True

    with open(ARCHIVO, "a", newline="", encoding="utf-8") as archivo:

        # Si faltaba el salto de línea, lo inyectamos antes de escribir
        if necesita_salto:
            archivo.write("\n")

        escritor = csv.DictWriter(archivo, fieldnames=CAMPOS, delimiter=';')
        # hacemos el header si el archivo esta completamente vacio
        if not tiene_datos:
            escritor.writeheader()
        #escirbimos el nuevo registro
        escritor.writerow({
            "nombre": nombre,
            "especialidad": especialidad,
            "claves": claves,
            "contenido": descripcion
        })
    # Mensaje de proceso terminado
    return jsonify({
        "mensaje": "muchas gracias por tu comentario"
    })

if __name__ == "__main__":
    server.run(debug=True)



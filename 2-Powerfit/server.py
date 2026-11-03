from flask import Flask, render_template, request, jsonify
import os, csv

server = Flask(__name__)


Carpeta = os.path.dirname(os.path.abspath(__file__))
Inscripciones = os.path.join(Carpeta, "static/data/inscripciones.csv")
CAMPOS_INSCRIPCION = ["nombre", "email", "telefono", "clase", "dias", "turno"]
Consultas = os.path.join(Carpeta, "static/data/contactos.csv")
CAMPOS_CONSULTAS = ["nombre", "email", "mensaje"]

@server.route("/")
def inicio():
    return render_template("index.html")

@server.route("/formulario")
def formulario():
    return render_template("formulario.html")

@server.route("/index")
def index():
    return render_template("index.html")

@server.route("/contacto")
def contacto():
    return render_template("contacto.html")

@server.route("/inscripcion", methods=["POST"])
def Inscripcion():
    nombre = request.form.get("nombre", "").strip()
    email = request.form.get("email", "").strip()
    telefono = request.form.get("telefono", "").strip()
    clase = request.form.get("clase", "").strip()
    dias = request.form.get("dias", "").strip()
    turno = request.form.get("turno", "").strip()

    existe = os.path.exists(Inscripciones) and os.path.getsize(Inscripciones) > 0

    with open(Inscripciones, "a", newline="", encoding="utf-8") as archivo:
        writer = csv.DictWriter(archivo, fieldnames=CAMPOS_INSCRIPCION, delimiter=";")
        if not existe:
            writer.writeheader()

        writer.writerow({
            "nombre": nombre,
            "email": email,
            "telefono": telefono,
            "clase": clase,
            "dias": dias,
            "turno": turno
        })

    return jsonify({
        "mensaje": "Inscripcion realizada con exito, lo esperamos en la proxima clase!"
    })

@server.route("/consulta", methods=["POST"])
def consulta():
    nombre = request.form.get("nombre", "").strip()
    email = request.form.get("email", "").strip()
    mensaje = request.form.get("mensaje", "").strip()

    existe = os.path.exists(Consultas) and os.path.getsize(Consultas) > 0

    with open(Consultas, "a", newline="", encoding="utf-8") as archivo:
        writer = csv.DictWriter(archivo, fieldnames=CAMPOS_CONSULTAS, delimiter=";")
        if not existe:
            writer.writeheader()

        writer.writerow({
            "nombre": nombre,
            "email": email,
            "mensaje": mensaje
        })

    return jsonify({
        "mensaje": "Gracias por contactarnos, nos pondremos en contacto con usted pronto!"
    })

if __name__ == "__main__":
    server.run(debug=True)
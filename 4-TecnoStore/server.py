from flask import Flask, render_template, request, jsonify
import csv 
import os
import datetime

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))
Compras = os.path.join(Carpeta, "static/data/compras.csv")
Consultas = os.path.join(Carpeta, "static/data/consultas.csv")

CAMPOS_COMPRAS = ["dia","hora","compras", "total"]
CAMPOS_CONSULTAS = ["nombre", "email", "consulta"]

@server.route("/")
def inicio():
    return render_template("index.html")

@server.route("/catalogo.html")
def catalogo():
    return render_template("catalogo.html")

@server.route("/index.html")
def index():
    return render_template("index.html")

@server.route("/agregar_consulta", methods=["POST"])
def agregar_consulta():
    # Datos recibidos del formulario
    nombre = request.form.get("nombre", "").strip()
    email = request.form.get("email", "").strip()
    consulta = request.form.get("consulta", "").strip()

    # verificaciones

    if not nombre:
        return jsonify({
            "error": "el nombre es obligatorio"
        }), 400

    if not email:
        return jsonify({
            "error": "el email es obligatorio"
        }), 400

    if not consulta:
        return jsonify({
            "error": "el consulta es obligatorio"
        }), 400

    tiene_datos = (os.path.exists(Consultas) and os.path.getsize(Consultas) > 0)

    with open(Consultas, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CAMPOS_CONSULTAS, delimiter=";")
        if not tiene_datos:
            writer.writeheader()

        writer.writerow({
            "nombre":nombre,
            "email": email,
            "consulta": consulta
        })

    return jsonify({
        "mensaje": "Consulta enviada, sera contactado a la brevedad"
    })
    

@server.route("/agregar_compra", methods=["POST"])
def agregar_compra():
    datos = request.json
    compras_data = datos.get("compras", [])
    total = datos.get("total", 0)
    
    tiene_datos = os.path.exists(Compras) and os.path.getsize(Compras) > 0
    
    with open(Compras, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CAMPOS_COMPRAS, delimiter=";")
        if not tiene_datos:
            writer.writeheader()
            
        resumen_compras = ", ".join([f"{c['cantidad']}x {c['nombre']}" for c in compras_data])
            
        writer.writerow({
            "dia": datetime.datetime.now().strftime("%Y-%m-%d"),
            "hora": datetime.datetime.now().strftime("%H:%M:%S"),
            "compras": resumen_compras,
            "total": total
        })
        
    return jsonify({"mensaje": "Compra registrada con éxito"})

if __name__ == "__main__":
    server.run(debug=True)
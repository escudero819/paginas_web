from flask import Flask, render_template, request, jsonify
import csv, os

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))
Comentarios = os.path.join(Carpeta, "static", "data", "comentarios.csv")
Reservas = os.path.join(Carpeta, "static", "data", "reservas.csv")
Destinos = os.path.join(Carpeta, "static", "data", "destinos.csv")

CAMPOS_RESERVA = ["nombre", "email", "telefono", "destino", "mes", "semana", "pasajeros", "precio"]

@server.route("/")
def inicio():
    return render_template("index.html")

@server.route("/index.html")
def index():
    return render_template("index.html")

@server.route("/comentarios.html")
def comentarios():
    return render_template("comentarios.html")

@server.route("/destinos.html")
def destinos():
    return render_template("destinos.html")

@server.route("/contacto.html")
def contacto():
    return render_template("contacto.html")

@server.route("/reserva.html")
def reserva():
    return render_template("reserva.html")

@server.route("/reservar", methods=["POST"])
def reservar():
    nombre = request.form.get("nombre", "").strip()
    email = request.form.get("email", "").strip()
    telefono = request.form.get("telefono", "").strip()
    destino = request.form.get("destino", "").strip()
    mes = request.form.get("mes", "").strip()
    semana = request.form.get("semana", "").strip()
    pasajeros_str = request.form.get("pasajeros", "1").strip()

    if not all([nombre, email, telefono, destino, mes, semana, pasajeros_str]):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    pasajeros = int(pasajeros_str)
    precio_unitario = 0

    # 1. Leer el precio directamente desde destinos.csv
    if os.path.exists(Destinos):
        with open(Destinos, "r", encoding="utf-8") as file:
            reader = csv.reader(file, delimiter=";")
            next(reader, None)  # Salta la fila de encabezados
            for row in reader:
                if row and row[0].strip() == destino:
                    try:
                        precio_unitario = float(row[7].strip()) # Índice 7 asumiendo que el precio es la 8va columna
                    except (IndexError, ValueError):
                        precio_unitario = 0 
                    break

    precio_total = precio_unitario * pasajeros

    # 2. Escribir la reserva final en reservas.csv
    tiene_datos = os.path.exists(Reservas) and os.path.getsize(Reservas) > 0
    try:
        with open(Reservas, "a", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=CAMPOS_RESERVA, delimiter=";")
            if not tiene_datos:
                writer.writeheader()
            
            writer.writerow({
                "nombre": nombre,
                "email": email,
                "telefono": telefono,
                "destino": destino,
                "mes": mes,
                "semana": semana,
                "pasajeros": pasajeros,
                "precio": precio_total
            })
        return jsonify({
            "mensaje": f"Reserva exitosa. Costo total para {pasajeros} pasajeros: ${precio_total}."
        })
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500




if __name__ == "__main__":
    server.run(debug=True)
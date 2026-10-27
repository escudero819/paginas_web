from flask import Flask, render_template, request, jsonify
import csv, os

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))
Comentarios = os.path.join(Carpeta, "static", "data", "comentarios.csv")
Reservas = os.path.join(Carpeta, "static", "data", "reservas.csv")
Destinos = os.path.join(Carpeta, "static", "data", "destinos.csv")

CAMPOS_RESERVA = ["nombre", "email", "telefono", "dni", "destino", "mes", "semana", "pasajeros", "precio"]

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
    dni = request.form.get("dni", "").strip()
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
                "dni": dni,
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

@server.route("/agregar_comentario", methods=["POST"])
def agregar_comentario():
    dni = request.form.get("dni", "").strip()
    destino = request.form.get("destino", "").strip()
    comentario = request.form.get("comentario", "").strip()
    estrellas = request.form.get("estrellas", "5").strip()

    if not all([dni, destino, comentario]):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # 1. Verificar si existe la reserva
    reserva_valida = False
    nombre_usuario = "Usuario" # Por defecto, por si no se encuentra
    if os.path.exists(Reservas):
        with open(Reservas, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter=";")
            for row in reader:
                if row["dni"] == dni and row["destino"] == destino:
                    reserva_valida = True
                    nombre_usuario = row["nombre"]
                    break
    
    if not reserva_valida:
        return jsonify({"error": "No se encontró una reserva para este DNI en este destino."}), 403

    # 2. Guardar el comentario
    tiene_datos = os.path.exists(Comentarios) and os.path.getsize(Comentarios) > 0
    try:
        with open(Comentarios, "a", newline="", encoding="utf-8") as file:
            # Usando el mismo orden que el JS espera leer: Usuario;Destino;Comentario;Estrellas
            writer = csv.writer(file, delimiter=";")
            if not tiene_datos:
                writer.writerow(["Usuario", "Destino", "Comentario", "Estrellas"])
            writer.writerow([nombre_usuario, destino, comentario, estrellas])
        
        return jsonify({"mensaje": "¡Gracias por tu comentario!"})
    except Exception as e:
         return jsonify({"error": f"Error al guardar: {str(e)}"}), 500

if __name__ == "__main__":
    server.run(debug=True)
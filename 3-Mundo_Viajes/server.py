from flask import Flask, render_template, request, jsonify
import csv
import os

server = Flask(__name__)

Carpeta = os.path.dirname(os.path.abspath(__file__))
Comentarios = os.path.join(Carpeta, "static/data/comentarios.csv")
Contactos = os.path.join(Carpeta, "static/data/contactos.csv")
Reservas = os.path.join(Carpeta, "static/data/reservas.csv")

@server.route("/")
def inicio():
    return render_template("index.html")

@server.route("/index.html")
def index():
    return render_template("index.html")

@server.route("/destinos.html")
def destinos():
    return render_template("destinos.html")

@server.route("/comentarios.html")
def comentarios():
    return render_template("comentarios.html")

@server.route("/contacto.html")
def contacto():
    return render_template("contacto.html")

@server.route("/reserva.html")
def reserva():
    return render_template("reserva.html")


if __name__ == "__main__":
    server.run(debug=True)
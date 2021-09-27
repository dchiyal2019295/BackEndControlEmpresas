'use strict'

//VARIABLES GLOBALES

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

//IMPORTACION DE RUTAS 
var usuario_rutas = require("./src/rutas/usuarios.rutas");
var empresa_rutas = require("./src/rutas/empresa.rutas");

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CABECERAS
app.use(cors());

//APLICACION DE RUTAS 
app.use('/api',
        usuario_rutas,
        empresa_rutas)

//EXPORTACIONES 

module.exports = app;

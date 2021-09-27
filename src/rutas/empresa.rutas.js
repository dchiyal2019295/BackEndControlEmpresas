'use strict'

var express = require("express");
var empresaControlador = require("../Controladores/empresa.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated")
//RUTAS
var api=express.Router();

api.post('/registarEmpresa',md_autorizacion.ensureAuth, empresaControlador.AgregarEmpresa);
api.post('/LoginEmpresa', empresaControlador.Login);
api.put('/EditarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.EditarEmpresa );
api.put('/EliminarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.EliminarEmpresa);
module.exports = api;


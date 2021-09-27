'use strict'

var express = require("express");
var usuarioControlador = require("../Controladores/usuario.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated");

//RUTAS

var api = express.Router();
api.post('/Login', usuarioControlador.Login);
api.post('/registarEmpleado',md_autorizacion.ensureAuth,usuarioControlador.AgregarEmpleado);
api.put('/EditarEmpleado/:id', md_autorizacion.ensureAuth, usuarioControlador.EditarEmpleado);
api.put('/EliminarEmpleado/:id',md_autorizacion.ensureAuth, usuarioControlador.EliminarEmpleado);

api.get('/CantidadEmpleados', md_autorizacion.ensureAuth, usuarioControlador.CantidadEmpleado)
api.get('/ObtenerId/:id', md_autorizacion.ensureAuth, usuarioControlador.obtenerId);
api.get('/obtenerNombre', md_autorizacion.ensureAuth, usuarioControlador.ObtenerNombre)
api.get('/obtenerPuesto', md_autorizacion.ensureAuth, usuarioControlador.ObtenerPuesto)
api.get('/obtenerDepartamento', md_autorizacion.ensureAuth, usuarioControlador.ObtenerDepartamento)
api.get('/obtenerEmpleados', md_autorizacion.ensureAuth, usuarioControlador.ObtenerEmpleado)

api.get('/GenerarPdf',md_autorizacion.ensureAuth, usuarioControlador.GenerarPdf)

module.exports = api;
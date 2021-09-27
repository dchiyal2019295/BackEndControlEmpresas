'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({

    nombre: String,
    password: String,
    rol: String,
    puesto: String,
    departamento: String,
    empleadoEmpresa:{type:Schema.Types.ObjectId, ref:'empresas'}


})

module.exports = mongoose.model('usuarios', UsuarioSchema);
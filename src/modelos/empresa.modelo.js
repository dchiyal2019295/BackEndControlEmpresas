'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({

    nombre: String,
    password: String,
    rol: String

})

module.exports = mongoose.model('empresas', EmpresaSchema);
'use strict'

var jwt = require("jwt-simple")
var moment = require("moment");
var secret = 'clave_secreta';

exports.ensureAuth = function(req,res,next){

    if(!req.headers.authorization){

        return res.status(404).send({mensaje: 'La peticion no tiene la cabezera de autenticacion'})
    }

    var token = req.headers.authorization.replace(/['"]+/g,'');
    try {
        var payload = jwt.decode(token,secret);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({mensaje:'el token que ha ingresado ha expirado'});
        }
        
    } catch (error) {
        return res.status(401).send({mensaje:'el token que ha ingresado no es valido'})
        
    }

    req.user = payload;
    next();
}
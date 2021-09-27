'use strict'

var Empresa = require("../modelos/empresa.modelo");
var Usuario = require("../modelos/usuario.modelo")
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../servicios/jwt");


function Login(req, res) {

    var params = req.body;

    Empresa.findOne({ nombre: params.nombre }, (err, empresaEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (empresaEncontrado) {
            bcrypt.compare(params.password, empresaEncontrado.password, (err, passVerificada) => {
                if (passVerificada) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(empresaEncontrado)
                        })

                    } else {
                        empresaEncontrado.password = undefined;
                        return res.status(200).send({ empresaEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'La Empresa no se a podido indentificar' })
                }

            })
        } else {
            return res.status(500).send({ mensaje: 'Error al buscar la empresa' })
        }
    })

}


function AgregarEmpresa(req, res) {

    var empresaModel = Empresa();
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN") {

        return res.status(500).send({ mensaje: 'Solo los Administradores pueden agregar Empresas' })

    } else {
        if (params.nombre && params.password) {
            empresaModel.nombre = params.nombre;
            empresaModel.password = params.password;
            empresaModel.rol = 'ROL_EMPRESA';

            Empresa.find({

                $or: [
                    { nombre: empresaModel.nombre }
                
                ]

            }).exec((err, empresaEncontrada) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion del la Empresa' });

                if (empresaEncontrada && empresaEncontrada.length >= 1) {

                    return res.status(500).send({ mensaje: 'La empresa ya existe' })

                } else {

                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                        empresaModel.password = passwordEncriptada;

                        empresaModel.save((err, empresaGuardada) => {

                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardad Empresa' });

                            if (empresaGuardada) {

                                res.status(200).send({ empresaGuardada })

                            } else {
                                res.status(404).send({ mensaje: 'no se ha podido registrar la Empresa' })
                            }
                        })
                    })
                }
            })

        } else {
            return res.status(500).send({ mensaje: 'llene todos los datos necesarios' })
        }
    }
}

function EditarEmpresa(req, res) {

    var idEmpresa = req.params.id;
    var params = req.body;

    

        if (req.user.rol != "ROL_ADMIN") {
            return res.status(500).send({ mensaje: "no posee los permisos para modificar" })
        }
    

    Empresa.find({ nombre: params.nombre }).exec((err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (empresaEncontrada && empresaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe ' })

        } else {

            Empresa.findOne({ _id: idEmpresa }).exec((err, empresaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa" });

                if (!empresaEncontrada) return res.status(500).send({ mensaje: "Error en la peticion editar o No tienes datos " });

                Empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err, empresaactualizada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!empresaactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la empresa" });

                    if (empresaactualizada) {
                        return res.status(200).send({ empresaactualizada });
                    }
                }
                )
            }
            )


        }
    })





}

function EliminarEmpresa(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;

    

        if (req.user.rol != "ROL_ADMIN") {
            return res.status(500).send({ mensaje: "no posee los permisos para Eliminar " })
        }
    

    Empresa.findOne({ _id: idEmpresa }).exec((err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa" });

        if (!empresaEncontrada) return res.status(500).send({ mensaje: "no se han encontrado los datos " });

       
       
              Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en en la peticion' })
                if (!empresaEliminada) return res.status(500).send({ mensaje: 'no se ha podido eliminar la Empresa' })
    
                if (empresaEliminada) {
                    return res.status(200).send({ mensaje: 'Se ha eliminado la Empresa' })
                }
            })
        
            
          

        

        
    })

}




module.exports = {
    AgregarEmpresa,
    Login,
    EditarEmpresa,
    EliminarEmpresa
}
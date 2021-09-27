'use strict'

var Usuario = require("../modelos/usuario.modelo");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const pdf = require('pdfkit')
const fs = require('fs');
const xlsx = require('xlsx')

var Datos
const { relativeTimeRounding } = require("moment");
const { findOne } = require("../modelos/usuario.modelo");
const { HTML5_FMT } = require("moment");



function Admin(req, res) {

  var userModel = new Usuario();

      userModel.nombre = 'Admin';
      userModel.password = '123456';
      userModel.rol = 'ROL_ADMIN'

  Usuario.find({
      $or: [
      { nombre: userModel.nombre }
      ]
        }).exec((err, adminEncontrado) => {
          if (err) return console.log('Error en la Creacion del Usuario Administrador');
            if (adminEncontrado.length >= 1) {
              return console.log("Usuario Administrador Creado con exito")
                } else {
                  bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                        userModel.password = passwordEncriptada;
                      userModel.save((err, adminGuardado) => {
                   if (err) return console.log('error en la peticion del usuario Administrador')

                if (adminGuardado) {
              console.log('Administrador Guardado')
             } else {
                      console.log('Error en la creacion del usuario  Admin')
                               }
                            })
                          })
                        }
                      })
}

function Login(req, res) {

  var params = req.body;
  
      Usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado) => {
          if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (usuarioEncontrado) {
              bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                 if (passVerificada) {
                   if (params.getToken === 'true') {
                    return res.status(200).send({
                    token: jwt.createToken(usuarioEncontrado)})

                      } else {
                       usuarioEncontrado.password = undefined;
                    return res.status(200).send({ usuarioEncontrado });}
                } else {
               return res.status(500).send({ mensaje: 'El usuario no se puede indentificar' })}
              })} 
           else {
        return res.status(500).send({ mensaje: 'Error al buscar el Usuario' })
    }
  })

}

function AgregarEmpleado(req, res) {

    var empleadoModel = new Usuario();
    var params = req.body;

           if (req.user.rol != 'ROL_EMPRESA') {
               return res.status(500).send({ mensaje: 'solo las Empresas pueden agregar Empleados' })
                   } else {
                      if (params.nombre && params.puesto && params.departamento) {
                         empleadoModel.nombre = params.nombre,
                         empleadoModel.rol = 'ROL_EMPLEADO'
                         empleadoModel.puesto = params.puesto,
                         empleadoModel.departamento = params.departamento,
                         empleadoModel.empleadoEmpresa = req.user.sub;

                        Usuario.find({
                           $or: [{ nombre: empleadoModel.nombre }]
                              }).exec((err, empleadoEncontrado) => {
                         if (err) return res.status(500).send({ mensaje: 'Error en la peticion, Vuelva a intentarlo' });
                      if (empleadoEncontrado && empleadoEncontrado.length >= 1) {
                  return res.status(500).send({ mensaje: 'Los Datos que Ingreso ya se encuentran en el sistema' });
              } else {
           empleadoModel.save((err, empleadoGuardado) => {
          if (err) return res.status(500).send({ mensaje: 'Error al guardar los datos del usuario' });
        if (empleadoGuardado) {
     res.status(200).send({ empleadoGuardado })
            } else {
              res.status(404).send({ mensaje: 'No se ha podido registrar al Usuario'})
            }
          })
        }
      })
    } else {
      return res.status(500).send({ mensaje: 'Es necesario llenar todos los datos necesarios' })
    }
  }
}

function EditarEmpleado(req, res) {

      var idEmpleado = req.params.id;
      var params = req.body;

          if (req.user.rol != 'ROL_EMPRESA') {
            return res.status(500).send({ mensaje: 'No posee los permisos para poder editar este usuario' })}

          Usuario.find({ nombre: params.nombre , puesto: params.puesto , departamento: params.departamento}).exec((err, empleadoEncontrado) => {
              if (err) return res.status(500).send({ mensaje: 'error en la peticion' })
                if (empleadoEncontrado && empleadoEncontrado.length >= 1) {
                  return res.status(500).send({ mensaje: 'El Nombre  que desea modificar ya existe' })

        } else {
          Usuario.findOne({ _id: idEmpleado }).exec((err, empleadoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener el empleado' });
              if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la peticion editar ' });
                if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'no posee los permisos para Editar elementos de una empresa ajena' })

          Usuario.findByIdAndUpdate(idEmpleado, params, { new: true }, (err, empleadoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
              if (!empleadoActualizado) return res.status(500).send({ mensaje: 'No se ha podido editar el empleado' })
                if (empleadoActualizado) {
                return res.status(200).send({ empleadoActualizado });
          }
        })
      })
    }})
}

function EliminarEmpleado(req, res) {
     var idEmpleado = req.params.id;
     var params = req.body;

        if (req.user.rol != 'ROL_EMPRESA') {
          return res.status(500).send({ mensaje: 'No posee los permisos para poder eliminar empleados' })}

          Usuario.findOne({ _id: idEmpleado }).exec((err, empleadoEncontrado) => {
             if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar empleado' })
                if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });
                    if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para eliminar empleados de esta empresa' })

          Usuario.findByIdAndDelete(idEmpleado, (err, empleadoEliminado) => {
             if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!empleadoEliminado) return res.status(500).send({ mensaje: 'no se ha podido eliminar el empleado' });
                  if (empleadoEliminado) {
                     return res.status(200).send({ mensaje: 'Se ha eliminado el empleado' })}
    })
  })
}

function CantidadEmpleado(req, res) {

      var params = req.body;

        if (req.user.rol != 'ROL_EMPRESA') {
         return res.status(500).send({ mensaje: 'No posee los permisos para buscar a los empleado' })}

  if (!params.nombre) {
    return res.status(500).send({ mensaje: 'Parametros Incorrectos' })

  } else {
    if (params.nombre === req.user.nombre) {
      Usuario.find({ empleadoEmpresa: req.user.sub }).count().exec((err, empleadosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al obtener los empleados' });
        if (!empleadosEncontrados) return res.status(500).send({ mensaje: 'No existen  datos' });

        return res.status(200).send({ mensaje: `La empresa ${req.user.nombre} tiene ${empleadosEncontrados} Empleados` })
      })
    } else {
      return res.status(500).send({ mensaje: 'No puede obtener los empleados de esta empresa' })
    }
  }
}

function obtenerId(req, res) {
  var empleadoId = req.params.id;

  if (req.user.rol != "ROL_EMPRESA") {
    return res.status(500).send({ mensaje: 'no posee los permisos para buscar empleados' })
  }

  Usuario.findOne({ _id: empleadoId }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar al empleado' })
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

    if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados de esta empresa' })

    Usuario.findById(empleadoId, (err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion del usuario' });
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'error al obtener el empleado' })
      return res.status(200).send({ empleadoEncontrado });
    })

  })
}

function ObtenerNombre(req, res) {

  var params = req.body

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No tiene los permisos para buscar un empleado' })
  }

  Usuario.findOne({ nombre: params.nombre }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la busqueda del empleado' });
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No existen  datos' });
    if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'El empleado no existe' })

    return res.status(200).send({ empleadoEncontrado })
  })



}

function ObtenerPuesto(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados' })
  }

  Usuario.find({

    $or: [
      { puesto: params.puesto, empleadoEmpresa: req.user.sub }

    ]


  }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error al obtener el Empleado' });
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'El puesto no existe' });
    return res.status(200).send({ empleadoEncontrado })
  })
}

function ObtenerDepartamento(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados' })
  }

  Usuario.find({

    $or: [
      { departamento: params.departamento, empleadoEmpresa: req.user.sub }
    ]

  }).exec((err, departamentoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
    if (!departamentoEncontrado) return res.status(500).send({ mensaje: 'Los datos no existe' });
    return res.status(200).send(departamentoEncontrado)
  })
}

function ObtenerEmpleado(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar los empleados' })
  }

  if (params.nombre === req.user.nombre) {

    Usuario.find({ empleadoEmpresa: req.user.sub }).exec((err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la consulta de usuarios ' })
      return res.status(200).send({ empleadoEncontrado })
    })


  } else {
    return res.status(500).send({ mensaje: 'No se puede buscar empleados de esta  empresa' })
  }



}

function GenerarPdf(req, res) {
  var params = req.body;


  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar los empleados' })
  }

  if (params.nombre === req.user.nombre) {

    Usuario.find({ empleadoEmpresa: req.user.sub }).exec((err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la consulta de usuarios o no tiene datos' })

      Datos = empleadoEncontrado

      var doc = new pdf();

      doc.pipe(fs.createWriteStream(`./pdf/empresa ${req.user.nombre}.pdf`));

      doc.text(`Empleados de la Empresa ${req.user.nombre}`, {
        align: 'center'
      })

      doc.end()

    })

    return res.status(500).send({ mensaje: 'El PDF se ha generado exitosamente' })


  } else {
    return res.status(500).send({ mensaje: 'No puede generar un pdf de Otra Empresa' })
  }



}




module.exports = {
  Admin,
  Login,
  AgregarEmpleado,
  EditarEmpleado,
  EliminarEmpleado,
  CantidadEmpleado,
  obtenerId,
  ObtenerNombre,
  ObtenerPuesto,
  ObtenerDepartamento,
  ObtenerEmpleado,
  GenerarPdf
}


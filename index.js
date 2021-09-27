const mongoose = require("mongoose");
const app = require("./app");
var controladorAdmin = require("./src/Controladores/usuario.controlador")

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ControlEmpresas',{useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{

    console.log('Conexion a la base de datos exitosa');

    controladorAdmin.Admin();

    app.listen(3000, function(){
        console.log('Servidor Corriendo en el puerto 3000')
    })

}).catch(err => console.log(err));
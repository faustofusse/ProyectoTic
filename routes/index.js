var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User = require('../models/user');
var FriendRequest = require('../models/friendRequest');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index');
});

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }else{
    //req.flash('error_msg', 'No has iniciado sesion');
    res.redirect(302, '/login');
  }
}

router.get('/user', function(req,res,next){
  res.send(req.user);
});

router.get('/users/search/:query', function(req, res, next){
  var busqueda = req.params.query;
  busqueda = busqueda.toLowerCase().replace(/\s/g, '');
  mongoose.connection.db.collection('users').find().toArray(function(err, usuarios){
    var resultados = [];
    console.log(usuarios.length);  
    for (var i = 0; i<usuarios.length; i++){
      var nombre = (usuarios[i].nombre + usuarios[i].apellido).toLowerCase().replace(/\s/g, '');
      if (nombre.indexOf(busqueda) !== -1)
        resultados.push({_id:usuarios[i]._id, nombre:usuarios[i].nombre, apellido:usuarios[i].apellido});
    }
    res.send({resultados:resultados});
  });
});

module.exports = router;
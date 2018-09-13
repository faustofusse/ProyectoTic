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
  var user = req.user;
  busqueda = busqueda.toLowerCase().replace(/\s/g, '');
  User.find(function(err, usuarios){
    FriendRequest.find(function(err, friendRequests){
      var resultados = []; 
      for (var i = 0; i<usuarios.length; i++){
        var nombre = (usuarios[i].nombre + usuarios[i].apellido).toLowerCase().replace(/\s/g, '');
        if (nombre.indexOf(busqueda) !== -1){
          var request = getRequestStatus(usuarios[i]._id, user.friends, friendRequests);
          resultados.push({_id:usuarios[i]._id, 
            nombre:usuarios[i].nombre, 
            apellido:usuarios[i].apellido,
            request:request
          });
        }
      }
      res.send({
        user:{
          _id:req.user._id,
          nombre:req.user.nombre,
          apellido:req.user.apellido
        },
        resultados:resultados});

    });
  });
});

function getRequestStatus(id, friends, friendRequests){
  for (var i = 0; i<friends.length; i++){
    
    if (friends[i]._id == id){
      console.log(friends[i]);
      return 'friend';
    }
      
  }
  for (var i = 0; i<friendRequests.length; i++){
    if (friendRequests[i].from == id)
      return 'received';
    if (friendRequests[i].to == id)
      return 'sent';
  }
  return 'none';
}

module.exports = router;
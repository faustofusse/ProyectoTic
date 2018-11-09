var express = require('express');
var router = express.Router();

var User = require('../models/user');
var FriendRequest = require('../models/friendRequest');

router.get('/friends', function(req,res,next){
    var friends = [];
    friends.push(req.user.friends);
    res.send(req.user.friends);
});

router.get('/friends/requests', function(req, res, next){
    FriendRequest.find({to:req.user._id}, function(err, results){
        var requests = [];
        var pushedUsers = 0;
        if (results.length === 0) res.send(requests);
        for (var i = 0; i<results.length; i++){
            User.findOne({_id:results[i].from}, function(err, user){
                requests.push({
                    _id:user._id,
                    nombre:user.nombre,
                    apellido:user.apellido,
                    correo:user.correo
                });
                pushedUsers++;
                if (pushedUsers == results.length)
                    res.send(requests);
            });
        }
    });
});

router.post('/friends/requests/send/:id', function(req,res,next){
  var idFrom = req.user._id;
  var idTo = req.params.id;
  FriendRequest.newFR(idFrom, idTo, function(err, fr){ 
    if (err)
        res.send(err);
    else  
        res.send(fr);
  });
});

router.put('/friends/requests/accept/:id', function(req,res,next){
  var idTo = req.user._id;
  var idFrom = req.params.id;
  FriendRequest.acceptFR(idFrom, idTo, function(err, fr){
    if (err) 
      res.send(err);
    else  
      res.send(fr);
  });
});

router.delete('/friends/requests/decline/:id', function(req,res,next){
  var idTo = req.user._id;
  var idFrom = req.params.id;
  FriendRequest.declineFR(idFrom, idTo, function(err){
    if(err)
      res.send(err);
    else  
      res.send('Solicitud rechazada correctamente.');
  });
});

router.get('/search/:query', function(req, res, next){
  var busqueda = req.params.query;
  var user = req.user;
  busqueda = busqueda.toLowerCase().replace(/\s/g, '');
  User.find(function(err, usuarios){
    FriendRequest.find(function(err, friendRequests){
      var resultados = []; 
      for (var i = 0; i<usuarios.length; i++){
        var nombre = (usuarios[i].nombre + usuarios[i].apellido).toLowerCase().replace(/\s/g, '');
        if (nombre.indexOf(busqueda) !== -1){
          var request = getRequestStatus(user._id, usuarios[i]._id, user.friends, friendRequests);
          resultados.push({_id:usuarios[i]._id, 
            nombre:usuarios[i].nombre, 
            apellido:usuarios[i].apellido,
            request:request
          });
        }
      }
      res.send(resultados);
    });
  });
});

function getRequestStatus(myId, id, friends, friendRequests){
  for (var i = 0; i<friends.length; i++){
    if (friends[i]._id == id)
      return 'friend';        
  }
  for (var i = 0; i<friendRequests.length; i++){
    if (friendRequests[i].from == id && friendRequests[i].to == myId)
      return 'received';
    if (friendRequests[i].from == myId && friendRequests[i].to == id)
      return 'sent';
  }
  return 'none';
}

module.exports = router;
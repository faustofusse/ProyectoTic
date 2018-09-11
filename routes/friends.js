var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User = require('../models/user');
var FriendRequest = require('../models/friendRequest');

router.get('/users/friends', function(req,res,next){
    res.send({friends: req.user.friends});
});

router.get('/users/friends/requests', function(req,res,next){
    FriendRequest.find(function(err, results){
        res.send(results);
    });
});

router.post('/users/friends/sendReq/:id', function(req,res,next){
  var idFrom = req.user._id;
  var idTo = req.params.id;
  FriendRequest.newFR(idFrom, idTo, function(err, fr){ 
    if (err)
        res.send(err);
    else  
        res.send(fr);
  });
});

router.put('/users/friends/acceptReq/:id', function(req,res,next){
  var idTo = req.user._id;
  var idFrom = req.params.id;
  FriendRequest.acceptFR(idFrom, idTo, function(err, fr){
    if (err) 
      res.send(err);
    else  
      res.send(fr);
  });
});

router.delete('/users/friends/declineReq/:id', function(req,res,next){
  var idTo = req.user._id;
  var idFrom = req.params.id;
  FriendRequest.declineFR(idFrom, idTo, function(err){
    if(err)
      res.send(err);
    else  
      res.send('Solicitud rechazada correctamente.');
  });
});

module.exports = router;
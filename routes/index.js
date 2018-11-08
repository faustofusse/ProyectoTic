var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index');
});

router.get('/robots', function(req, res, next){
  res.send(req.app.locals.robots);
});

router.get('/users', function(req, res, next){
  for(var session in req.sessionStore.sessions){
    console.log(session);
  }
  res.send(req.sessionStore.sessions);
});

router.get('/connections', function(req, res, next){
  res.send(req.app.locals.connections);
});

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }else{
    //req.flash('error_msg', 'No has iniciado sesion');
    res.redirect(302, '/login');
  }
}

module.exports = router;
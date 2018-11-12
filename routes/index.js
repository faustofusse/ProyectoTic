var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index');
});

router.get('/robots', function(req, res, next){
  res.send(req.app.locals.robots);
});
router.get('/videocalls', function(req, res, next){
  res.send(req.app.locals.videocalls);
});
router.get('/users', function(req, res, next){
  res.send(req.app.locals.users);
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
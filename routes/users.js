var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

// ----------------- GET PAGINA DE LOGIN/REGISTRO 

router.get('/login', function(req, res, next) {
  req.logout();
  res.render('login', {title: "TARS - Iniciar Sesion", login: true});
});
router.get('/register', function(req, res, next){
  res.redirect(302, '/login');
});

//-------------------- LOGIN FORM

router.post('/login', 
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash:true}),
  function(req, res) {
    res.redirect('/');
});

// ----------------- LOGIN CON GOOGLE 

router.get('/auth/google', passport.authenticate('google', {
  scope:['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), function (req, res, next) {
  res.redirect('/');
});

// ----------------- REGISTER FORM

router.post('/register', function(req, res, next){
  var nombre = req.body.nombre,
      apellido = req.body.apellido,
      correo = req.body.correo,
      password = req.body.password;
  req.checkBody('correo', 'El correo electronico no es valido').isEmail();
  req.checkBody('repeatPassword', 'Las contrasenas no coinciden').equals(password);

  if (req.validationErrors()){
    res.render('login', {title: "TARS - Iniciar Sesion", errors: errors, login: false});
  }else{
    var newUser = new User({
      nombre: nombre,
      apellido: apellido,
      correo: correo,
      password: password
    });

    User.findOne({correo:correo}, function(err, user) {
      if (err) throw err;
      if (user && user.password){
        res.render('login', {title: "TARS - Iniciar Sesion", error:'El correo electronico ya existe.', login: false});
      }else if (user && user.googleId){
        User.addPassword(newUser, user, function(err, user){
          if (err) throw err;
          console.log('Contrasenia agregada a: '+ user)
        });
      }else{
        User.createUser(newUser, function(err, user){
          if (err) throw err;
          console.log('Usuario creado: '+user)
        });
      }
    });

    req.flash('success_msg', 'Estas registrado y ahora puedes iniciar sesion.');
    res.redirect(302, '/login');
  }
});

//-------------------- LOGOUT

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'Has cerrado la sesion.');
  res.redirect('/login');
});

module.exports = router;
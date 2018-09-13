var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var FriendRequest = require('../models/friendRequest');

/* GET PAGINA DE LOGIN/REGISTRO */
router.get('/login', function(req, res, next) {
  res.render('login', {title: "TARS - Iniciar Sesion"});
});
router.get('/register', function(req, res, next){
  res.redirect(302, '/login');
});

// ----------------- REGISTER FORM
router.post('/register', function(req, res, next){
  var nombre = req.body.nombre,
      apellido = req.body.apellido,
      correo = req.body.correo,
      password = req.body.password,
      password2 = req.body.repeatPassword;
  req.checkBody('nombre', 'El campo nombre esta vacio').notEmpty();
  req.checkBody('apellido', 'El campo apellido esta vacio').notEmpty();
  req.checkBody('correo', 'El campo correo esta vacio').notEmpty();
  req.checkBody('correo', 'El correo electronico no es valido').isEmail();
  req.checkBody('password', 'El campo contrasena esta vacio').notEmpty();
  req.checkBody('repeatPassword', 'Las contrasenas no coinciden').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors){
    res.render('login', {
      title: "TARS - Iniciar Sesion",
      errors: errors,
      clase: "desplegado"
    });
  }else{
    var newUser = new User({
      nombre: nombre,
      apellido: apellido,
      correo: correo,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if (err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'Estas registrado y ahora puedes iniciar sesion.');
    res.redirect(302, '/login');
  }
});

// ----------------- PASSPORT
passport.use(new LocalStrategy({
    usernameField:'correo',
    passwordField:'password'
  },
  function(correo, password, done) {
    User.getUserByEmail(correo, function(err, user){
      if (err) throw err;
      if (!user) return done(null, false, {message: "El correo electronico no ha sido registrado"})
    
      User.comparePassword(password, user.password, function(err, isMatch){
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        }else{
          return done(null, false, {message: "Contrasena invalida"});
        }
      });
    });
  }));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//-------------------- LOGIN FORM
router.post('/login', 
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash:true}),
  function(req, res) {
    res.redirect('/');
});

//-------------------- LOGOUT
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'Has cerrado la sesion.');
  res.redirect('/login');
});

module.exports = router;
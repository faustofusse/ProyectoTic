var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20');

var User = require('../models/user');
var FriendRequest = require('../models/friendRequest');

/* GET PAGINA DE LOGIN/REGISTRO */

router.get('/login', function(req, res, next) {
  req.logout();
  res.render('login', {title: "TARS - Iniciar Sesion", login: true});
});
router.get('/register', function(req, res, next){
  res.redirect(302, '/login');
});

/* LOGIN CON GOOGLE */

router.get('/auth/google', passport.authenticate('google', {
  scope:['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), function (req, res, next) {
  res.send(req.user);
});

// ----------------- REGISTER FORM

router.post('/register', function(req, res, next){
  var nombre = req.body.nombre,
      apellido = req.body.apellido,
      correo = req.body.correo,
      password = req.body.password;
  req.checkBody('correo', 'El correo electronico no es valido').isEmail();
  req.checkBody('repeatPassword', 'Las contrasenas no coinciden').equals(password);

  var errors = req.validationErrors();
  if (errors){
    res.render('login', {title: "TARS - Iniciar Sesion", errors: errors, login: false});
  }else{
    var newUser = new User({
      nombre: nombre,
      apellido: apellido,
      correo: correo,
      password: password
    });

    User.findOne({correo:correo, password:{$exists: true}}, function(err, user) {
      if (err) throw err;
      if (user){
        res.render('login', {title: "TARS - Iniciar Sesion", error:'El correo electronico ya existe.', login: false});
      }else{
        User.findOne({correo:correo, password:{$exists:false}, googleId:{$exists:true}}, function(err, googleUser){
          if (err) throw err;
          if (googleUser){
            User.addPassword(newUser, googleUser, function(err, user){
              if (err) throw err;
              console.log('Contrasenia agregada a: '+user)
            });
          }else{
            User.createUser(newUser, function(err, user){
              if (err) throw err;
              console.log('Usuario creado: '+user)
            });
          }
        });
      }
    });

    req.flash('success_msg', 'Estas registrado y ahora puedes iniciar sesion.');
    res.redirect(302, '/login');
  }
});

// ----------------- PASSPORT LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField:'correo',
  passwordField:'password'
}, 
function(correo, password, done) {
  User.getUserByEmail(correo, function(err, user){
    if (err) throw err;
    if (!user) return done(null, false, {message: "El correo electronico no ha sido registrado"})
    
    if (user.googleId && !user.password){
      return done(null, false, {message: "Inicia con Gooogle o registrate"});
    }else{
      User.comparePassword(password, user.password, function(err, isMatch){
        if (err) throw err;
        if (isMatch)
          return done(null, user);
        else
          return done(null, false, {message: "Contrasena invalida"});
      });
    }
  });
}));

// ----------------- PASSPORT GOOGLE STRATEGY

passport.use(new GoogleStrategy({
  callbackURL:'/auth/google/redirect',
  clientID:'256071701601-ao4aqfs5c29519dbfgbvr6bddv8knesq.apps.googleusercontent.com',
  clientSecret:'T85zJSHLtLd_weLckeyJMcaJ'
}, 
function(accessToken, refreshToken, profile, done) {
  var newUser = new User({
    nombre: profile.name.givenName,
    apellido: profile.name.familyName,
    correo: profile.emails[0].value,
    googleId: profile.id
  });
  User.createUserGoogle(newUser, function(user){
    console.log('Google user created: '+user);
  });
}));

//-------------------- PASSPORT SERIALIZE AND DESERIALIZE

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
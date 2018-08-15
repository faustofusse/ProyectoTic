var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login', {title: "TARS - Iniciar Sesion"});
});
router.get('/register', function(req, res, next){
  res.redirect(302, '/login');
});

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

module.exports = router;
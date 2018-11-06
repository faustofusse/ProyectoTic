var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20');
var User = require('../models/user');

// ----------------- LOCAL STRATEGY

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

// ----------------- GOOGLE STRATEGY

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
        done(null, user);
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
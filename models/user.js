var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    nombre:{type:String},
    apellido:{type:String},
    correo:{type:String},
    password:{type:String},
    friends:[{
        _id:{type:String},
        nombre:{type:String},
        apellido:{type:String}
    }],
    googleId:{type:String}
});

var User = module.exports = mongoose.model('User', UserSchema);

// --------------- FUNCTIONS -------------------

module.exports.createUser = function (newUser, callback){
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function (err, hash){
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.addPassword = function(newUser, googleUser, callback){
    googleUser.nombre = newUser.nombre;
    googleUser.apellido = newUser.apellido;
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function (err, hash){
            googleUser.password = hash;
            googleUser.save(callback);
        });
    });
};

module.exports.createUserGoogle = function(newUser, callback){
    User.findOne({googleId:newUser.googleId}, function(err, googleUser){
        if (err) throw err;
        if (googleUser){
            // Existe el usuario con el googleId (ya habia iniciado con Google)
            console.log('Ya habia iniciado con Google.');
            callback(googleUser);
        } else {
            User.findOne({correo:newUser.correo}, function(err, user){
                if (err) throw err;
                if (user){
                    console.log('Existe un usuario con el mismo correo.');
                    user.googleId = newUser.googleId;
                    user.save(function(){
                        callback(user)
                    });                    
                }else{
                    console.log('No existe el usuario y nunca habia iniciado sesion.')
                    newUser.save(function(){
                        callback(newUser);
                    });  
                }
            });
        }
    });
}

module.exports.getUserByEmail = function (correo, callback){
    var query = {correo: correo};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback){
    User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.deleteFriend = function(user1, user2, callback){
    User.update({_id:user1}, {$pull: { friends: { _id: user2 } }}, function(err, raw){
        User.update({_id:user2}, {$pull: { friends: { _id: user1 } }}, callback);
    });
}
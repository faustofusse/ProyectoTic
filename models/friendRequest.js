var mongoose = require('mongoose');
var User = require('./user');

var FriendReqSchema = mongoose.Schema({
    from:{type:String},
    to:{type:String}
});

var FriendRequest = module.exports = mongoose.model('FriendRequest', FriendReqSchema);

// ------------ FUNCTIONS

module.exports.newFR = function(from, to, callback){
    FriendRequest.find({from:from, to:to}, function(err, docs){
        if (docs.length){
            var newfr = new FriendRequest({
                from:from,
                to:to
            });
            newfr.save(callback);
        }
    });
};

module.exports.acceptFR = function(from, to, callback){
    User.findById(from, function(err, userFrom){
        User.findById(to, function(err, userTo){
            userFrom.friends.push({
                _id: to,
                nombre: userTo.nombre,
                apellido: userTo.apellido
            });
            userTo.friends.push({
                _id: from,
                nombre: userFrom.nombre,
                apellido: userFrom.apellido
            });
            userFrom.save();
            userTo.save();
            FriendRequest.deleteOne({from:from,to:to}, callback);
        });
    });
};

module.exports.declineFR = function(from, to, callback){
    FriendRequest.deleteOne({from:from,to:to}, callback);
};
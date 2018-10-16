var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000});

server.on('connection', function(id){
    console.log('User connected. ID: '+id);
});

server.on('disconnect', function(id){
    console.log('User disconnected. ID: '+id);
});

module.exports = server;
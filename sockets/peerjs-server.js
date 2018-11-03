var ExpressPeerServer = require('peer').ExpressPeerServer;
var express = require('express');
var app = express();
var http = require('http');

var PORT = 9000;

var server = http.createServer(app);
server.listen(PORT, function () {
  console.log('PeerJs server listening on port ' + PORT + '....');
});

var peerserver = ExpressPeerServer(server, {debug: true});

app.use('/', peerserver);

peerserver.on('connection', function(id) {
//console.log(id + ' connected.');
});

peerserver.on('disconnect', function(id) {
//console.log(id + ' disconnected');
});

module.exports = peerserver;
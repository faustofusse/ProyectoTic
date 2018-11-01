var WebSocketServer = require('websocket').server;
var http = require('http');

var PORT = 8000;

var server = http.createServer();
server.listen(PORT, function () {
  console.log('Socket server listening on port ' + PORT + '....');
});

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', function (request) {

  var connection = request.accept('arduino', request.origin);
  console.log('Connection accepted.');

  connection.on('message', function (message) {
    console.log('DATa ', message);
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data)
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
  });

  connection.on('close', function (reasonCode, description) {
    console.log('Socket ' + connection.remoteAddress + ' disconnected.');
  });

  connection.sendUTF('Hallo Client!');
});

module.exports = wsServer;
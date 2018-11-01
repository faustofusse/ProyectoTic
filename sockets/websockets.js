module.exports = function(app, server){
    var WebSocketServer = require('websocket').server;

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
        
        var connection = request.accept('arduino', request.origin);
        console.log('Robot connected.');
        
        connection.on('message', function (message) {
            console.log('Message: ', message);
        });

        connection.on('close', function (reasonCode, description) {
            console.log('Robot disconnected. IP:' + connection.remoteAddress);
        });
    });
};
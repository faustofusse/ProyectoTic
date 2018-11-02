module.exports = function(app, server){
    var WebSocketServer = require('websocket').server;

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
        var robot = request.accept('arduino', request.origin);
        console.log('Someone connected.');
        
        robot.on('message', function (message) {
            console.log('Message: ', message.utf8Data);
            wsServer.broadcast(message.utf8Data);
        });
        robot.on('close', function (reasonCode, description) {
            console.log('Robot disconnected.');
        });
    });
};
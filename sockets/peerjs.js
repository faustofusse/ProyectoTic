module.exports = function(app, server){
    var ExpressPeerServer = require('peer').ExpressPeerServer;
    var peerserver = ExpressPeerServer(server, {debug: true});

    app.use('/', peerserver);

    peerserver.on('connection', function(id) {
    //console.log(id + ' connected.');
    });

    peerserver.on('disconnect', function(id) {
    //console.log(id + ' disconnected');
    });
};
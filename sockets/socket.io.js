module.exports = function(app, server){
    var io = require('socket.io')(server);

    io.on('connection', function(socket){
        console.log('User connected.');
        socket.emit('light', true);

        socket.on('disconnect', function(){
            console.log('User disconnected.');
        });

        socket.on('movimiento', function(data){
            app.locals.movimiento = data;
        });

        //socket.emit('request', ); // emit an event to the socket
        //io.emit('broadcast', ); // emit an event to all connected sockets
        //socket.on('reply', function(){ }); // listen to the event
    });
};
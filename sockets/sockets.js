module.exports = function(app, server){
    var io = require('socket.io')(server);

    io.on('connection', function(socket){

        socket.on('movimiento', function(data){
            app.locals.movimiento = data.movimiento;
            if (app.locals.robots[0] !== undefined)
                io.to(`${app.locals.robots[0].socket}`).emit('movimiento', data.movimiento);
        });

        socket.on('arduino-connection', function(data){
            console.log('Arduino connected. (MAC: '+data.mac+')');
            app.locals.robots.push({mac:data.mac, socket:socket.id});
        });

        socket.on('user-connection', function(data){
            console.log('User connected. (ID: '+data+')');
            io.emit('user-connection', data);
            //io.emit('usuarioconectado', true);
            if (app.locals.robots[0] !== undefined)
                io.to(`${app.locals.robots[0].socket}`).emit('hola', 'arduino');
        });

        socket.on('disconnect', function(){
            disconnectRobot(socket.id);
        });
    });

    function disconnectRobot(id){
        for(var i = 0; i<app.locals.robots.length; i++){
            if (app.locals.robots[i].socket === id){
                app.locals.robots.splice(i, 1);
                console.log('Arduino disconnected.');
            }
        }
    }
}
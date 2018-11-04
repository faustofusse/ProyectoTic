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
            console.log('User connected. (ID: '+data.id+')');
            io.emit('user-connection', data);
            data.socket = socket.id;
            app.locals.users.push(data);
            if (app.locals.robots[0] !== undefined)
                io.to(`${app.locals.robots[0].socket}`).emit('hola', 'arduino');
        });

        socket.on('disconnect', function(){
            disconnectUser(socket.id);
            disconnectRobot(socket.id);
        });
    });

    function disconnectRobot(id){
        for(var i = 0; i<app.locals.robots.length; i++){
            if (app.locals.robots[i].socket === id){
                app.locals.robots.splice(i, 1);
                io.emit('robot-disconnect', app.locals.robots[i].mac);
                console.log('Arduino disconnected.');
            }
        }
    }
    
    function disconnectUser(id){
        for(var i = 0; i<app.locals.users.length; i++){
            if (app.locals.users[i].socket === id){
                io.emit('user-disconnect', app.locals.users[i].id);
                app.locals.users.splice(i, 1);
                console.log('User disconnected.');
            }
        }
    }
}
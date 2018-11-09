module.exports = function(app, server){
    var io = require('socket.io')(server);

    io.on('connection', function(socket){

        socket.on('movimiento', function(data){
            var socketRobot;
            for (var i = 0; i < app.locals.connections.length; i++) {
                if(app.locals.connections[i].socketUser === socket.id)
                    socketRobot = app.locals.connections[i].socketRobot;
            }
            if (app.locals.robots[0] !== undefined)
                io.to(`${socketRobot}`).emit('movimiento', data.movimiento);
        });

        socket.on('arduino-connection', function(data){
            console.log('Arduino connected. (MAC: '+data.mac+')');
            app.locals.robots.push({mac:data.mac, socket:socket.id});
        });

        socket.on('robot-request', function(data){
            console.log('Request: '+data.mac);
            var request = robotRequest(data.id, data.mac);
            if (request === 'Conexion aceptada.'){
                var robotId = getRobotId(data.mac);
                console.log(robotId);
                app.locals.connections.push({id:data.id, mac:data.mac, socketUser:socket.id, socketRobot:robotId});
                console.log('Conexion aceptada papu');
            }else{
                console.log(request);
            }
            socket.emit('robot-request', request);
        });

        socket.on('user-connection', function(data){
            console.log('User connected. (ID: '+data.id+')');
            io.emit('user-connection', data);
            data.socket = socket.id;
            app.locals.users.push(data);
            /*if (app.locals.robots[0] !== undefined)
                io.to(`${app.locals.robots[0].socket}`).emit('hola', 'arduino');*/
        });

        socket.on('arduino-freno', function(data){
            for (let i = 0; i < app.locals.connections.length; i++) {
                const element = app.locals.connections[i];
                if (element.socketRobot === socket.id){
                    io.to(`${element.socketUser}`).emit('arduino-freno', data);
                }
            }
        });

        socket.on('disconnect', function(){
            for (var i = 0; i < app.locals.connections.length; i++) {
                if(app.locals.connections[i].socketRobot === socket.id || app.locals.connections[i].socketUser === socket.id)
                    app.locals.connections.splice(i, 1);
            }
            disconnectUser(socket.id);
            disconnectRobot(socket.id);
        });
    });

    function disconnectRobot(id){
        for(var i = 0; i<app.locals.robots.length; i++){
            if (app.locals.robots[i].socket === id){
                io.emit('robot-disconnect', app.locals.robots[i].mac);
                app.locals.robots.splice(i, 1);
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

    function getRobotId(mac) {
        for (var i = 0; i < app.locals.robots.length; i++) {
            if(app.locals.robots[i].mac === mac)
                return app.locals.robots[i].socket;
        }
    }

    function robotRequest(userId, mac) {
        for (var i = 0; i < app.locals.connections.length; i++) {
            if (app.locals.connections[i].id === userId){
                return 'Ya estas conectado a un robot.';
            }
            if (app.locals.connections[i].mac === mac){
                if (app.locals.connections[i].id === userId){
                    return 'Ya estas conectado a ese robot.';
                }else{
                    return 'El robot esta ocupado.';
                }
            }
        }
        for (var i = 0; i < app.locals.robots.length; i++) {
            if(app.locals.robots[i].mac === mac){
                return 'Conexion aceptada.';
            }
        }
        return 'El robot no existe o no esta conectado.';
    }
}
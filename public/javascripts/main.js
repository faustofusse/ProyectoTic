// ------------------------------------------------- CHECKEAR HTTPS

if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '192.168.0.47')
	//window.location.href = 'https://'+location.hostname;
	
var mobile = window.matchMedia("(max-width: 780px)").matches;
var height = $('html').height() - ($('header').height() + $('nav').height() + $('div.menuBottom').height() + $('div.menuBottom').height()/2);
if (mobile)
	$('div.left div.amigos, div.left div.robots').height(height);
// ------------------------------------------------- INICIALIZAR

updateRequests();
updateFriends();
updateRobots();

var circuito = false;
var tiempoCircuitos = [16000, 9000, 16000];
var movimiento = 'stop';
var robot = '';
var friends = [];
var robots = [];
var videollamada = '';

// ------------------------------------------------- SOCKETS

var socket = io({transports: ['polling', 'websockets']});  // con transports: polling funciona - NO FUNCIONA con transports: websockets

socket.on('connect', function() {
	console.log('Socket connected.');
	socket.emit('user-connection', {id:userId, nombre:nombre, apellido:apellido});
	if (robot !== '')
		socket.emit('robot-request', {id:userId, mac:robot});
	teclasMovimiento(socket); 
});

socket.on('user-connection', function(data) {
	if (data.id !== userId && isMyFriend(data.id)){
		showMessage(data.nombre + ' ' + data.apellido, ' se ha conectado.', 'green');
		updateFriends();
	}
});

socket.on('videocall', function(data) {
	
});

socket.on('videocall-close', function(data) {
	videocall = '';
	window.currentCall.close();
});

socket.on('user-disconnect', function(data) {
	// alert('User disconnected: '+data);
	updateFriends();
});

socket.on('robot-request', function(data) {
	if (data === 'Conexion aceptada.'){
		$('div.menu div.addRobot div.mac').slideUp();
		$('div.menu div.addRobot div.movimiento').slideDown();
		showMessage('', 'Conexion Aceptada.', 'green');
		$('div.contenedor div.left div.amigos').animate({width: '0%'}, 300);
		$('div.contenedor div.left div.robots').animate({width: '100%'}, 300);
		$('button#robots').css('border-color', $('header h1').css('color'));
		$('button#amigos').css('border-color', $('button#amigos').css('background-color'));
	}else{
		robot = '';
		showMessage(data, '', 'red');
	}
});

socket.on('robot-connection', function (mac) {
	var element = document.getElementById(mac);
	$(element.querySelector('div#estado')).attr('class', 'conectado');
	$(element.querySelector('button#connect')).css('display', 'flex');
	$(element).css('order', '0');
	for (var i = 0; i < robots.length; i++) {
		if (robots[i] === mac)
			showMessage('', mac + ' conectado.', 'green');
	}
});

socket.on('robot-disconnect', function (mac) {
	for (var i = 0; i < robots.length; i++) {
		if (robots[i] === mac)
			updateRobots();
	}
	if (robot === mac){
		$('div.menu div.addRobot div.movimiento').slideUp();
		$('div.menu div.addRobot div.mac').slideDown();
		showMessage('', 'Robot desconectado.', 'red');
	}
});

socket.on('reconnect_attempt', function() {
	console.log('Reconnect attempt.');
	// esto era cuando el transports estaba inicialmente en 'websockets', entonces si no funcionaba se ponia polling
    // socket.io.ospts.transports = ['polling', 'websocket'];
});

function teclasMovimiento(socket) {
	$(document).keydown(function(e) {
		var temp = movimiento;
	    switch(e.which) {
	        case 37: movimiento = "left"; break;
	        case 38: movimiento = "forward"; break;
	        case 39: movimiento = "right"; break;
	        case 40: movimiento = "backward"; break;
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault();
	    if(temp !== movimiento && !circuito){
	    	$('div.flechas button').css('background-color', 'var(--transparent)');
	    	$('div.flechas button#'+movimiento).css('background-color', 'var(--navbar)');
	    	console.log(movimiento);
	    	socket.emit('movimiento', {id:userId, movimiento:movimiento});
	    }
	}).keyup(function(e) {
		var movimientoAnterior = movimiento;
	    switch(e.which) {
	        case 37: movimiento = "stop"; break;
	        case 38: movimiento = "stop"; break;
	        case 39: movimiento = "stop"; break;
	        case 40: movimiento = "stop"; break;
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault();
	    if (!circuito){
	    	$('div.flechas button#'+movimientoAnterior).css('background-color', 'var(--transparent)');
		    console.log(movimiento);
		    socket.emit('movimiento', {id:userId, movimiento:movimiento});
		}
	});

	$('div.flechas button').mousedown(function(event) {
		var movimiento = $(this).attr('id');
		if (!circuito){
			socket.emit('movimiento', {id:userId, movimiento:movimiento});
			console.log(movimiento);
		}	
	}).mouseup(function(event) {
		var movimiento = "stop";
		if (!circuito) {
			socket.emit('movimiento', {id:userId, movimiento:movimiento});
			console.log(movimiento);
		}			
	});

	$('div.circuitos button').click(function(event) {
		var id = $(this).attr('id')
		var movimiento = 'circuito' + id;
		var tiempo = tiempoCircuitos[id-1];
		if (!circuito){
			socket.emit('movimiento', {id:userId, movimiento:movimiento});
			console.log('Circuito '+id+' comenzado.');
			circuito = true;
			setTimeout(function(){ 
				circuito = false;	
				console.log('Circuito '+id+' terminado.'); 
			}, tiempo);
		}
	});
}

// ------------------------------------------------- 
// -------------------------------------------------
// ------------------------------------------------- EVENTS
// ------------------------------------------------- 
// -------------------------------------------------

$('button#conectar').click(function(event) {
	var mac = '';
	for (var i = 0; i < $('div.mac input').length; i++) {
		mac += $('div.mac input')[i].value.toUpperCase();
		if(i!==$('div.mac input').length-1) mac += ':';
	}
	if (!validateMacAddress(mac)) return alert('Ingrese una direccion valida.');
	socket.emit('robot-request', {id:userId, mac:mac});
	robot = mac;
});

$('div.videollamada div.llamando div.opciones button#atender').click(atender);
$('div.videollamada div.llamando div.opciones button#declinar').click(declinar);

$('div.conferencia div.opciones button#close').click(declinar);
$('div.conferencia div.opciones button#screenshot').click(screenshot);
$('div.conferencia div.opciones button#volume').click(volume);
$('div.conferencia div.opciones button#expand').click(expand);

$('div.screenshot a, div.screenshot button').click(function(event) {
	$('div.screenshot').css('display', 'none');
});

$('div.conferencia').mouseenter(function(event) {
	$(this).find('div.opciones').css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0});
	animateButtons('5%', 20);
});

$('div.conferencia').mouseleave(function(event) {
	$(this).find('div.opciones').css({opacity: 1.0, visibility: "visible"}).animate({opacity: 0}, 200);
	animateButtons('0%', 20);
});

$('div.contenedor div.left div.superior button, div.menuBottom button#amigos, div.menuBottom button#robots').click(function(event) {
	var id = $(this).attr('id');
	var id2 = 'amigos';
	if (id == 'amigos') id2 = 'robots';
	$('div.contenedor div.left div.' + id2).animate({width: '0%'}, 300);
	$('div.contenedor div.left div.' + id).animate({width: '100%'}, 300);
	$('button#' + id).css('border-color', $('header h1').css('color'));
	$('button#' + id2).css('border-color', $(this).css('background-color'));
	if (id === 'amigos')
		updateFriends();
	else 
		updateRobots();
});

$('html').keyup(function(event) {
	if (event.keyCode === 27) {
		terminarMenu();
		peer.send("Atende.");
	}
});

$('div.menu div div.superior button, div.menu div.background').click(function(event) {
	terminarMenu();
});

$('div.buscar div.input input').keyup(function(event) {
	if ($(this).val().trim().length > 0){
		searchUsers($(this).val());
	} else {
		$('div.buscar div.listado div.usuario').remove();
		$('div.buscar div.listado div.none').css('display', 'none');
	}
});

$('button#friendRequests, div.menuBottom button#solicitudes').click(function(event) {
	$('div.menu').css('display','flex');
	$('div.solicitudes').css('display','flex');
	$('div.menu div.solicitudes').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
	updateRequests();
});
$('button#addFriend, button#buscar').click(function(){
	$('div.menu').css('display','flex');
	$('div.buscar').css('display','flex');
	$('div.menu div.buscar').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
	$('input#buscar').focus();
});
$('button#connectRobot').click(function(event) {
	$('div.menu').css('display','flex');
	$('div.addRobot').css('display','flex');
	$('div.menu div.addRobot').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
});
$('button#logout').click(function(event) {
	document.location.href = '/logout';
});

// ------------------------------------------------- 
// ------------------------------------------------- 
// ------------------------------------------------- FUNCTIONS
// ------------------------------------------------- 
// ------------------------------------------------- 


function updateRobots() {
	$.get('/api/robots', function(data) {
		$('main div.contenedor div.left div.inferior div.robots > div').remove();
		var myRobots = data.robots,
			connected = data.connected;
		robots = data.robots;
		if (myRobots.length) $('div.contenedor div.left div.robots h3').css('display', 'none');
		for (var i = 0; i < myRobots.length; i++) {
			var mac = myRobots[i].mac;
			var div = $('<div class="usuario"><span></span><input type="text"><div class="opciones"><button id="rechazar"><i class="fas fa-times"></i></button><button id="aceptar"><i class="fas fa-check"></i></button><button id="edit"><i class="fas fa-pencil-alt"></i></button><button id="connect"><i class="fas fa-plug"></i></button><div id="estado" class="desconectado"></div></div></div>')
			div.attr('id', mac);
			div.find('button#edit').click(btnEditarNombre);
			div.find('button#aceptar').click(btnAceptarNombre);
			div.find('button#rechazar').click(btnRechazarNombre);
			div.find('span').html(myRobots[i].nombre);
			div.find('input').val(myRobots[i].nombre);
			div.find('button#connect').css('display', 'none').click(conectarRobot);;
			$('div.contenedor div.left div.robots').append(div);
		}
		for (var i = 0; i < data.connected.length; i++) {
			var element = document.getElementById(mac);
			// var element = $('main div.contenedor div.left div.inferior div.robots > div#'+data.connected[i].mac);
			$(element.querySelector('div#estado')).attr('class', 'conectado');
			$(element.querySelector('button#connect')).css('display', 'flex');
			$(element).css('order', '0');
		}
	});
}

function updateFriends(){
	$.get('/api/friends', function(data){
		friends = data.friends;
		$('main div.contenedor div.left div.inferior div.amigos div.usuario').remove();
		if (data.friends.length)
			$('main div.contenedor div.left div.inferior div.amigos h3').css('display', 'none');
		else
			$('main div.contenedor div.left div.inferior div.amigos h3').css('display', 'flex');
		
		for (var i = data.friends.length - 1; i >= 0; i--) {
			var div = $('<div class="usuario"><span></span></div>');
			var opciones = $('<div><button class="videollamada"></button><button id="opciones"></button><div id="estado" class="desconectado"></div></div>')
			var list = $('<ul></ul>');
			list.append('<li><button id="perfil">Perfil</button></li>')
				.append('<li><button id="eliminar">Eliminar</button></li>');
			list.find('button#perfil').click(botonPerfil);
			list.find('button#eliminar').click(botonEliminar);
			opciones.find('button.videollamada').append('<i class="fa fa-video"></i>').attr('id', data.friends[i]._id).click(botonVideollamada);
			opciones.find('button#opciones').append('<i class="fa fa-ellipsis-v"></i>').click(botonOpciones);
			/* ELIMINAR BOTON DE OPCIONES */ opciones.find('button#opciones').remove();
			div.attr('id', data.friends[i]._id);
			div.find('span').html(data.friends[i].nombre + ' ' + data.friends[i].apellido);
			div.append(opciones);
			div.find('button#opciones').append(list);
			$('main div.contenedor div.left div.inferior div.amigos').append(div);
		}
		$('main div.contenedor div.left div.inferior div.amigos div button.videollamada').css('display', 'none');
		for (var i = 0; i < data.connected.length; i++) {
			var element = $('main div.contenedor div.left div.inferior div.amigos > div#'+data.connected[i].id);
			element.find('div#estado').attr('class', 'conectado');
			element.find('button.videollamada').css('display', 'flex');
			element.css('order', '0');
		}
	});
}

function updateRequests(){
	$.get('/api/friends/requests', function(requests){
		$('div.solicitudes div.listado div.usuario').remove();
		if (requests.length === 0) 
			$('div.solicitudes div.listado div.none').css('display', 'flex');
		else	
			$('div.solicitudes div.listado div.none').css('display', 'none');
		for (var i = 0; i<requests.length; i++){
			var div = $('<div></div>');
			div.attr({
			   	'id': requests[i]._id,
			   	'class': 'usuario'
			   })
			   .append('<span>'+requests[i].nombre+' '+requests[i].apellido+'</span>');
			var options = $('<div></div>').append('<button id="aceptar"><i class="fa fa-check"></i></button>')
										  .append('<button id="rechazar"><i class="fa fa-times"></i></button>');
			div.append(options);
			div.find('div button').click(botonSolicitud);
			$('div.solicitudes div.listado').append(div);
		}
	}, 'json');
}

function searchUsers(query){
	$.get('/api/search/' + query, function (resultados) {
		$('div.buscar div.listado div.usuario').remove();
		for (var i = 0; i<resultados.length; i++){
			var nombre = resultados[i].nombre+' '+resultados[i].apellido;
			var user = $('<div></div>').append('<span>'+nombre+'</span>')
							.append('<div class="options"><button><i class="fa fa-check"></i></button><button><i class="fa fa-times"></i></button></div>')
							.append('<button><i class="fa fa-user-plus"></i></button>')
							.attr('class', 'usuario');
			user.find('div.options').css('display', 'none');
			user.find('button').click(botonAgregar);
			user.find('button').attr('id', resultados[i]._id);
			switch(resultados[i].request){
				case 'sent':
					user.find('button i').attr('class', 'fa fa-user-clock');
					break;
				case 'friend':
					user.find('button i').attr('class', 'fa fa-user-friends');
					break;
				case 'received':
					user.find('> button').css('display', 'none');
					user.find('div.options').css('display', 'flex');
					break;	
			}
			if (resultados[i]._id !== userId)
				$('div.buscar div.listado').append(user);
		}
		if (!$('div.buscar div.listado div.usuario').length)
			$('div.buscar div.listado div.none').css('display', 'flex');
		else 
			$('div.buscar div.listado div.none').css('display', 'none');
	},'json');
}

function animateButtons(margin, speed){
	var buttons = $('div.conferencia div.opciones button');
	buttons.eq(0).animate({
		marginLeft: margin},
		speed, function() {
		buttons.eq(1).animate({
			marginLeft: margin},
			speed, function() {
			buttons.eq(2).animate({
				marginLeft: margin},
				speed, function() {
				buttons.eq(3).animate({
					marginLeft: margin},
					speed, function() {
				});
			});
		});
	});
}

function btnEditarNombre() {
	var parent = $(this).parent().parent();
	$(this).css('display', 'none');
	parent.find('input').css('display', 'flex');
	parent.find('> span').css('display', 'none');
	parent.find('button#rechazar, button#aceptar').css('display', 'flex');
}

function findRobotByMac(mac) {
	for (var i = 0; i < robots.length; i++) {
		if (robots[i].mac === mac)
			return robots[i];
	}
}

function btnAceptarNombre() {
	var parent = $(this).parent().parent();
	var nombre = parent.find('input').val();
	parent.find('> span').html(nombre);
	parent.find('> span, button#edit').css('display', 'flex');
	parent.find('button#rechazar, button#aceptar, input').css('display', 'none');
	cambiarNombre(parent.attr('id'), nombre);
}

function btnRechazarNombre() {
	var parent = $(this).parent().parent();
	parent.find('input').val(findRobotByMac(parent.attr('id')).nombre);
	parent.find('> span, button#edit').css('display', 'flex');
	parent.find('button#rechazar, button#aceptar, input').css('display', 'none');
}

function conectarRobot(mac) {
	var mac = $(this).parent().parent().attr('id');
	socket.emit('robot-request', {id:userId, mac:mac});
	robot = mac;
}

function cambiarNombre(mac, nombre) {
	$.post('/api/robots/edit/name', {mac: mac, nombre:nombre}, function(data, textStatus, xhr) {
		console.log(data);
		updateRobots();
	});
}

function botonOpciones(){
	$('button#opciones ul').slideUp(200);
	if ($(this).find('ul').css('display')==='none')
		$(this).find('ul').slideDown(200);
}

function botonPerfil(){
	alert('perfil');
}

function botonEliminar(){
	var id = $(this).parent().parent().parent().parent().parent().attr('id');
	deleteFriend(id);
}

function botonSolicitud(){
	var div = $(this).parent().parent();
	var id = div.attr('id');
	switch($(this).attr('id')){
		case 'aceptar':
			console.log('aceptar');
			acceptRequest(id);
			break;
		case 'rechazar':
			console.log('rechazar');
			declineRequest(id);
			break;
	}
	div.remove();
}

function botonAgregar(event) {
	var id = $(this).attr('id');
	var clase = $(this).find('i').attr('class');
	if (clase.indexOf('user-plus') != -1){
		$(this).find('i').attr('class', 'fa fa-user-clock');
		sendRequest(id);
	}else if (clase.indexOf('clock') != -1){
	}else if (clase.indexOf('user-friends') != -1){
		console.log('Ya son amigos che.')
	}else if (clase.indexOf('check') != -1){
		$(this).parent().css('display', 'none');
		$(this).parent().parent().find('> button').css('display', 'flex');
		$(this).parent().parent().find('> button i').attr('class', 'fa fa-user-friends');
		acceptRequest(id);
	}else if (clase.indexOf('times') != -1){
		$(this).parent().css('display', 'none');
		$(this).parent().parent().find('> button').css('display', 'flex');
		$(this).parent().parent().find('> button i').attr('class', 'fa fa-user-plus');
		declineRequest(id);
	}
};

function terminarMenu(){
	$('div.buscar, div.solicitudes, div.addRobot').animate({marginTop:'10%'}, 200, function(){
		$('div.menu, div.menu > div').css('display', 'none');
		$('div.menu').css('display', 'none');
	});
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0)');
}

function sendRequest(to){
	$.post('/api/friends/requests/send/' + to, function(data){
		console.log(data);
	}, 'json');
};

function acceptRequest(from){
	$.ajax({
		url:'/api/friends/requests/accept/' + from,
		type:'PUT',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
		updateFriends();
	});
};

function declineRequest(from){
	$.ajax({
		url:'/api/friends/requests/decline/' + from,
		type:'DELETE',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
};

function deleteFriend(id){
	$.ajax({
		url:'/api/friends/delete/' + id,
		type:'DELETE',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
}

function validateMacAddress(mac) {
	var regex = /^([0-9A-F]{2}[:-]?){5}([0-9A-F]{2})$/;
	return regex.test(mac);
}

function showMessage(strong, text, status) {
	var div = $('<div><div class="status"></div><span><strong></strong></span><button id="cerrar"><i class="fa fa-times"></i></button></div>')
	div.find('strong').html(strong);
	div.find('span').append(text);
	div.find('div.status').attr('class', 'status '+status);
	div.find('button#cerrar').click(cerrarMensaje);
	$('div.mensajes').append(div);
	div.css('display', 'flex');
	div.animate({paddingLeft:'1em', width:'100%'}, 300);
	setTimeout(function() {
		div.slideUp(300, function() {
			div.remove();
		});
	}, 5000);
}

function cerrarMensaje(event) {
	var div = $(this).parent();
	div.slideUp(400, function() {
		div.remove();
	});
}

function isMyFriend(id) {
	for (var i = 0; i < friends.length; i++) {
		if(friends[i]._id === id)
			return true;
	}
}


/*
$('header').attr('id', 'redBox');
var red = document.getElementById("redBox");
console.log(red._gsTransform);
// $('header').changeOrder(2);


$.fn.changeOrder = function(order) {
	var box = {
		transform: this._gsTransform,
	    x: this.offsetLeft,
	    y: this.offsetTop,
	    element: this
	}
	this.css('order', order);

	var lastX = box.x;
    var lastY = box.y;
    
    box.x = box.element.offsetLeft;
    box.y = box.element.offsetTop;
    
    // Continue if box hasn't moved
    // if (lastX === box.x && lastY === box.y) continue;
    
    // Reversed delta values taking into account current transforms
    var x = box.transform.x + lastX - box.x;
    var y = box.transform.y + lastY - box.y;  
    var ease  = Power1.easeInOut;

    // Tween to 0 to remove the transforms
    TweenLite.fromTo(box.element, 0.5, { x, y }, { x: 0, y: 0, ease });
}*/

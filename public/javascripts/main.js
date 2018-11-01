// ------------------------------------------------- INICIALIZAR

//if (location.protocol !== 'https:' && location.hostname !== 'localhost')
updateFriends();
updateRequests();

// ------------------------------------------------- SOCKETS

var socket = io({transports: ['polling', 'websockets']});  // con transports: polling funciona - NO FUNCIONA con transports: websockets

socket.on('connect', function() {
	console.log('Socket connected.');
	teclasMovimiento(socket);
});

socket.on('reconnect_attempt', () => {
	console.log('Reconnect attempt.');
	// esto era cuando el transports estaba inicialmente en 'websockets', entonces si no funcionaba se ponia polling
    socket.io.ospts.transports = ['polling', 'websocket'];
});

function teclasMovimiento(socket) {
	$(document).keydown(function(e) {
	    switch(e.which) {
	        case 37: // left
	            movimiento = "left";
	            break;
	        case 38: // up
	            movimiento = "forward";
	            break;
	        case 39: // right
	            movimiento = "right";
	            break;
	        case 40: // down
	            movimiento = "backward";
	            break;
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	    console.log(movimiento);
	    socket.emit('movimiento', movimiento);
	});

	$(document).keyup(function(e) {
	    switch(e.which) {
	        case 37: // left
	            movimiento = "stop";
	            break;
	        case 38: // up
	            movimiento = "stop";
	            break;
	        case 39: // right
	            movimiento = "stop";
	            break;
	        case 40: // down
	            movimiento = "stop";
	            break;
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	    socket.emit('movimiento', movimiento);
	});
}

// ------------------------------------------------- 
// -------------------------------------------------
// ------------------------------------------------- EVENTS
// ------------------------------------------------- 
// -------------------------------------------------

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

$('div.contenedor div.left div.superior button').click(function(event) {
	var id = $(this).attr('id');
	var id2 = 'amigos';
	if (id == 'amigos') id2 = 'robots';
	$('div.contenedor div.left div.' + id2).animate({width: '0%'}, 300);
	$('div.contenedor div.left div.' + id).animate({width: '100%'}, 300);
	$('button#' + id).css('border-color', $('header h1').css('color'));
	$('button#' + id2).css('border-color', $(this).css('background-color'));
	if (id === 'amigos')
		updateFriends();
});

$('html').keyup(function(event) {
	if (event.keyCode === 27) {
		terminarMenu();
		peer.send("Atende.");
	}
});

$('div.solicitudes div.superior button, div.menu div.background').click(function(event) {
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

$('button#friendRequests').click(function(event) {
	$('div.menu').css('display','flex');
	$('div.solicitudes').css('display','flex');
	$('div.menu div.solicitudes').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
	updateRequests();
});
$('button#addFriend').click(function(){
	$('div.menu').css('display','flex');
	$('div.buscar').css('display','flex');
	$('div.menu div.buscar').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
	$('input#buscar').focus();
});
$('button#settings').click(function(event) {
	
});
$('button#logout').click(function(event) {
	document.location.href = '/logout';
});

// ------------------------------------------------- 
// ------------------------------------------------- 
// ------------------------------------------------- FUNCTIONS
// ------------------------------------------------- 
// ------------------------------------------------- 

function updateFriends(){
	$.get('/api/friends', function(friends){
		$('main div.contenedor div.left div.inferior div.amigos div.usuario').remove();
		if (friends.length)
			$('main div.contenedor div.left div.inferior div.amigos h3').css('display', 'none');
		else
			$('main div.contenedor div.left div.inferior div.amigos h3').css('display', 'flex');
		for (var i = friends.length - 1; i >= 0; i--) {
			var div = $('<div class="usuario"><span></span></div>');
			var opciones = $('<div><button id="videollamada"></button><button id="opciones"></button></div>')
			var list = $('<ul></ul>');
			list.append('<li><button id="perfil">Perfil</button></li>')
				.append('<li><button id="eliminar">Eliminar</button></li>');
			list.find('button#perfil').click(botonPerfil);
			list.find('button#eliminar').click(botonEliminar);
			opciones.find('button#videollamada').append('<i class="fa fa-video"></i>').attr('id', friends[i]._id).click(botonVideollamada);
			opciones.find('button#opciones').append('<i class="fa fa-ellipsis-v"></i>').click(botonOpciones);
			div.attr('id', friends[i]._id);
			div.find('span').html(friends[i].nombre + ' ' + friends[i].apellido);
			div.append(opciones);
			div.find('button#opciones').append(list);
			$('main div.contenedor div.left div.inferior div.amigos').append(div);
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
	$('div.buscar, div.solicitudes').animate({marginTop:'10%'}, 200, function(){
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
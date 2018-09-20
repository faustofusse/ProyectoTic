var escapeBuscar = true;


$.get('/api/friends/requests', function(data){
	console.log(data);
}, 'json');


// ------------------------------------------------- EVENTS


$('div.contenedor div.left div.superior button').click(function(event) {
	var id = $(this).attr('id');
	var id2 = 'amigos';
	if (id == 'amigos') id2 = 'robots';
	$('div.contenedor div.left div.' + id2).animate({width: '0%'}, 300);
	$('div.contenedor div.left div.' + id).animate({width: '100%'}, 300);
	$('button#' + id).css('border-color', $('header h1').css('color'));
	$('button#' + id2).css('border-color', $(this).css('background-color'));
});

$('div.buscar div.background').click(function(event) {
	terminarBusqueda();
});

$('div.buscar').keyup(function(event) {
	if (event.keyCode === 27) 
		terminarBusqueda();
});

$('div.solicitudes div.background').click(function(event) {
	terminarSolicitudes();
});

$('div.solicitudes div.contenedor div.superior button').click(function(event) {
	terminarSolicitudes();
});

$('div.buscar div.input input').keyup(function(event) {
	if ($(this).val().trim().length > 0)
		searchUsers($(this).val());
	else 
		$('div.buscar div.listado div').remove();
});


$('button#friendRequests').click(function(event) {
	$('div.solicitudes').css('display','flex')
	$('div.solicitudes div.contenedor').animate({marginTop:'5%'}, 200);
	$('div.solicitudes div.background').css('background-color', 'rgba(0,0,0,0.15)');
});
$('button#addFriend').click(function(){
	$('div.buscar').css('display','flex')
	$('div.buscar div.input').animate({marginTop:'6%'}, 200);
	$('div.buscar div.background').css('background-color', 'rgba(30,136,229,0.9)');
	$('input#buscar').focus();
});
$('button#settings').click(function(event) {
	
});
$('button#logout').click(function(event) {
	document.location.href = '/logout';
});

// ------------------------------------------------- FUNCTIONS

function searchUsers(query){
	$.get('/api/search/' + query, function (search) {
		$('div.buscar div.listado div').remove();
		console.log(search);
		for (var i = 0; i<search.resultados.length; i++){
			var nombre = search.resultados[i].nombre+' '+search.resultados[i].apellido;
			var user = $('<div></div>').append('<span>'+nombre+'</span>')
							.append('<div class="options"><button><i class="fa fa-check"></i></button><button><i class="fa fa-times"></i></button></div>')
							.append('<button><i class="fa fa-user-plus"></i></button>');
			user.find('div.options').css('display', 'none');
			user.find('button').click(botonAgregar);
			user.find('button').attr('id', search.resultados[i]._id);
			switch(search.resultados[i].request){
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
			if (search.resultados[i]._id != search.user._id)
				$('div.buscar div.listado').append(user);
		}
	},'json');
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

function sendRequest(to){
	$.post('/api/friends/sendReq/' + to, function(data){
		console.log(data);
	}, 'json');
};

function acceptRequest(from){
	$.ajax({
		url:'/api/friends/acceptReq/' + from,
		type:'PUT',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
};

function declineRequest(from){
	$.ajax({
		url:'/api/friends/declineReq/' + from,
		type:'DELETE',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
};

function terminarBusqueda(){
	$('div.buscar div.input').animate({marginTop:'8%'}, 200, function(){
		$('div.buscar').css('display', 'none');
	});
	$('div.buscar div.background').css('background-color', 'rgba(30,136,229,0)');
}

function terminarSolicitudes(){
	$('div.solicitudes div.contenedor').animate({marginTop:'7%'}, 200, function(){
		$('div.solicitudes').css('display', 'none');
	});
	$('div.solicitudes div.background').css('background-color', 'rgba(66,66,66,0)');
}






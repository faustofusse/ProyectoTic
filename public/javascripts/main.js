
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

$('div.buscar').keyup(function(event) {
	if (event.keyCode === 27) 
		terminarMenu();
});

$('div.menu div.background').click(function(event) {
	terminarMenu();
});

$('div.solicitudes div.superior button').click(function(event) {
	terminarMenu();
});

$('div.buscar div.input input').keyup(function(event) {
	if ($(this).val().trim().length > 0)
		searchUsers($(this).val());
	else 
		$('div.buscar div.listado div').remove();
});


$('button#friendRequests').click(function(event) {
	$('div.menu').css('display','flex');
	$('div.solicitudes').css('display','flex');
	$('div.menu div.solicitudes').animate({marginTop:'5%'}, 200);
	$('div.menu div.background').css('display', 'flex');
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0.9)');
	searchRequests();
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

// ------------------------------------------------- FUNCTIONS

function searchRequests(){
	$.get('/api/friends/requests', function(requests){
		//if (requests.length === 0) 
		$('div.solicitudes div.listado div').remove();
		for (var i = 0; i<requests.length; i++){
			var div = $('<div></div>');
			div.attr('id', requests[i]._id)
			   .append('<span>'+requests[i].nombre+' '+requests[i].apellido+'</span>');
			var options = $('<div></div>').append('<button id="aceptar"><i class="fa fa-check"></i></button>')
										  .append('<button id="rechazar"><i class="fa fa-times"></i></button>');
			div.append(options);
			$('div.solicitudes div.listado').append(div);
		}
	}, 'json');
}


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

function terminarMenu(){
	$('div.buscar, div.solicitudes').animate({marginTop:'10%'}, 200, function(){
		$('div.menu, div.menu > div').css('display', 'none');
		$('div.menu').css('display', 'none');
	});
	$('div.menu div.background').css('background-color', 'rgba(30,136,229,0)');
}






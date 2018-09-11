
// ------------------------------------------------- EVENTS

$('button#addFriend').click(function(){
	$('div.buscar').css('display','flex').animate({paddingTop:'6em'}, 200);
	$('div.buscar').css('background-color', 'rgba(30,136,229,0.9)');
	$('input#buscar').focus();
	$('html, body').css('overflow', 'hidden');
});

$('div.buscar div.input input').keyup(function(event) {
	if ($(this).val().trim().length > 0)
		searchUsers($(this).val());
	else 
		$('div.buscar div.listado div').remove();
});

// ------------------------------------------------- FUNCTIONS

function searchUsers(query){
	$.get('/users/search/' + query, function (search) {
		$('div.buscar div.listado div').remove();
		var botones = [];
		for (var i = 0; i<search.resultados.length; i++){
			var nombre = search.resultados[i].nombre+' '+search.resultados[i].apellido;
			var user = $('<div></div>').append('<span>'+nombre+'</span>').append('<button><i class="fa fa-user-plus"></i></button>');
			user.find('button').click(botonAgregar);
			user.find('button').attr('id', search.resultados[i]._id);
			botones.push(user);
			$('div.buscar div.listado').css('visibility', 'hidden');
			$('div.buscar div.listado').append(user);
		}
		$.get('/users/friends/requests', function(requests){
			$.get('/user', function(user){
				for (var i = 0; i<requests.length; i++){
					if (requests[i].from === user._id)
						$('button#'+requests[i].to).find('i').attr('class', 'fa fa-clock');
				}
				for (friend in user.friends){
					$('button#'+friend._id).find('i').attr('class', 'fa fa-user-friends');
				}
				$('div.buscar div.listado').css('visibility', 'visible');
			}, 'json');
		}, 'json');
	},'json');
}

function botonAgregar(event) {
	var id = $(this).attr('id');
	var clase = $(this).find('i').attr('class');
	if (clase.indexOf('user-plus') != -1){
		console.log('Disponible para enviar.');
		$(this).find('i').attr('class', 'fa fa-clock');
		sendRequest(id);
	}else if (clase.indexOf('clock') != -1){
		console.log('Solicitud ya enviada (tiene el relojito).')
	}else if (clase.indexOf('user-friends') != -1){
		console.log('Ya son amigos che.')
	}	
};

function sendRequest(to){
	$.post('/users/friends/sendReq/' + to, function(data){
		console.log(data);
	}, 'json');
};

function acceptRequest(from){
	$.ajax({
		url:'/users/friends/acceptReq/' + from,
		type:'PUT',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
};

function declineRequest(from){
	$.ajax({
		url:'/users/friends/declineReq/' + from,
		type:'DELETE',
		dataType: 'JSON'
	}).done(function(data){
		console.log(data);
	});
};

// LA PUTA MADRE NO SE POR QUE MIERDA NO ANDA ESTO LA CONCHA DE MI HERMANA LA PUTA MADRE QUE ME PARIO LA RE PUTISIMA HIJA DE RE MIL PUTA AGUANTE GAGO VIEJA
$.fn.findById = function(id){
	//console.log($(this[2]).attr('id'));
	for (var i 	= 0; i<this.length; i++){
		if (this[i].attr('id') === id)
			return this[i];
	}
};
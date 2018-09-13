var escapeBuscar = true;

// ------------------------------------------------- EVENTS

$('button#addFriend').click(function(){
	$('div.buscar').css('display','flex').animate({paddingTop:'6em'}, 200);
	$('div.buscar').css('background-color', 'rgba(30,136,229,0.9)');
	$('input#buscar').focus();
	$('html, body').css('overflow', 'hidden');
});

$('div.buscar').click(function(event){
	if (escapeBuscar){
		$('div.buscar').animate({paddingTop:'8em'}, 200, function(){
			$(this).css('display', 'none');
		});
		$('div.buscar').css('background-color', 'rgba(30,136,229,0)');
		$('html, body').css('overflow', 'auto');
	}
});
$('div.buscar input').mouseenter(function(event) {escapeBuscar = false;})
					.mouseleave(function(event) {escapeBuscar = true;});
$('div.buscar div.listado').mouseenter(function(event) {escapeBuscar = false;})
					.mouseleave(function(event) {escapeBuscar = true;});

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
					user.find('button i').attr('class', 'fa fa-clock');
					break;
				case 'friend':
					user.find('button i').attr('class', 'fa fa-user-friends');
					break;
				case 'received':
					user.find('> button').css('display', 'none');
					user.find('div.options').css('display', 'flex');
					break;	
			}
			$('div.buscar div.listado').append(user);
		}
	},'json');
}

function botonAgregar(event) {
	var id = $(this).attr('id');
	var clase = $(this).find('i').attr('class');
	if (clase.indexOf('user-plus') != -1){
		$(this).find('i').attr('class', 'fa fa-clock');
		sendRequest(id);
	}else if (clase.indexOf('clock') != -1){
	}else if (clase.indexOf('user-friends') != -1){
		console.log('Ya son amigos che.')
	}else if (clase.indexOf('check') != -1){
		$(this).parent().find('div.opciones').css('display', 'none');
		$(this).parent().find('> button').css('display', 'flex');
		$(this).parent().find('> button i').attr('class', 'fa fa-user-friends');
		acceptRequest(id);
	}else if (clase.indexOf('times') != -1){
		$(this).parent().find('div.opciones').css('display', 'none');
		$(this).parent().find('> button').css('display', 'flex');
		$(this).parent().find('> button i').attr('class', 'fa fa-user-plus');
		declineRequest(id);
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
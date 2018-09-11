
/*------------------ INICIO DE SESION --------------------*/

var iniciarSesion = true;
$('button#btnRegistrarse').css('background-color', '#42a5f5');
//$('input#apellido, input#nombre, input#repeatPassword').css('display', 'none');
if ($('input#nombre').attr('class') != "desplegado"){
	$('button#btnIniciar').css('background-color', '#1976d2');
	$('button#btnRegistrarse').css('background-color', '#42a5f5');
	$('input#apellido, input#nombre, input#repeatPassword').css('display', 'none');
}else{
	$('button#btnIniciar').css('background-color', '#42a5f5');
	$('button#btnRegistrarse').css('background-color', '#1976d2');
	iniciarSesion = false;
}

$('button#btnRegistrarse').click(function () {
	iniciarSesion = false;
	$('form').attr('action', '/register');
	$('button#btnIniciar').css('background-color', '#42a5f5');
	$('button#btnRegistrarse').css('background-color', '#1976d2');
	$('input#apellido, input#nombre, input#repeatPassword').slideDown();
	//$('header').slideUp();
});
$('button#btnIniciar').click(function () {
	iniciarSesion = true;
	$('form').attr('action', '/login');
	$('button#btnIniciar').css('background-color', '#1976d2');
	$('button#btnRegistrarse').css('background-color', '#42a5f5');
	$('input#apellido, input#nombre, input#repeatPassword').slideUp();
	//$('header').slideDown();
});

$('div.mensajes div').click(function(){
	$(this).slideUp();
});

$('button#logout').click(function(){
	window.location.href = "/logout";
});

/*------------------ PANTALLA PRINCIPAL --------------------*/

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

function searchUsers(query){
	$.get('/users/search/' + query, function (data) {
		$('div.buscar div.listado div').remove();
		for (var i = 0; i<data.resultados.length; i++){
			var nombre = data.resultados[i].nombre+' '+data.resultados[i].apellido;
			var user = $('<div></div>').append('<span>'+nombre+'</span>').append('<button><i class="fa fa-user-plus"></i></button>');
			user.find('button').click(botonAgregar);
			$('div.buscar div.listado').append(user);
		}
	},'json');
}

function botonAgregar(event) {
	$(this).find('i').attr('class', 'fa fa-clock');
	//$.put('/users/friendRequest')
};

$.put = function(url, data, callback, type){
  if ( $.isFunction(data) ){
    type = type || callback,
    callback = data,
    data = {}
  }
 
  return $.ajax({
    url: url,
    type: 'PUT',
    success: callback,
    data: data,
    contentType: type
  });
}

























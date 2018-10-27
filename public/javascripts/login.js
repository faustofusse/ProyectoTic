if (login){
	$('button#btnIniciar').css('background-color', '#1976d2');
	$('button#btnRegistrarse').css('background-color', '#42a5f5');
}else{
	$('button#btnIniciar').css('background-color', '#42a5f5');
	$('button#btnRegistrarse').css('background-color', '#1976d2');
	$('input#apellido, input#nombre, input#repeatPassword').css('display', 'flex').prop('required', true);
}

$('button#btnRegistrarse').click(function () {
	login = false;
	$('form').attr('action', '/register');
	$('button#btnIniciar').css('background-color', '#42a5f5');
	$('button#btnRegistrarse').css('background-color', '#1976d2');
	$('input#apellido, input#nombre, input#repeatPassword').slideDown().prop('required', true);
});
$('button#btnIniciar').click(function () {
	login = true;
	$('form').attr('action', '/login');
	$('button#btnIniciar').css('background-color', '#1976d2');
	$('button#btnRegistrarse').css('background-color', '#42a5f5');
	$('input#apellido, input#nombre, input#repeatPassword').slideUp().prop('required', false);
});

$('div.mensajes div').click(function(){
	$(this).slideUp();
});

$('button#logout').click(function(){
	window.location.href = "/logout";
});

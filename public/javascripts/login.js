$('div.background').particleground({
    // curvedLines: true,
    // proximity: 130,
    // parallaxMultiplier: 2,
   	density: 7000, 
    dotColor: '#00c853',
    lineColor: '#1565c0',
}).css('background-color', '#212121');;

scrollTo($('header'), 0);

if (login){
	$('button#btnIniciar').css('background-color', '#1976d2');
	$('button#btnRegistrarse').css('background-color', '#42a5f5');
}else{
	$('button#btnIniciar').css('background-color', '#42a5f5');
	$('button#btnRegistrarse').css('background-color', '#1976d2');
	$('input#apellido, input#nombre, input#repeatPassword').css('display', 'flex').prop('required', true);
}

// $(window).resize(function () {
// 	if (window.matchMedia("(max-width: 780px)").matches){
// 		$('main, header').css('height', window.innerHeight + "px");
// 	}
// });

$('button#scrollDown').click(function(event) {
	scrollTo($('main'), 400);
});

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

function scrollTo(element, duration) {
	$([document.documentElement, document.body]).animate({
        scrollTop: element.offset().top
    }, duration);
}
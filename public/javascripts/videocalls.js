var videoFriend = document.querySelector('#videoFriend');
var videoUser = document.querySelector('#videoUser');
var photo = document.querySelector('#photo');
var canvas = document.querySelector('#canvas'),
	width = 320,
    height = 0;

getUserVideo(function(stream){
	videoUser.srcObject = stream;
	videoFriend.srcObject = stream;
	$('div.videollamada div.conferencia').css('display', 'flex');
	$('div.videollamada h2').css('display', 'none');
});

var peer = new Peer(userId, { 
	host: location.hostname, 
	port: location.port || (location.protocol === 'https:' ? 443 : 80), 
	secure: (location.protocol === 'https:')
});
var heartbeater = makePeerHeartbeater(peer); //to stop it: heartbeater.stop();

peer.on('open', function(id) {
	console.log('My peer ID is: ' + id);
});

peer.on('error', onError);

peer.on('call', function(call) {
	$('div.videollamada div.llamando').css('display', 'flex');
	$('div.videollamada div.llamando button#atender').css('display', 'flex');
	$('div.videollamada h2').css('display', 'none');
	scrollTo($('div.videollamada'), 600);

	var otherId = call.peer;
	console.log('Call from ' + otherId);
	$('div.videollamada div.llamando h3').html('LLamada de ' + findFriendById(otherId) + '....');
	window.currentCall = call;
});

function botonVideollamada(){
	var otherId = $(this).attr('id');
	var nombre = $(this).parent().parent().find('span').html();
	console.log('Calling '+otherId+'....');

	getUserVideo(function (stream) {
		$('div.videollamada div.llamando').css('display', 'flex');
		$('div.videollamada div.llamando button#atender').css('display', 'none');
		$('div.videollamada div.llamando h3').html('Llamando a ' + nombre + '....');
		$('div.videollamada h2').css('display', 'none');
		scrollTo($('div.videollamada'), 600);

		window.localStream = stream;
		var call = peer.call(otherId, stream);	
		window.currentCall = call;
		call.on('stream', onStream);
		call.on('error', onError);
		call.on('close', onClose);
	});
}

function atender() {
	console.log('atender');
	getUserVideo(function(stream) {
		window.localStream = stream;
		var call = window.currentCall;
		call.answer(stream);
		call.on('stream', onStream);
		call.on('error', onError);
		call.on('close', onClose);
	});	
	$('div.videollamada div.llamando').css('display', 'none');
}

function declinar() {
	window.currentCall.close();
	videoUser.src = null;
	$('div.videollamada div.llamando').css('display', 'none');
	$('div.videollamada h2').css('display', 'flex');
}

function onStream(stream){
	$('div.videollamada div.conferencia').css('display', 'flex');
	$('div.videollamada div.llamando').css('display', 'none');
	$('div.videollamada h2').css('display', 'none');
	videoUser.srcObject = window.localStream;
	videoFriend.srcObject = stream;
}

function onError(err) {
	console.error(err);
	$('div.videollamada div.conferencia, div.videollamada div.llamando').css('display', 'none');
	$('div.videollamada h2').css('display', 'flex');
	window.currentCall.close();
}

function onClose() {
	console.log('Call ended.');
	$('div.videollamada div.conferencia').css('display', 'none');
	$('div.videollamada h2').css('display', 'flex');
}

function getUserVideo(callback) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if (navigator.mediaDevices.getUserMedia) {       
	  navigator.mediaDevices.getUserMedia({video: true, audio:true})
	  .then(callback)
	  .catch(function(error) {
	    console.log("Something went wrong!");
	    console.error(error);
	  });
	}
}

function scrollTo(element, duration) {
	$([document.documentElement, document.body]).animate({
        scrollTop: element.offset().top
    }, duration);
}

function findFriendById(id) {
	return $('main div.contenedor div.left div.inferior div.amigos div#'+id+' span').html();
}

function makePeerHeartbeater ( peer ) {
    var timeoutId = 0;
    function heartbeat () {
        timeoutId = setTimeout( heartbeat, 20000 );
        if ( peer.socket._wsOpen() )
            peer.socket.send( {type:'HEARTBEAT'} );
    }
    // Start 
    heartbeat();
    // return
    return {
        start : function () {
            if ( timeoutId === 0 ) { heartbeat(); }
        },
        stop : function () {
            clearTimeout( timeoutId );
            timeoutId = 0;
        }
    };
}

function screenshot() {
	console.log('screenshot');
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d').drawImage(videoFriend, 0, 0, width, height);
	var data = canvas.toDataURL('image/png');
	photo.setAttribute('src', data);
}
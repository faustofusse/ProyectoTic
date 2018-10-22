var videoFriend = document.querySelector('#videoFriend');
var videoUser = document.querySelector('#videoUser');
videoUser.volume = 0.0;

/*getUserVideo(function(stream){
	videoUser.srcObject = stream;
	videoFriend.srcObject = stream;
	$('div.videollamada div.conferencia').css('display', 'flex');
	$('div.videollamada h2').css('display', 'none');
});*/

getUserVideo(function(stream){
	videoFriend.srcObject = stream;
	videoUser.srcObject = stream;
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
	var canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 480;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(videoFriend, 0, 0, canvas.width, canvas.height);
	var data = canvas.toDataURL('image/png');
	$('div.screenshot img').attr('src', data);
	$('div.screenshot a').attr('href', data);
	$('div.screenshot').css('display', 'flex');
}

function volume(event){
	var i = $(this).find('i');
	switch(i.attr('class')){
		case 'fa fa-volume-up':
			videoFriend.volume = 0.0;
			i.attr('class', 'fa fa-volume-off');
			break;
		case 'fa fa-volume-down':
			videoFriend.volume = 1.0;
			i.attr('class', 'fa fa-volume-up');
			break;
		case 'fa fa-volume-off':
			videoFriend.volume = 0.5;
			i.attr('class', 'fa fa-volume-down');
			break;
	}
}

function expand() {
	var i = $(this).find('i');
	var div = $('div.conferencia');
	if(i.attr('class')=='fa fa-expand'){
		i.attr('class', 'fa fa-compress');
		div.css('position', 'fixed');
	}else{
		i.attr('class', 'fa fa-expand');
		div.css('position', 'relative');
	}
}



var videoFriend = document.querySelector('#videoFriend');
var videoUser = document.querySelector('#videoUser');
videoUser.volume = 0.0;

var mobile = window.matchMedia("(max-width: 780px)").matches;
var otherId = '';

/*getUserVideo(function(stream){
	videoUser.srcObject = stream;
	videoFriend.srcObject = stream;
	$('div.videollamada div.conferencia').css('display', 'flex');
	$('div.videollamada h2').css('display', 'none');
});*/

var peer = new Peer(userId, { 
	host: 'tars-videocalls.herokuapp.com', 
	port: location.protocol === 'https:' ? 443 : 80, 
	secure: (location.protocol === 'https:'),
	config: {
		// iceTransportPolicy: 'relay',
		iceServers: [
			{ url: 'stun:stun.samsungsmartcam.com:3478' },
			{ url: 'stun:stun.stunprotocol.org' },
			{ url: 'stun:stun.l.google.com:19302' },
	    	{
			    url: 'turn:numb.viagenie.ca',
			    credential: 'F@usto123',
			    username: 'faustofusse@gmail.com'
			}
		]
	}
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
	scrollTo($('div.videollamada div.llamando button'), 600);

	if (mobile){
		$('div.videollamada').css('display', 'flex');
		/*$('div.left').animate({width:'0%'}, 200);
		$('div.videollamada').animate({width:'100%'}, 200);*/
	}

	otherId = call.peer;
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

		if (mobile){
			$('div.videollamada').css('display', 'flex');
			scrollTo($('header'), 200);
			/*$('div.left').animate({width:'0%'}, 200);
			$('div.videollamada').animate({width:'100%'}, 200);*/
		}

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
		socket.emit('videocall', {id1:userId, id2:otherId});
	});	
	$('div.videollamada div.llamando').css('display', 'none');
}

function declinar() {
	window.currentCall.close();
	videoUser.src = null;
	$('div.videollamada div.videollamada').css('display', 'none');
	$('div.videollamada div.llamando').css('display', 'none');
	$('div.videollamada h2').css('display', 'flex');
	scrollTo($('header'), 200);
	socket.emit('videocall-close', userId);
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

	if (mobile){
		$('div.videollamada').css('display', 'none');
	}else{
		$('div.videollamada h2').css('display', 'flex');
	}
	scrollTo($('header'), 200);
	window.currentCall.close();
	socket.emit('videocall-close', userId);
}

function onClose() {
	console.log('Call ended.');
	$('div.videollamada div.conferencia').css('display', 'none');
	if (mobile) {
		$('div.videollamada').css('display', 'none');;
	}else{
		$('div.videollamada h2').css('display', 'flex');
	}
	scrollTo($('header'), 200);
	socket.emit('videocall-close', userId);
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
    heartbeat(); // start
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


var turn = {
    url: 'turn:numb.viagenie.ca',
    credential: 'F@usto123',
    username: 'faustofusse@gmail.com'
};

checkTURNServer(turn).then(function(bool){
    console.log('is TURN server active? ', bool? 'yes':'no');
}).catch(console.error.bind(console));


function checkTURNServer(turnConfig, timeout){ 

  return new Promise(function(resolve, reject){

    setTimeout(function(){
        if(promiseResolved) return;
        resolve(false);
        promiseResolved = true;
    }, timeout || 5000);

    var promiseResolved = false
      , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
      , pc = new myPeerConnection({iceServers:[turnConfig]})
      , noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(function(sdp){
      if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
        promiseResolved = true;
        resolve(true);
      }
      pc.setLocalDescription(sdp, noop, noop);
    }, noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
      if(promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay')>-1))  return;
      promiseResolved = true;
      resolve(true);
    };
  });   
}



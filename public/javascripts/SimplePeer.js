// archivo js descargado (simple-peer.min.js)

var peer = new SimplePeer({
	initiator: location.hash === '#init', //true o false: especifica si esta es la peer que inicio la conexion
	trickle: false, // ni puta idea
	stream: stream
});

peer.on('error', function (err) { console.log('ERROR', err) })

peer.on('signal', function (data) {
	console.log('SIGNAL')
	$('textarea').val(JSON.stringify(data));
});

peer.on('connect', function () {
	console.log('CONNECTED');
})

peer.on('data', function (data) {
	console.log(data);
});

peer.on('stream', function (stream) {
	var video = $('<video src=""></video>');
	$('body').prepend(video);

	video.src = window.URL.createObjectURL(stream);
	video.trigger('play');
});

function botonVideollamada(){
	var otherPeer = JSON.parse($('textarea').val());
	peer.signal(otherPeer);	
}
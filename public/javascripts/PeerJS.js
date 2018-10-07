//<script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.16/peer.min.js"></script>

var peer = new Peer();

peer.on('open', function(id){
	$('textarea').val(id);
});

peer.on('connection', function(connection) {
  connection.on('data', function(data){
    console.log(data);
  });
});

peer.on('call', function(call) {
  navigator.getUserMedia({video: true, audio: false}, function(stream) {
    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', function(remoteStream) {
      // Show stream in some video/canvas element.
      console.log(remoteStream);
      var video = $('<video autoplay="autoplay"></video>');
	  $('body').prepend(video);
	  try {
		  video.srcObject = remoteStream;
		} catch (error) {
		  video.src = URL.createObjectURL(remoteStream);
		}
	  video.trigger('play');
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});

$('button#connect').click(function (event) {
	var otherId = $('textarea').val();
	var connection = peer.connect(otherId);
	connection.on('open', function (id) {	
		connection.send('connected successfuly');
	});
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video: true, audio: false}, function(stream) {

		var call = peer.call(otherId, stream);
		call.on('stream', function(remoteStream) {
			console.log(remoteStream);
			var video = $('<video autoplay="autoplay"></video>');
			$('body').prepend(video);
			try {
			  video.srcObject = remoteStream;
			} catch (error) {
			  video.src = URL.createObjectURL(remoteStream);
			}
			video.trigger('play');
		});

	}, function (err) {
		console.error(err);
	});
});

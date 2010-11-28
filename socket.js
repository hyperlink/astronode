// requires socket.io
// http://socket.io/

var http = require('http'),  
	 io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHeader(200, {'Content-Type': 'text/html'}); 
res.end('<h1>Astronode</h1>'); 
});

server.listen(8080);

// socket.io 
var socket = io.listen(server), controllerId;

socket.on('connection', function(client) { 
  console.log("new client connect "+ client.sessionId);
  
  if (typeof controllerId == 'undefined') {
	 controllerId = client.sessionId;
	 client.send(JSON.stringify(true));
  } else {
	 client.send(JSON.stringify(false));
	}
  
  client.on('message', function(message) {
		// TODO: broadcast to specific clients
		var data;
		try {
			 data = JSON.parse(message);
		} catch(e) {
			console.log(message);
			console.error(e.message);
		}
		
		if (client.sessionId == controllerId && Array.isArray(data) ) {
			 client.broadcast(JSON.stringify(data));
			 console.log('controller sent: ', message);
		} else {
			console.dir(data);
			 client.broadcast(JSON.stringify({
				  isRight: !data.isRight,
				  tel: data.tel
			 }));
		}
  }) ;
  
  client.on('disconnect', function(){
		console.log('client disconnected', client.sessionId);
		if (client.sessionId == controllerId) {
			 controllerId = undefined;
		}
  });
});
(function () {

	function addEvent( obj, type, fn ) {
		if (obj.addEventListener)
			obj.addEventListener( type, fn, false );
		else if (obj.attachEvent) {
			obj["e"+type+fn] = fn;
			obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
			obj.attachEvent( "on"+type, obj[type+fn] );
		}
	}

	function removeEvent( obj, type, fn ) {
		if (obj.removeEventListener)
			obj.removeEventListener( type, fn, false );
		else if (obj.detachEvent) {
			obj.detachEvent( "on"+type, obj[type+fn] );
			obj[type+fn] = null;
			obj["e"+type+fn] = null;
		}
	}
	const rate = 20;
	var lastSend, lastSentKey, isController = false, eventsAdded = false;
	
	function passKeyPress(key) {
		 if (lastSend == null) {
			  socket.send(JSON.stringify(key));
			  console.log("sending "+ key);
			  lastSend = +new Date;
			  lastSentKey = key;
		 } else if ( (+new Date) - lastSend > rate)	{
			  socket.send(JSON.stringify(key));
				console.log("sending "+ key);
			  lastSend = +new Date;
			  lastSentKey = key;
		 } else if ( !isSameKeyPress(key, lastSentKey) ) {
			  console.log('qued '+ key);
			  setTimeout(function(){
					passKeyPress(key);
			  }, rate);
		 } else {
			  console.log('same key ignored.');
		 }
	}

	function isSameKeyPress(key1, key2) {
		 return key1[0] == key2[0] && key1[1] == key2[1];
	}

	function keyeventUp(event) {
		  var event = event || window.event;
		  console.log("up "+ event.keyCode);
		  passKeyPress([event.keyCode, false]);
	}

	function keyeventDown(event) {
		  var event = event || window.event;
		  console.log("down "+ event.keyCode);
		  passKeyPress([event.keyCode, true]);
	}

	 function callback() {
		  socket = new io.Socket('localhost', {
				port: '8080'
		  });
		  socket.on('connect', function () {
				console.log("I'm connected!", arguments);
		  });
		  socket.on('message', function (message) {

				try {
					 var key = JSON.parse(message);
				} catch(e) {}


				if (key && Array.isArray(key) && window.ASTEROIDSPLAYERS && window.ASTEROIDSPLAYERS.length >0) {
					 window.ASTEROIDSPLAYERS[0].keysPressed[key[0]] = key[1];
				} else {
					if (typeof key == "boolean") {
						isController = key;
						if (!eventsAdded && isController) {
						  console.log('I am the controller');
						  addEvent(document, 'keyup', keyeventUp);
						  addEvent(document, 'keydown', keyeventDown);
						}

						if (!isController && window.ASTEROIDSPLAYERS ) {
							console.log("not the controller");
							window.ASTEROIDSPLAYERS[0].shipExit();
						}
					} else if (key.tel) {
						ASTEROIDSPLAYERS[0].shipEnter(key.isRight, key.tel);
					}
				}
				console.log("message: ", message);
		  });

		  socket.on('disconnect', function () {
				console.log("Disconnected");
				if (eventsAdded) {
					 removeEvent(document, 'keyup', keyeventUp);
					 removeEvent(document, 'keydown', keyeventDown);
				}
				socket.connect();
		  });

		  socket.connect();

	 }
	 var script = document.createElement("script");
	 script.src = "http://localhost:8080/socket.io/socket.io.js";
	 if (script.readyState) {
		  script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					 script.onreadystatechange = null;
					 callback();
				}
		  };
	 } else {
		  script.onload = callback;
	 }
	 document.getElementsByTagName("head")[0].appendChild(script);
})();
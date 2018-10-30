var ws = new WebSocket('ws://coolcoolchat.herokuapp.com');

function send(obj) {
	ws.send(JSON.stringify(obj))
}

function user() {
	let username = document.querySelector('#username_input').value
	if (username == '') return;
	let data = {
		type:'username',
		value:username
	}
	send(data)
}

function chat() {
	let chatmessage = document.querySelector('#chat_input').value
	if (chatmessage == '') return;
	let data = {
		type:'sendchat',
		value:chatmessage
	}
	send(data)
	document.querySelector('#chat_input').value = ''
}

ws.onopen = function open() {
    console.log('Connected!');
    $('#username_modal').modal({
	    backdrop: 'static',
	    keyboard: false
	})

    document.querySelector('#username_input').addEventListener('keypress',e => {
	    var key = e.which || e.keyCode;
	    if (key === 13) {
			user()
		}
	});

	document.querySelector('#username_button').addEventListener('click',() => {
		user()
	});

	document.querySelector('#chat_input').addEventListener('keypress',e => {
	    var key = e.which || e.keyCode;
	    if (key === 13) {
			chat()
		}
	});

	document.querySelector('#chat_button').addEventListener('click',() => {
	    chat()
	});
}

ws.onerror = function error() {
    console.log('Error connecting!');
}

ws.onmessage = function(msg) {
	let data = JSON.parse(msg.data);
	if (data) switch(data.type) {
		case 'confirmUser':
			$(function () {
			   $('#username_modal').modal('toggle');
			});
			return
		case 'receivechat':
			$("#messages").prepend('<li><div class="time">('+data.message.date+')</div> <div class="user">'+data.message.author+'</div> <div class="content">'+data.message.content+'</div></li>');
			return
		case 'chatmessages':
			data.messages.forEach(function(message){
				$("#messages").prepend('<li><div class="time">('+message.date+')</div> <div class="user">'+message.author+'</div> <div class="content">'+message.content+'</div></li>');
			})
			return
	}
}

ws.onclose = function(code, message) {
    console.log('Disconnection: ' + code + ', ' + message);
}
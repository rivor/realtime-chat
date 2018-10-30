'use strict'

const path = require('path');
const http = require('http');
const express = require('express');
const app = express()
const WebSocket = require('ws');

app.use(express.static(path.resolve(__dirname, '../client')));

const server = new http.createServer(app);
const wss = new WebSocket.Server({server});

let users = []
let messages = []

let uniqueid = 0;

function getClientByID(id) {
	let client = wss.clients.find(function(ws){
		return ws.id == id;
	})
	return client
}

function getUsernameByID(id) {
	let user = users.find(function(user){
		return user.id == id;
	})
	if (typeof(user) == "object") return user.username
}

function broadcast(obj) {
	wss.clients.forEach(function(ws){
		ws.send(JSON.stringify(obj))
	})
}

function getDate() {
	let date = new Date();
	return date.getHours()+":"+date.getMinutes()
}

wss.on('connection', ws => {
	console.log('new connection')
	ws.id = uniqueid;
	uniqueid++;
	ws.sendobj = function(obj){
		ws.send(JSON.stringify(obj))
	}
	ws.on('message', msg => {
		let data = JSON.parse(msg);
		if (data) switch(data.type) {
			case 'username':
				let user = {
					id:ws.id,
					username:data.value
				}
				users.push(user)
				ws.sendobj({type:'confirmUser'})
				return
			case 'sendchat':
				let author = getUsernameByID(ws.id)
				if (author) {
					let message = {
						author:author,
						date:getDate(),
						content:data.value
					}
					messages.push(message)
					broadcast({type:"receivechat",message:message})
				}
				return
		}
	});

	ws.sendobj({type:'chatmessages',messages:messages})

	ws.on('close', (code,msg) => {
		console.log('connection closed')
	})
});

server.listen(process.env.PORT || 3000)
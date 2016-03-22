var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickName = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function (server) {
	
	//启动Socket.IO服务器,允许它搭载在已有的HTTP服务器上
	io = socketio.listen(server);
	io.set('log level', 1);
	
	//定义每一个用户的连接处理
	io.sockets.on('connection', function (socket) {
		//在用户连接上来时 赋予其一个访客名
		guestNumber = assignGuestName(socket, guestNumber, nickName, namesUsed);
		
		//在用户连接上来时把他放入聊天室Lobby里
		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickName);
		//处理用户的消息更名,以及聊天室的创建和变更
		handleNameChangeAttempts(socket, nickName, namesUsed);
		handleRoomJoining(socket);
		
		//用户发出请求时,向用户提供已经被占用的聊天室的列表
		socket.on('rooms', function () {
			socket.emit('rooms', io.sockets.manager.rooms);
		});
		
		//定义用户断开连接后的清除逻辑
		handleClientDisconnection(socket, nickName, namesUsed);
	});
};
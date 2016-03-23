var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
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
function assignGuestName(socket, guestNumber, nickName, namesUsed) {
	// 生成新昵称
	var name = 'Guest' + guestNumber;
	//把用户昵称跟客户端连接ID关联上
	nickNames[socket.id] = name;
	
	//让用户知道他们的昵称
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);//存放已经被占用的昵称
	return guestNumber + 1;//增加用来生成昵称的计数器
}

function joinRoom(socket, room) {
	socket.join(room);//让用户进入房间
	currentRoom[socket.id] = room;//记录用户的当前房间
	socket.emit('joinResult', { room: room });
	
	//让房间里的其他用户知道有新用户进入了房间
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});
	
	var usersInRoom = io.sockets.clients(room);
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users current in ' + room + ': ';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		//将房间里其他用户汇总发送给这个用户
		socket.emit('message', { text: usersInRoomSummary });
	}
}

// 更名请求的处理逻辑
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function (name) {
		if (name.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});
		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed[socket.id] = name;
				delete namesUsed[previousNameIndex];//删掉之前的昵称,让其他用户可以使用
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'That naem is already in use.'
				});
			}
		}
	});
}

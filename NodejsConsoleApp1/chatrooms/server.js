var http = require("http");
var fs = require("fs");
var path = require("path");//内置的path模块提供了与文件系统路径相关的功能
var mime = require("mime");//附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache = {};//cache是用来缓存文件内容的对象

//错误响应
function send404(response) {
	response.writeHead(404, { "Content-Type": 'text/plain' });
	response.write('Error 404: resource not found.');
	response.end();
}

//提供文件数据服务
function sendFile(response, filePath, fileContents) {
	var mimestr = mime.lookup(path.basename(filePath));
	
	response.writeHead(200, { "Content-Type": mimestr });
	response.end(fileContents);
}


//提供静态文件服务
function serveStatic(res, cache, absPath) {
	if (cache[absPath]) {//检查文件是否缓存在内存中
		sendFile(res, absPath, cache[absPath]);//从内存中返回文件
	} else {
		fs.exists(absPath, function (exists) {//检查文件是否存在
			if (exists) {
				fs.readFile(absPath, function (err, data) {//从硬盘中读取文件
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);//从硬盘中读取文件并返回
					}
				});
			} else {
				send404(res);
			}
		});
	}
}


//创建HTTP服务器的逻辑
var server = http.createServer(function (req, res) { //用匿名函数定义对每个请求的处理行为
	var filePath = false;
	if (req.url == '/') {
		filePath = 'public/index.html';// 确定返回的默认HTML文件
	} else {
		filePath = 'public' + req.url;//将URL路径作为文件的相对路径
	}
	var absPath = './' + filePath;
	serveStatic(res, cache, absPath);//返回静态文件
});

server.listen(3000, function () {
	console.log("server listening on port 3000.");
});


var chatServer = require('./lib/chat_server.js');

//启动Socket.IO服务器, 给它提供一个已经定义好的HTTP服务器,这样它就能跟HTTP服务器共享同一个TCP/IP端口
chatServer.listen(server);
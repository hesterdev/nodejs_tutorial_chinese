//console.log('Hello world');
var print = console.log;

//var http = require("http");
//http.createServer(function (request, response) {
//	//Send the HTTP header
//	//HTTP Status: 200 : OK
//	//Content Type: text/plain
//	response.writeHead(200, { "Content-Type": "text/plain" });
	
//	// Send the response body as "Hello World"
//	response.end("Hello World\n");
	
//}).listen(8081);

//// Console will print the message
//print("Server running at http://127.0.0.1:8081");

//var fs = require("fs");
//var stream = fs.createReadStream("C:/Users/pc/Desktop/复试.txt");
//stream.on('data', function (chunk) {
//	console.log(chunk);
//	console.log(new Date().toDateString());
//});
//stream.on('end', function () {
//	console.log("finished");
//});

//var http = require("http");
//var fs = require("fs");

//http.createServer(function (req, res) {
//	res.writeHead(200, { 'Content-Type': 'image/png' });

//	fs.createReadStream("C:/Users/pc/Desktop/temp2/搜狗截图20150829210306.png").pipe(res);
//}).listen(3000);
//console.log("Server running at http://localhost:3000");


var http = require("http");
var fs = require("fs");

http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/html' });
	var fn = 'C:/Users/pc/Source/Repos/nodejs_tutorial_chinese/NodejsConsoleApp1/chatrooms/public/index.html';
	fs.readFile(fn, function (err, data) {
		res.end(data);
	});
	//fs.createReadStream().pipe(res);
}).listen(3001);

console.log("Server running at http://localhost:3001");